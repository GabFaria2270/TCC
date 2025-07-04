<?php

namespace App\Services\Auth;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class LoginService
{
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

        // LOGIN BEM-SUCEDIDO
        Auth::login($usuario, $remember);

        return [
            'success' => true,
            'user' => $usuario,
            'reason' => 'success'
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
            'usuario_id' => $usuario->ID ?? 'N/A',
        ]);
    }
}