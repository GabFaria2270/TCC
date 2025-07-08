<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\LoginService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Controller customizado para login
 * Responsabilidades:
 * - Exibir formulário de login
 * - Coordenar processo de autenticação via Service
 * - Registrar logs de auditoria
 * - Tratar exceções e erros
 */
class LoginController extends Controller
{
    protected $loginService;

    /**
     * Injeção de dependência do LoginService
     * Segue padrão de inversão de controle
     */
    public function __construct(LoginService $loginService)
    {
        $this->loginService = $loginService;
    }

    /**
     * Exibe o formulário de login
     * Retorna view customizada (não Inertia)
     */
    public function show()
    {
        return view('login');
    }

    /**
     * Processa tentativa de login
     * Fluxo: Validação → Service → Logs → Resposta
     */
    public function login(LoginRequest $request): RedirectResponse
    {
        try {
            // LOG DA TENTATIVA - Auditoria de segurança
            $this->logLoginAttempt($request);

            // PROCESSA LOGIN VIA SERVICE - Separação de responsabilidades
            $result = $this->loginService->attempt($request->validated(), $request);

            if ($result['success']) {
                // LOGIN SUCESSO
                // Regenera sessão para prevenir session fixation
                $request->session()->regenerate();
                
                // LOG DE SUCESSO
                $this->logLoginSuccess($result['user'], $request);
                
                return redirect()->route('home')
                    ->with('success', 'Login realizado com sucesso!');
            }

            // LOGIN FALHOU - Retorna com erros específicos
            return back()
                ->withErrors($result['errors'])
                ->withInput($request->except('SENHA_HASH')); // Não retorna senha

        } catch (ValidationException $e) {
            // RATE LIMITING OU VALIDAÇÃO - Captura middleware de rate limiting
            $this->logValidationError($e, $request);
            
            return back()
                ->withErrors($e->errors())
                ->withInput($request->except('SENHA_HASH'));

        } catch (\Exception $e) {
            // ERRO INTERNO - Tratamento de erros inesperados
            $this->logSystemError($e, $request);
            
            return back()
                ->with('error', 'Erro interno. Tente novamente.')
                ->withInput($request->except('SENHA_HASH'));
        }
    }

    /**
     * Logs de auditoria para compliance e segurança
     * Canal 'security' separado para análise
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
