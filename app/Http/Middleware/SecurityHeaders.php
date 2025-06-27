<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // PROTEÇÃO CONTRA XSS
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        
        // POLÍTICA DE REFERÊNCIA
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // DESABILITA RECURSOS PERIGOSOS
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        
        // POLÍTICA DE SEGURANÇA DE CONTEÚDO (CSP) - AJUSTADA PARA VITE
        if (app()->environment('local')) {
            // DESENVOLVIMENTO: Inclui servidores Vite e é permissiva
            $csp = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http://localhost:* http://127.0.0.1:* http://[::1]:* ws://localhost:* ws://127.0.0.1:* ws://[::1]:*; " .
                   "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* http://127.0.0.1:* http://[::1]:* ws://localhost:* ws://127.0.0.1:* ws://[::1]:* cdn.jsdelivr.net unpkg.com; " .
                   "style-src 'self' 'unsafe-inline' http://localhost:* http://127.0.0.1:* http://[::1]:* cdn.jsdelivr.net fonts.googleapis.com unpkg.com; " .
                   "img-src 'self' data: blob: http://localhost:* http://127.0.0.1:* http://[::1]:* https:; " .
                   "font-src 'self' data: http://localhost:* http://127.0.0.1:* http://[::1]:* cdn.jsdelivr.net fonts.gstatic.com; " .
                   "connect-src 'self' http://localhost:* http://127.0.0.1:* http://[::1]:* ws://localhost:* ws://127.0.0.1:* ws://[::1]:*; " .
                   "frame-src 'self' http://localhost:* http://127.0.0.1:* http://[::1]:*";
        } else {
            // PRODUÇÃO: Mais restritivo
            $csp = "default-src 'self'; " .
                   "script-src 'self' 'unsafe-eval' 'unsafe-inline' cdn.jsdelivr.net unpkg.com; " .
                   "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net fonts.googleapis.com unpkg.com; " .
                   "img-src 'self' data: https:; " .
                   "font-src 'self' cdn.jsdelivr.net fonts.gstatic.com; " .
                   "connect-src 'self'";
        }
               
        // COMENTAR TEMPORARIAMENTE PARA DESENVOLVIMENTO
        // $response->headers->set('Content-Security-Policy', $csp);
        
        return $response;
    }
}