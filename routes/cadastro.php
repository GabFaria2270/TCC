<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisterController;

Route::middleware(['guest'])->group(function () {
    Route::get('/cadastro', [RegisterController::class, 'show'])->name('cadastro');
    
    Route::post('/cadastro', [RegisterController::class, 'register'])
        ->middleware(['cadastro.rate.limiting'])
        ->name('cadastro.attempt');
});