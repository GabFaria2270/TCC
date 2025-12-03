<?php

namespace App\Services\Pagamentos;

use App\Models\PagamentoExterno;
use App\Models\Venda;

class PaymentProcessor
{
    public function __construct(private PaymentGatewayInterface $gateway)
    {
    }

    /**
     * Orquestra a criação do pagamento e persiste os metadados na venda.
     */
    public function processar(Venda $venda, array $payload): PaymentResponse
    {
        $response = $this->gateway->criarPagamento($venda, $payload);

        $this->sincronizarVenda($venda, $response);

        return $response;
    }

    public function atualizarStatus(Venda $venda): ?PaymentResponse
    {
        $pagamento = $venda->pagamentoExterno;

        if (!$pagamento || !$pagamento->external_reference) {
            return null;
        }

        $response = $this->gateway->consultarPagamento($pagamento->external_reference);

        if ($response) {
            $this->sincronizarVenda($venda, $response);
        }

        return $response;
    }

    public function registrarPagamentoLocal(Venda $venda, array $paymentData): PaymentResponse
    {
        $response = PaymentResponse::fromArray($paymentData);

        $this->sincronizarVenda($venda, $response);

        return $response;
    }

    private function sincronizarVenda(Venda $venda, PaymentResponse $response): void
    {
        $statusMap = [
            'approved' => 'concluida',
            'rejected' => 'cancelada',
            'cancelled' => 'cancelada',
            'refunded' => 'cancelada',
        ];

        $novoStatus = $statusMap[strtolower($response->status)] ?? 'pendente';

        $this->sincronizarPagamentoExterno($venda, $response);

        $venda->update([
            'payment_status' => $response->status,
            'status' => $novoStatus,
        ]);
    }

    private function sincronizarPagamentoExterno(Venda $venda, PaymentResponse $response): void
    {
        $pagamento = $venda->pagamentoExterno;

        if (!$pagamento) {
            $pagamento = new PagamentoExterno(['venda_id' => $venda->id]);
        }

        $pagamento->fill([
            'provider' => $response->provider,
            'external_reference' => $response->reference,
            'status' => $response->status,
            'method' => $response->method,
            'amount' => $venda->total,
            'currency' => 'BRL',
            'payload' => $response->raw,
            'metadata' => $response->raw['metadata'] ?? null,
            'pix_qr_code' => $response->pixQrCode,
            'pix_qr_code_base64' => $response->pixQrCodeBase64,
        ]);

        $pagamento->save();
    }
}
