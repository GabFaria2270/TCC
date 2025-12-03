<?php

namespace App\Services\Pagamentos;

use App\Models\Venda;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use JsonException;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Exceptions\MPApiException;
use MercadoPago\MercadoPagoConfig;
use RuntimeException;

class MercadoPagoGateway implements PaymentGatewayInterface
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

        if (!empty($config['integrator_id'])) {
            MercadoPagoConfig::setIntegratorId($config['integrator_id']);
        }

        if (!empty($config['app_id'])) {
            MercadoPagoConfig::setPlatformId((string) $config['app_id']);
        }

        $this->client = new PaymentClient();
        $this->provider = $config['provider'] ?? 'mercadopago';
    }

    public function criarPagamento(Venda $venda, array $payload): PaymentResponse
    {
        $methodId = $this->mapMethod($venda->forma_pagamento, $payload);

        $payer = $this->buildPayerPayload($venda, $payload);
        $externalReference = (string) Arr::get($payload, 'external_reference', $venda->id ?: (string) Str::uuid());
        $metadata = array_merge([
            'venda_id' => $venda->id,
            'comercio_id' => $venda->comercio_id,
            'usuario_id' => $venda->usuario_id,
        ], (array) Arr::get($payload, 'metadata', []));

        $description = $venda->id ? 'Venda #' . $venda->id : 'Venda temporária';

        $body = [
            'transaction_amount' => round((float) $venda->total, 2),
            'description' => $description,
            'payment_method_id' => $methodId,
            'payer' => $payer,
            'external_reference' => $externalReference,
            'metadata' => $metadata,
        ];

        if (in_array($venda->forma_pagamento, ['cartao_credito', 'cartao_debito'], true)) {
            $body['token'] = Arr::get($payload, 'card.token');
            $body['installments'] = Arr::get($payload, 'card.installments', 1);
            if ($issuerId = Arr::get($payload, 'card.issuer_id')) {
                $body['issuer_id'] = $issuerId;
            }
        }

        try {
            $payment = $this->client->create($body);
        } catch (MPApiException $exception) {
            Log::error('Mercado Pago: erro ao criar pagamento', [
                'message' => $exception->getMessage(),
                'status' => $exception->getStatusCode(),
                'response' => $exception->getApiResponse()->getContent(),
            ]);

            throw new RuntimeException(__('validation.pdv_js_erro_finalizar'));
        }

        try {
            $raw = json_decode(json_encode($payment, JSON_THROW_ON_ERROR), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            Log::warning('Falha ao converter resposta do Mercado Pago para array', [
                'message' => $exception->getMessage(),
            ]);
            $raw = json_decode(json_encode($payment), true) ?? [];
        }

        return new PaymentResponse(
            provider: $this->provider,
            reference: (string) ($raw['id'] ?? ''),
            status: (string) ($raw['status'] ?? 'pending'),
            method: (string) ($raw['payment_method_id'] ?? $methodId),
            raw: $raw,
            pixQrCode: Arr::get($raw, 'point_of_interaction.transaction_data.qr_code'),
            pixQrCodeBase64: Arr::get($raw, 'point_of_interaction.transaction_data.qr_code_base64'),
        );
    }

    public function consultarPagamento(string $paymentReference): ?PaymentResponse
    {
        if (!$paymentReference) {
            return null;
        }

        try {
            $payment = $this->client->get((int) $paymentReference);
        } catch (MPApiException $exception) {
            Log::warning('Mercado Pago: erro ao consultar pagamento', [
                'reference' => $paymentReference,
                'message' => $exception->getMessage(),
            ]);
            return null;
        }

        try {
            $raw = json_decode(json_encode($payment, JSON_THROW_ON_ERROR), true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            $raw = json_decode(json_encode($payment), true) ?? [];
        }

        return new PaymentResponse(
            provider: $this->provider,
            reference: (string) ($raw['id'] ?? $paymentReference),
            status: (string) ($raw['status'] ?? 'pending'),
            method: (string) ($raw['payment_method_id'] ?? ''),
            raw: $raw,
            pixQrCode: Arr::get($raw, 'point_of_interaction.transaction_data.qr_code'),
            pixQrCodeBase64: Arr::get($raw, 'point_of_interaction.transaction_data.qr_code_base64'),
        );
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
}
