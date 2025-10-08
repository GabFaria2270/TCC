<?php

namespace App\Services\Auth;

use App\Models\Usuario;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CacheTokenService
{
    private int $expirationMinutes = 1440; // 24 horas
    
    /**
     * Gera um novo token garantindo que haja apenas UM token por usuário no cache
     */
    public function generateToken(Usuario $usuario): string
    {
        try {
            // ✅ Antes de gerar, remove qualquer token existente desse usuário
            $this->revokeAllTokensForUser($usuario->id);

            $tokenId = Str::random(40);
            $cacheKey = "auth_token:{$tokenId}";
            
            $expiresAt = now()->addMinutes($this->expirationMinutes);

            $tokenData = [
                'user_id' => $usuario->id,
                'email' => $usuario->EMAIL,
                'nome' => $usuario->NOME,
                'perfil' => $usuario->PERFIL,
                'created_at' => now()->toDateTimeString(),
                'expires_at' => $expiresAt->toDateTimeString(),
                'ip' => request()->ip(),
                'user_agent' => substr(request()->userAgent() ?? '', 0, 500),
            ];

            // ✅ Grava apenas o token individual (sem ponteiro por usuário)
            Cache::put($cacheKey, $tokenData, $expiresAt);
            
            Log::channel('security')->info('✅ Token único gerado', [
                'user_id' => $usuario->id,
                'token_preview' => substr($tokenId, 0, 10) . '...',
                'cache_key' => $cacheKey,
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
     * Valida token
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

            // Confere expiração
            if (Carbon::parse($tokenData['expires_at'])->isPast()) {
                Cache::forget($cacheKey);
                Log::channel('security')->info('⌛ Token expirado removido', [
                    'user_id' => $usuario->id,
                ]);
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
     * Revoga token
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
     * Indica se deve renovar (<= 15 min restantes)
     */
    public function shouldRefresh(array $tokenData): bool
    {
        try {
            $expiresAt = Carbon::parse($tokenData['expires_at']);
            // Minutos restantes até expirar (valor absoluto)
            $minutesLeft = now()->diffInMinutes($expiresAt);
            
            return $minutesLeft <= 15; // renovar se <= 15 minutos
            
        } catch (\Exception $e) {
            Log::error('❌ Erro ao verificar refresh', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Renova token (remove antigo e cria novo garantindo unicidade por usuário)
     */
    public function refreshToken(string $token): ?string
    {
        try {
            $cacheKey = "auth_token:{$token}";
            $tokenData = Cache::get($cacheKey);
            
            if (!$tokenData) {
                return null;
            }
            
            $usuario = Usuario::find($tokenData['user_id']);
            if (!$usuario) {
                $this->revokeToken($token);
                return null;
            }
            
            // Remove token antigo e gera novo (garantindo 1 por usuário)
            Cache::forget($cacheKey);
            return $this->generateToken($usuario);
            
        } catch (\Exception $e) {
            Log::error('❌ Erro ao renovar token', [
                'error' => $e->getMessage(),
                'token_preview' => substr($token, 0, 10) . '...'
            ]);
            return null;
        }
    }

    /**
     * Retorna tokenId existente no cache para o usuário, se houver e não expirado
     */
    public function findExistingTokenIdForUser(int $userId): ?string
    {
        try {
            // ❗️Robusto para qualquer prefixo e separador (':' ou '_')
            $rows = DB::table('cache')
                ->select('key', 'value')
                ->where('key', 'like', '%auth_token:%')
                ->limit(1000)
                ->get();

            foreach ($rows as $row) {
                $baseKey = $this->baseAuthTokenKey($row->key);
                if (!$baseKey) continue;
                // ignorar chaves de ponteiro antigas
                if (str_starts_with($baseKey, 'auth_token:user:')) {
                    continue;
                }
                $data = @unserialize($row->value);
                if (!is_array($data)) continue;
                if (($data['user_id'] ?? null) !== $userId) continue;
                if (empty($data['expires_at']) || Carbon::parse($data['expires_at'])->isPast()) continue;

                // extrai o tokenId da chave auth_token:{id}
                if (preg_match('/^auth_token:([A-Za-z0-9:_\-]{16,128})$/', $baseKey, $m)) {
                    // se vier no formato auth_token:ID apenas, pega a parte após o último ':'
                    $tokenId = substr($baseKey, strlen('auth_token:'));
                    return $tokenId;
                }
            }
        } catch (\Exception $e) {
            Log::channel('security')->warning('Falha ao procurar token existente do usuário', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
        }
        return null;
    }

    /**
     * Retorna token atual do usuário. Reusa token do request ou existente no cache.
     */
    public function getTokenData(Usuario $usuario): array
    {
        // 1) Tenta reusar token do request (Authorization Bearer ou cookie)
        $currentToken = $this->extractTokenFromRequest();
        if ($currentToken) {
            $currentData = $this->validateToken($currentToken);
            if ($currentData && ($currentData['user_id'] ?? null) === $usuario->id) {
                // Renovar próximo do vencimento
                if ($this->shouldRefresh($currentData)) {
                    $refreshed = $this->refreshToken($currentToken);
                    if ($refreshed) {
                        $currentToken = $refreshed;
                        $currentData = Cache::get("auth_token:{$currentToken}");
                    }
                }
                return [
                    'token' => $currentToken,
                    'type' => 'Bearer',
                    'expires_in' => $this->expirationMinutes * 60,
                    'expires_at' => $currentData['expires_at'] ?? now()->addMinutes($this->expirationMinutes)->toDateTimeString(),
                    'user' => [
                        'id' => $usuario->id,
                        'nome' => $usuario->NOME,
                        'email' => $usuario->EMAIL,
                        'perfil' => $usuario->PERFIL,
                    ]
                ];
            }
        }

        // 1.5) Tenta localizar token existente no cache para o usuário
        $existingTokenId = $this->findExistingTokenIdForUser($usuario->id);
        if ($existingTokenId) {
            $existingData = Cache::get("auth_token:{$existingTokenId}");
            if ($existingData && !Carbon::parse($existingData['expires_at'])->isPast()) {
                if ($this->shouldRefresh($existingData)) {
                    $refreshed = $this->refreshToken($existingTokenId);
                    if ($refreshed) {
                        $existingTokenId = $refreshed;
                        $existingData = Cache::get("auth_token:{$existingTokenId}");
                    }
                }
                return [
                    'token' => $existingTokenId,
                    'type' => 'Bearer',
                    'expires_in' => $this->expirationMinutes * 60,
                    'expires_at' => $existingData['expires_at'] ?? now()->addMinutes($this->expirationMinutes)->toDateTimeString(),
                    'user' => [
                        'id' => $usuario->id,
                        'nome' => $usuario->NOME,
                        'email' => $usuario->EMAIL,
                        'perfil' => $usuario->PERFIL,
                    ]
                ];
            }
        }

        // 2) Não há token válido: gerar novo (removendo antigos)
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
     * Teste de cache
     */
    public function testCache(): array
    {
        try {
            $testKey = 'cache_test_' . time();
            $testValue = ['test' => 'value_' . Str::random(10)];
            
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
     * Limpeza automática (Laravel já lida)
     */
    public function clearExpiredTokens(): int
    {
        Log::info('🧹 Limpeza automática de tokens expirados (Laravel cuida disso)');
        return 0;
    }

    /**
     * Estatísticas do cache
     */
    public function getCacheStats(): array
    {
        try {
            $testResult = $this->testCache();
            
            return [
                'cache_working' => $testResult['working'],
                'cache_driver' => config('cache.default'),
                'table_exists' => true,
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

    // ===================== Helpers internos =====================

    /**
     * Remove todos os tokens do usuário na tabela de cache (DB driver)
     */
    private function revokeAllTokensForUser(int $userId): void
    {
        try {
            // Robusto para qualquer prefixo/separador
            $rows = DB::table('cache')
                ->select('key', 'value')
                ->where('key', 'like', '%auth_token:%')
                ->get();

            foreach ($rows as $row) {
                $baseKey = $this->baseAuthTokenKey($row->key);
                if (!$baseKey) continue;

                // 1) Chave de token normal: valor serializado array com user_id
                $data = @unserialize($row->value);
                if (is_array($data) && ($data['user_id'] ?? null) === $userId && str_starts_with($baseKey, 'auth_token:')) {
                    Cache::forget($baseKey);
                    continue;
                }

                // 2) Chave ponteiro antiga: auth_token:user:{id} (valor é string)
                if ($baseKey === 'auth_token:user:' . $userId) {
                    Cache::forget($baseKey);
                }
            }

            // Remoção direta do ponteiro (independente de estar listado)
            $pointerBase = 'auth_token:user:' . $userId;
            Cache::forget($pointerBase);
        } catch (\Exception $e) {
            Log::channel('security')->warning('⚠️ Falha ao revogar tokens antigos do usuário', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Extrai token do request atual (Authorization Bearer ou cookie)
     */
    private function extractTokenFromRequest(): ?string
    {
        $request = request();
        if (!$request) return null;

        $authHeader = $request->header('Authorization');
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            return substr($authHeader, 7);
        }
        if ($request->cookies->has('auth_token')) {
            return $request->cookie('auth_token');
        }
        $q = $request->query('token');
        if ($q && preg_match('/^[A-Za-z0-9]{32,64}$/', $q)) {
            return $q;
        }
        return null;
    }

    /**
     * Retorna a chave base começando em 'auth_token:...'
     * Aceita chaves com prefixo 'laravel_cache:' ou 'laravel_cache_' etc.
     */
    private function baseAuthTokenKey(string $fullKey): ?string
    {
        $pos = strpos($fullKey, 'auth_token:');
        if ($pos === false) {
            return null;
        }
        return substr($fullKey, $pos);
    }
}