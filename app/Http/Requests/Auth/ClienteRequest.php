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
                // Adiciona validação de unicidade para o comércio
                function ($attribute, $value, $fail) {
                    $comercioId = auth()->user()->comercio->id ?? null;
                    if ($comercioId && \App\Models\Cliente::where('email', $value)->where('comercio_id', $comercioId)->exists()) {
                        $fail(__('validation.cliente_email_exists'));
                    }
                },
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
                            $fail(__("validation.custom.telefone.digits_max"));
                        }
                        if (strlen($apenasNumeros) > 0 && strlen($apenasNumeros) < 10) {
                            $fail(__("validation.custom.telefone.digits_min"));
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

        // ✅ CORRIGIDO: Limpa formatação da moeda brasileira
        if (is_string($saldo)) {
            // Remove separadores de milhares (pontos)
            $saldo = str_replace('.', '', $saldo);
            // Converte vírgula decimal para ponto
            $saldo = str_replace(',', '.', $saldo);
            // Remove espaços e caracteres não numéricos (exceto ponto decimal)
            $saldo = preg_replace('/[^0-9.-]/', '', $saldo);
        }

        // ✅ CORRIGIDO: Só converte para null se realmente for vazio ou inválido
        if ($saldo === '' || $saldo === null) {
            $saldo = null;
        } else if (!is_numeric($saldo)) {
            $saldo = null; // ✅ Só aqui que vira null se não for numérico
        } else {
            $saldo = floatval($saldo); // ✅ Converte para float se for válido
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