<?php

namespace App\Http\Controllers\Auth;

use App\Exceptions\SocialLoginException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SocialLoginCallbackRequest;
use App\Services\Auth\SocialLoginService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SocialLoginController extends Controller
{
    public function __construct(
        private readonly SocialLoginService $socialLoginService
    ) {
    }

    public function redirectToGoogle(Request $request): RedirectResponse
    {
        if ($request->hasSession()) {
            $request->session()->put('social_login_remember', $request->boolean('remember'));
        }

        return $this->socialLoginService->getGoogleRedirect();
    }

    public function handleGoogleCallback(SocialLoginCallbackRequest $request): RedirectResponse
    {
        try {
            $result = $this->socialLoginService->authenticateViaGoogle($request);
        } catch (SocialLoginException $exception) {
            return redirect()->route('login')->with('error', $exception->getMessage());
        }

        $this->queueAuthTokenCookie($result['token_data']['token']);

        if (!empty($result['remember_token'])) {
            $this->queueRememberTokenCookie($result['remember_token']);
        }

        return redirect()
            ->intended(route('gerenciamento'))
            ->with('success', 'Login realizado com Google com sucesso!');
    }

    private function queueAuthTokenCookie(string $token): void
    {
        $secure = (bool) config('session.secure', false);
        $sameSiteCfg = config('session.same_site');
        $sameSite = $sameSiteCfg ? strtolower($sameSiteCfg) : 'lax';
        $path = config('session.path', '/');

        cookie()->queue(
            cookie(
                'auth_token',
                $token,
                1440,
                $path,
                config('session.domain'),
                $secure,
                true,
                false,
                $sameSite
            )
        );
    }

    private function queueRememberTokenCookie(string $token): void
    {
        $minutes = 43200; // 30 dias para remember-me
        $secure = (bool) config('session.secure', false);
        $sameSiteCfg = config('session.same_site');
        $sameSite = $sameSiteCfg ? strtolower($sameSiteCfg) : 'lax';
        $path = config('session.path', '/');

        cookie()->queue(
            cookie(
                'remember_token',
                $token,
                $minutes,
                $path,
                config('session.domain'),
                $secure,
                true,
                false,
                $sameSite
            )
        );
    }
}
