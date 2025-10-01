<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ProdutoUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        $comercioId = optional(Auth::user()?->comercio)->id;
        return [
            'nome' => ['required', 'string', 'max:150'],
            'preco' => ['required', 'numeric', 'min:0'],
            'quantidade' => ['nullable', 'integer', 'min:0'],
            'estoque_minimo' => ['nullable', 'integer', 'min:0'],
            'categoria_id' => [
                'nullable',
                'integer',
                'required_without:nova_categoria_nome',
                Rule::exists('categoria', 'id')->where(fn ($q) => $q->where('comercio_id', $comercioId)),
            ],
            'nova_categoria_nome' => ['nullable', 'string', 'max:100', 'required_without:categoria_id'],
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome do produto é obrigatório.',
            'nome.max' => 'O nome do produto não pode ultrapassar 150 caracteres.',
            'preco.required' => 'Informe o preço do produto.',
            'preco.numeric' => 'O preço deve ser um valor numérico.',
            'preco.min' => 'O preço não pode ser negativo.',
            'quantidade.integer' => 'A quantidade deve ser um número inteiro.',
            'quantidade.min' => 'A quantidade não pode ser negativa.',
            'estoque_minimo.integer' => 'O estoque mínimo deve ser um número inteiro.',
            'estoque_minimo.min' => 'O estoque mínimo não pode ser negativo.',
            'categoria_id.required_without' => 'Escolha uma categoria existente ou informe uma nova.',
            'categoria_id.exists' => 'A categoria selecionada não é válida.',
            'nova_categoria_nome.required_without' => 'Informe o nome da nova categoria quando não selecionar uma existente.',
            'nova_categoria_nome.max' => 'O nome da categoria deve ter no máximo 100 caracteres.',
        ];
    }
}
