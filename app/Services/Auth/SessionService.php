<?php

namespace App\Services\Auth;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * SessionService
 * 
 * Gerencia operações de sessão de forma centralizada, respeitando
 * o Single Responsibility Principle e evitando acoplamento direto
 * dos models com a camada de persistência de sessões.
 */
class SessionService
{
    /**
     * Vincula a sessão atual ao usuário autenticado.
     * 
     * IMPORTANTE: Este método NÃO manipula diretamente a tabela sessions.
     * O Laravel gerencia sessions automaticamente via SessionHandler.
     * Apenas garantimos que a sessão está vinculada ao user_id correto.
     * 
     * @param Usuario $user
     * @param Request $request
     * @return bool
     */
    public function linkSessionToUser(Usuario $user, Request $request): bool
    {
        try {
            if (!$request->hasSession()) {
                return false;
            }

            if (method_exists($request->session(), 'isStarted') && !$request->session()->isStarted()) {
                $request->session()->start();
            }

            // Regenera o ID da sessão para prevenir fixation, preservando dados.
            if (method_exists($request->session(), 'regenerate')) {
                $request->session()->regenerate();
            }

            $request->session()->put('user_id', $user->getKey());
            $request->session()->put('session_meta', [
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 500),
                'last_activity' => time(),
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Erro ao vincular sessão ao usuário', [
                'user_id' => $user->getKey(),
                'session_id' => $request->session()->getId(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }

    /**
     * Remove do banco a sessão atual e, opcionalmente, todas as sessões do usuário.
     * Útil para garantir que não reste sessão persistida após o logout.
     */
    public function terminateStoredSessions(Request $request, ?int $userId = null, bool $deleteAllForUser = false): void
    {
        try {
            $currentSessionId = null;
            if ($request->hasSession()) {
                if (method_exists($request->session(), 'isStarted') && !$request->session()->isStarted()) {
                    $request->session()->start();
                }
                $currentSessionId = $request->session()->getId();
            }

            if ($currentSessionId) {
                DB::table('sessions')->where('id', $currentSessionId)->delete();
            } else {
                // Tenta obter pelo cookie caso o handler ainda não tenha iniciado
                $sessionCookie = config('session.cookie', 'laravel_session');
                $cookieId = $request->cookie($sessionCookie);
                if ($cookieId) {
                    DB::table('sessions')->where('id', $cookieId)->delete();
                }
            }

            if ($deleteAllForUser && $userId) {
                DB::table('sessions')->where('user_id', $userId)->delete();
            }

            Log::channel('security')->info('Sessões persistidas encerradas no banco', [
                'current_session_deleted' => (bool) $currentSessionId,
                'user_id' => $userId,
                'delete_all_for_user' => $deleteAllForUser,
            ]);
        } catch (\Throwable $e) {
            Log::channel('security')->warning('Falha ao encerrar sessões persistidas no banco', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    

    /**
     * Remove a vinculação da sessão ao usuário.
     * 
     * @param Request $request
     * @return bool
     */
    public function unlinkSession(Request $request, bool $invalidate = false): bool
    {
        try {
            if (!$request->hasSession()) {
                return true;
            }

            if (method_exists($request->session(), 'isStarted') && !$request->session()->isStarted()) {
                $request->session()->start();
            }

            $request->session()->forget(['user_id', 'session_meta']);

            if ($invalidate) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            } else {
                if (method_exists($request->session(), 'regenerate')) {
                    $request->session()->regenerate();
                }
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Erro ao desvincular sessão', [
                'session_id' => $request->session()->getId(),
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Remove registros da tabela sessions relacionados à sessão atual e, opcionalmente, ao usuário.
     */
    public function purgeStoredSessions(?string $sessionId = null, ?int $userId = null, bool $purgeAllUserSessions = false): bool
    {
        try {
            if ($sessionId) {
                DB::table('sessions')->where('id', $sessionId)->delete();
            }

            if ($userId) {
                $query = DB::table('sessions')->where('user_id', $userId);

                if (!$purgeAllUserSessions && $sessionId) {
                    $query->where('id', '!=', $sessionId);
                }

                $query->delete();
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning('Erro ao remover sessão persistida', [
                'session_id' => $sessionId,
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Obtém o user_id da sessão atual.
     * 
     * @param Request $request
     * @return int|null
     */
    public function getUserIdFromSession(Request $request): ?int
    {
        return $request->session()->get('user_id');
    }

    /**
     * Valida se a sessão está vinculada a um usuário válido.
     * 
     * @param Request $request
     * @return bool
     */
    public function hasValidUserSession(Request $request): bool
    {
        $userId = $this->getUserIdFromSession($request);

        if (!$userId) {
            return false;
        }

        // Verifica se o usuário ainda existe
        return Usuario::where('id', $userId)->exists();
    }

    /**
     * Retorna o usuário atual da sessão validando se ainda existe.
     * Remove dados de sessão se o usuário não for encontrado.
     */
    public function restoreUserFromSession(Request $request): ?Usuario
    {
        $userId = $this->getUserIdFromSession($request);

        if (!$userId) {
            return null;
        }

        $user = Usuario::find($userId);

        if (!$user) {
            $this->unlinkSession($request);
            return null;
        }

        return $user;
    }

    /**
     * Tenta restaurar o usuário a partir do registro na tabela sessions.
     * Caso encontre, atualiza a sessão atual com os dados necessários.
     */
    public function restoreUserFromStoredSession(Request $request): ?Usuario
    {
        try {
            $sessionCookie = config('session.cookie', 'laravel_session');
            $sessionId = $request->cookie($sessionCookie);

            if (!$sessionId) {
                return null;
            }

            $row = DB::table('sessions')->where('id', $sessionId)->first();
            if (!$row) {
                return null;
            }

            $userId = $row->user_id ?? null;

            if (!$userId && !empty($row->payload)) {
                $userId = $this->extractUserIdFromPayload($row->payload);
            }

            if (!$userId) {
                return null;
            }

            $user = Usuario::find($userId);

            if (!$user) {
                $this->unlinkSession($request);
                return null;
            }

            if ($request->hasSession()) {
                if (method_exists($request->session(), 'isStarted') && !$request->session()->isStarted()) {
                    $request->session()->start();
                }

                $request->session()->put('user_id', $user->getKey());
                $request->session()->put('session_meta', [
                    'ip_address' => $request->ip(),
                    'user_agent' => substr((string) $request->userAgent(), 0, 500),
                    'last_activity' => time(),
                ]);
            }

            return $user;
        } catch (\Throwable $e) {
            Log::warning('Falha ao restaurar usuário da tabela sessions', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Garante que apenas uma sessão permaneça ativa para o usuário.
     */
    public function enforceSingleSession(Usuario $user, Request $request): void
    {
        try {
            if (!$request->hasSession()) {
                return;
            }

            if (method_exists($request->session(), 'isStarted') && !$request->session()->isStarted()) {
                $request->session()->start();
            }

            $currentSessionId = $request->session()->getId();

            DB::table('sessions')
                ->where('user_id', $user->getKey())
                ->where('id', '!=', $currentSessionId)
                ->delete();

            Log::channel('security')->info('Sessões extras encerradas', [
                'user_id' => $user->getKey(),
                'current_session' => $currentSessionId,
            ]);
        } catch (\Throwable $e) {
            Log::channel('security')->warning('Falha ao encerrar sessões extras', [
                'user_id' => $user->getKey(),
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Auxiliar para extrair user_id do payload da sessão no banco.
     */
    private function extractUserIdFromPayload(string $payload): ?int
    {
        // Tentativa 1: payload salvo com base64(json_encode())
        $decoded = @base64_decode($payload, true);
        if ($decoded !== false) {
            $data = @json_decode($decoded, true);
            if (is_array($data) && isset($data['user_id'])) {
                return (int) $data['user_id'];
            }
        }

        // Tentativa 2: payload serializado
        $data = @unserialize($payload);
        if (is_array($data) && isset($data['user_id'])) {
            return (int) $data['user_id'];
        }

        return null;
    }
}
