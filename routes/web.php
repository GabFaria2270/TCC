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

// Rota principal pós login/cadastro (painel)
// Usa 'auth' para sessão normal e 'require.token' como fallback + regeneração de token
Route::get('/gerenciamento', function () {
        return view('gerenciamento');
})->middleware(['require.token'])
    ->name('gerenciamento');

