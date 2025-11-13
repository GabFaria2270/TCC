<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UsuarioRequest;
use App\Services\Auth\RegistrationService;
use App\Services\Auth\CacheTokenService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * CONTROLADOR DE CADASTRO - COM TOKEN CACHE
 */
class RegisterController extends Controller
{
    protected $registrationService;
    protected CacheTokenService $tokenService;

    public function __construct(RegistrationService $registrationService, CacheTokenService $tokenService)
    {
        $this->registrationService = $registrationService;
        $this->tokenService = $tokenService;
    }

    /**
     * Exibe formulário de cadastro
     */
    public function show()
    {
        return view('cadastro');
    }

    /**
     * Processa cadastro
     * ✅ PODE RETORNAR REDIRECT OU JSON
     */
    public function register(UsuarioRequest $request): RedirectResponse|JsonResponse
    {
        try {
            // LOG DA TENTATIVA
            $this->logRegistrationAttempt($request);

            // PROCESSA CADASTRO VIA SERVICE
            $result = $this->registrationService->create($request->validated(), $request);

            if ($result['success']) {
                $usuario = $result['user'];
                $this->logRegistrationSuccess($usuario, $request);

                // Autentica usuário e garante sessão exclusiva
                Auth::login($usuario);
                if ($request->hasSession()) {
                    $session = $request->session();
                    if (!$session->isStarted()) {
                        $session->start();
                    }
                    $session->regenerate();
                    $sessionId = $session->getId();
                    $session->put('user_id', $usuario->id);
                    $this->vincularSessaoExistente($sessionId, $usuario->id, $usuario->EMAIL);
                    $this->encerrarOutrasSessoes($usuario->id, $sessionId);
                }

                // Limpa vestígios de sessão anterior do navegador
                cookie()->queue(cookie('remember_token', '', -1, '/', null, false, true, false, 'Lax'));

                // Gera token via cache e define cookie httpOnly
                $tokenData = $this->tokenService->getTokenData($usuario);
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

                // Resposta AJAX
                if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                    return response()->json([
                        'success' => true,
                        'message' => 'Cadastro realizado com sucesso! Bem-vindo(a), ' . $usuario->NOME . '!',
                        'user' => [
                            'id' => $usuario->id,
                            'nome' => $usuario->NOME,
                            'email' => $usuario->EMAIL,
                            'perfil' => $usuario->PERFIL,
                        ],
                        'auth' => $tokenData
                    ]);
                }

                // Redireciona ao painel SPA protegido por require.token (que também garantirá o token)
                return redirect()->intended(route('gerenciamento'))
                    ->with('success', 'Cadastro realizado com sucesso! Bem-vindo(a), ' . $usuario->NOME . '!');
            }

            // CADASTRO FALHOU
            return back()->withErrors($result['errors']);

        } catch (ValidationException $e) {
            // ERRO DE VALIDAÇÃO
            $this->logValidationError($e, $request);
            
            return back()->withErrors($e->errors());

        } catch (\Exception $e) {
            // ERRO INTERNO
            $this->logSystemError($e, $request);
            
            return back()->with('error', 'Erro interno do sistema. Tente novamente.');
        }
    }

    /**
     * LOGS DE AUDITORIA
     */
    private function logRegistrationAttempt(Request $request): void
    {
        Log::channel('security')->info('Tentativa de cadastro', [
            'email' => $request->EMAIL,
            'nome' => $request->NOME,
            'perfil' => $request->PERFIL,
            'ip' => $request->ip(),
            'user_agent' => substr($request->userAgent(), 0, 200),
            'timestamp' => now(),
        ]);
    }

    private function logRegistrationSuccess($user, Request $request): void
    {
        Log::channel('security')->info('Cadastro realizado com sucesso', [
            'user_id' => $user->id,
            'email' => $user->EMAIL,
            'nome' => $user->NOME,
            'perfil' => $user->PERFIL,
            'ip' => $request->ip(),
            'session_id' => $request->session()->getId(),
            'timestamp' => now(),
        ]);
    }

    private function logValidationError(ValidationException $e, Request $request): void
    {
        Log::channel('security')->warning('Erro de validação no cadastro', [
            'email' => $request->EMAIL ?? 'N/A',
            'nome' => $request->NOME ?? 'N/A',
            'ip' => $request->ip(),
            'errors' => $e->errors(),
            'timestamp' => now(),
        ]);
    }

    private function logSystemError(\Exception $e, Request $request): void
    {
        Log::channel('security')->error('Erro no sistema de cadastro', [
            'email' => $request->EMAIL ?? 'N/A',
            'nome' => $request->NOME ?? 'N/A',
            'ip' => $request->ip(),
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'timestamp' => now(),
        ]);
    }

    private function vincularSessaoExistente(string $sessionId, int $userId, string $email): void
    {
        try {
            DB::table('sessions')
                ->where('id', $sessionId)
                ->update([
                    'user_id' => $userId,
                    'last_activity' => now()->timestamp,
                ]);

            Log::channel('security')->info('Sessão vinculada durante cadastro', [
                'session_id' => $sessionId,
                'user_id' => $userId,
                'user_email' => $email,
            ]);
        } catch (\Throwable $e) {
            Log::channel('security')->warning('Falha ao vincular sessão no cadastro', [
                'session_id' => $sessionId,
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function encerrarOutrasSessoes(int $userId, string $currentSessionId): void
    {
        try {
            DB::table('sessions')
                ->where('user_id', $userId)
                ->where('id', '!=', $currentSessionId)
                ->delete();

            Log::channel('security')->info('Sessões antigas removidas após cadastro', [
                'user_id' => $userId,
                'session_id' => $currentSessionId,
            ]);
        } catch (\Throwable $e) {
            Log::channel('security')->warning('Falha ao limpar sessões antigas após cadastro', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
