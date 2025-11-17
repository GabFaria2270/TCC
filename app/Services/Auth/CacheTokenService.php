<?php

namespace App\Services\Auth;

use App\Models\Usuario;
use App\Models\RememberToken;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CacheTokenService
{
    private int $expirationMinutes = 1440; // 24 horas
    
    /**
     * Gera um novo token garantindo que haja apenas UM token por usuário no cache
     * @param Usuario $usuario
     * @param int|null $minutes Expiração em minutos; se null usa o padrão
     * @param bool $persistInDb Se true, grava token e expiração na tabela usuario
     */
    public function generateToken(Usuario $usuario, ?int $minutes = null, bool $persistInDb = false): string
    {
        try {
            // ✅ Antes de gerar, remove qualquer token existente desse usuário
            $this->revokeAllTokensForUser($usuario->id);

            $tokenId = Str::random(40);
            $cacheKey = "auth_token:{$tokenId}";
            
            $ttl = $minutes ?? $this->expirationMinutes;
            $expiresAt = now()->addMinutes($ttl);

            $tokenData = [
                'user_id' => $usuario->id,
                'email' => $usuario->EMAIL,
                'nome' => $usuario->NOME,
                'perfil' => $usuario->PERFIL,
                'persisted' => $persistInDb,
                'created_at' => now()->toDateTimeString(),
                'expires_at' => $expiresAt->toDateTimeString(),
                'ip' => request()->ip(),
                'user_agent' => substr(request()->userAgent() ?? '', 0, 500),
            ];

            // ✅ Grava apenas o token individual (sem ponteiro por usuário)
            // Cache::put aceita DateTime para TTL também
            Cache::put($cacheKey, $tokenData, $expiresAt);

            // Se pedido, persiste token e expiração na tabela remember_tokens
            if ($persistInDb) {
                try {
                    $tokenHash = hash_hmac('sha256', $tokenId, config('app.key'));
                    RememberToken::create([
                        'user_id' => $usuario->id,
                        'token_hash' => $tokenHash,
                        'ip_address' => request()->ip(),
                        'user_agent' => substr(request()->userAgent() ?? '', 0, 500),
                        'expires_at' => $expiresAt,
                        'last_used_at' => now(),
                    ]);

                    Log::channel('security')->info('✅ Token persistido na tabela remember_tokens', [
                        'user_id' => $usuario->id,
                        'token_preview' => substr($tokenId, 0, 10) . '...',
                    ]);
                } catch (\Exception $e) {
                    Log::channel('security')->warning('⚠️ Falha ao persistir token na tabela remember_tokens', [
                        'user_id' => $usuario->id ?? 'N/A',
                        'error' => $e->getMessage()
                    ]);
                }
            }

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

            // Detectar se o token que estamos validando veio do cookie remember_token
            $isRememberCookie = false;
            try {
                $req = request();
                if ($req && $req->cookies->has('remember_token') && $req->cookie('remember_token') === $token) {
                    $isRememberCookie = true;
                }
            } catch (\Throwable $e) {
                // ignore
            }

            if (!$tokenData) {
                // Se não encontrou no cache, tenta localizar no banco (remember_token)
                Log::channel('security')->debug('Token não encontrado no cache, verificando DB', [
                    'token_preview' => substr($token, 0, 10) . '...',
                    'cache_key' => $cacheKey
                ]);

                // Procurar pelo hash do token na tabela remember_tokens
                try {
                    $tokenHash = hash_hmac('sha256', $token, config('app.key'));
                    $remember = RememberToken::where('token_hash', $tokenHash)->first();

                    if ($remember && $remember->expires_at && !Carbon::parse($remember->expires_at)->isPast()) {
                        $usuario = Usuario::find($remember->user_id);
                        if ($usuario) {
                            $expiresAt = Carbon::parse($remember->expires_at);
                            $tokenData = [
                                'user_id' => $usuario->id,
                                'email' => $usuario->EMAIL,
                                'nome' => $usuario->NOME,
                                'perfil' => $usuario->PERFIL,
                                'persisted' => true,
                                'created_at' => now()->toDateTimeString(),
                                'expires_at' => $expiresAt->toDateTimeString(),
                                'ip' => request()->ip(),
                                'user_agent' => substr(request()->userAgent() ?? '', 0, 500),
                            ];

                            // Armazena em cache até expiresAt
                            Cache::put($cacheKey, $tokenData, $expiresAt);
                            Log::channel('security')->info('✅ Token encontrado na tabela remember_tokens e recarregado no cache', [
                                'user_id' => $usuario->id,
                                'token_preview' => substr($token, 0, 10) . '...'
                            ]);
                        }
                    } else {
                        Log::channel('security')->warning('⚠️ Token não encontrado nem no cache nem na tabela remember_tokens', [
                            'token_preview' => substr($token, 0, 10) . '...',
                            'cache_key' => $cacheKey
                        ]);
                        return null;
                    }
                } catch (\Exception $e) {
                    Log::channel('security')->warning('⚠️ Erro ao buscar token na tabela remember_tokens', [
                        'token_preview' => substr($token, 0, 10) . '...',
                        'error' => $e->getMessage()
                    ]);
                    return null;
                }
            }

            // Se token veio do cookie remember, sempre garantir que exista no DB
            if ($isRememberCookie) {
                try {
                    $tokenHash = hash_hmac('sha256', $token, config('app.key'));
                    $remember = RememberToken::where('token_hash', $tokenHash)->first();
                    if (!$remember || ($remember->expires_at && Carbon::parse($remember->expires_at)->isPast())) {
                        // Garantir que o cache não permita autenticação se o DB não tem o registro.
                        Cache::forget($cacheKey);
                        // Limpar cookie remember_token no cliente para evitar redirecionamentos futuros
                        try {
                            Cookie::queue(Cookie::forget('remember_token'));
                            Log::channel('security')->info('Cookie remember_token removido do cliente porque não existe no DB', [
                                'token_preview' => substr($token, 0, 10) . '...'
                            ]);
                        } catch (\Throwable $e) {
                            Log::channel('security')->warning('Falha ao tentar remover cookie remember_token', [
                                'error' => $e->getMessage()
                            ]);
                        }
                        Log::channel('security')->info('Token do cookie remember_token não existe/expirou na tabela remember_tokens', [
                            'token_preview' => substr($token, 0, 10) . '...'
                        ]);
                        return null;
                    }
                } catch (\Exception $e) {
                    Log::channel('security')->warning('Erro ao verificar remember_tokens para cookie remember', [
                        'error' => $e->getMessage(),
                        'token_preview' => substr($token, 0, 10) . '...'
                    ]);
                    return null;
                }
            }

            // Se token foi persistido no DB, garantir que o registro ainda exista
            if (!empty($tokenData['persisted'])) {
                try {
                    $tokenHash = hash_hmac('sha256', $token, config('app.key'));
                    $remember = RememberToken::where('token_hash', $tokenHash)->first();
                    if (!$remember || ($remember->expires_at && Carbon::parse($remember->expires_at)->isPast())) {
                        // Token persistido foi removido do DB ou expirou -> antes de invalidar, verificar se existe sessão ativa
                        try {
                            $req = request();
                            $sessionOk = false;
                            if ($req) {
                                // 1) Verifica se a sessão atual tem user_id igual ao do token
                                if ($req->session()->has('user_id') && $req->session()->get('user_id') == ($tokenData['user_id'] ?? null)) {
                                    $sessionOk = true;
                                }
                                // 2) Se não, tenta checar a tabela sessions pelo cookie de sessão
                                if (!$sessionOk) {
                                    $sessionCookieName = config('session.cookie', 'laravel_session');
                                    $sessionId = $req->cookie($sessionCookieName);
                                    if ($sessionId) {
                                            $sessRow = DB::table('sessions')->where('id', $sessionId)->first();
                                            if ($sessRow && isset($sessRow->user_id) && $sessRow->user_id == ($tokenData['user_id'] ?? null)) {
                                                $sessionOk = true;
                                            } else {
                                                // Log detalhado para depuração: sessão encontrada mas não corresponde
                                                Log::channel('security')->debug('Sessão encontrada mas não corresponde ao user_id do token', [
                                                    'session_id' => $sessionId,
                                                    'session_user_id' => $sessRow->user_id ?? null,
                                                    'token_user_id' => $tokenData['user_id'] ?? null,
                                                    'payload_snippet' => isset($sessRow->payload) ? substr($sessRow->payload, 0, 300) : null,
                                                ]);
                                            
                                            // tentar extrair user_id do payload
                                            if ($sessRow && !empty($sessRow->payload)) {
                                                $decoded = @base64_decode($sessRow->payload, true);
                                                $maybe = $decoded !== false ? @json_decode($decoded, true) : null;
                                                if (is_array($maybe) && !empty($maybe['user_id']) && $maybe['user_id'] == ($tokenData['user_id'] ?? null)) {
                                                    $sessionOk = true;
                                                } else {
                                                    $maybe2 = @unserialize($sessRow->payload);
                                                    if (is_array($maybe2) && !empty($maybe2['user_id']) && $maybe2['user_id'] == ($tokenData['user_id'] ?? null)) {
                                                        $sessionOk = true;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            if ($sessionOk) {
                                // Existe sessão ativa para o mesmo usuário: não invalidar o cache — manter token para a sessão atual
                                Log::channel('security')->info('Remember token deletado do DB, mas sessão ativa detectada — mantendo token em cache para a sessão atual', [
                                    'user_id' => $tokenData['user_id'] ?? 'N/A',
                                    'token_preview' => substr($token, 0, 10) . '...'
                                ]);
                                // Marcar que agora não está mais persisted (apenas para sessão atual)
                                $tokenData['persisted'] = false;
                                // Regravar no cache até expires_at
                                try {
                                    $expiresAt = Carbon::parse($tokenData['expires_at']);
                                    Cache::put($cacheKey, $tokenData, $expiresAt);
                                } catch (\Throwable $e) {
                                    Cache::put($cacheKey, $tokenData, now()->addMinutes($this->expirationMinutes));
                                }
                                // continuar validação abaixo
                            } else {
                                // Sem sessão válida: invalidar cache
                                Cache::forget($cacheKey);
                                Log::channel('security')->info('Token em cache inválido: não existe na tabela remember_tokens', [
                                    'token_preview' => substr($token, 0, 10) . '...'
                                ]);
                                return null;
                            }
                        } catch (\Exception $e) {
                            // se qualquer erro, falhar fechado
                            Cache::forget($cacheKey);
                            Log::channel('security')->info('Erro verificando sessão antes de invalidar token em cache', [
                                'error' => $e->getMessage(),
                                'token_preview' => substr($token, 0, 10) . '...'
                            ]);
                            return null;
                        }
                    }
                } catch (\Exception $e) {
                    Log::channel('security')->warning('Erro ao verificar remember_tokens durante validação', [
                        'error' => $e->getMessage(),
                        'token_preview' => substr($token, 0, 10) . '...'
                    ]);
                    return null;
                }
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

            // Também limpar da tabela remember_tokens (hash)
            try {
                $tokenHash = hash_hmac('sha256', $token, config('app.key'));
                RememberToken::where('token_hash', $tokenHash)->delete();
                Log::channel('security')->info('🗑️ Token removido da tabela remember_tokens', [
                    'token_hash_preview' => substr($tokenHash, 0, 10) . '...'
                ]);
            } catch (\Exception $e) {
                Log::channel('security')->warning('⚠️ Falha ao limpar token na tabela remember_tokens durante revogação', [
                    'error' => $e->getMessage()
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
     * Revoga todos os tokens vinculados ao usuário informado.
     */
    public function revokeTokensForUser(int $userId): void
    {
        $this->revokeAllTokensForUser($userId);
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
            // Primeiro tenta localizar token no cache
            $rows = DB::table('cache')
                ->select('key', 'value')
                ->where('key', 'like', '%auth_token:%')
                ->limit(1000)
                ->get();

            foreach ($rows as $row) {
                $baseKey = $this->baseAuthTokenKey($row->key);
                if (!$baseKey) continue;
                $data = @unserialize($row->value);
                if (!is_array($data)) continue;
                if (($data['user_id'] ?? null) !== $userId) continue;
                if (empty($data['expires_at']) || Carbon::parse($data['expires_at'])->isPast()) continue;

                if (preg_match('/^auth_token:([A-Za-z0-9:_\-]{16,128})$/', $baseKey, $m)) {
                    $tokenId = substr($baseKey, strlen('auth_token:'));
                    return $tokenId;
                }
            }

            // Se não encontrou no cache, não podemos reconstruir token plain a partir do hash em remember_tokens
            return null;
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
     * Remove todos os tokens do usuário específico (apenas dele)
     */
    public function revokeAllTokensForUser(int $userId): void
    {
        try {
            // 1. Remove tokens da tabela remember_tokens para este usuário
            RememberToken::where('user_id', $userId)->delete();

            // 2. Remove do cache apenas os tokens DESTE usuário
            // Como não temos índice direto user_id->token no cache, precisamos:
            // a) Pegar todos os tokens em cache
            // b) Verificar quais pertencem a este user_id
            // c) Remover apenas esses
            
            $rows = DB::table('cache')
                ->select('key', 'value')
                ->where('key', 'like', '%auth_token:%')
                ->get();

            $removed = 0;
            foreach ($rows as $row) {
                $baseKey = $this->baseAuthTokenKey($row->key);
                if (!$baseKey || !str_starts_with($baseKey, 'auth_token:')) {
                    continue;
                }

                // Decodificar o valor do cache para verificar user_id
                try {
                    $decoded = @unserialize($row->value);
                    if (is_array($decoded) && isset($decoded['user_id']) && $decoded['user_id'] == $userId) {
                        Cache::forget($baseKey);
                        $removed++;
                    }
                } catch (\Throwable $e) {
                    // Se não conseguir decodificar, ignorar
                    continue;
                }
            }

            Log::channel('security')->info('🗑️ Tokens antigos revogados', [
                'user_id' => $userId,
                'tokens_removed' => $removed
            ]);

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
