<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produto extends Model
{
    use HasFactory;

    protected $table = 'produto';

    protected $fillable = [
        'nome',
        'preco',
        'quantidade_estoque',
        'categoria_id',
        'comercio_id',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'quantidade_estoque' => 'integer',
        'categoria_id' => 'integer',
        'comercio_id' => 'integer',
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function comercio()
    {
        return $this->belongsTo(Comercio::class, 'comercio_id');
    }

    public function estoque()
    {
        return $this->hasOne(Estoque::class, 'produto_id');
    }

    public function scopeByComercio($query, int $comercioId)
    {
        return $query->where('comercio_id', $comercioId);
    }

    public function scopeOrderByNome($query)
    {
        return $query->orderBy('nome');
    }
}
