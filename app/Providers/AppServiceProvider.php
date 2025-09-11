<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Auth\CacheTokenService;
use App\Services\Auth\RegistrationService; // ✅ ADICIONAR

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ✅ REGISTRA O CacheTokenService no container
        $this->app->singleton(CacheTokenService::class, function ($app) {
            return new CacheTokenService();
        });

        // ✅ REGISTRA O RegistrationService com CacheTokenService
        $this->app->singleton(RegistrationService::class, function ($app) {
            return new RegistrationService($app->make(CacheTokenService::class));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
