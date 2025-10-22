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
// use Illuminate\Support\Facades\DB; // não usado após remover vinculação de sessão
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

                // Autentica usuário e garante sessão
                // Não habilitar "remember" automaticamente no cadastro.
                // O token remember deve ser criado apenas quando o usuário marcar o checkbox no login.
                Auth::login($usuario);
                if ($request->hasSession()) {
                    if (!$request->session()->isStarted()) {
                        $request->session()->start();
                    }
                    $request->session()->regenerate();
                }

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

    // Removida vinculação de sessão no cadastro: login é feito apenas na tela de login

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
}
