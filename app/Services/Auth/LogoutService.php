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
        $allDevices = $request->wantsAllDevices();

        $sessionCookieName = config('session.cookie', 'laravel_session');
        $sessionId = $request->hasSession() ? $request->session()->getId() : null;

        $authToken = $request->cookie('auth_token');
        $rememberToken = $request->cookie('remember_token');

        $userId = $usuario->id ?? null;
        if (!$userId) {
            $tokenData = null;
            if ($authToken) {
                $tokenData = $this->tokenService->validateToken($authToken);
            }
            if (!$tokenData && $rememberToken) {
                $tokenData = $this->tokenService->validateToken($rememberToken);
            }
            if (!empty($tokenData['user_id'])) {
                $userId = (int) $tokenData['user_id'];
                Log::channel('security')->debug('LogoutService: user_id obtido via token', [
                    'user_id' => $userId,
                ]);
            }
        }

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
                // Também limpar o remember_token legacy da tabela usuario (caso exista)
                try {
                    if (\Illuminate\Support\Facades\Schema::hasTable('usuario') && \Illuminate\Support\Facades\Schema::hasColumn('usuario', 'remember_token')) {
                        \Illuminate\Support\Facades\DB::table('usuario')->where('id', $userId)->update([
                            'remember_token' => null,
                        ]);
                    }
                } catch (\Throwable $e2) {
                    Log::channel('security')->warning('Falha ao limpar coluna remember_token (legacy) no usuario', [
                        'user_id' => $userId,
                        'error' => $e2->getMessage(),
                    ]);
                }
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
            $sameSiteCfg = config('session.same_site');
            $sameSite = $sameSiteCfg ? strtolower($sameSiteCfg) : 'lax';
            $secureCfg = (bool) config('session.secure', false);
            $domainCfg = config('session.domain');
            $paths = array_values(array_unique([
                config('session.path', '/'),
                '/',
                '/gerenciamento',
                $request->getBasePath() ?: '/',
            ]));
            $sameSiteVariants = ['lax', 'strict', 'none'];
            foreach ($sameSiteVariants as $ss) {
                foreach ($paths as $p) {
                    // auth_token
                    cookie()->queue(cookie('auth_token', '', -1, $p, $domainCfg, $secureCfg, true, false, $ss));
                    cookie()->queue(cookie('auth_token', '', -1, $p, null, $secureCfg, true, false, $ss));
                    cookie()->queue(cookie('auth_token', '', -1, $p, $domainCfg, !$secureCfg, true, false, $ss));
                    cookie()->queue(cookie('auth_token', '', -1, $p, null, !$secureCfg, true, false, $ss));

                    // remember_token
                    cookie()->queue(cookie('remember_token', '', -1, $p, $domainCfg, $secureCfg, true, false, $ss));
                    cookie()->queue(cookie('remember_token', '', -1, $p, null, $secureCfg, true, false, $ss));
                    cookie()->queue(cookie('remember_token', '', -1, $p, $domainCfg, !$secureCfg, true, false, $ss));
                    cookie()->queue(cookie('remember_token', '', -1, $p, null, !$secureCfg, true, false, $ss));

                    // laravel_session
                    $sessPath = config('session.path', '/');
                    cookie()->queue(cookie($sessionCookieName, '', -1, $sessPath, $domainCfg, $secureCfg, true, false, $ss));
                    cookie()->queue(cookie($sessionCookieName, '', -1, $sessPath, null, $secureCfg, true, false, $ss));
                    cookie()->queue(cookie($sessionCookieName, '', -1, $sessPath, $domainCfg, !$secureCfg, true, false, $ss));
                    cookie()->queue(cookie($sessionCookieName, '', -1, $sessPath, null, !$secureCfg, true, false, $ss));

                    // XSRF-TOKEN
                    cookie()->queue(cookie('XSRF-TOKEN', '', -1, $p, $domainCfg, $secureCfg, false, false, $ss));
                    cookie()->queue(cookie('XSRF-TOKEN', '', -1, $p, null, $secureCfg, false, false, $ss));
                    cookie()->queue(cookie('XSRF-TOKEN', '', -1, $p, $domainCfg, !$secureCfg, false, false, $ss));
                    cookie()->queue(cookie('XSRF-TOKEN', '', -1, $p, null, !$secureCfg, false, false, $ss));
                }
            }

            // Remover cookies padrão do Laravel: remember_web_*
            try {
                $cookieBag = $request->cookies->all();
                foreach (array_keys($cookieBag) as $cookieName) {
                    if (str_starts_with($cookieName, 'remember_web')) {
                        foreach ($sameSiteVariants as $ss) {
                            foreach ($paths as $p) {
                                cookie()->queue(cookie($cookieName, '', -1, $p, $domainCfg, $secureCfg, true, false, $ss));
                                cookie()->queue(cookie($cookieName, '', -1, $p, null, $secureCfg, true, false, $ss));
                                cookie()->queue(cookie($cookieName, '', -1, $p, $domainCfg, !$secureCfg, true, false, $ss));
                                cookie()->queue(cookie($cookieName, '', -1, $p, null, !$secureCfg, true, false, $ss));
                            }
                        }
                        Log::channel('security')->info('Cookie remember_web_* removido', ['name' => $cookieName]);
                    }
                }
            } catch (\Throwable $e) {
                Log::channel('security')->warning('Falha ao remover cookie remember_web_*', [
                    'error' => $e->getMessage(),
                ]);
            }
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
