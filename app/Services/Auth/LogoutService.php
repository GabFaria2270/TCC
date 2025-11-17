<?php

namespace App\Services\Auth;

use App\Http\Requests\Auth\LogoutRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LogoutService
{
    public function __construct(
        private SessionService $sessionService,
        private CacheTokenService $tokenService,
    ) {
    }

    /**
     * Executa o fluxo completo de logout com limpeza de tokens, cookies e sessões persistidas.
     */
    public function handle(LogoutRequest $request): array
    {
        $usuario = Auth::user();
        $userId = $usuario->id ?? null;
        $allDevices = $request->wantsAllDevices();

        $sessionCookieName = config('session.cookie', 'laravel_session');
        $sessionId = $request->hasSession() ? $request->session()->getId() : null;

        $authToken = $request->cookie('auth_token');
        $rememberToken = $request->cookie('remember_token');

        // Revoga tokens conhecidos do cliente
        try {
            if ($authToken) {
                $this->tokenService->revokeToken($authToken);
            }
            if ($rememberToken && (!$authToken || $rememberToken !== $authToken)) {
                $this->tokenService->revokeToken($rememberToken);
            }
        } catch (\Throwable $e) {
            Log::channel('security')->warning('Falha ao revogar tokens de cookies no logout', [
                'error' => $e->getMessage(),
            ]);
        }

        // Revoga todos os tokens do usuário (cache + remember_tokens)
        if ($userId) {
            try {
                $this->tokenService->revokeAllTokensForUser($userId);
            } catch (\Throwable $e) {
                Log::channel('security')->warning('Falha ao revogar todos os tokens do usuário no logout', [
                    'user_id' => $userId,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Logout no guard
        Auth::guard('web')->logout();

        // Remove sessões persistidas (atual e, opcional, todas do usuário)
        try {
            $this->sessionService->purgeStoredSessions($sessionId, $userId, $allDevices);
        } catch (\Throwable $e) {
            Log::channel('security')->warning('Falha ao remover sessões persistidas no logout', [
                'error' => $e->getMessage(),
            ]);
        }

        // Invalida sessão em memória e regenera token CSRF
        $this->sessionService->unlinkSession($request, true);

        // Limpa cookies no cliente usando mesmos atributos
        try {
            $sameSite = config('session.same_site');
            $sameSite = $sameSite ? ucfirst(strtolower($sameSite)) : 'Lax';

            // auth_token
            cookie()->queue(cookie('auth_token', '', -1, '/', null, (bool) config('session.secure', false), true, false, 'Lax'));
            // remember_token
            cookie()->queue(cookie('remember_token', '', -1, '/', null, (bool) config('session.secure', false), true, false, 'Lax'));
            // laravel_session
            cookie()->queue(cookie($sessionCookieName, '', -1, config('session.path','/'), config('session.domain'), (bool) config('session.secure', false), true, false, $sameSite));
            // XSRF-TOKEN
            cookie()->queue(cookie('XSRF-TOKEN', '', -1, '/', null, (bool) config('session.secure', false), false, false, 'Lax'));
        } catch (\Throwable $e) {
            Log::channel('security')->warning('Falha ao enfileirar remoção de cookies no logout', [
                'error' => $e->getMessage(),
            ]);
        }

        Log::channel('security')->info('Logout concluído', [
            'user_id' => $userId ?? 'N/A',
            'all_devices' => $allDevices,
        ]);

        return [
            'success' => true,
            'all_devices' => $allDevices,
        ];
    }
}
