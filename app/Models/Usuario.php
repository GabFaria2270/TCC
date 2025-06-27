<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\SoftDeletes; // Para exclusão segura

class Usuario extends Authenticatable
{
    use HasFactory, Notifiable; // REMOVIDO SoftDeletes temporariamente

    protected $table = 'usuario'; // Nome da tabela no banco
    protected $primaryKey = 'ID'; // Nome da chave primária
    public $timestamps = false; // DESABILITADO até verificar se a tabela tem created_at/updated_at

    // PROTEÇÃO CONTRA MASS ASSIGNMENT
    protected $fillable = [
        'NOME',
        'EMAIL', 
        'SENHA_HASH',
        'PERFIL',
    ];

    // CAMPOS SENSÍVEIS QUE NUNCA DEVEM APARECER EM JSON
    protected $hidden = [
        'SENHA_HASH',
        'remember_token',
        // 'deleted_at', // Removido pois não usamos SoftDeletes agora
    ];

    // CONVERSÕES AUTOMÁTICAS (simplificado)
    protected $casts = [
        // 'created_at' => 'datetime', // Removido pois timestamps = false
        // 'updated_at' => 'datetime', // Removido pois timestamps = false
        // 'deleted_at' => 'datetime', // Removido pois não usamos SoftDeletes
        // 'email_verified_at' => 'datetime', // Removido se não existe na tabela
    ];

    // MÉTODOS DE AUTENTICAÇÃO SEGUROS (CAMPOS PERSONALIZADOS)
    public function getAuthPassword()
    {
        return $this->SENHA_HASH; // Campo personalizado
    }

    public function getAuthIdentifierName()
    {
        return 'EMAIL'; // Campo personalizado
    }

    public function getAuthIdentifier()
    {
        return $this->EMAIL; // Campo personalizado
    }

    // MAPEAR CAMPOS PADRÃO PARA CAMPOS PERSONALIZADOS
    public function getEmailAttribute()
    {
        return $this->EMAIL; // Para compatibilidade
    }

    public function getPasswordAttribute()
    {
        return $this->SENHA_HASH; // Para compatibilidade
    }

    // SETTER PARA HASH AUTOMÁTICO DA SENHA
    public function setSenhaHashAttribute($value)
    {
        $this->attributes['SENHA_HASH'] = Hash::make($value);
    }

    // SCOPES PARA CONSULTAS SEGURAS
    public function scopeByEmail($query, $email)
    {
        return $query->where('EMAIL', strtolower($email));
    }

    public function scopeByPerfil($query, $perfil)
    {
        return $query->where('PERFIL', strtolower($perfil));
    }
}