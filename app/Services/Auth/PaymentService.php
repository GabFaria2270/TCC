<?php

namespace App\Services\Auth;

use App\Models\PagamentoExterno;
use App\Models\Venda;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Exceptions\MPApiException;
use MercadoPago\MercadoPagoConfig;
use RuntimeException;
use JsonException;

class PaymentService
{
    private PaymentClient $client;
    private string $provider;

    public function __construct()
    {
        $config = config('services.mercadopago');
        $token = $config['access_token'] ?? null;

        if (!$token) {
            throw new RuntimeException('Access token do Mercado Pago não configurado.');
        }

        MercadoPagoConfig::setAccessToken($token);

        // Only set integrator/platform ids when running in production mode.
        // Setting a production platform or integrator id while using TEST tokens
        // can cause Mercado Pago to reject the request with
        // "Unauthorized use of live credentials".
        $mode = $config['mode'] ?? 'sandbox';
        Log::debug('Mercado Pago: inicializando client', ['mode' => $mode]);

        if (($mode === 'production' || $mode === 'live') ) {
            if (!empty($config['integrator_id'])) {
                MercadoPagoConfig::setIntegratorId($config['integrator_id']);
            }

            if (!empty($config['app_id'])) {
                MercadoPagoConfig::setPlatformId((string) $config['app_id']);
            }
        } else {
            // In sandbox mode, ensure platform/integrator IDs are not set to avoid
            // mixing live credentials with test tokens.
            MercadoPagoConfig::setIntegratorId('');
            MercadoPagoConfig::setPlatformId('');
        }

        $this->client = new PaymentClient();
        $this->provider = $config['provider'] ?? 'mercadopago';
    }

    public function criarPagamentoRemoto(Venda $venda, array $payload): array
    {
        $methodId = $this->mapMethod($venda->forma_pagamento, $payload);
        $body = $this->buildPaymentBody($venda, $payload, $methodId);

        // Log request body for debugging, but avoid leaking card tokens
        $logBody = $body;
        if (isset($logBody['token'])) {
            $logBody['token'] = '***masked***';
        }

        Log::debug('Mercado Pago: criando pagamento remoto', [
            'venda_id' => $venda->id,
            'provider' => $this->provider,
            'body' => $logBody,
        ]);

        try {
            $payment = $this->client->create($body);
        } catch (MPApiException $exception) {
            $apiResponse = null;
            try {
                $apiResponse = method_exists($exception, 'getApiResponse') ? $exception->getApiResponse()->getContent() : null;
            } catch (\Throwable $e) {
                $apiResponse = null;
            }

            Log::error('Mercado Pago: erro ao criar pagamento', [
                'message' => $exception->getMessage(),
                'status' => method_exists($exception, 'getStatusCode') ? $exception->getStatusCode() : null,
                'response' => $apiResponse,
            ]);

            throw new RuntimeException(__('validation.pdv_js_erro_finalizar'));
        }

        $raw = $this->normalizeResponse($payment);

        // Log raw response for debugging if needed
        Log::debug('Mercado Pago: resposta crua do create', [
            'venda_id' => $venda->id,
            'raw' => $raw,
        ]);

        return $this->formatResponse($raw, $methodId);
    }

    public function registrarPagamento(Venda $venda, array $paymentData): array
    {
        $this->syncVenda($venda, $paymentData);

        return $paymentData;
    }

    public function atualizarStatus(Venda $venda): ?array
    {
        $pagamento = $venda->pagamentoExterno;

        if (!$pagamento || !$pagamento->external_reference) {
            return null;
        }

        try {
            $payment = $this->client->get((int) $pagamento->external_reference);
        } catch (MPApiException $exception) {
            Log::warning('Mercado Pago: erro ao consultar pagamento', [
                'reference' => $pagamento->external_reference,
                'message' => $exception->getMessage(),
            ]);

            return null;
        }

        $raw = $this->normalizeResponse($payment);
        $response = $this->formatResponse($raw);

        $this->syncVenda($venda, $response);

        return $response;
    }

    private function buildPaymentBody(Venda $venda, array $payload, string $methodId): array
    {
        $metadata = array_merge([
            'venda_id' => $venda->id,
            'comercio_id' => $venda->comercio_id,
            'usuario_id' => $venda->usuario_id,
        ], (array) Arr::get($payload, 'metadata', []));

        $body = [
            'transaction_amount' => round((float) $venda->total, 2),
            'description' => $venda->id ? 'Venda #' . $venda->id : 'Venda temporária',
            'payment_method_id' => $methodId,
            'payer' => $this->buildPayerPayload($venda, $payload),
            'external_reference' => (string) Arr::get($payload, 'external_reference', $venda->id),
            'metadata' => $metadata,
        ];

        if (in_array($venda->forma_pagamento, ['cartao_credito', 'cartao_debito'], true)) {
            $body['token'] = Arr::get($payload, 'card.token');
            $body['installments'] = Arr::get($payload, 'card.installments', 1);
            if ($issuerId = Arr::get($payload, 'card.issuer_id')) {
                $body['issuer_id'] = $issuerId;
            }
        }

        return $body;
    }

    private function buildPayerPayload(Venda $venda, array $payload): array
    {
        $defaultEmail = config('mail.from_address', 'contato@example.com');
        $cliente = $venda->cliente;

        $payer = [
            'email' => Arr::get($payload, 'payer.email')
                ?? $cliente->email
                ?? $defaultEmail,
            'first_name' => Arr::get($payload, 'payer.first_name')
                ?? ($cliente->nome ?? 'Cliente'),
            'last_name' => Arr::get($payload, 'payer.last_name') ?? '',
        ];

        if ($document = Arr::get($payload, 'payer.document')) {
            $payer['identification'] = [
                'type' => $document['type'] ?? 'CPF',
                'number' => preg_replace('/\D/', '', $document['number'] ?? '00000000000'),
            ];
        }

        return $payer;
    }

    private function mapMethod(string $formaPagamento, array $payload): string
    {
        return match ($formaPagamento) {
            'pix' => 'pix',
            'cartao_credito' => Arr::get($payload, 'card.payment_method_id', 'visa'),
            'cartao_debito' => Arr::get($payload, 'card.payment_method_id', 'debvisa'),
            default => $formaPagamento,
        };
    }

    private function normalizeResponse(object $payment): array
    {
        try {
            return json_decode(json_encode($payment, JSON_THROW_ON_ERROR), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            Log::warning('Falha ao converter resposta do Mercado Pago', [
                'message' => $exception->getMessage(),
            ]);

            return json_decode(json_encode($payment), true) ?? [];
        }
    }

    private function formatResponse(array $raw, ?string $fallbackMethod = null): array
    {
        return [
            'provider' => $this->provider,
            'reference' => (string) ($raw['id'] ?? ''),
            'status' => (string) ($raw['status'] ?? 'pending'),
            'method' => (string) ($raw['payment_method_id'] ?? $fallbackMethod ?? ''),
            'raw' => $raw,
            'pix_qr_code' => Arr::get($raw, 'point_of_interaction.transaction_data.qr_code'),
            'pix_qr_code_base64' => Arr::get($raw, 'point_of_interaction.transaction_data.qr_code_base64'),
            // include raw point_of_interaction to help debug missing QR fields
            'point_of_interaction_raw' => Arr::get($raw, 'point_of_interaction'),
        ];
    }

    /**
     * Sincroniza o status local da venda com o último retorno do gateway.
     */
    private function syncVenda(Venda $venda, array $response): void
    {
        $statusMap = [
            'approved' => 'concluida',
            'rejected' => 'cancelada',
            'cancelled' => 'cancelada',
            'refunded' => 'cancelada',
        ];

        $novoStatus = $statusMap[strtolower($response['status'] ?? '')] ?? 'pendente';

        $this->persistPagamentoExterno($venda, $response);

        $venda->update([
            'payment_status' => $response['status'] ?? null,
            'status' => $novoStatus,
        ]);
    }

    private function persistPagamentoExterno(Venda $venda, array $response): void
    {
        $pagamento = $venda->pagamentoExterno;

        if (!$pagamento) {
            $pagamento = new PagamentoExterno(['venda_id' => $venda->id]);
        }

        $pagamento->fill([
            'provider' => $response['provider'] ?? $this->provider,
            'external_reference' => $response['reference'] ?? null,
            'status' => $response['status'] ?? null,
            'method' => $response['method'] ?? null,
            'amount' => $venda->total,
            'currency' => 'BRL',
            'payload' => $response['raw'] ?? [],
            'metadata' => $response['raw']['metadata'] ?? null,
            'pix_qr_code' => $response['pix_qr_code'] ?? null,
            'pix_qr_code_base64' => $response['pix_qr_code_base64'] ?? null,
        ]);

        $pagamento->save();
    }
}
