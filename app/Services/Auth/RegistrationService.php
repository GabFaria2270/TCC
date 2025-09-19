<?php

namespace App\Services\Auth;

use App\Models\Usuario;
use App\Services\Auth\CacheTokenService; // ✅ ADICIONAR
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Comercio;

class RegistrationService
{
    protected ?CacheTokenService $tokenService; // ✅ ADICIONAR

    public function __construct(?CacheTokenService $tokenService = null) // ✅ ADICIONAR
    {
        $this->tokenService = $tokenService;
    }

    /**
     * Cria um novo usuário
     */
    public function create(array $data, Request $request): array
    {
        try {
            // INICIA TRANSAÇÃO PARA SEGURANÇA
            DB::beginTransaction();

            // VERIFICA SE EMAIL JÁ EXISTE
            $emailExists = Usuario::byEmail($data['EMAIL'])->exists();
            if ($emailExists) {
                DB::rollback();
                return [
                    'success' => false,
                    'errors' => ['EMAIL' => 'Este e-mail já está cadastrado.'],
                    'reason' => 'email_exists'
                ];
            }

            // VERIFICA SE PERFIL JÁ EXISTE
            $perfilExists = Usuario::byPerfil($data['PERFIL'])->exists();
            if ($perfilExists) {
                DB::rollback();
                return [
                    'success' => false,
                    'errors' => ['PERFIL' => __('validation.profile_in_use')],
                    'reason' => 'profile_exists'
                ];
            }

            // LOG DE DEBUG
            $this->logCreationDebug($data);

            // CRIA USUÁRIO
            $usuario = Usuario::create([
                'NOME' => $data['NOME'],
                'EMAIL' => $data['EMAIL'],
                'SENHA_HASH' => $data['SENHA_HASH'],
                'PERFIL' => $data['PERFIL'],
            ]);

            // VERIFICA SE USUÁRIO FOI CRIADO
            if (!$usuario) {
                DB::rollback();
                return [
                    'success' => false,
                    'errors' => ['system' => 'Falha ao criar usuário.'],
                    'reason' => 'creation_failed'
                ];
            }

            // CRIA MERCEARIA E VINCULA AO USUÁRIO
            $comercio = Comercio::create([
                'nome' => $data['COMERCIO_NOME'],
                'cnpj' => $data['COMERCIO_CNPJ'],
                'usuario_id' => $usuario->id,
            ]);

            // VERIFICA SE MERCEARIA FOI CRIADA
            if (!$comercio) {
                DB::rollback();
                return [
                    'success' => false,
                    'errors' => ['system' => 'Falha ao criar comércio.'],
                    'reason' => 'creation_failed'
                ];
            }

            // Não faz login automático e não gera token no cadastro.
            $tokenData = null;

            // CONFIRMA TRANSAÇÃO
            DB::commit();

            return [
                'success' => true,
                'user' => $usuario,
                'reason' => 'success',
                'token_data' => $tokenData
            ];

        } catch (\Illuminate\Database\QueryException $e) {
            // ERRO DE BANCO DE DADOS
            DB::rollback();
            
            Log::error('Erro de banco no RegistrationService', [
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
            // ERRO GERAL
            DB::rollback();
            
            Log::error('Erro geral no RegistrationService', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
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
     * Log de debug para criação
     */
    private function logCreationDebug(array $data): void
    {
        Log::channel('security')->info('DEBUG Registration Service', [
            'email_enviado' => $data['EMAIL'],
            'nome_enviado' => $data['NOME'],
            'perfil_enviado' => $data['PERFIL'],
            'senha_hash_length' => strlen($data['SENHA_HASH']),
        ]);
    }
}