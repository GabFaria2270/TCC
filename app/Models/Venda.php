<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

/**
 * Model Venda
 * 
 * @property int $id
 * @property int $comercio_id
 * @property int $usuario_id
 * @property int|null $cliente_id
 * @property float $subtotal
 * @property float $desconto
 * @property float $total
 * @property string $forma_pagamento
 * @property float|null $valor_recebido
 * @property float|null $troco
 * @property string $status
 * @property string|null $observacoes
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property-read \App\Models\Usuario $usuario
 * @property-read \App\Models\Comercio $comercio
 * @property-read \App\Models\Cliente|null $cliente
 * @property-read \Illuminate\Database\Eloquent\Collection<\App\Models\ItemVenda> $itens
 * @property-read \Illuminate\Database\Eloquent\Collection<\App\Models\MovimentoEstoque> $movimentosEstoque
 * @property-read string $total_formatado
 * @property-read string $subtotal_formatado
 * @property-read string $desconto_formatado
 * @property-read string $troco_formatado
 */
class Venda extends Model
{
    use HasFactory;

    protected $table = 'vendas';

    protected $fillable = [
        'comercio_id',
        'usuario_id',
        'cliente_id',
        'subtotal',
        'desconto',
        'total',
        'forma_pagamento',
        'valor_recebido',
        'troco',
        'status',
        'observacoes',
    ];

    protected $casts = [
        'comercio_id' => 'int',
        'usuario_id' => 'int',
        'cliente_id' => 'int',
        'subtotal' => 'float',
        'desconto' => 'float',
        'total' => 'float',
        'valor_recebido' => 'float',
        'troco' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relacionamento: Venda pertence a um usuário.
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class);
    }

    /**
     * Relacionamento: Venda pertence a um comércio.
     */
    public function comercio(): BelongsTo
    {
        return $this->belongsTo(Comercio::class, 'comercio_id');
    }

    /**
     * Relacionamento: Venda pertence a um cliente (opcional).
     */
    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    /**
     * Relacionamento: Venda possui múltiplos itens.
     */
    public function itens(): HasMany
    {
        return $this->hasMany(ItemVenda::class);
    }

    /**
     * Relacionamento: Venda possui múltiplos movimentos de estoque.
     */
    public function movimentosEstoque(): HasMany
    {
        return $this->hasMany(MovimentoEstoque::class);
    }

    /**
     * Accessor: Total formatado em moeda brasileira.
     */
    public function getTotalFormatadoAttribute(): string
    {
        return 'R$ ' . number_format((float) $this->total, 2, ',', '.');
    }

    /**
     * Accessor: Subtotal formatado em moeda brasileira.
     */
    public function getSubtotalFormatadoAttribute(): string
    {
        return 'R$ ' . number_format((float) $this->subtotal, 2, ',', '.');
    }

    /**
     * Accessor: Desconto formatado em moeda brasileira.
     */
    public function getDescontoFormatadoAttribute(): string
    {
        return 'R$ ' . number_format((float) $this->desconto, 2, ',', '.');
    }

    /**
     * Accessor: Troco formatado em moeda brasileira.
     */
    public function getTrocoFormatadoAttribute(): string
    {
        return 'R$ ' . number_format($this->troco ?? 0, 2, ',', '.');
    }

    /**
     * Scope: Filtra vendas concluídas.
     */
    public function scopeConcluidas(Builder $query): Builder
    {
        return $query->where('status', 'concluida');
    }

    /**
     * Scope: Filtra vendas pendentes.
     */
    public function scopePendentes(Builder $query): Builder
    {
        return $query->where('status', 'pendente');
    }

    /**
     * Scope: Filtra vendas em conta fiada.
     */
    public function scopeContaFiada(Builder $query): Builder
    {
        return $query->where('status', 'conta_fiada');
    }
}