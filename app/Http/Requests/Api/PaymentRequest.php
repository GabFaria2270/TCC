<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'itens' => 'required|array|min:1',
            'itens.*.produto_id' => 'required|integer|exists:produto,id',
            'itens.*.quantidade' => 'required|integer|min:1',
            'itens.*.preco_unitario' => 'required|numeric|min:0',
            'forma_pagamento' => [
                'required',
                Rule::in(['dinheiro', 'pix', 'conta_fiada', 'debito', 'credito', 'cartao_debito', 'cartao_credito']),
            ],
            'cliente_id' => 'nullable|required_if:forma_pagamento,conta_fiada|integer|exists:cliente,id',
            'valor_recebido' => 'required_if:forma_pagamento,dinheiro|numeric|min:0',
            'desconto' => 'nullable|numeric|min:0',
            'observacoes' => 'nullable|string|max:500',

            'payer.email' => 'nullable|email',
            'payer.first_name' => 'nullable|string|max:120',
            'payer.last_name' => 'nullable|string|max:120',
            'payer.document.type' => 'nullable|string|max:4',
            'payer.document.number' => 'nullable|string|max:20',

            'card.token' => 'required_if:forma_pagamento,cartao_credito,cartao_debito|string',
            'card.payment_method_id' => 'required_with:card.token|string',
            'card.installments' => 'nullable|integer|min:1|max:12',
            'card.issuer_id' => 'nullable|integer',
        ];
    }
}
