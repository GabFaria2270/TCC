<?php

namespace App\Http\Middleware;

use App\Services\Auth\CacheTokenService;
use App\Models\Usuario;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CacheTokenAuth
{
    protected CacheTokenService $tokenService;

    public function __construct(CacheTokenService $tokenService)
    {
        $this->tokenService = $tokenService;
    }

    public function handle(Request $request, Closure $next): Response
    {
        // Se já autenticado via sessão, prossegue
        if (Auth::check()) {
            return $next($request);
        }

        // Busca token no header
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return $this->unauthorized('Token não fornecido');
        }

        $token = substr($authHeader, 7);
        $tokenData = $this->tokenService->validateToken($token);
        
        if (!$tokenData) {
            return $this->unauthorized('Token inválido ou expirado');
        }

        // Busca usuário
        $usuario = Usuario::find($tokenData['user_id']);
        if (!$usuario) {
            return $this->unauthorized('Usuário não encontrado');
        }

        // Autentica via Laravel
        Auth::login($usuario);
        
        // Adiciona dados do token na request
        $request->attributes->set('token_data', $tokenData);

        // Verifica se precisa refresh
        if ($this->tokenService->shouldRefresh($tokenData)) {
            $newToken = $this->tokenService->refreshToken($token);
            if ($newToken) {
                $newTokenData = $this->tokenService->getTokenData($usuario);
                $request->attributes->set('refresh_token', $newTokenData);
            }
        }

        return $next($request);
    }

    private function unauthorized(string $message): Response
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'code' => 'UNAUTHORIZED'
        ], 401);
    }
}