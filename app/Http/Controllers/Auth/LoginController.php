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

/**
 * CONTROLADOR DE LOGIN - CORRIGIDO PARA VINCULAÇÃO
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
                $usuario = $result['user'];

                // ✅ CORRIGIDO: ORDEM E VINCULAÇÃO DE SESSÃO
                
                // PASSO 1: Regenera sessão
                $request->session()->regenerate();
                $request->session()->save();

                // PASSO 2: Vincula sessão ao usuário
                $this->vincularSessaoAoUsuario($request, $usuario);

                // PASSO 3: Limpa rate limiting
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
     * ✅ MÉTODO PARA VINCULAR SESSÃO AO USUÁRIO
     */
    private function vincularSessaoAoUsuario($request, $usuario): void
    {
        try {
            $sessionId = $request->session()->getId();
            $userId = $usuario->id;

            // Valida se temos os dados necessários
            if (!$sessionId || !$userId) {
                Log::channel('security')->error('Dados insuficientes para vinculação', [
                    'session_id' => $sessionId ?? 'NULL',
                    'user_id' => $userId ?? 'NULL',
                ]);
                return;
            }

            // ✅ ATUALIZA/INSERE NA TABELA SESSIONS
            $affected = DB::table('sessions')->updateOrInsert(
                ['id' => $sessionId],
                [
                    'user_id' => $userId, // ✅ CAMPO CORRETO DAS MIGRATIONS
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'last_activity' => time(),
                    'payload' => $request->session()->serialize(),
                ]
            );

            // ✅ VERIFICA SE FUNCIONOU
            $vinculacao = DB::table('sessions')
                ->where('id', $sessionId)
                ->where('user_id', $userId)
                ->first();

            if ($vinculacao) {
                Log::channel('security')->info('✅ Sessão vinculada com sucesso no LOGIN', [
                    'session_id' => $sessionId,
                    'user_id' => $userId,
                    'user_email' => $usuario->EMAIL,
                    'affected_rows' => $affected,
                ]);
            } else {
                Log::channel('security')->error('❌ Falha na vinculação no LOGIN', [
                    'session_id' => $sessionId,
                    'user_id' => $userId,
                    'affected_rows' => $affected,
                ]);
            }

        } catch (\Exception $e) {
            Log::channel('security')->error('Erro ao vincular sessão no LOGIN', [
                'error' => $e->getMessage(),
                'user_id' => $usuario->id ?? 'N/A',
                'session_id' => $request->session()->getId() ?? 'N/A',
            ]);
        }
    }

    /**
     * LOGS DE AUDITORIA
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
