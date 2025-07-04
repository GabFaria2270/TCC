<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'NOME' => [
                'required',
                'string',
                'max:100',
                'min:2',
                'regex:/^[a-zA-ZÀ-ÿ\s]+$/',
            ],
            'EMAIL' => [
                'required',
                'email:rfc,dns',
                'max:150',
                'unique:usuario,EMAIL',
                'lowercase',
            ],
            'SENHA_HASH' => [
                'required',
                'confirmed',
                Password::min(12) // Reduzindo de 12 para 8 para facilitar testes
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],
            'PERFIL' => [
                'required',
                'string',
                'max:50',
                'min:3',
                'unique:usuario,PERFIL',
                'alpha_dash',
                'lowercase',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'NOME.required' => 'O nome é obrigatório.',
            'NOME.min' => 'O nome deve ter pelo menos 2 caracteres.',
            'NOME.regex' => 'O nome deve conter apenas letras e espaços.',
            
            'EMAIL.required' => 'O email é obrigatório.',
            'EMAIL.email' => 'Digite um email válido.',
            'EMAIL.unique' => 'Este email já está cadastrado.',
            'EMAIL.lowercase' => 'O email deve estar em minúsculas.',
            
            'SENHA_HASH.required' => 'A senha é obrigatória.',
            'SENHA_HASH.confirmed' => 'A confirmação da senha não confere.',
            'SENHA_HASH.uncompromised' => '⚠️ Esta senha foi encontrada em vazamentos de dados. Escolha uma senha diferente.',
            
            'PERFIL.required' => 'O perfil é obrigatório.',
            'PERFIL.min' => 'O perfil deve ter pelo menos 3 caracteres.',
            'PERFIL.unique' => 'Este perfil já está em uso.',
            'PERFIL.alpha_dash' => 'O perfil deve conter apenas letras, números, _ e -.',
            'PERFIL.lowercase' => 'O perfil deve estar em minúsculas.',
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'EMAIL' => strtolower(trim($this->EMAIL ?? '')),
            'NOME' => ucwords(strtolower(trim($this->NOME ?? ''))),
            'PERFIL' => strtolower(trim($this->PERFIL ?? '')),
        ]);
    }
}