<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
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