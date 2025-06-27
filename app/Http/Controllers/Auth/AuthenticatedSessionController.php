<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        try {
            // LOG DE TENTATIVA
            Log::channel('security')->info('Tentativa de login (Controller)', [
                'email' => $request->email ?? $request->EMAIL,
                'ip' => $request->ip(),
                'user_agent' => substr($request->userAgent(), 0, 200),
                'timestamp' => now(),
            ]);

            $request->authenticate();
            $request->session()->regenerate();

            $usuario = Auth::user();

            // LOG DE SUCESSO
            Log::channel('security')->info('Login realizado com sucesso (Controller)', [
                'user_id' => $usuario->id ?? $usuario->ID,
                'email' => $usuario->email ?? $usuario->EMAIL,
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);

            // REDIRECIONA PARA HOME (NÃO DASHBOARD)
            return redirect()->intended(route('home', absolute: false));
        } catch (\Exception $e) {
            // LOG DE ERRO
            Log::channel('security')->error('Erro no login (Controller)', [
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);

            throw $e;
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $usuario = Auth::user();

        // LOG DE LOGOUT
        Log::channel('security')->info('Logout realizado (Controller)', [
            'user_id' => $usuario->id ?? $usuario->ID ?? 'N/A',
            'email' => $usuario->email ?? $usuario->EMAIL ?? 'N/A',
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home')->with('success', 'Logout realizado com sucesso!');
    }
}
