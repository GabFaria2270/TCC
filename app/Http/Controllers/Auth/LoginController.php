<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\LoginService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    protected $loginService;

    public function __construct(LoginService $loginService)
    {
        $this->loginService = $loginService;
    }

    /**
     * Exibe o formulário de login
     */
    public function show()
    {
        return view('login');
    }

    /**
     * Processa o login
     */
    public function login(LoginRequest $request): RedirectResponse
    {
        try {
            // LOG DA TENTATIVA
            $this->logLoginAttempt($request);

            // PROCESSA LOGIN VIA SERVICE
            $result = $this->loginService->attempt($request->validated(), $request);

            Log::debug('Resultado do login:', $result);

            if ($result['success']) {
                // REGENERA SESSÃO
                $request->session()->regenerate();

                // Associa usuário à sessão
                $usuario = $result['user'];
                $sessionId = $request->session()->getId();

                $userId = is_object($usuario) ? $usuario->id : $usuario['id'];
                DB::table('sessions')->where('id', $sessionId)->update([
                    'user_id' => $userId,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'last_activity' => time(),
                ]);

                Log::debug('ID do usuário autenticado:', ['id' => $userId]);
                Log::debug('Usuário autenticado:', ['usuario' => $usuario]);

                // LIMPA RATE LIMIT
                \App\Http\Middleware\LoginRateLimiting::clearRateLimit($request);

                // LOG DE SUCESSO
                $this->logLoginSuccess($usuario, $request);

                return redirect()->route('home')
                    ->with('success', 'Login realizado com sucesso!');
            }

            // LOGIN FALHOU
            return back()
                ->withErrors($result['errors'])
                ->withInput($request->except('SENHA_HASH'));

        } catch (ValidationException $e) {
            // RATE LIMITING OU VALIDAÇÃO
            $this->logValidationError($e, $request);
            
            return back()
                ->withErrors($e->errors())
                ->withInput($request->except('SENHA_HASH'));

        } catch (\Exception $e) {
            // ERRO INTERNO
            $this->logSystemError($e, $request);
            
            return back()
                ->with('error', 'Erro interno. Tente novamente.')
                ->withInput($request->except('SENHA_HASH'));
        }
    }

    /**
     * Logs de auditoria
     */
    private function logLoginAttempt(Request $request): void
    {
        Log::channel('security')->info('Tentativa de login', [
            'email' => $request->EMAIL,
            'ip' => $request->ip(),
            'user_agent' => substr($request->userAgent(), 0, 200),
            'timestamp' => now(),
        ]);
    }

    private function logLoginSuccess($user, Request $request): void
    {
        Log::channel('security')->info('Login realizado com sucesso', [
            'user_id' => $user->id,
            'email' => $user->EMAIL,
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);
    }

    private function logValidationError(ValidationException $e, Request $request): void
    {
        Log::channel('security')->warning('Erro de validação no login', [
            'email' => $request->EMAIL ?? 'N/A',
            'ip' => $request->ip(),
            'errors' => $e->errors(),
            'timestamp' => now(),
        ]);
    }

    private function logSystemError(\Exception $e, Request $request): void
    {
        Log::channel('security')->error('Erro no sistema de login', [
            'email' => $request->EMAIL ?? 'N/A',
            'ip' => $request->ip(),
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'timestamp' => now(),
        ]);
    }
}
