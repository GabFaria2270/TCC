<?php


namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class ClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'nome' => [
                'required',
                'string',
                'max:100',
                'regex:/^[A-Za-zÀ-ÿ\s]+$/'
            ],
            'email' => [
                'required',
                'email',
                'max:150',
            ],
            'telefone' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^[\d\s\(\)\-\+]+$/'
            ],
            'saldo_inicial' => [
                'nullable',
                'numeric',
                'min:-999999.99',
                'max:999999.99'
            ],
            'descricao' => [
                'nullable',
                'string',
                'max:500'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome do cliente é obrigatório.',
            'nome.string' => 'O nome deve ser um texto válido.',
            'nome.max' => 'O nome não pode ter mais que 100 caracteres.',
            'nome.regex' => 'O nome deve conter apenas letras e espaços.',
            
            'email.required' => 'O e-mail é obrigatório.',
            'email.email' => 'Digite um e-mail válido.',
            'email.max' => 'O e-mail não pode ter mais que 150 caracteres.',
            
            'telefone.string' => 'O telefone deve ser um texto válido.',
            'telefone.max' => 'O telefone não pode ter mais que 20 caracteres.',
            'telefone.regex' => 'Formato de telefone inválido.',
            
            'saldo_inicial.numeric' => 'O saldo inicial deve ser um número válido.',
            'saldo_inicial.min' => 'O saldo inicial é muito baixo.',
            'saldo_inicial.max' => 'O saldo inicial é muito alto.',
            
            'descricao.string' => 'A descrição deve ser um texto válido.',
            'descricao.max' => 'A descrição não pode ter mais que 500 caracteres.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $saldo = $this->saldo_inicial;

        // Remove pontos de milhar e troca vírgula por ponto
        if (is_string($saldo)) {
            $saldo = str_replace('.', '', $saldo);
            $saldo = str_replace(',', '.', $saldo);
        }

        // Se não for numérico ou estiver vazio, vira null
        if ($saldo === '' || $saldo === null || !is_numeric($saldo)) {
            $saldo = null;
        }

        $this->merge([
            'nome' => $this->nome ? ucwords(strtolower(trim($this->nome))) : null,
            'email' => $this->email ? strtolower(trim($this->email)) : null,
            'telefone' => $this->telefone ? preg_replace('/[^0-9]/', '', $this->telefone) : null,
            'saldo_inicial' => $saldo,
            'descricao' => $this->descricao ? trim($this->descricao) : null,
        ]);
    }
}