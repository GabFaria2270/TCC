<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\Usuario;
use App\Services\Auth\CacheTokenService;
use App\Services\Auth\SessionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SocialLoginController extends Controller
{
    public function __construct(
        private readonly SessionService $sessionService,
        private readonly CacheTokenService $tokenService
    ) {
    }

    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Throwable $exception) {
            Log::channel('security')->warning('Falha ao completar login com Google', [
                'error' => $exception->getMessage(),
            ]);

            return redirect()->route('login')->with('error', 'Não foi possível validar sua conta Google. Tente novamente.');
        }

        $email = strtolower($googleUser->getEmail() ?? '');
        $emailVerified = (bool) (($googleUser->user['verified_email'] ?? false) || ($googleUser->user['email_verified'] ?? false));

        if (!$email || !$emailVerified) {
            return redirect()->route('login')->with('error', 'Precisamos de um e-mail Google verificado para continuar.');
        }

        $usuario = Usuario::byEmail($email)->first();
        if (!$usuario) {
            return redirect()->route('login')->with('error', 'Não encontramos uma conta com este e-mail. Cadastre-se primeiro.');
        }

        DB::transaction(function () use ($usuario, $googleUser) {
            SocialAccount::updateOrCreate(
                [
                    'provider' => 'google',
                    'provider_user_id' => $googleUser->getId(),
                ],
                [
                    'user_id' => $usuario->id,
                    'provider_email' => strtolower($googleUser->getEmail()),
                    'avatar_url' => $googleUser->getAvatar(),
                    'encrypted_refresh_token' => $googleUser->refreshToken ? encrypt($googleUser->refreshToken) : null,
                    'metadata' => [
                        'name' => $googleUser->getName(),
                        'nickname' => $googleUser->getNickname(),
                    ],
                    'last_login_at' => now(),
                ]
            );
        });

        if (!$this->sessionService->linkSessionToUser($usuario, $request)) {
            Log::channel('security')->warning('Falha ao vincular sessão após login Google', [
                'user_id' => $usuario->id,
                'email' => $usuario->EMAIL,
            ]);
        }

        $this->sessionService->enforceSingleSession($usuario, $request);
        Auth::setUser($usuario);
        $request->session()->regenerateToken();

        $tokenData = $this->tokenService->getTokenData($usuario);
        $secure = (bool) config('session.secure', false);
        $sameSiteCfg = config('session.same_site');
        $sameSite = $sameSiteCfg ? strtolower($sameSiteCfg) : 'lax';
        $path = config('session.path', '/');

        cookie()->queue(cookie('auth_token', $tokenData['token'], 1440, $path, config('session.domain'), $secure, true, false, $sameSite));

        Log::channel('security')->info('Login realizado via Google', [
            'user_id' => $usuario->id,
            'email' => $usuario->EMAIL,
        ]);

        return redirect()->intended(route('gerenciamento'))->with('success', 'Login realizado com Google com sucesso!');
    }
}
