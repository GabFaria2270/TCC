<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;

/**
 * MODEL USUARIO - CORRIGIDO PARA SESSIONS
 */
class Usuario extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'usuario';
    protected $primaryKey = 'id'; // ✅ CORRIGIDO: usa 'id' das migrations
    public $timestamps = true; // ✅ ATIVADO: migrations têm timestamps

    protected $fillable = ['NOME', 'EMAIL', 'SENHA_HASH', 'PERFIL'];
    protected $hidden = ['SENHA_HASH', 'remember_token'];

    /**
     * ✅ CONFIGURAÇÃO CORRIGIDA PARA SESSÕES
     */
    public function getAuthPassword()
    {
        return $this->SENHA_HASH;
    }

    public function getAuthIdentifierName()
    {
        return 'EMAIL'; // Campo para login
    }

    public function getAuthIdentifier()
    {
        return $this->id; // ✅ CORRIGIDO: RETORNA ID NUMÉRICO
    }

    /**
     * CAST AUTOMÁTICO
     */
    protected $casts = [
        'EMAIL' => 'string',
        'PERFIL' => 'string',
    ];

    /**
     * MUTATOR AUTOMÁTICO
     */
    public function setSenhaHashAttribute($value)
    {
        $this->attributes['SENHA_HASH'] = Hash::make($value);
    }

    /**
     * SCOPES
     */
    public function scopeByEmail($query, $email)
    {
        return $query->where('EMAIL', strtolower($email));
    }

    public function scopeByPerfil($query, $perfil)
    {
        return $query->where('PERFIL', strtolower($perfil));
    }

    /**
     * RELACIONAMENTOS
     */
    public function comercio()
    {
        return $this->hasOne(Comercio::class, 'usuario_id');
    }

    public function scopeWithComercio($query)
    {
        return $query->with('comercio');
    }
}