<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\CacheTokenService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class NewPasswordController extends Controller
{
    /**
     * Show the password reset page.
     */
    public function create(Request $request): View
    {
        $email = $this->resolveEmailFromCode($request->query('code'))
            ?? $request->query('email');

        return view('auth.reset-password', [
            'email' => $email,
            'token' => $request->route('token'),
        ]);
    }

    /**
     * Handle an incoming new password request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Here we will attempt to reset the user's password. If it is successful we
        // will update the password on an actual user model and persist it to the
        // database. Otherwise we will parse the error and return the response.
        $credentials = $request->only('email', 'password', 'password_confirmation', 'token');
        $credentials['EMAIL'] = strtolower((string) $credentials['email']);

        $tokenService = app(CacheTokenService::class);

        $status = Password::reset(
            $credentials,
            function ($user) use ($request, $tokenService) {
                $user->forceFill([
                    'SENHA_HASH' => $request->password,
                ])->save();

                // Revoga todos os tokens persistidos/cookies para evitar sessões antigas.
                $tokenService->revokeAllTokensForUser($user->id);

                event(new PasswordReset($user));
            }
        );

        // If the password was successfully reset, we will redirect the user back to
        // the application's home authenticated view. If there is an error we can
        // redirect them back to where they came from with their error message.
        if ($status === Password::PASSWORD_RESET) {
            $this->purgeResetToken($request->email);

            return to_route('login')->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    private function purgeResetToken(string $email): void
    {
        $table = config('auth.passwords.users.table', 'password_reset_tokens');

        DB::table($table)
            ->where('email', strtolower($email))
            ->delete();
    }

    private function resolveEmailFromCode(?string $code): ?string
    {
        if (empty($code)) {
            return null;
        }

        try {
            $decoded = base64_decode($code, true);
            if ($decoded === false) {
                return null;
            }

            return Crypt::decryptString($decoded);
        } catch (\Throwable $e) {
            return null;
        }
    }
}
