<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return view('home');
})->name('home');

Route::get('/cadastro', function () {
    return view('cadastro');
})->name('cadastro');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/cadastro.php';