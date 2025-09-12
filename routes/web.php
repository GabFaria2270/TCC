<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

Route::get('/', function () {
    return view('home');
})->name('home');

Route::get('/login/lock-status', [AuthenticatedSessionController::class, 'lockStatus'])->name('login.lock-status');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/cadastro.php';
require __DIR__.'/login.php';

// Gerenciamento via Inertia (respeitando o tratamento de dados antes do painel)
Route::middleware(['require.token'])->group(function () {
    Route::get('/gerenciamento', function () {
        $user = request()->user();
        return Inertia::render('gerenciamento/Inicio', [
            'comercio' => optional($user?->comercio)->only(['nome','cnpj']),
        ]);
    })->name('gerenciamento');

    Route::get('/gerenciamento/clientes', function () {
        return Inertia::render('gerenciamento/Clientes');
    })->name('gerenciamento.clientes');
});

