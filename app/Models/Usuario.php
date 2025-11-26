<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Log;
use App\Notifications\ResetPasswordNotification;

/**
 * Model Usuario
 * 
 * Representa um usuário do sistema com autenticação.
 * 
 * @property int $id
 * @property string $NOME
 * @property string $EMAIL
 * @property string $SENHA_HASH
 * @property string $PERFIL
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Comercio|null $comercio
 */
class Usuario extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'usuario';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = ['NOME', 'EMAIL', 'SENHA_HASH', 'PERFIL'];
    protected $hidden = ['SENHA_HASH'];

    /**
     * Guarda o último token atribuído pela infraestrutura do Laravel.
     */
    protected ?string $rememberTokenValue = null;

    /**
     * Retorna a senha do usuário para autenticação.
     */
    public function getAuthPassword(): string
    {
        return $this->SENHA_HASH;
    }

    /**
     * Retorna o nome do campo usado como identificador de autenticação.
     */
    public function getAuthIdentifierName(): string
    {
        return 'EMAIL';
    }

    /**
     * Retorna o identificador único do usuário.
     */
    public function getAuthIdentifier(): int
    {
        return $this->id;
    }

    /**
     * Casts de atributos.
     */
    protected $casts = [
        'EMAIL' => 'string',
        'PERFIL' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Mutator: Hash automático de senha ao atribuir.
     */
    public function setSenhaHashAttribute(string $value): void
    {
        $this->attributes['SENHA_HASH'] = Hash::make($value);
    }

    /**
     * Scope: Filtra por email (case-insensitive).
     */
    public function scopeByEmail(Builder $query, string $email): Builder
    {
        return $query->where('EMAIL', strtolower($email));
    }

    /**
     * Scope: Filtra por perfil (case-insensitive).
     */
    public function scopeByPerfil(Builder $query, string $perfil): Builder
    {
        return $query->where('PERFIL', strtolower($perfil));
    }

    /**
     * Relacionamento: Um usuário possui um comércio.
     */
    public function comercio(): HasOne
    {
        return $this->hasOne(Comercio::class, 'usuario_id');
    }

    /**
     * Scope: Carrega relacionamento de comércio.
     */
    public function scopeWithComercio(Builder $query): Builder
    {
        return $query->with('comercio');
    }

    /**
     * Garante que as notificações por email usem o campo correto.
     */
    public function routeNotificationForMail(): string
    {
        return (string) $this->EMAIL;
    }

    /**
     * Informa ao broker qual email usar durante o reset de senha.
     */
    public function getEmailForPasswordReset(): string
    {
        return (string) $this->EMAIL;
    }

    /**
     * Dispara email customizado de reset.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * Recupera o token "remember me" registrado mais recentemente.
     */
    public function getRememberToken(): ?string
    {
        return $this->rememberTokenValue;
    }

    /**
     * Persiste ou revoga tokens na tabela dedicada sem exigir coluna no usuário.
     */
    public function setRememberToken($value): void
    {
        $this->rememberTokenValue = $value ? (string) $value : null;

        if (!$this->getKey()) {
            return;
        }

        try {
            RememberToken::where('user_id', $this->getKey())->delete();

            if (empty($value)) {
                return;
            }

            $request = null;
            try {
                $request = request();
            } catch (\Throwable $e) {
                // Sem request disponível (ex.: CLI/artisan).
            }

            $ip = $request?->ip();
            $userAgent = $request ? substr((string) $request->userAgent(), 0, 512) : null;
            $ttlMinutes = (int) config('auth.remember_token_ttl', 43200);

            RememberToken::create([
                'user_id' => $this->getKey(),
                'token_hash' => hash_hmac('sha256', (string) $value, config('app.key')),
                'ip_address' => $ip,
                'user_agent' => $userAgent,
                'expires_at' => now()->addMinutes($ttlMinutes),
                'last_used_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::channel('security')->warning('Falha ao sincronizar remember token customizado', [
                'user_id' => $this->getKey(),
                'error' => $e->getMessage(),
            ]);
        }
    }
}