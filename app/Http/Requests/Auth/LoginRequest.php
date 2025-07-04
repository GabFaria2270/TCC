<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'EMAIL' => [
                'required',
                'email:rfc,dns',
                'max:150',
            ],
            'SENHA_HASH' => [
                'required',
                'string',
                'min:6',
            ],
            'remember' => [
                'boolean',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'EMAIL.required' => 'O e-mail é obrigatório.',
            'EMAIL.email' => 'Digite um e-mail válido.',
            'EMAIL.max' => 'O e-mail deve ter no máximo 150 caracteres.',
            'SENHA_HASH.required' => 'A senha é obrigatória.',
            'SENHA_HASH.min' => 'A senha deve ter pelo menos 6 caracteres.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'EMAIL' => strtolower(trim($this->EMAIL ?? '')),
            'remember' => $this->boolean('remember'),
        ]);
    }
}
