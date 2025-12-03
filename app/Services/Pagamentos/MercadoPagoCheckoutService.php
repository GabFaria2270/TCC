<?php

namespace App\Services\Pagamentos;

use App\Models\Venda;

class MercadoPagoCheckoutService
{
    public function __construct(private PaymentGatewayInterface $gateway)
    {
    }

    public function criarPagamento(Venda $venda, array $payload): PaymentResponse
    {
        return $this->gateway->criarPagamento($venda, $payload);
    }
}
