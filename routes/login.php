<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;

Route::middleware(['guest'])->group(function () {
    Route::get('/login', [LoginController::class, 'show'])->name('login');
    
    Route::post('/login', [LoginController::class, 'login'])
        ->middleware(['login.rate.limiting'])
        ->name('login.attempt');
});