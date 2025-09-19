<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UsuarioRequest;
use App\Services\Auth\RegistrationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse; // ✅ ADICIONAR
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * CONTROLADOR DE CADASTRO - COM TOKEN CACHE
 */
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
                $tokenData = $result['token_data'] ?? null; // ✅ PEGA TOKEN

                // ✅ ORDEM CORRIGIDA
                
                // PASSO 1: Regenera sessão
                $request->session()->regenerate();
                $request->session()->save();

                // PASSO 2: Vincula sessão ao usuário
                $this->vincularSessaoAoUsuario($request, $usuario);
                
                // LOG DE SUCESSO
                $this->logRegistrationSuccess($usuario, $request);

                // ✅ RESPOSTA AJAX COM TOKEN (se for AJAX)
                if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                    $response = [
                        'success' => true,
                        'message' => 'Cadastro realizado com sucesso! Bem-vindo(a), ' . $usuario->NOME . '!',
                        'user' => [
                            'id' => $usuario->id,
                            'nome' => $usuario->NOME,
                            'email' => $usuario->EMAIL,
                            'perfil' => $usuario->PERFIL,
                        ]
                    ];
                    
                    // Adiciona token se disponível
                    if ($tokenData) {
                        $response['auth'] = $tokenData;
                    }
                    
                    return response()->json($response);
                }

                // ✅ RESPOSTA WEB NORMAL COM TOKEN NA SESSÃO (gerenciamento)
                $redirect = redirect()->intended(route('gerenciamento'))
                    ->with('success', 'Cadastro realizado com sucesso! Bem-vindo(a), ' . $usuario->NOME . '!');

                if ($tokenData) {
                    $redirect->with('auth_token', $tokenData);
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
     * ✅ MÉTODO PARA VINCULAR SESSÃO AO USUÁRIO (MESMO DO LOGIN)
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
                Log::channel('security')->info('✅ Sessão vinculada com sucesso no CADASTRO', [
                    'session_id' => $sessionId,
                    'user_id' => $userId,
                    'user_email' => $usuario->EMAIL,
                    'affected_rows' => $affected,
                ]);
            } else {
                Log::channel('security')->error('❌ Falha na vinculação no CADASTRO', [
                    'session_id' => $sessionId,
                    'user_id' => $userId,
                    'affected_rows' => $affected,
                ]);
            }

        } catch (\Exception $e) {
            Log::channel('security')->error('Erro ao vincular sessão no CADASTRO', [
                'error' => $e->getMessage(),
                'user_id' => $usuario->id ?? 'N/A',
                'session_id' => $request->session()->getId() ?? 'N/A',
            ]);
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
}


