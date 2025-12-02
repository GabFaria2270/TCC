<?php

namespace App\Services\Auth;

use App\Exceptions\SocialLoginException;
use App\Http\Requests\Auth\SocialLoginCallbackRequest;
use App\Models\SocialAccount;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SocialLoginService
{
    public function __construct(
        private readonly SessionService $sessionService,
        private readonly CacheTokenService $tokenService
    ) {
    }

    public function getGoogleRedirect(): RedirectResponse
    {
        /** @var \Laravel\Socialite\Two\GoogleProvider $googleDriver */
        $googleDriver = Socialite::driver('google');

        return $googleDriver
            ->scopes(['openid', 'profile', 'email'])
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    /**
     * @return array{user: Usuario, token_data: array}
     */
    public function authenticateViaGoogle(SocialLoginCallbackRequest $request): array
    {
        $googleUser = $this->fetchGoogleUser();
        $rememberPreference = $request->session()->pull('social_login_remember', false) || $request->boolean('remember');

        $email = strtolower($googleUser->getEmail() ?? '');
        $emailVerified = (bool) (($googleUser->user['verified_email'] ?? false) || ($googleUser->user['email_verified'] ?? false));

        if (!$email || !$emailVerified) {
            throw new SocialLoginException('Precisamos confirmar um e-mail Google verificado antes de continuar.');
        }

        $usuario = Usuario::byEmail($email)->first();
        if (!$usuario) {
            throw new SocialLoginException('Não encontramos uma conta para este e-mail. Cadastre-se primeiro.');
        }

        $cacheSnapshot = $this->snapshotCacheTokenForUser($usuario->id);

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
            throw new SocialLoginException('Não conseguimos iniciar sua sessão. Atualize a página e tente novamente.');
        }

        if ($cacheSnapshot) {
            $this->syncSessionWithCacheSnapshot($usuario, $request, $cacheSnapshot);
        }

        $guardName = config('auth.defaults.guard', 'web');
        Auth::guard($guardName)->login($usuario, false);

        $this->sessionService->enforceSingleSession($usuario, $request);
        $request->session()->regenerateToken();

        $tokenData = null;
        $rememberToken = null;

        if ($rememberPreference) {
            [$tokenData, $rememberToken] = $this->issueRememberToken($usuario, $cacheSnapshot);
        } else {
            $tokenData = $cacheSnapshot ? $this->buildTokenResponseFromSnapshot($cacheSnapshot, $usuario) : null;
            if (!$tokenData) {
                $tokenData = $this->tokenService->getTokenData($usuario);
            }
        }

        if (empty($tokenData['token'])) {
            throw new SocialLoginException('Não conseguimos gerar o token de acesso. Tente novamente.');
        }

        return [
            'user' => $usuario,
            'token_data' => $tokenData,
            'remember_token' => $rememberToken,
        ];
    }

    private function fetchGoogleUser()
    {
        try {
            /** @var \Laravel\Socialite\Two\GoogleProvider $googleDriver */
            $googleDriver = Socialite::driver('google');

            return $googleDriver->stateless()->user();
        } catch (\Throwable $exception) {
            Log::warning('Falha ao completar login com Google', [
                'error' => $exception->getMessage(),
            ]);

            throw new SocialLoginException('Não foi possível validar sua conta Google. Tente novamente.');
        }
    }

    private function snapshotCacheTokenForUser(int $userId): ?array
    {
        try {
            $tokenId = $this->tokenService->findExistingTokenIdForUser($userId);
            if (!$tokenId) {
                return null;
            }

            $cacheKey = "auth_token:{$tokenId}";
            $payload = Cache::get($cacheKey);

            if (!is_array($payload)) {
                return null;
            }

            return [
                'token' => $tokenId,
                'cache_key' => $cacheKey,
                'payload' => $payload,
            ];
        } catch (\Throwable $e) {
            Log::warning('Erro ao buscar snapshot de cache para usuário', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function syncSessionWithCacheSnapshot(Usuario $usuario, Request $request, array $snapshot): void
    {
        try {
            if (!$request->hasSession()) {
                return;
            }

            if (method_exists($request->session(), 'isStarted') && !$request->session()->isStarted()) {
                $request->session()->start();
            }

            $request->session()->put('auth_cache_token', $snapshot['token']);
            $request->session()->put('auth_cache_expires_at', $snapshot['payload']['expires_at'] ?? null);
            $request->session()->save();
        } catch (\Throwable $e) {
            Log::warning('Falha ao sincronizar sessão com snapshot do cache', [
                'user_id' => $usuario->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function buildTokenResponseFromSnapshot(array $snapshot, Usuario $usuario): ?array
    {
        try {
            $expiresAt = $snapshot['payload']['expires_at'] ?? null;
            if (!$expiresAt) {
                return null;
            }

            $expiration = Carbon::parse($expiresAt);
            if ($expiration->isPast()) {
                return null;
            }

            return [
                'token' => $snapshot['token'],
                'type' => 'Bearer',
                'expires_in' => now()->diffInSeconds($expiration, false),
                'expires_at' => $expiration->toDateTimeString(),
                'user' => [
                    'id' => $usuario->id,
                    'nome' => $usuario->NOME,
                    'email' => $usuario->EMAIL,
                    'perfil' => $usuario->PERFIL,
                ],
            ];
        } catch (\Throwable $e) {
            Log::warning('Falha ao montar resposta do token a partir do cache', [
                'user_id' => $usuario->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function issueRememberToken(Usuario $usuario, ?array $cacheSnapshot): array
    {
        $rememberMinutes = 43200; // 30 dias

        if ($cacheSnapshot && !empty($cacheSnapshot['payload']['persisted'])) {
            $tokenData = $this->buildTokenResponseFromSnapshot($cacheSnapshot, $usuario);
            if ($tokenData) {
                return [$tokenData, $tokenData['token']];
            }
        }

        $token = $this->tokenService->generateToken($usuario, $rememberMinutes, true);
        $expiresAt = now()->addMinutes($rememberMinutes);

        $tokenData = [
            'token' => $token,
            'type' => 'Bearer',
            'expires_in' => $rememberMinutes * 60,
            'expires_at' => $expiresAt->toDateTimeString(),
            'user' => [
                'id' => $usuario->id,
                'nome' => $usuario->NOME,
                'email' => $usuario->EMAIL,
                'perfil' => $usuario->PERFIL,
            ],
        ];

        return [$tokenData, $token];
    }
}
