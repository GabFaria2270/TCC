<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return view('home');
})->name('home');

// ROTAS DE CADASTRO E LOGIN REMOVIDAS - Já existem em seus próprios arquivos

// ROTA DE LOGOUT REMOVIDA - Já existe em routes/auth.php

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/cadastro.php';
require __DIR__.'/login.php';
// require __DIR__.'/logout.php'; // Arquivo não existe - removido

