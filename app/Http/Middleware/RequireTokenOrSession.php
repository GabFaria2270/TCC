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
        // ✅ PRIMEIRA VERIFICAÇÃO: Rotas públicas não precisam de token
        $publicRoutes = ['home', 'login', 'login.attempt', 'cadastro', 'cadastro.attempt'];
        $publicPaths = ['/', 'home', 'login', 'cadastro'];
        
        $routeName = $request->route()?->getName();
        $path = trim($request->path(), '/');
        if (empty($path)) $path = '/';
        
        // Se for rota pública, SAIR IMEDIATAMENTE
        if (($routeName && in_array($routeName, $publicRoutes)) || 
            in_array($path, $publicPaths)) {
            Log::channel('security')->debug('Rota pública detectada, ignorando middleware', [
                'route' => $routeName,
                'path' => $path
            ]);
            return $next($request);
        }

        // ✅ RESTO DO MIDDLEWARE APENAS PARA ROTAS PROTEGIDAS
        // Tenta restaurar usuário via sessão DB caso não esteja autenticado
        if (!Auth::check()) {
            try {
                $sessionId = $request->session()->getId();
                if ($sessionId) {
                    $dbSession = DB::table('sessions')
                        ->where('id', $sessionId)
                        ->whereNotNull('user_id')
                        ->first();
                    
                    if ($dbSession && $dbSession->user_id) {
                        $usuario = Usuario::find($dbSession->user_id);
                        if ($usuario) {
                            // Não regenerar ID de sessão: evita criar nova sessão
                            Auth::setUser($usuario);
                            Log::channel('security')->info('Usuário restaurado via sessão DB (sem regenerar sessão)', [
                                'user_id' => $usuario->id,
                                'session_id' => $sessionId
                            ]);
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::channel('security')->warning('Erro ao tentar restaurar usuário via sessão DB', [
                    'error' => $e->getMessage()
                ]);
            }
        }

        // ✅ SE AINDA NÃO ESTÁ AUTENTICADO, VERIFICAR TOKEN
        if (!Auth::check()) {
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
                Log::channel('security')->warning('Usuário do token não encontrado', [
                    'user_id' => $data['user_id']
                ]);
                return $this->deny($request, 'Usuário não encontrado');
            }

            // Não regenerar sessão ao autenticar por token
            Auth::setUser($usuario);
            $request->attributes->set('token_data', $data);
        }

        // ✅ USUÁRIO AUTENTICADO - VERIFICAR SE PRECISA RENOVAR TOKEN
        if (Auth::check()) {
            $existingToken = $request->cookie('auth_token');

            if ($existingToken) {
                $validData = $this->tokenService->validateToken($existingToken);
                if ($validData) {
                    // Cookie ausente mas token válido no cache? Regrava o MESMO token no cookie
                    if (!$request->cookies->has('auth_token')) {
                        cookie()->queue(cookie('auth_token', $existingToken, 1440, '/', null, false, true, false, 'Lax'));
                        Log::channel('security')->debug('Regravado cookie com token já válido (sem gerar novo)', [
                            'user_id' => Auth::id()
                        ]);
                    }
                } else {
                    // Token inválido/removido: gerar um novo único
                    $tokenData = $this->tokenService->getTokenData(Auth::user());
                    cookie()->queue(cookie('auth_token', $tokenData['token'], 1440, '/', null, false, true, false, 'Lax'));
                    Log::channel('security')->info('Token regenerado (inválido/removido)', [
                        'user_id' => Auth::id()
                    ]);
                }
            } else {
                // Cookie ausente: tentar extrair do header Authorization
                $headerToken = $this->extractToken($request);
                if ($headerToken) {
                    $validData = $this->tokenService->validateToken($headerToken);
                    if ($validData) {
                        cookie()->queue(cookie('auth_token', $headerToken, 1440, '/', null, false, true, false, 'Lax'));
                        Log::channel('security')->debug('Cookie ausente, mas header Bearer válido - regravado', [
                            'user_id' => Auth::id()
                        ]);
                    } else {
                        $tokenData = $this->tokenService->getTokenData(Auth::user());
                        cookie()->queue(cookie('auth_token', $tokenData['token'], 1440, '/', null, false, true, false, 'Lax'));
                        Log::channel('security')->info('Cookie e header inválidos - gerado novo token', [
                            'user_id' => Auth::id()
                        ]);
                    }
                } else {
                    // Sem cookie e sem header: gerar um novo
                    $tokenData = $this->tokenService->getTokenData(Auth::user());
                    cookie()->queue(cookie('auth_token', $tokenData['token'], 1440, '/', null, false, true, false, 'Lax'));
                    Log::channel('security')->info('Token ausente em cookie e header - gerado novo', [
                        'user_id' => Auth::id()
                    ]);
                }
            }
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
