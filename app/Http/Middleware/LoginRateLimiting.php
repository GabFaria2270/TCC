<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class LoginRateLimiting
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // APENAS PARA REQUISIÇÕES POST DE LOGIN
        if ($request->isMethod('POST') && $request->routeIs('login.attempt')) {
            $this->checkRateLimit($request);
        }

        $response = $next($request);

        // INCREMENTA CONTADOR APENAS EM CASO DE ERRO DE VALIDAÇÃO
        if ($this->shouldIncrementRateLimit($response)) {
            $this->incrementRateLimit($request);
        }

        return $response;
    }

    /**
     * Verifica se excedeu limite
     */
    protected function checkRateLimit(Request $request): void
    {
        $key = $this->getRateLimitKey($request);
        $maxAttempts = 2;

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);

            // LOG DE BLOQUEIO
            Log::channel('security')->warning('IP bloqueado por rate limiting', [
                'ip' => $request->ip(),
                'email' => $request->EMAIL ?? 'N/A',
                'blocked_for_seconds' => $seconds,
                'max_attempts' => $maxAttempts,
                'timestamp' => now(),
            ]);

            throw ValidationException::withMessages([
                'EMAIL' => "🚨 Muitas tentativas de login. Aguarde {$seconds} segundos para tentar novamente.",
            ]);
        }
    }

    /**
     * Incrementa contador em caso de falha
     */
    protected function incrementRateLimit(Request $request): void
    {
        $key = $this->getRateLimitKey($request);
        RateLimiter::hit($key, 60); // 60 segundos de decaimento
    }

    /**
     * Limpa contador em caso de sucesso
     */
    public static function clearRateLimit(Request $request): void
    {
        $key = static::getRateLimitKey($request);
        RateLimiter::clear($key);
    }

    /**
     * Verifica se deve incrementar rate limit
     */
    protected function shouldIncrementRateLimit(Response $response): bool
    {
        // Incrementa se for redirect de volta (erro de validação)
        return $response->getStatusCode() === 302 && 
               str_contains($response->headers->get('location', ''), 'login');
    }

    /**
     * Gera chave única para rate limiting
     */
    protected static function getRateLimitKey(Request $request): string
    {
        return $request->ip();
    }
}
