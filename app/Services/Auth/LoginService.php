<?php

namespace App\Services\Auth;

use App\Models\Usuario;
use App\Services\Auth\CacheTokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class LoginService
{
    protected CacheTokenService $tokenService;

    public function __construct(CacheTokenService $tokenService)
    {
        $this->tokenService = $tokenService;
    }

    /**
     * Tenta fazer login
     */
    public function attempt(array $credentials, Request $request): array
    {
        $email = $credentials['EMAIL'];
        $password = $credentials['SENHA_HASH'];
        $remember = $credentials['remember'] ?? false;

        // BUSCA USUÁRIO
        $usuario = Usuario::byEmail($email)->first();

        // LOG DE DEBUG
        $this->logAttemptDebug($email, $usuario);

        // VERIFICA SE USUÁRIO EXISTE
        if (!$usuario) {
            return [
                'success' => false,
                'errors' => ['EMAIL' => 'E-mail não cadastrado.'],
                'reason' => 'user_not_found'
            ];
        }

        // VERIFICA SENHA
        if (!Hash::check($password, $usuario->SENHA_HASH)) {
            return [
                'success' => false,
                'errors' => ['SENHA_HASH' => 'Senha incorreta.'],
                'reason' => 'invalid_password'
            ];
        }

        // Gera token de sessão para API/gerenciamento
        // Se "remember" for verdadeiro, gerar um token com TTL estendido e reusar para o cookie remember_token
        if ($remember) {
            // 30 dias = 43200 minutos
            // Persiste também no DB para permitir autenticação automática por cookie
            $rememberToken = $this->tokenService->generateToken($usuario, 43200, true);
            // Reutiliza o mesmo token como auth_token retornado
            $tokenData = [
                'token' => $rememberToken,
                'type' => 'Bearer',
                'expires_in' => 43200 * 60,
                'expires_at' => now()->addMinutes(43200)->toDateTimeString(),
                'user' => [
                    'id' => $usuario->id,
                    'nome' => $usuario->NOME,
                    'email' => $usuario->EMAIL,
                    'perfil' => $usuario->PERFIL,
                ]
            ];
            $secure = (bool) config('session.secure', false);
            $sameSiteCfg = config('session.same_site');
            $defaultSameSite = 'lax';
            $sameSite = $sameSiteCfg ? strtolower($sameSiteCfg) : $defaultSameSite;
            $path = config('session.path', '/');
            cookie()->queue(cookie('remember_token', $rememberToken, 43200, $path, config('session.domain'), $secure, true, false, $sameSite)); // 30 dias
        } else {
            $tokenData = $this->tokenService->getTokenData($usuario);
        }

        return [
            'success' => true,
            'user' => $usuario,
            'reason' => 'success',
            'token_data' => $tokenData
        ];
    }

    /**
     * Log de debug
     */
    private function logAttemptDebug(string $email, $usuario): void
    {
        Log::channel('security')->info('DEBUG Login Service', [
            'email_enviado' => $email,
            'usuario_encontrado' => $usuario ? 'SIM' : 'NÃO',
            'usuario_id' => $usuario->id ?? 'N/A',
        ]);
    }
}