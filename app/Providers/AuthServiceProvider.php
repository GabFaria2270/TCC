<?php

namespace App\Providers;

use App\Models\Produto;
use App\Models\Venda;
use App\Policies\ProdutoPolicy;
use App\Policies\VendaPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Produto::class => ProdutoPolicy::class,
        Venda::class => VendaPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
