<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders; // ADICIONE ESTE IMPORT
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // REGISTRAR SUAS ROTAS PERSONALIZADAS
            Route::middleware('web')->group(base_path('routes/login.php'));
            Route::middleware('web')->group(base_path('routes/cadastro.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->alias([
            'login.rate.limiting' => \App\Http\Middleware\LoginRateLimiting::class,
          
        ]);

        $middleware->web(append: [
            SecurityHeaders::class, // ADICIONE SEU MIDDLEWARE DE SEGURANÇA
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
