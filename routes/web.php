<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\ClienteController;
use App\Http\Controllers\Auth\ProdutoController;
use App\Http\Controllers\Auth\VendasController;

// ✅ ROTAS PÚBLICAS - SEM MIDDLEWARE
Route::get('/', function () {
    return view('home');
})->name('home');

// Rotas de login e cadastro ficam em arquivos dedicados (login.php, cadastro.php, auth.php)

// ✅ APENAS ROTAS PROTEGIDAS COM MIDDLEWARE
Route::middleware(['require.token'])->group(function () {
    Route::get('/gerenciamento', function () {
        $user = request()->user();
        return Inertia::render('gerenciamento/Inicio', [
            'comercio' => optional($user?->comercio)->only(['nome','cnpj']),
        ]);
    })->name('gerenciamento');
    
    // ✅ GRUPO DE ROTAS DE GERENCIAMENTO
    Route::prefix('gerenciamento')->group(function () {
        // Clientes
        Route::get('clientes', [ClienteController::class, 'index'])->name('clientes.index');
        Route::get('clientes/create', [ClienteController::class, 'create'])->name('clientes.create');
        Route::post('clientes', [ClienteController::class, 'store'])->name('clientes.store');
        Route::get('clientes/{cliente}', [ClienteController::class, 'show'])->name('clientes.show');
        Route::get('clientes/{cliente}/edit', [ClienteController::class, 'edit'])->name('clientes.edit');
        Route::put('clientes/{cliente}', [ClienteController::class, 'update'])->name('clientes.update');
        Route::delete('clientes/{cliente}/conta-fiada', [ClienteController::class, 'pagarContaFiada'])->name('clientes.pagarContaFiada');

        // Produtos
        Route::get('produtos', [ProdutoController::class, 'index'])->name('produtos.index');
        Route::post('produtos/filtros', [ProdutoController::class, 'setFilters'])->name('produtos.filtros');
        Route::post('produtos', [ProdutoController::class, 'store'])->name('produtos.store');
        Route::put('produtos/{produto}', [ProdutoController::class, 'update'])->name('produtos.update');
        Route::delete('produtos/{produto}', [ProdutoController::class, 'destroy'])->name('produtos.destroy');
        Route::post('produtos/{produto}/estoque/entrada', [ProdutoController::class, 'estoqueEntrada'])->name('produtos.estoque.entrada');
        Route::post('produtos/{produto}/estoque/saida', [ProdutoController::class, 'estoqueSaida'])->name('produtos.estoque.saida');
        Route::post('produtos/{produto}/estoque/ajuste', [ProdutoController::class, 'estoqueAjuste'])->name('produtos.estoque.ajuste');
        Route::get('produtos/{produto}/historico', [ProdutoController::class, 'historico'])->name('produtos.historico');

        // Vendas
        Route::get('vendas', [VendasController::class, 'index'])->name('vendas.index');
        Route::post('vendas', [VendasController::class, 'store'])->name('vendas.store');
        Route::get('vendas/{venda}', [VendasController::class, 'show'])->name('vendas.show');
        Route::get('vendas/{venda}/edit', [VendasController::class, 'edit'])->name('vendas.edit');
        Route::put('vendas/{venda}', [VendasController::class, 'update'])->name('vendas.update');
        Route::delete('vendas/{venda}', [VendasController::class, 'destroy'])->name('vendas.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/cadastro.php';
require __DIR__.'/login.php';



