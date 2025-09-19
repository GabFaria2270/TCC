<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\LoginService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse; // ✅ ADICIONAR
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * CONTROLADOR DE LOGIN - COM TOKEN CACHE
 */
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
     * ✅ CORRIGIDO: Pode retornar RedirectResponse OU JsonResponse
     */
    public function login(LoginRequest $request): RedirectResponse|JsonResponse
    {
        try {
            // LOG DA TENTATIVA
            $this->logLoginAttempt($request);

            // PROCESSA LOGIN VIA SERVICE
            $result = $this->loginService->attempt($request->validated(), $request);

            Log::debug('Resultado do login:', $result);

            if ($result['success']) {
                $usuario = $result['user'];
                
                // ✅ SÓ PEGA TOKEN SE IMPLEMENTOU O SERVICE
                $tokenData = $result['token_data'] ?? null;

                // ✅ ORDEM CORRIGIDA
                
                // PASSO 1: Regenera sessão
                $request->session()->regenerate();
                $request->session()->save();

                // PASSO 2: Vincula sessão ao usuário
                $this->vincularSessaoAoUsuario($request, $usuario);

                // PASSO 3: Limpa rate limiting
                \App\Http\Middleware\LoginRateLimiting::clearRateLimit($request);

                // LOG DE SUCESSO
                $this->logLoginSuccess($usuario, $request);

                // ✅ RESPOSTA AJAX COM TOKEN (se implementado)
                if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                    $response = [
                        'success' => true,
                        'message' => 'Login realizado com sucesso!',
                        'user' => [
                            'id' => $usuario->id,
                            'nome' => $usuario->NOME,
                            'email' => $usuario->EMAIL,
                            'perfil' => $usuario->PERFIL,
                        ]
                    ];
                    
                    // Adiciona token só se foi implementado
                    if ($tokenData) {
                        $response['auth'] = $tokenData;
                    }
                    
                    return response()->json($response);
                }

                // RESPOSTA WEB NORMAL
                $redirect = redirect()->intended(route('gerenciamento'))
                    ->with('success', 'Login realizado com sucesso!');

                if ($tokenData) {
                    // Guarda também em sessão se quiser
                    $redirect->with('auth_token', $tokenData);
                    // Define cookie HttpOnly SameSite=Lax
                    cookie()->queue(
                        cookie(
                            'auth_token',
                            $tokenData['token'],
                          1440, // 24 horas
                            '/',
                            null,
                            false,
                            true,
                            false,
                            'Lax'
                        )
                    );
                }

                return $redirect;
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
     * ✅ MÉTODO PARA VINCULAR SESSÃO AO USUÁRIO
     */
    private function vincularSessaoAoUsuario($request, $usuario): void
    {
        try {
            if (!$usuario || !$request->session()->getId()) {
                Log::channel('security')->error('Dados insuficientes para vinculação');
                return;
            }

            $success = $usuario->linkCurrentSession($request);

            Log::channel('security')->{$success ? 'info' : 'error'}(
                $success ? '✅ Sessão vinculada com sucesso' : '❌ Falha na vinculação',
                [
                    'session_id' => $request->session()->getId(),
                    'user_id' => $usuario->id,
                    'user_email' => $usuario->EMAIL,
                ]
            );
        } catch (\Exception $e) {
            Log::channel('security')->error('Erro ao vincular sessão', [
                'error' => $e->getMessage(),
                'user_id' => $usuario->id ?? 'N/A',
            ]);
        }
    }

    // ...existing code... (métodos de log permanecem iguais)
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
            'session_id' => $request->session()->getId(),
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