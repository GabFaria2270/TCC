<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\LoginController; // ✅ SEU CONTROLLER CUSTOMIZADO
use App\Http\Controllers\Auth\RegisterController; // ✅ SEU CONTROLLER CUSTOMIZADO
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

Route::middleware('guest')->group(function () {
    // ✅ CORRIGIDO: Usa seus Controllers customizados
    Route::get('register', [RegisterController::class, 'show'])
        ->name('register');

    Route::post('register', [RegisterController::class, 'register'])
        ->middleware('cadastro.rate.limiting'); // ✅ USA SEU MIDDLEWARE

    Route::get('login', [LoginController::class, 'show']) // ✅ SEU CONTROLLER
        ->name('login');

    Route::post('login', [LoginController::class, 'login']) // ✅ SEU CONTROLLER
        ->middleware('login.rate.limit'); // ✅ USA SEU MIDDLEWARE

    // Reset de senha (padrão Laravel - pode manter)
    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->middleware('throttle:2,1')
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

Route::middleware('auth')->group(function () {
    // Verificação de email (padrão Laravel - pode manter)
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    // ✅ LOGOUT: Usa AuthenticatedSessionController (único que você usa dele)
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});

// Refresh Token via Cache
Route::post('/refresh-token', function (Request $request) {
    $user = Auth::user();
    if (!$user) {
        return response()->json(['success' => false, 'message' => 'Não autenticado'], 401);
    }
    
    $tokenService = app(\App\Services\Auth\CacheTokenService::class);
    $tokenData = $tokenService->getTokenData($user);
    
    return response()->json([
        'success' => true,
        'auth' => $tokenData,
        'user' => [
            'id' => $user->id,
            'nome' => $user->NOME,
            'email' => $user->EMAIL,
            'perfil' => $user->PERFIL,
        ]
    ]);
})->middleware(['web', 'cache.token.auth']);
