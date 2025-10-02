<?php
// filepath: c:\Users\User\Desktop\TCC\app\Services\Auth\ClienteService.php

namespace App\Services\Auth; // ✅ CORRIGIR PARA COINCIDIR COM A PASTA

use App\Models\Cliente;
use App\Models\ContaFiada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ClienteService
{
    /**
     * ✅ Usa mensagens centralizadas do validation.php
     */
    public function cadastrar(array $data, Request $request): array
    {
        try {
            DB::beginTransaction();

            $usuario = Auth::user();
            $comercio = $usuario->comercio;

            if (!$comercio) {
                DB::rollback();
                return [
                    'success' => false,
                    'errors' => ['system' => __('validation.comercio_not_found')],
                    'reason' => 'comercio_not_found'
                ];
            }

            // ✅ Verifica email usando mensagem centralizada
            $emailExists = Cliente::where('email', $data['email'])
                ->where('comercio_id', $comercio->id)
                ->exists();

            if ($emailExists) {
                DB::rollback();
                return [
                    'success' => false,
                    'errors' => ['email' => __('validation.cliente_email_exists')],
                    'reason' => 'email_exists'
                ];
            }

            $cliente = Cliente::create([
                'nome' => $data['nome'],
                'email' => $data['email'],
                'telefone' => $data['telefone'] ?? null,
                'comercio_id' => $comercio->id,
            ]);

            if (!$cliente) {
                DB::rollback();
                return [
                    'success' => false,
                    'errors' => ['system' => __('validation.cliente_creation_failed')],
                    'reason' => 'creation_failed'
                ];
            }

            $saldoInicial = 0.00;
            // ✅ CORRIGIDO: Verifica se existe, não é null, não é string vazia E é numérico
            if (isset($data['saldo_inicial']) && 
                $data['saldo_inicial'] !== null && 
                $data['saldo_inicial'] !== '' && 
                is_numeric($data['saldo_inicial'])) {
                $saldoInicial = floatval($data['saldo_inicial']);
            }

            $descricao = '';
            if (isset($data['descricao']) && !empty(trim($data['descricao']))) {
                $descricao = trim($data['descricao']);
            }

            $contaFiada = ContaFiada::create([
                'cliente_id' => $cliente->id,
                'comercio_id' => $comercio->id,
                'saldo' => $saldoInicial,
                'descricao' => $descricao,
            ]);

            DB::commit();
            $cliente->load('contaFiada');

            return [
                'success' => true,
                'cliente' => $cliente,
                'reason' => 'success'
            ];

        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollback();
            Log::error('Erro de banco ao cadastrar cliente', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'errors' => ['system' => __('validation.database_error')],
                'reason' => 'database_error'
            ];

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Erro interno ao cadastrar cliente', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'errors' => ['system' => __('validation.system_error')],
                'reason' => 'system_error'
            ];
        }
    }

    /**
     * Lista clientes do comércio
     */
    public function listarClientes(): array
    {
        try {
            $usuario = Auth::user();
            $comercio = $usuario->comercio;

            if (!$comercio) {
                return [
                    'success' => false,
                    'errors' => ['system' => 'Comércio não encontrado.'],
                    'reason' => 'comercio_not_found'
                ];
            }

            $clientes = Cliente::where('comercio_id', $comercio->id)
                ->with(['contaFiada' => function($query) {
                    $query->select('id', 'cliente_id', 'comercio_id', 'saldo', 'descricao');
                }])
                ->orderBy('nome', 'asc')
                ->get();

            return [
                'success' => true,
                'clientes' => $clientes,
                'reason' => 'success'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'errors' => ['system' => 'Erro ao carregar clientes: ' . $e->getMessage()],
                'reason' => 'system_error'
            ];
        }
    }

    public function pagarContaFiada($clienteId, $usuario)
    {
        try {
            $cliente = Cliente::where('id', $clienteId)
                ->where('comercio_id', $usuario->comercio->id)
                ->first();

            if (!$cliente) {
                return ['success' => false, 'error' => 'Cliente não encontrado.'];
            }

            $contaFiada = $cliente->contaFiada;
            if (!$contaFiada) {
                return ['success' => false, 'error' => 'Conta fiada não encontrada.'];
            }

            $contaFiada->delete();

            return ['success' => true];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Erro interno ao pagar conta fiada.'];
        }
    }

    /**
     * Atualiza um cliente e sua conta fiada
     */
    public function atualizar(int $clienteId, array $data, $request): array
    {
        try {
            DB::beginTransaction();

            $usuario = Auth::user();
            $comercio = $usuario->comercio;

            if (!$comercio) {
                DB::rollback();
                return [
                    'success' => false,
                    'errors' => ['system' => __('validation.comercio_not_found')],
                    'reason' => 'comercio_not_found'
                ];
            }

            $cliente = Cliente::where('id', $clienteId)
                ->where('comercio_id', $comercio->id)
                ->first();

            if (!$cliente) {
                DB::rollback();
                return [
                    'success' => false,
                    'errors' => ['system' => __('validation.cliente_not_found')],
                    'reason' => 'cliente_not_found'
                ];
            }

            // ✅ Verifica email duplicado com mensagem centralizada
            if (isset($data['email']) && $data['email'] !== $cliente->email) {
                $emailExists = Cliente::where('email', $data['email'])
                    ->where('comercio_id', $comercio->id)
                    ->where('id', '!=', $clienteId)
                    ->exists();
                
                if ($emailExists) {
                    DB::rollback();
                    return [
                        'success' => false,
                        'errors' => ['email' => __('validation.cliente_email_exists')],
                        'reason' => 'email_exists'
                    ];
                }
            }

            // Atualiza cliente
            $cliente->nome = $data['nome'];
            $cliente->email = $data['email'];
            $cliente->telefone = $data['telefone'] ?? null;
            $cliente->save();

            // Atualiza conta fiada
            $contaFiada = $cliente->contaFiada;
            if ($contaFiada) {
                $contaFiada->saldo = isset($data['saldo_inicial']) && $data['saldo_inicial'] !== '' ? floatval($data['saldo_inicial']) : 0.00;
                $contaFiada->descricao = isset($data['descricao']) ? trim($data['descricao']) : '';
                $contaFiada->save();
            } else if (
                (isset($data['saldo_inicial']) && $data['saldo_inicial'] !== '' && floatval($data['saldo_inicial']) != 0)
                || (isset($data['descricao']) && trim($data['descricao']) !== '')
            ) {
                // Cria nova conta fiada se algum campo for preenchido
                \App\Models\ContaFiada::create([
                    'cliente_id' => $cliente->id,
                    'comercio_id' => $comercio->id,
                    'saldo' => isset($data['saldo_inicial']) && $data['saldo_inicial'] !== '' ? floatval($data['saldo_inicial']) : 0.00,
                    'descricao' => isset($data['descricao']) ? trim($data['descricao']) : '',
                ]);
            }

            DB::commit();
            $cliente->load('contaFiada');
            
            return [
                'success' => true,
                'cliente' => $cliente,
                'reason' => 'success'
            ];

        } catch (\Exception $e) {
            DB::rollback();
            return [
                'success' => false,
                'errors' => ['system' => __('validation.system_error')],
                'reason' => 'system_error'
            ];
        }
    }
}