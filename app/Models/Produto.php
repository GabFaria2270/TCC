<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Produto extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'produto';

    protected $fillable = [
        'nome',
        'preco',
        'foto_path',
        'quantidade_estoque',
        'estoque_minimo',
        'categoria_id',
        'comercio_id',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'foto_path' => 'string',
        'quantidade_estoque' => 'integer',
        'estoque_minimo' => 'integer',
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

    /**
     * Accessor para determinar se o produto está ativo
     * Um produto está ativo se não foi excluído logicamente
     */
    public function getAtivoAttribute(): bool
    {
        return is_null($this->deleted_at);
    }
}
