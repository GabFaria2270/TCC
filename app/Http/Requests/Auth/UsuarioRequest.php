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
                Password::min(12)
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
            'COMERCIO_NOME' => ['required', 'string', 'min:2', 'max:255'],
            'COMERCIO_CNPJ' => ['required', 'string', 'size:14', 'unique:comercio,cnpj'],
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