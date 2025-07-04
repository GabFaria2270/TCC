<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Registra os services de autenticação
        $this->app->bind(
            \App\Services\Auth\LoginService::class,
            \App\Services\Auth\LoginService::class
        );
        
        $this->app->bind(
            \App\Services\Auth\RegistrationService::class,
            \App\Services\Auth\RegistrationService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
