<?php


namespace App\Services;

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
            $emailExists = Cliente::byEmail($data['email'])
                ->byComercio($comercio->id)
                ->exists();

            if ($emailExists) {
                DB::rollback();
                return [
                    'success' => false,
                    'errors' => ['email' => 'Este e-mail já está cadastrado neste comércio.'],
                    'reason' => 'email_exists'
                ];
            }

            // LOG DE DEBUG
            $this->logCadastroDebug($data, $comercio->id);

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

            // CRIA CONTA FIADA
            $contaFiada = ContaFiada::create([
                'cliente_id' => $cliente->id,
                'saldo' => $data['saldo_inicial'] ?? 0.00,
                'comercio_id' => $comercio->id,
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

            // LOG DE SUCESSO
            $this->logCadastroSucesso($cliente, $request);

            return [
                'success' => true,
                'cliente' => $cliente->load('contaFiada'),
                'reason' => 'success'
            ];

        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollback();
            
            Log::error('Erro de banco no ClienteService', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'data' => $data,
            ]);

            return [
                'success' => false,
                'errors' => ['system' => 'Erro de banco de dados.'],
                'reason' => 'database_error'
            ];

        } catch (\Exception $e) {
            DB::rollback();
            
            Log::error('Erro geral no ClienteService', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'data' => $data,
            ]);

            return [
                'success' => false,
                'errors' => ['system' => 'Erro interno do sistema.'],
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

            $clientes = Cliente::byComercio($comercio->id)
                ->withContaFiada()
                ->orderBy('nome')
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
                'errors' => ['system' => 'Erro ao carregar clientes.'],
                'reason' => 'system_error'
            ];
        }
    }

    /**
     * Log de debug para cadastro
     */
    private function logCadastroDebug(array $data, int $comercioId): void
    {
        Log::channel('security')->info('DEBUG Cliente Service', [
            'nome_enviado' => $data['nome'],
            'email_enviado' => $data['email'],
            'telefone_enviado' => $data['telefone'] ?? 'N/A',
            'saldo_inicial' => $data['saldo_inicial'] ?? 0,
            'comercio_id' => $comercioId,
        ]);
    }

    /**
     * Log de sucesso
     */
    private function logCadastroSucesso(Cliente $cliente, Request $request): void
    {
        Log::channel('security')->info('Cliente cadastrado com sucesso', [
            'cliente_id' => $cliente->id,
            'nome' => $cliente->nome,
            'email' => $cliente->email,
            'comercio_id' => $cliente->comercio_id,
            'user_id' => Auth::id(),
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);
    }
}