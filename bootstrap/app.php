<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up'
        // ✅ Rotas já estão sendo carregadas pelo web.php via require
    )
    ->withMiddleware(function (Middleware $middleware) {
        // ✅ REGISTRAR TODOS OS MIDDLEWARES DE ALIAS
        $middleware->alias([
            'login.rate.limit' => \App\Http\Middleware\LoginRateLimiting::class,
            'cadastro.rate.limiting' => \App\Http\Middleware\CadastroRateLimiting::class, // ✅ FALTAVA
            'cache.token.auth' => \App\Http\Middleware\CacheTokenAuth::class,
        ]);

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            SecurityHeaders::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
