<?php

namespace App\Services\Pagamentos;

use App\Models\Venda;

interface PaymentGatewayInterface
{
    /**
     * Cria um pagamento remoto para a venda informada.
     *
     * @param  Venda  $venda
     * @param  array  $payload Dados específicos do método de pagamento (token, payer etc.)
     * @return PaymentResponse
     */
    public function criarPagamento(Venda $venda, array $payload): PaymentResponse;

    /**
     * Consulta o status de um pagamento remoto.
     */
    public function consultarPagamento(string $paymentReference): ?PaymentResponse;
}
