<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;

    protected $table = 'categoria';
    protected $fillable = [
        'nome',
    ];

    public function produtos()
    {
        return $this->hasMany(Produto::class, 'categoria_id');
    }

    public function scopeOrderByNome($query)
    {
        return $query->orderBy('nome');
    }
}
