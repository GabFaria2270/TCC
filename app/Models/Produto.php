<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Model Produto
 *
 * @property int $id
 * @property string $nome
 * @property float $preco
 * @property string|null $foto_path
 * @property int|null $estoque_minimo
 * @property int $categoria_id
 * @property int $comercio_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\Categoria $categoria
 * @property-read \App\Models\Comercio $comercio
 * @property-read \App\Models\Estoque|null $estoque
 * @property-read bool $ativo
 */
class Produto extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'produto';

    protected $fillable = [
        'nome',
        'preco',
        'foto_path',
        'estoque_minimo',
        'categoria_id',
        'comercio_id',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'foto_path' => 'string',
        'estoque_minimo' => 'integer',
        'categoria_id' => 'integer',
        'comercio_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Relacionamento: Produto pertence a uma categoria.
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    /**
     * Relacionamento: Produto pertence a um comércio.
     */
    public function comercio(): BelongsTo
    {
        return $this->belongsTo(Comercio::class, 'comercio_id');
    }

    /**
     * Relacionamento: Produto possui um registro de estoque.
     */
    public function estoque(): HasOne
    {
        return $this->hasOne(Estoque::class, 'produto_id');
    }

    /**
     * Scope: Filtra produtos por comércio.
     */
    public function scopeByComercio(Builder $query, int $comercioId): Builder
    {
        return $query->where('comercio_id', $comercioId);
    }

    /**
     * Scope: Ordena produtos por nome.
     */
    public function scopeOrderByNome(Builder $query): Builder
    {
        return $query->orderBy('nome');
    }

    /**
     * Accessor: Verifica se o produto está ativo (não deletado).
     */
    public function getAtivoAttribute(): bool
    {
        return !$this->trashed();
    }
}
