<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller padrão do Laravel (Breeze/Jetstream)
 * USADO APENAS PARA LOGOUT no seu sistema
 * 
 * Métodos create() e store() são ignorados
 * Você usa LoginController customizado
 */
class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page - NÃO USADO
     * Você usa LoginController->show()
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    // ✅ MÉTODO REMOVIDO - Você usa LoginController customizado

    /**
     * Retorna status de bloqueio do login (segundos restantes).
     * NOVO MÉTODO PARA PERSISTÊNCIA DO BLOQUEIO
     */
    public function lockStatus(Request $request)
    {
        $email = (string) $request->query('email', '');
        $key = Str::transliterate(Str::lower($email) . '|' . $request->ip());
        $maxAttempts = 2; // Mesmo valor do seu middleware

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            return response()->json([
                'locked' => true,
                'seconds' => RateLimiter::availableIn($key),
            ]);
        }

        return response()->json([
            'locked' => false,
            'seconds' => 0,
        ]);
    }

    /**
     * Destroy session - USADO PARA LOGOUT
     * Único método que você utiliza deste controller
     */
    public function destroy(Request $request): RedirectResponse
    {
        $usuario = Auth::user();

        // LOG DE LOGOUT - Auditoria de sessões
        Log::channel('security')->info('Logout realizado (Controller)', [
            'user_id' => $usuario->id ?? 'N/A',
            'email' => $usuario->EMAIL ?? 'N/A',
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        // LOGOUT SEGURO
        Auth::guard('web')->logout();
        $request->session()->invalidate(); // Invalida sessão atual
        $request->session()->regenerateToken(); // Regenera CSRF token

        return redirect()->route('home')->with('success', 'Logout realizado com sucesso!');
    }
}
