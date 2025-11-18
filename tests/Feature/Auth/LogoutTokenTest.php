<?php

use App\Models\RememberToken;
use App\Models\Usuario;
use App\Services\Auth\CacheTokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

it('revoga tokens de autenticação e remember no logout', function () {
    $usuario = Usuario::create([
        'NOME' => 'Usuário Teste',
        'EMAIL' => 'logout@example.com',
        'SENHA_HASH' => Hash::make('senha-segura'),
        'PERFIL' => 'admin',
    ]);

    $fakeRequest = Request::create('/', 'GET');
    app()->instance('request', $fakeRequest);

    /** @var CacheTokenService $tokenService */
    $tokenService = app(CacheTokenService::class);
    $token = $tokenService->generateToken($usuario, 43200, true);

    $response = $this
        ->actingAs($usuario)
        ->withCookie('auth_token', $token)
        ->withCookie('remember_token', $token)
        ->post(route('logout'));

    $response->assertRedirect(route('login'));
    $response->assertCookieExpired('auth_token');
    $response->assertCookieExpired('remember_token');

    expect(Cache::get("auth_token:{$token}"))->toBeNull();

    $tokenHash = hash_hmac('sha256', $token, config('app.key'));
    expect(RememberToken::where('token_hash', $tokenHash)->exists())->toBeFalse();
});
