<?php

namespace App\Services\Pagamentos;

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
        if (!$venda->payment_reference) {
            return null;
        }

        $response = $this->gateway->consultarPagamento($venda->payment_reference);

        if ($response) {
            $this->sincronizarVenda($venda, $response);
        }

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

        $venda->update([
            'payment_provider' => $response->provider,
            'payment_reference' => $response->reference,
            'payment_status' => $response->status,
            'payment_method_detail' => $response->method,
            'payment_payload' => $response->raw,
            'pix_qr_code' => $response->pixQrCode,
            'pix_qr_code_base64' => $response->pixQrCodeBase64,
            'status' => $novoStatus,
        ]);
    }
}
