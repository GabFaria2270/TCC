<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log; // ADICIONA IMPORT LOG
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'EMAIL' => [
                'required',
                'email:rfc,dns',
                'max:150',
            ],
            'SENHA_HASH' => [
                'required',
                'string',
                'min:6',
            ],
            'remember' => [
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'EMAIL.required' => 'O e-mail é obrigatório.',
            'EMAIL.email' => 'Digite um e-mail válido.',
            'SENHA_HASH.required' => 'A senha é obrigatória.',
            'SENHA_HASH.min' => 'A senha deve ter pelo menos 6 caracteres.',
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'EMAIL' => strtolower(trim($this->EMAIL ?? '')),
        ]);
    }

    /**
     * Attempt to authenticate the request's credentials.
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // BUSCAR USUÁRIO PELO EMAIL
        $usuario = \App\Models\Usuario::where('EMAIL', $this->EMAIL)->first();
        
        // DEBUG: LOG PARA VERIFICAR O QUE ESTÁ ACONTECENDO
        Log::channel('security')->info('DEBUG Login - Dados recebidos', [
            'email_enviado' => $this->EMAIL,
            'senha_enviada_length' => strlen($this->SENHA_HASH),
            'usuario_encontrado' => $usuario ? 'SIM' : 'NÃO',
            'usuario_id' => $usuario->ID ?? 'N/A',
            'hash_no_banco' => $usuario ? substr($usuario->SENHA_HASH, 0, 20) . '...' : 'N/A',
        ]);

        // VERIFICAR SE USUÁRIO EXISTE
        if (!$usuario) {
            RateLimiter::hit($this->throttleKey());
            
            Log::channel('security')->warning('Login falhou - Usuário não encontrado', [
                'email' => $this->EMAIL,
            ]);

            throw ValidationException::withMessages([
                'EMAIL' => 'E-mail não cadastrado.',
            ]);
        }

        // VERIFICAR SENHA
        $senhaCorreta = \Illuminate\Support\Facades\Hash::check($this->SENHA_HASH, $usuario->SENHA_HASH);
        
        Log::channel('security')->info('DEBUG Login - Verificação de senha', [
            'senha_correta' => $senhaCorreta ? 'SIM' : 'NÃO',
            'hash_check_result' => $senhaCorreta,
        ]);

        if (!$senhaCorreta) {
            RateLimiter::hit($this->throttleKey());
            
            Log::channel('security')->warning('Login falhou - Senha incorreta', [
                'email' => $this->EMAIL,
                'usuario_id' => $usuario->ID,
            ]);

            throw ValidationException::withMessages([
                'SENHA_HASH' => 'Senha incorreta.',
            ]);
        }

        // LOGIN COM OPÇÃO LEMBRAR-ME
        Auth::login($usuario, $this->boolean('remember'));
        RateLimiter::clear($this->throttleKey());
        
        Log::channel('security')->info('DEBUG Login - Sucesso', [
            'usuario_logado_id' => Auth::id(),
            'usuario_logado_email' => Auth::user()->EMAIL ?? 'N/A',
        ]);
    }

    /**
     * Ensure the login request is not rate limited.
     */
    public function ensureIsNotRateLimited(): void
    {
        if (!RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        // LOG DE BLOQUEIO
        Log::channel('security')->warning('IP bloqueado por excesso de tentativas', [
            'ip' => $this->ip(),
            'email' => $this->EMAIL ?? 'N/A',
            'blocked_for_seconds' => $seconds,
            'timestamp' => now(),
        ]);

        throw ValidationException::withMessages([
            'EMAIL' => "Muitas tentativas de login. Tente novamente em {$seconds} segundos.",
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('EMAIL')).'|'.$this->ip());
    }
}
