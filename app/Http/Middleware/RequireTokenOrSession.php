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
        // Garantir que a sessão do request esteja iniciada (casos em que middleware roda antes)
        try {
            if ($request->hasSession() && method_exists($request->session(), 'start') && !method_exists($request->session(), 'isStarted') || ($request->hasSession() && method_exists($request->session(), 'isStarted') && !$request->session()->isStarted())) {
                // Tenta iniciar a sessão para poder acessar dados
                $request->session()->start();
            }
        } catch (\Throwable $e) {
            Log::channel('security')->debug('Não foi possível iniciar sessão no middleware: ' . $e->getMessage());
        }

        // 1. Prioriza restauração via sessão/cache
        $usuario = null;
        if ($request->session()->has('user_id')) {
            $usuario = Usuario::find($request->session()->get('user_id'));
            if ($usuario) {
                Auth::setUser($usuario);
                Log::channel('security')->info('Usuário restaurado via sessão DB personalizada', [
                    'user_id' => $usuario->id,
                    'session_id' => $request->session()->getId()
                ]);
            }
        }

        // Fallback: se não encontrou via sessão carregada, tentar ler diretamente a tabela `sessions`
        if (!$usuario) {
            try {
                $sessionCookieName = config('session.cookie', 'laravel_session');
                $sessionId = $request->cookie($sessionCookieName);
                if ($sessionId) {
                    $row = DB::table('sessions')->where('id', $sessionId)->first();
                    if ($row) {
                        $foundUserId = null;
                        if (isset($row->user_id) && $row->user_id) {
                            $foundUserId = $row->user_id;
                        } else {
                            // Tentar extrair user_id do payload (algumas rotas armazenam user_id no payload)
                            try {
                                if (!empty($row->payload)) {
                                    // Tentativa 1: payload foi salvo com base64(json_encode(session->all()))
                                    $decoded = @base64_decode($row->payload, true);
                                    $maybe = $decoded !== false ? @json_decode($decoded, true) : null;
                                    if (is_array($maybe) && !empty($maybe['user_id'])) {
                                        $foundUserId = $maybe['user_id'];
                                    } else {
                                        // Tentativa 2: talvez payload seja serialize/unserialize
                                        $maybe2 = @unserialize($row->payload);
                                        if (is_array($maybe2) && !empty($maybe2['user_id'])) {
                                            $foundUserId = $maybe2['user_id'];
                                        }
                                    }
                                }
                            } catch (\Throwable $e) {
                                Log::channel('security')->debug('Erro ao decodificar payload da tabela sessions: ' . $e->getMessage());
                            }
                        }

                        if ($foundUserId) {
                            $usuario = Usuario::find($foundUserId);
                        if ($usuario) {
                            // Restora sessão e Auth
                            $request->session()->put('user_id', $usuario->id);
                            Auth::setUser($usuario);
                            Log::channel('security')->info('Usuário restaurado via sessions table (fallback)', [
                                'user_id' => $usuario->id,
                                'session_id' => $sessionId
                            ]);
                        }
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::channel('security')->warning('Falha no fallback de restauração de sessão', [
                    'error' => $e->getMessage()
                ]);
            }
        }

        // 2. Só tenta remember_token se NÃO houver sessão/cache
        $loginViaRememberToken = false;
        if (!$usuario && !Auth::check() && $request->cookies->has('remember_token')) {
            $rememberToken = $request->cookie('remember_token');
            $data = $this->tokenService->validateToken($rememberToken);
            if ($data) {
                $usuario = Usuario::find($data['user_id']);
                if ($usuario) {
                    $request->session()->put('user_id', $usuario->id);
                    Auth::setUser($usuario);
                    $loginViaRememberToken = true;
                    Log::channel('security')->info('Usuário autenticado via remember_token', [
                        'user_id' => $usuario->id,
                        'token_preview' => substr($rememberToken,0,10).'...'
                    ]);
                }
            } else {
                // Token inválido: apenas remove o cookie, NÃO mexe na sessão/cache
                cookie()->queue(cookie('remember_token', '', -1, '/', null, false, true, false, 'Lax'));
                Log::channel('security')->info('remember_token inválido removido, mas sessão/cached login mantido');
                // Não retorna deny, apenas segue o fluxo normal
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

        // Redireciona para gerenciamento APENAS se login foi via remember_token e está na home
        $routeName = $request->route()?->getName();
        $path = trim($request->path(), '/');
        if ($loginViaRememberToken && ($routeName === 'home' || $path === '' || $path === '/' || $path === 'home')) {
            return redirect()->route('gerenciamento');
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
