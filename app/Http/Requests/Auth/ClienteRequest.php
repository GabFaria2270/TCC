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
                'max:20', // Máximo para formato "(00) 00000-0000"
                'regex:/^[\d\s\(\)\-\+]+$/',
                // ✅ Validação adicional para garantir máximo 11 dígitos
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $apenasNumeros = preg_replace('/\D/', '', $value);
                        if (strlen($apenasNumeros) > 11) {
                            $fail('O telefone não pode ter mais que 11 dígitos.');
                        }
                        if (strlen($apenasNumeros) > 0 && strlen($apenasNumeros) < 10) {
                            $fail('O telefone deve ter pelo menos 10 dígitos.');
                        }
                    }
                }
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

    protected function prepareForValidation(): void
    {
        $saldo = $this->saldo_inicial;

        if (is_string($saldo)) {
            $saldo = str_replace('.', '', $saldo);
            $saldo = str_replace(',', '.', $saldo);
        }

        if ($saldo === '' || $saldo === null || !is_numeric($saldo)) {
            $saldo = null;
        }

        // ✅ Limpa telefone e remove caracteres especiais
        $telefone = $this->telefone;
        if ($telefone) {
            // Remove tudo que não é número
            $telefone = preg_replace('/[^0-9]/', '', $telefone);

            // ✅ Aplica limite de 11 dígitos
            if (strlen($telefone) > 11) {
                $telefone = substr($telefone, 0, 11);
            }
        }

        $this->merge([
            'nome' => $this->nome ? ucwords(strtolower(trim($this->nome))) : null,
            'email' => $this->email ? strtolower(trim($this->email)) : null,
            'telefone' => $telefone ?: null,
            'saldo_inicial' => $saldo,
            'descricao' => $this->descricao ? trim($this->descricao) : null,
        ]);
    }
}