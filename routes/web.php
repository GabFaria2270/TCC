<?php

use App\Http\Controllers\InicioController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\ClienteController;
use App\Http\Controllers\Auth\ProdutoController;
use App\Http\Controllers\Auth\VendasController; // ✅ ADICIONAR IMPORT
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\FiadoController;

// ✅ ROTAS PÚBLICAS - SEM MIDDLEWARE
Route::get('/', function () {
    return view('home');
})->name('home');

Route::get('/login/lock-status', [AuthenticatedSessionController::class, 'lockStatus'])->name('login.lock-status');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/cadastro.php';
require __DIR__ . '/login.php';

// ✅ GERENCIAMENTO VIA INERTIA (ROTAS ORGANIZADAS)
Route::middleware(['require.token'])->group(function () {

    // Dashboard principal (usa controller para preencher dashboard)
    Route::get('/gerenciamento', [InicioController::class, 'index'])->name('gerenciamento');

    // ✅ GRUPO DE ROTAS DE GERENCIAMENTO
    Route::prefix('gerenciamento')->group(function () {

        // ✅ ROTAS DE CLIENTES
        Route::get('clientes', [ClienteController::class, 'index'])
            ->name('clientes.index');

        Route::get('clientes/create', [ClienteController::class, 'create'])
            ->name('clientes.create');

        Route::post('clientes', [ClienteController::class, 'store'])
            ->name('clientes.store');

        Route::get('clientes/{cliente}', [ClienteController::class, 'show'])
            ->name('clientes.show');

        Route::get('clientes/{cliente}/edit', [ClienteController::class, 'edit'])
            ->name('clientes.edit');

        Route::put('clientes/{cliente}', [ClienteController::class, 'update'])
            ->name('clientes.update');

        Route::delete('clientes/{cliente}/conta-fiada', [ClienteController::class, 'pagarContaFiada'])
            ->name('clientes.pagarContaFiada');

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

        // ✅ ROTAS DE VENDAS (IGUAL AOS CLIENTES)
        Route::get('vendas', [VendasController::class, 'index'])
            ->name('vendas.index');
        Route::post('vendas', [VendasController::class, 'store'])
            ->name('vendas.store');
        Route::get('vendas/{venda}', [VendasController::class, 'show'])
            ->name('vendas.show');
        Route::get('vendas/{venda}/edit', [VendasController::class, 'edit'])
            ->name('vendas.edit');
        Route::put('vendas/{venda}', [VendasController::class, 'update'])
            ->name('vendas.update');
        Route::delete('vendas/{venda}', [VendasController::class, 'destroy'])
            ->name('vendas.destroy');
        Route::get('fiado/historico', [FiadoController::class, 'historico'])
            ->name('fiado.historico');
        // ROTA DE RELATÓRIO
        Route::get('relatorio', [\App\Http\Controllers\Auth\RelatorioController::class, 'index'])->name('relatorio.index');
    Route::get('relatorio/exportar-excel', [\App\Http\Controllers\Auth\RelatorioController::class, 'exportExcel'])->name('relatorio.exportarExcel');
    });
});





