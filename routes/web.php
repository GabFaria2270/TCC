<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return view('home');
})->name('home');

Route::get('/cadastro', function () {
    return view('cadastro');
})->name('cadastro');


Route::get('/login', function () {
    return view('login');
})->name('login');

// ROTA DE LOGOUT REMOVIDA - Já existe em routes/auth.php

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/cadastro.php';
require __DIR__.'/login.php';
// require __DIR__.'/logout.php'; // Arquivo não existe - removido