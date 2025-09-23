<?php


namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => [
                'required',
                'string',
                'max:100',
                'regex:/^[A-Za-zÀ-ÿ\s]+$/',
            ],
            'email' => [
                'required',
                'email',
                'max:150',
                'unique:cliente,email',
            ],
            'telefone' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^\(\d{2}\)\s\d{4,5}-\d{4}$/',
            ],
            'saldo_inicial' => [
                'nullable',
                'numeric',
                'min:0',
                'max:999999.99',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome do cliente é obrigatório.',
            'nome.regex' => 'O nome deve conter apenas letras e espaços.',
            'nome.max' => 'O nome não pode ter mais que 100 caracteres.',
            
            'email.required' => 'O e-mail é obrigatório.',
            'email.email' => 'Digite um e-mail válido.',
            'email.unique' => 'Este e-mail já está cadastrado.',
            
            'telefone.regex' => 'Telefone deve estar no formato (00) 0000-0000 ou (00) 00000-0000.',
            
            'saldo_inicial.numeric' => 'O saldo inicial deve ser um número válido.',
            'saldo_inicial.min' => 'O saldo inicial não pode ser negativo.',
            'saldo_inicial.max' => 'O saldo inicial muito alto.',
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'nome' => ucwords(strtolower($this->nome)),
            'email' => strtolower($this->email),
            'telefone' => $this->telefone ? preg_replace('/[^0-9]/', '', $this->telefone) : null,
        ]);
    }
}