<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\LoginService;
use App\Services\Auth\CacheTokenService;
use App\Services\Auth\SessionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * CONTROLADOR DE LOGIN - COM TOKEN CACHE
 */
class LoginController extends Controller
{
    protected LoginService $loginService;
    protected CacheTokenService $tokenService;
    protected SessionService $sessionService;

    public function __construct(
        LoginService $loginService,
        CacheTokenService $tokenService,
        SessionService $sessionService
    ) {
        $this->loginService = $loginService;
        $this->tokenService = $tokenService;
        $this->sessionService = $sessionService;
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

                // Vincula a sessão atual ao usuário de forma centralizada
                if (!$this->sessionService->linkSessionToUser($usuario, $request)) {
                    Log::channel('security')->error('Falha ao vincular sessão ao usuário após login', [
                        'user_id' => $usuario->id,
                        'email' => $usuario->EMAIL,
                    ]);
                    // Fallback mínimo para evitar sessão órfã
                    $request->session()->put('user_id', $usuario->id);
                }

                // Garante sessão única
                $this->sessionService->enforceSingleSession($usuario, $request);

                // Atualiza contexto de autenticação
                Auth::setUser($usuario);

                // Regenera token CSRF após o login
                $request->session()->regenerateToken();

                // ✅ NÃO GERAR TOKEN DE NOVO: usar o retornado do service
                $tokenData = $result['token_data'] ?? $this->tokenService->getTokenData($usuario);

                // Define cookie do token (usando config para consistência)
                $secure = (bool) config('session.secure', false);
                $sameSiteCfg = config('session.same_site');
                $sameSite = $sameSiteCfg ? strtolower($sameSiteCfg) : 'lax';
                $path = config('session.path', '/');
                cookie()->queue(cookie('auth_token', $tokenData['token'], 1440, $path, config('session.domain'), $secure, true, false, $sameSite));

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