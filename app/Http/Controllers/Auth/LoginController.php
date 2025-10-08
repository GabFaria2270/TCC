<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\LoginService;
use App\Services\Auth\CacheTokenService; // ✅ ADICIONAR
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * CONTROLADOR DE LOGIN - COM TOKEN CACHE
 */
class LoginController extends Controller
{
    protected LoginService $loginService;
    protected CacheTokenService $tokenService; // ✅ ADICIONAR

    public function __construct(LoginService $loginService, CacheTokenService $tokenService) // ✅ INJETAR
    {
        $this->loginService = $loginService;
        $this->tokenService = $tokenService; // ✅ ATRIBUIR
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
                
                // ✅ REUTILIZA SESSÃO EXISTENTE
                $sessionId = $request->session()->getId();
                if (!$request->session()->isStarted()) {
                    $request->session()->start();
                    $sessionId = $request->session()->getId();
                }
                
                // ✅ REGENERA TOKEN DA SESSÃO (segurança) MAS MANTÉM ID
                $request->session()->regenerateToken();
                
                // ✅ VINCULA SESSÃO EXISTENTE AO USUÁRIO (não cria nova)
                $this->vincularSessaoExistente($request, $usuario, $sessionId);

                // ✅ GARANTE SESSÃO ÚNICA POR USUÁRIO
                $this->encerrarOutrasSessoes($usuario->id, $sessionId);
                
                // ✅ NÃO GERAR TOKEN DE NOVO: usar o retornado do service
                $tokenData = $result['token_data'] ?? $this->tokenService->getTokenData($usuario);
                
                // Define cookie do token
                cookie()->queue(
                    cookie('auth_token', $tokenData['token'], 1440, '/', null, false, true, false, 'Lax')
                );
                
                // Limpa rate limiting
                \App\Http\Middleware\LoginRateLimiting::clearRateLimit($request);
                $this->logLoginSuccess($usuario, $request);

                // RESPOSTA AJAX
                if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                    return response()->json([
                        'success' => true,
                        'message' => 'Login realizado com sucesso!',
                        'user' => [
                            'id' => $usuario->id,
                            'nome' => $usuario->NOME,
                            'email' => $usuario->EMAIL,
                            'perfil' => $usuario->PERFIL,
                        ],
                        'auth' => $tokenData
                    ]);
                }

                // RESPOSTA WEB
                return redirect()->intended(route('gerenciamento'))
                    ->with('success', 'Login realizado com sucesso!');
            }

            // LOGIN FALHOU
            return back()
                ->withErrors($result['errors'])
                ->withInput($request->except('SENHA_HASH'));

        } catch (ValidationException $e) {
            $this->logValidationError($e, $request);
            return back()
                ->withErrors($e->errors())
                ->withInput($request->except('SENHA_HASH'));

        } catch (\Exception $e) {
            $this->logSystemError($e, $request);
            return back()
                ->with('error', 'Erro interno. Tente novamente.')
                ->withInput($request->except('SENHA_HASH'));
        }
    }

    /**
     * ✅ VINCULA SESSÃO EXISTENTE AO INVÉS DE CRIAR NOVA
     */
    private function vincularSessaoExistente(Request $request, $usuario, string $sessionId): void
    {
        try {
            // Atualiza a sessão existente com o user_id
            DB::table('sessions')
                ->where('id', $sessionId)
                ->update([
                    'user_id' => $usuario->id,
                    'last_activity' => now()->timestamp
                ]);

            Log::channel('security')->info('✅ Sessão existente vinculada ao usuário', [
                'session_id' => $sessionId,
                'user_id' => $usuario->id,
                'user_email' => $usuario->EMAIL,
            ]);

        } catch (\Exception $e) {
            Log::channel('security')->error('❌ Erro ao vincular sessão existente', [
                'error' => $e->getMessage(),
                'session_id' => $sessionId,
                'user_id' => $usuario->id ?? 'N/A',
            ]);
        }
    }

    /**
     * ✅ Remove outras sessões do mesmo usuário para manter 1 sessão ativa
     */
    private function encerrarOutrasSessoes(int $userId, string $currentSessionId): void
    {
        try {
            DB::table('sessions')
                ->where('user_id', $userId)
                ->where('id', '!=', $currentSessionId)
                ->delete();

            Log::channel('security')->info('🧹 Outras sessões encerradas para manter sessão única', [
                'user_id' => $userId,
                'current_session' => $currentSessionId
            ]);
        } catch (\Exception $e) {
            Log::channel('security')->warning('⚠️ Falha ao encerrar outras sessões', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
        }
    }

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