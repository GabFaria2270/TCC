<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UsuarioRequest;
use App\Services\Auth\RegistrationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    protected $registrationService;

    public function __construct(RegistrationService $registrationService)
    {
        $this->registrationService = $registrationService;
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
     */
    public function register(UsuarioRequest $request): RedirectResponse
    {
        try {
            // LOG DA TENTATIVA
            $this->logRegistrationAttempt($request);

            // PROCESSA CADASTRO VIA SERVICE
            $result = $this->registrationService->create($request->validated(), $request);

            if ($result['success']) {
                // REGENERA SESSÃO
                $request->session()->regenerate();
                
                // LOG DE SUCESSO
                $this->logRegistrationSuccess($result['user'], $request);
                
                return redirect()->route('home')
                    ->with('success', 'Cadastro realizado com sucesso! Bem-vindo(a), ' . $result['user']->NOME . '!');
            }

            // CADASTRO FALHOU
            return back()
                ->withErrors($result['errors'])
                ->withInput($request->except('SENHA_HASH', 'SENHA_HASH_confirmation'));

        } catch (ValidationException $e) {
            // ERRO DE VALIDAÇÃO
            $this->logValidationError($e, $request);
            
            return back()
                ->withErrors($e->errors())
                ->withInput($request->except('SENHA_HASH', 'SENHA_HASH_confirmation'));

        } catch (\Exception $e) {
            // ERRO INTERNO
            $this->logSystemError($e, $request);
            
            return back()
                ->with('error', 'Erro interno do sistema. Tente novamente.')
                ->withInput($request->except('SENHA_HASH', 'SENHA_HASH_confirmation'));
        }
    }

    /**
     * Logs de auditoria para cadastro
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
            'user_id' => $user->ID,
            'email' => $user->EMAIL,
            'nome' => $user->NOME,
            'perfil' => $user->PERFIL,
            'ip' => $request->ip(),
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
            'trace' => $e->getTraceAsString(),
            'timestamp' => now(),
        ]);
    }
}
