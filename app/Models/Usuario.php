<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasOne;
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
}