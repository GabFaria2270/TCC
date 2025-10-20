<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Modelo Produto
 *
 * Propriedades expostas via atributos do Eloquent (acessadas magicamente),
 * declaradas aqui para ajudar o analisador estático (Intelephense/PHP LS)
 * e evitar avisos de propriedades indefinidas em outros arquivos.
 *
 * @property int $id
 * @property string $nome
 * @property float|string $preco
 * @property int|null $estoque_minimo
 * @property int $categoria_id
 * @property int $comercio_id
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\Categoria|null $categoria
 * @property-read \App\Models\Estoque|null $estoque
 * @mixin \Eloquent
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
        // Evita acessar atributo mágico diretamente (melhor para analisadores estáticos)
        return !$this->trashed();
    }
}
