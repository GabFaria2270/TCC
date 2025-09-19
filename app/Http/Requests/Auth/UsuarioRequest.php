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

    public function prepareForValidation()
    {
        $this->merge([
            'EMAIL' => strtolower(trim($this->EMAIL ?? '')),
            'PERFIL' => strtoupper(trim($this->PERFIL ?? '')),
            'COMERCIO_CNPJ' => preg_replace('/\D/', '', $this->COMERCIO_CNPJ ?? ''),
        ]);
    }

    public function rules(): array
    {
        return [
            'NOME' => 'required|string|min:2|max:255|regex:/^[a-zA-ZÀ-ÿ\s]+$/',
            'EMAIL' => 'required|email|max:255|unique:usuario,EMAIL',
            'SENHA_HASH' => [
                'required',
                'string',
                'min:12',
                'confirmed',
                Password::min(12)->letters()->mixedCase()->numbers()->symbols()
            ],
            'PERFIL' => 'required|string|max:100',
            'COMERCIO_NOME' => 'required|string|min:2|max:255',
            'COMERCIO_CNPJ' => [
                'required',
                'string',
                'size:14',
                'regex:/^\d{14}$/',
                'unique:comercio,cnpj',
                function ($attribute, $value, $fail) {
                    if (!$this->isValidCnpj($value)) {
                        $fail(__('validation.cnpj_invalid', ['attribute' => $attribute]));
                    }
                },
            ],
        ];
    }

    private function isValidCnpj(string $cnpj): bool
    {
        $cnpj = preg_replace('/\D/', '', $cnpj);

        if (strlen($cnpj) !== 14) {
            return false;
        }

        if (preg_match('/(\d)\1{13}/', $cnpj)) {
            return false;
        }

        $sum = 0;
        $weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        for ($i = 0; $i < 12; $i++) {
            $sum += $cnpj[$i] * $weights[$i];
        }

        $remainder = $sum % 11;
        $digit1 = $remainder < 2 ? 0 : 11 - $remainder;

        if ($cnpj[12] != $digit1) {
            return false;
        }

        $sum = 0;
        $weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        for ($i = 0; $i < 13; $i++) {
            $sum += $cnpj[$i] * $weights[$i];
        }

        $remainder = $sum % 11;
        $digit2 = $remainder < 2 ? 0 : 11 - $remainder;

        return $cnpj[13] == $digit2;
    }
}