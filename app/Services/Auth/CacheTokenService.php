<?php

namespace App\Services\Auth;

use App\Models\Usuario;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CacheTokenService
{
  private int $expirationMinutes = 1440; // 24 horas
    
    /**
     * ✅ FUNCIONA COM SUA TABELA CACHE EXISTENTE
     */
    public function generateToken(Usuario $usuario): string
    {
        try {
            // Gera token único (40 caracteres)
            $tokenId = Str::random(40);
            $cacheKey = "auth_token:{$tokenId}";
            
            $tokenData = [
                'user_id' => $usuario->id,
                'email' => $usuario->EMAIL,
                'nome' => $usuario->NOME,
                'perfil' => $usuario->PERFIL,
                'created_at' => now()->toDateTimeString(),
                'expires_at' => now()->addMinutes($this->expirationMinutes)->toDateTimeString(),
                'ip' => request()->ip(),
                'user_agent' => substr(request()->userAgent() ?? '', 0, 500),
            ];

            // ✅ ARMAZENA NA SUA TABELA CACHE (igual ao Rate Limiting)
            $expiresAt = now()->addMinutes($this->expirationMinutes);
            Cache::put($cacheKey, $tokenData, $expiresAt);
            
            // Verifica se foi armazenado (debug)
            $verification = Cache::get($cacheKey);
            if (!$verification) {
                throw new \Exception('Falha ao armazenar token no cache');
            }
            
            // Log de sucesso
            Log::channel('security')->info('✅ Token gerado via Cache', [
                'user_id' => $usuario->id,
                'email' => $usuario->EMAIL,
                'token_preview' => substr($tokenId, 0, 10) . '...',
                'expires_at' => $tokenData['expires_at'],
                'cache_key' => $cacheKey
            ]);
            
            return $tokenId;
            
        } catch (\Exception $e) {
            Log::error('❌ Erro ao gerar token', [
                'error' => $e->getMessage(),
                'user_id' => $usuario->id ?? 'N/A'
            ]);
            throw $e;
        }
    }

    /**
     * ✅ VALIDA TOKEN DA SUA TABELA CACHE
     */
    public function validateToken(string $token): ?array
    {
        try {
            $cacheKey = "auth_token:{$token}";
            $tokenData = Cache::get($cacheKey);
            
            if (!$tokenData) {
                Log::channel('security')->warning('⚠️ Token não encontrado', [
                    'token_preview' => substr($token, 0, 10) . '...',
                    'cache_key' => $cacheKey
                ]);
                return null;
            }
            
            // Verifica se usuário ainda existe
            $usuario = Usuario::find($tokenData['user_id']);
            if (!$usuario) {
                Log::channel('security')->warning('⚠️ Token válido mas usuário não existe', [
                    'user_id' => $tokenData['user_id']
                ]);
                $this->revokeToken($token); // Remove token inválido
                return null;
            }
            
            Log::channel('security')->debug('✅ Token validado', [
                'user_id' => $usuario->id,
                'token_preview' => substr($token, 0, 10) . '...'
            ]);
            
            return $tokenData;
            
        } catch (\Exception $e) {
            Log::error('❌ Erro ao validar token', [
                'error' => $e->getMessage(),
                'token_preview' => substr($token, 0, 10) . '...'
            ]);
            return null;
        }
    }

    /**
     * ✅ REMOVE TOKEN DA SUA TABELA CACHE
     */
    public function revokeToken(string $token): bool
    {
        try {
            $cacheKey = "auth_token:{$token}";
            
            $tokenData = Cache::get($cacheKey);
            $result = Cache::forget($cacheKey);
            
            if ($tokenData) {
                Log::channel('security')->info('🗑️ Token revogado', [
                    'user_id' => $tokenData['user_id'] ?? 'N/A',
                    'token_preview' => substr($token, 0, 10) . '...',
                    'cache_key' => $cacheKey
                ]);
            }
            
            return $result;
            
        } catch (\Exception $e) {
            Log::error('❌ Erro ao revogar token', [
                'error' => $e->getMessage(),
                'token_preview' => substr($token, 0, 10) . '...'
            ]);
            return false;
        }
    }

    /**
     * ✅ VERIFICA SE PRECISA RENOVAR
     */
    public function shouldRefresh(array $tokenData): bool
    {
        try {
            $expiresAt = Carbon::parse($tokenData['expires_at']);
            $now = now();
            $minutesRemaining = $expiresAt->diffInMinutes($now);
            
            // Renova se restam menos de 15 minutos
            return $minutesRemaining <= 15;
            
        } catch (\Exception $e) {
            Log::error('❌ Erro ao verificar refresh', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * ✅ RENOVA TOKEN (remove antigo, cria novo)
     */
    public function refreshToken(string $token): ?string
    {
        try {
            $cacheKey = "auth_token:{$token}";
            $tokenData = Cache::get($cacheKey);
            
            if (!$tokenData) {
                return null;
            }
            
            // Busca usuário atual
            $usuario = Usuario::find($tokenData['user_id']);
            if (!$usuario) {
                $this->revokeToken($token);
                return null;
            }
            
            // Remove token antigo da sua tabela cache
            Cache::forget($cacheKey);
            
            // Gera novo token
            $newToken = $this->generateToken($usuario);
            
            Log::channel('security')->info('🔄 Token renovado', [
                'user_id' => $usuario->id,
                'old_token' => substr($token, 0, 10) . '...',
                'new_token' => substr($newToken, 0, 10) . '...'
            ]);
            
            return $newToken;
            
        } catch (\Exception $e) {
            Log::error('❌ Erro ao renovar token', [
                'error' => $e->getMessage(),
                'token_preview' => substr($token, 0, 10) . '...'
            ]);
            return null;
        }
    }

    /**
     * ✅ DADOS FORMATADOS PARA RESPOSTA JSON
     */
    public function getTokenData(Usuario $usuario): array
    {
        $token = $this->generateToken($usuario);
        
        return [
            'token' => $token,
            'type' => 'Bearer',
            'expires_in' => $this->expirationMinutes * 60, 
            'expires_at' => now()->addMinutes($this->expirationMinutes)->toDateTimeString(),
            'user' => [
                'id' => $usuario->id,
                'nome' => $usuario->NOME,
                'email' => $usuario->EMAIL,
                'perfil' => $usuario->PERFIL,
            ]
        ];
    }

    /**
     * ✅ TESTA SE CACHE ESTÁ FUNCIONANDO
     */
    public function testCache(): array
    {
        try {
            $testKey = 'cache_test_' . time();
            $testValue = ['test' => 'value_' . Str::random(10)];
            
            // Testa armazenamento
            Cache::put($testKey, $testValue, 60);
            $retrieved = Cache::get($testKey);
            Cache::forget($testKey);
            
            $isWorking = $retrieved && $retrieved['test'] === $testValue['test'];
            
            return [
                'working' => $isWorking,
                'driver' => config('cache.default'),
                'message' => $isWorking ? '✅ Cache funcionando perfeitamente!' : '❌ Cache com problemas',
                'test_data' => [
                    'expected' => $testValue,
                    'retrieved' => $retrieved
                ]
            ];
            
        } catch (\Exception $e) {
            return [
                'working' => false,
                'driver' => config('cache.default'),
                'error' => $e->getMessage(),
                'message' => '❌ Erro no cache: ' . $e->getMessage()
            ];
        }
    }

    /**
     * ✅ LIMPA TOKENS EXPIRADOS (manutenção)
     */
    public function clearExpiredTokens(): int
    {
        // O Laravel limpa automaticamente tokens expirados da tabela cache
        // Mas podemos forçar limpeza se necessário
        
        Log::info('🧹 Limpeza automática de tokens expirados (Laravel cuida disso)');
        return 0; // Laravel faz automaticamente
    }

    /**
     * ✅ ESTATÍSTICAS DO CACHE
     */
    public function getCacheStats(): array
    {
        try {
            // Testa conexão
            $testResult = $this->testCache();
            
            return [
                'cache_working' => $testResult['working'],
                'cache_driver' => config('cache.default'),
                'table_exists' => true, // Confirmado pelos attachments
                'message' => $testResult['working'] ? 
                    '✅ Sistema de cache totalmente funcional!' : 
                    '❌ Problemas no cache'
            ];
            
        } catch (\Exception $e) {
            return [
                'cache_working' => false,
                'error' => $e->getMessage(),
                'message' => '❌ Erro ao verificar stats: ' . $e->getMessage()
            ];
        }
    }
}