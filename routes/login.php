<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\SocialLoginController;

Route::middleware(['guest'])->group(function () {
    Route::get('/login', [LoginController::class, 'show'])->name('login');
    
    Route::post('/login', [LoginController::class, 'login'])
        ->middleware(['login.rate.limiting'])
        ->name('login.attempt');

    Route::get('/auth/google/redirect', [SocialLoginController::class, 'redirectToGoogle'])
        ->name('login.google.redirect');

    Route::get('/auth/google/callback', [SocialLoginController::class, 'handleGoogleCallback'])
        ->name('login.google.callback');
});