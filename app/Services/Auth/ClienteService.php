<?php
// filepath: c:\Users\User\Desktop\TCC\app\Services\Auth\ClienteService.php

namespace App\Services\Auth; // ✅ CORRIGIR PARA COINCIDIR COM A PASTA

use App\Models\Cliente;
use App\Models\ContaFiada;
use App\Models\Comercio;
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

            Log::info('ClienteService: Criando cliente', [
                'nome' => $data['nome'],
                'email' => $data['email'],
                'comercio_id' => $comercio->id
            ]);

            // CRIA CLIENTE
            $cliente = Cliente::create([
                'nome' => $data['nome'],
                'email' => $data['email'],
                'telefone' => $data['telefone'] ?? null,
                'comercio_id' => $comercio->id,
            ]);

            if (!$cliente) {
                DB::rollback();
                Log::error('ClienteService: Falha ao criar cliente');
                return [
                    'success' => false,
                    'errors' => ['system' => 'Falha ao criar cliente.'],
                    'reason' => 'creation_failed'
                ];
            }

            // CRIA CONTA FIADA COM DESCRIÇÃO
            $saldoInicial = 0.00;
            if (isset($data['saldo_inicial']) && $data['saldo_inicial'] !== null && $data['saldo_inicial'] !== '') {
                $saldoInicial = floatval(str_replace(',', '.', $data['saldo_inicial']));
            }

            // DESCRIÇÃO PADRÃO OU PERSONALIZADA
            $descricao = 'Saldo inicial do cliente';
            if (isset($data['descricao']) && !empty(trim($data['descricao']))) {
                $descricao = trim($data['descricao']);
            }

            $contaFiada = ContaFiada::create([
                'cliente_id' => $cliente->id,
                'comercio_id' => $comercio->id,
                'saldo' => $saldoInicial,
                'descricao' => $descricao, // NOVO CAMPO
            ]);

            if (!$contaFiada) {
                DB::rollback();
                Log::error('ClienteService: Falha ao criar conta fiada');
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

            Log::info('ClienteService: Cliente cadastrado com sucesso', [
                'cliente_id' => $cliente->id,
                'nome' => $cliente->nome,
                'saldo' => $saldoInicial,
                'descricao' => $descricao
            ]);

            return [
                'success' => true,
                'cliente' => $cliente,
                'reason' => 'success'
            ];

        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollback();
            
            Log::error('ClienteService: Erro de banco', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'data' => $data,
            ]);

            return [
                'success' => false,
                'errors' => ['system' => 'Erro de banco de dados: ' . $e->getMessage()],
                'reason' => 'database_error'
            ];

        } catch (\Exception $e) {
            DB::rollback();
            
            Log::error('ClienteService: Erro geral', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'data' => $data,
            ]);

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

            // ✅ CARREGAR CONTA FIADA COM TODOS OS CAMPOS
            $clientes = Cliente::where('comercio_id', $comercio->id)
                ->with(['contaFiada' => function($query) {
                    $query->select('id', 'cliente_id', 'comercio_id', 'saldo', 'descricao'); // ✅ INCLUIR DESCRIÇÃO
                }])
                ->orderBy('nome', 'asc')
                ->get();

            return [
                'success' => true,
                'clientes' => $clientes,
                'reason' => 'success'
            ];

        } catch (\Exception $e) {
            Log::error('Erro ao listar clientes', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return [
                'success' => false,
                'errors' => ['system' => 'Erro ao carregar clientes: ' . $e->getMessage()],
                'reason' => 'system_error'
            ];
        }
    }
}