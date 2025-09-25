<?php

namespace App\Http\Middleware;

use App\Services\Auth\CacheTokenService;
use App\Models\Usuario;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class RequireTokenOrSession
{
    protected CacheTokenService $tokenService;

    public function __construct(CacheTokenService $tokenService)
    {
        $this->tokenService = $tokenService;
    }

    public function handle(Request $request, Closure $next): Response
    {
        // Garante que a sessão Laravel esteja iniciada (caso alguma ordem fora do padrão ocorra)
        if ($request->hasSession() && !$request->session()->isStarted()) {
            try {
                $request->session()->start();
                Log::channel('security')->debug('Sessão iniciada manualmente no início do middleware', [
                    'session_id' => $request->session()->getId()
                ]);
            } catch (\Exception $e) {
                Log::channel('security')->warning('Falha ao iniciar sessão manualmente', [
                    'error' => $e->getMessage()
                ]);
            }
        }

        // 1. Se já autenticado via sessão: garantir que exista um token válido
        if (Auth::check()) {
            $needsNewToken = false;
            $reason = null;

            $existingToken = $request->cookie('auth_token');
            if (!$existingToken) {
                $needsNewToken = true;
                $reason = 'ausente';
            } else {
                // Validar token existente no cache; se não existir mais (apagado manualmente), gerar outro
                $validData = $this->tokenService->validateToken($existingToken);
                if (!$validData) {
                    $needsNewToken = true;
                    $reason = 'inválido_ou_removido_cache';
                }
            }

            if ($needsNewToken) {
                try {
                    $tokenData = $this->tokenService->getTokenData(Auth::user());
                    cookie()->queue(
                        cookie(
                            'auth_token',
                            $tokenData['token'],
                            1440, // 24 horas
                            '/',
                            null,
                            false,
                            true,
                            false,
                            'Lax'
                        )
                    );
                    Log::channel('security')->info('Token regenerado para sessão existente', [
                        'user_id' => Auth::id(),
                        'motivo' => $reason
                    ]);
                } catch (\Exception $e) {
                    Log::warning('Falha ao regenerar token para sessão existente', [
                        'error' => $e->getMessage(),
                        'user_id' => Auth::id(),
                        'motivo' => $reason
                    ]);
                }
            }
            return $next($request);
        }

        Log::channel('security')->debug('Sessão não autenticada, tentando token', [
            'has_session' => $request->hasSession(),
            'session_started' => $request->hasSession() ? $request->session()->isStarted() : null,
            'cookies' => array_keys($request->cookies->all()),
        ]);

        // 1.1 Tentativa de recuperar usuário via linha da tabela sessions (fallback quando Auth::check falha mas a sessão existe)
        try {
            if ($request->hasSession() && $request->session()->isStarted()) {
                $sessionId = $request->session()->getId();
                if ($sessionId) {
                    $row = DB::table('sessions')->where('id', $sessionId)->first();
                    if ($row && $row->user_id) {
                        $usuarioRow = Usuario::find($row->user_id);
                        if ($usuarioRow) {
                            Auth::login($usuarioRow, false);
                            Log::channel('security')->info('Usuário restaurado a partir da linha da tabela sessions', [
                                'user_id' => $usuarioRow->id,
                                'session_id' => $sessionId
                            ]);
                            // Agora que temos usuário autenticado, refaz a lógica de garantia de token
                            $existingToken = $request->cookie('auth_token');
                            $needsNewToken = false;
                            $reason = null;
                            if (!$existingToken) { $needsNewToken = true; $reason = 'ausente_pos_restore'; }
                            else if (!$this->tokenService->validateToken($existingToken)) { $needsNewToken = true; $reason = 'invalido_pos_restore'; }
                            if ($needsNewToken) {
                                try {
                                    $tokenData = $this->tokenService->getTokenData(Auth::user());
                                    cookie()->queue(cookie('auth_token',$tokenData['token'],1440,'/',null,false,true,false,'Lax'));
                                    Log::channel('security')->info('Token regenerado após restauração de usuário via sessão DB', [
                                        'user_id' => Auth::id(),
                                        'motivo' => $reason
                                    ]);
                                } catch (\Exception $e) {
                                    Log::channel('security')->warning('Falha ao regenerar token após restauração de usuário', [
                                        'error' => $e->getMessage(),
                                        'user_id' => Auth::id(),
                                        'motivo' => $reason
                                    ]);
                                }
                            }
                            return $next($request);
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::channel('security')->warning('Erro ao tentar restaurar usuário via sessão DB', [
                'error' => $e->getMessage()
            ]);
        }

        // 2. Tenta extrair token (Header Authorization ou Cookie auth_token)
        $token = $this->extractToken($request);
        if (!$token) {
            Log::channel('security')->warning('Acesso negado: token ausente', [
                'path' => $request->path(),
                'ip' => $request->ip(),
            ]);
            return $this->deny($request, 'Token ausente');
        }

        $data = $this->tokenService->validateToken($token);
        if (!$data) {
            Log::channel('security')->warning('Acesso negado: token inválido ou expirado', [
                'token_preview' => substr($token,0,10).'...'
            ]);
            return $this->deny($request, 'Token inválido ou expirado');
        }

        $usuario = Usuario::find($data['user_id']);
        if (!$usuario) {
            Log::channel('security')->warning('Acesso negado: usuário não encontrado', [
                'user_id' => $data['user_id']
            ]);
            return $this->deny($request, 'Usuário não encontrado');
        }

        // 3. Faz login para contexto da request e cria sessão persistente
        Auth::login($usuario, false);
        if ($request->hasSession()) {
            if (!$request->session()->isStarted()) {
                $request->session()->start();
            }
            $request->session()->regenerate();
            $request->session()->put('_token_auth_user', $usuario->id);
        }
        Log::channel('security')->info('Sessão reconstruída via token', [
            'user_id' => $usuario->id,
            'ip' => $request->ip()
        ]);

        return $next($request);
    }

    private function extractToken(Request $request): ?string
    {
        // Prioridade 1: Authorization Bearer
        $authHeader = $request->header('Authorization');
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            return substr($authHeader, 7);
        }
        // Prioridade 2: Cookie
        if ($request->cookies->has('auth_token')) {
            return $request->cookie('auth_token');
        }
        // Prioridade 3: Query param (fallback controlado)
        $q = $request->query('token');
        if ($q && preg_match('/^[A-Za-z0-9]{32,64}$/', $q)) {
            return $q;
        }
        return null;
    }

    private function deny(Request $request, string $message): Response
    {
        if ($request->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => $message,
                'code' => 'UNAUTHORIZED'
            ], 401);
        }
        return redirect()->route('login')->with('error', $message);
    }
}
