<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Usuario extends Authenticatable
{
    protected $table = 'usuario'; // Nome da tabela no banco
    protected $primaryKey = 'ID'; // Nome da chave primária
    public $timestamps = false; // Se não tiver created_at/updated_at

    protected $fillable = [
        'NOME',
        'EMAIL',
        'SENHA_HASH',
        'PERFIL',
        'DATA_CRIACAO'
    ];


}