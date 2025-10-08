<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VendaRequest extends FormRequest
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
                // aceitar dinheiro, pix, conta_fiada, debito/credito e sinônimos de cartão
                Rule::in(['dinheiro','pix','conta_fiada','debito','credito','cartao_debito','cartao_credito']),
            ],
            'cliente_id' => 'nullable|required_if:forma_pagamento,conta_fiada|integer|exists:cliente,id', // ✅ CORRIGIDO: nullable primeiro
            'valor_recebido' => 'required_if:forma_pagamento,dinheiro|numeric|min:0',
            'desconto' => 'nullable|numeric|min:0',
            'observacoes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            // Mensagens dos itens
            'itens.required' => __('validation.custom.itens.required'),
            'itens.array' => __('validation.custom.itens.array'),
            'itens.min' => __('validation.custom.itens.min'),
            
            // Mensagens dos produtos
            'itens.*.produto_id.required' => __('validation.custom.itens.*.produto_id.required'),
            'itens.*.produto_id.integer' => __('validation.custom.itens.*.produto_id.integer'),
            'itens.*.produto_id.exists' => __('validation.custom.itens.*.produto_id.exists'),
            
            // Mensagens das quantidades
            'itens.*.quantidade.required' => __('validation.custom.itens.*.quantidade.required'),
            'itens.*.quantidade.integer' => __('validation.custom.itens.*.quantidade.integer'),
            'itens.*.quantidade.min' => __('validation.custom.itens.*.quantidade.min'),
            
            // Mensagens dos preços
            'itens.*.preco_unitario.required' => __('validation.custom.itens.*.preco_unitario.required'),
            'itens.*.preco_unitario.numeric' => __('validation.custom.itens.*.preco_unitario.numeric'),
            'itens.*.preco_unitario.min' => __('validation.custom.itens.*.preco_unitario.min'),
            
            // Forma de pagamento
            'forma_pagamento.required' => __('validation.custom.forma_pagamento.required'),
            'forma_pagamento.in' => __('validation.custom.forma_pagamento.in'),
            
            // Cliente
            'cliente_id.required_if' => __('validation.custom.cliente_id.required_if'),
            'cliente_id.exists' => __('validation.custom.cliente_id.exists'),
            'cliente_id.integer' => __('validation.custom.cliente_id.integer'),
            
            // Valor recebido
            'valor_recebido.required_if' => __('validation.custom.valor_recebido.required_if'),
            'valor_recebido.numeric' => __('validation.custom.valor_recebido.numeric'),
            'valor_recebido.min' => __('validation.custom.valor_recebido.min'),
            
            // Desconto
            'desconto.numeric' => __('validation.custom.desconto.numeric'),
            'desconto.min' => __('validation.custom.desconto.min'),
            
            // Observações
            'observacoes.string' => __('validation.custom.observacoes.string'),
            'observacoes.max' => __('validation.custom.observacoes.max'),
        ];
    }
}