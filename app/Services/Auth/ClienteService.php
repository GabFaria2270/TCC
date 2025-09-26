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
     * Cadastra um novo cliente com conta fiada
     */
    public function cadastrar(array $data, Request $request): array
    {
        try {
            // INICIA TRANSAÇÃO
            DB::beginTransaction();

            // PEGA COMÉRCIO DO USUÁRIO LOGADO
            $usuario = Auth::user();
            $comercio = $usuario->comercio;

            if (!$comercio) {
                DB::rollback();
                return [
                    'success' => false,
                    'errors' => ['system' => 'Comércio não encontrado para o usuário.'],
                    'reason' => 'comercio_not_found'
                ];
            }

            // VERIFICA SE EMAIL JÁ EXISTE NESTE COMÉRCIO
            $emailExists = Cliente::where('email', $data['email'])
                ->where('comercio_id', $comercio->id)
                ->exists();

            if ($emailExists) {
                DB::rollback();
                return [
                    'success' => false,
                    'errors' => ['email' => 'Este e-mail já está cadastrado neste comércio.'],
                    'reason' => 'email_exists'
                ];
            }

            // CRIA CLIENTE
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
                    'errors' => ['system' => 'Falha ao criar cliente.'],
                    'reason' => 'creation_failed'
                ];
            }

            // CRIA CONTA FIADA COM DESCRIÇÃO
            $saldoInicial = 0.00;
            if (isset($data['saldo_inicial']) && $data['saldo_inicial'] !== null && $data['saldo_inicial'] !== '') {
                $saldoInicial = floatval($data['saldo_inicial']);
            }

            Log::info('Valor recebido para saldo_inicial:', ['valor' => $data['saldo_inicial']]);

            // Descrição: vazio se não informado
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

            if (!$contaFiada) {
                DB::rollback();
                return [
                    'success' => false,
                    'errors' => ['system' => 'Falha ao criar conta fiada.'],
                    'reason' => 'conta_creation_failed'
                ];
            }

            // CONFIRMA TRANSAÇÃO
            DB::commit();

            // CARREGAR RELACIONAMENTOS
            $cliente->load('contaFiada');

            return [
                'success' => true,
                'cliente' => $cliente,
                'reason' => 'success'
            ];

        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollback();
            return [
                'success' => false,
                'errors' => ['system' => 'Erro de banco de dados: ' . $e->getMessage()],
                'reason' => 'database_error'
            ];

        } catch (\Exception $e) {
            DB::rollback();
            return [
                'success' => false,
                'errors' => ['system' => 'Erro interno: ' . $e->getMessage()],
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
}