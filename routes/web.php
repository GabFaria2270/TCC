<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



Route::get('/app', function () {
    return view('app'); // 'app' refere-se ao arquivo app.blade.php em resources/views
})->name('app');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
