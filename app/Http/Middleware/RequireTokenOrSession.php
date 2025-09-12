<?php

namespace App\Http\Middleware;

use App\Services\Auth\CacheTokenService;
use App\Models\Usuario;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
        // 1. Se já autenticado via sessão e não há cookie de token, gera um
        if (Auth::check()) {
            if (!$request->cookies->has('auth_token')) {
                try {
                    $tokenData = $this->tokenService->getTokenData(Auth::user());
                    cookie()->queue(
                        cookie(
                            'auth_token',
                            $tokenData['token'],
                            60,
                            '/',
                            null,
                            false,
                            true,
                            false,
                            'Lax'
                        )
                    );
                    Log::channel('security')->info('Token regenerado para sessão existente', [
                        'user_id' => Auth::id()
                    ]);
                } catch (\Exception $e) {
                    Log::warning('Falha ao regenerar token para sessão existente', [
                        'error' => $e->getMessage(),
                        'user_id' => Auth::id()
                    ]);
                }
            }
            return $next($request);
        }

        // 2. Tenta extrair token (Header Authorization ou Cookie auth_token)
        $token = $this->extractToken($request);
        if (!$token) {
            return $this->deny($request, 'Token ausente');
        }

        $data = $this->tokenService->validateToken($token);
        if (!$data) {
            return $this->deny($request, 'Token inválido ou expirado');
        }

        $usuario = Usuario::find($data['user_id']);
        if (!$usuario) {
            return $this->deny($request, 'Usuário não encontrado');
        }

        // 3. Faz login para contexto da request e cria sessão persistente
        Auth::login($usuario, false);
        if ($request->hasSession()) {
            $request->session()->regenerate();
            $request->session()->put('_token_auth_user', $usuario->id);
        }

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
