<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\LoginService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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

            if ($result['success']) {
                // REGENERA SESSÃO
                $request->session()->regenerate();
                
                // LOG DE SUCESSO
                $this->logLoginSuccess($result['user'], $request);
                
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
            'user_id' => $user->ID,
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
