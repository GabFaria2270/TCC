<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('app');
})->name('app');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/cadastro.php';