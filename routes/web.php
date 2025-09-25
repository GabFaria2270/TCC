<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ClienteController; // ✅ NAMESPACE Auth CORRETO
use App\Http\Controllers\Auth\ProdutoController;

Route::get('/', function () {
    return view('home');
})->name('home');

Route::get('/login/lock-status', [AuthenticatedSessionController::class, 'lockStatus'])->name('login.lock-status');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/cadastro.php';
require __DIR__.'/login.php';

// ✅ GERENCIAMENTO VIA INERTIA (ROTAS ORGANIZADAS)
Route::middleware(['require.token'])->group(function () {
    
    // Dashboard principal
    Route::get('/gerenciamento', function () {
        $user = request()->user();
        return Inertia::render('gerenciamento/Inicio', [
            'comercio' => optional($user?->comercio)->only(['nome','cnpj']),
        ]);
    })->name('gerenciamento');

    // ✅ GRUPO DE ROTAS DE CLIENTES (middleware aplicado pelo grupo pai)
    Route::prefix('gerenciamento')->group(function () {
        
        // Lista de clientes
        Route::get('clientes', [ClienteController::class, 'index'])
            ->name('clientes.index');
        
        // Formulário de cadastro
        Route::get('clientes/create', [ClienteController::class, 'create'])
            ->name('clientes.create');
        
        // Processar cadastro
        Route::post('clientes', [ClienteController::class, 'store'])
            ->name('clientes.store');
        
        // Visualizar cliente específico
        Route::get('clientes/{cliente}', [ClienteController::class, 'show'])
            ->name('clientes.show');
            
        // Editar cliente
        Route::get('clientes/{cliente}/edit', [ClienteController::class, 'edit'])
            ->name('clientes.edit');
            
        // Atualizar cliente
        Route::put('clientes/{cliente}', [ClienteController::class, 'update'])
            ->name('clientes.update');

        // Produtos
        Route::get('produtos', [ProdutoController::class, 'index'])
            ->name('produtos.index');

        Route::post('produtos', [ProdutoController::class, 'store'])
            ->name('produtos.store');
    });
});



