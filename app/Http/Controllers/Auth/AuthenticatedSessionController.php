<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
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

    /**
     * Handle authentication request - NÃO USADO
     * Você usa LoginController->login()
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        try {
            Log::channel('security')->info('Tentativa de login (Controller)', ['timestamp' => now()]);

            $request->authenticate();
            $request->session()->regenerate();

            // garante que a sessão seja gravada no storage (cria a linha quando usa driver database)
            $request->session()->save();

            $usuario = Auth::user();
            $sessionId = $request->session()->getId();

            // pega a chave primária do model independentemente do nome do campo
            $usuarioKey = $usuario ? $usuario->getKey() : null;

            // cria ou atualiza a linha da sessão garantindo associação ao usuário
            DB::table('sessions')->updateOrInsert(
                ['id' => $sessionId],
                [
                    'usuario_id'    => $usuarioKey,
                    'ip_address'    => $request->ip(),
                    'user_agent'    => $request->userAgent(),
                    'last_activity' => time(),
                ]
            );

            Log::channel('security')->info('Login realizado com sucesso (Controller)', [
                'user_key' => $usuarioKey ?? 'N/A',
                'session_id' => $sessionId,
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);

            return redirect()->intended(route('home', absolute: false));
        } catch (\Exception $e) {
            Log::channel('security')->error('Erro no login (Controller)', ['timestamp' => now(), 'error' => $e->getMessage()]);
            throw $e;
        }
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
