<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Venda extends Model
{
    use HasFactory;

    protected $table = 'vendas';

    protected $fillable = [
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
        'subtotal' => 'decimal:2',
        'desconto' => 'decimal:2',
        'total' => 'decimal:2',
        'valor_recebido' => 'decimal:2',
        'troco' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relacionamentos
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function itens(): HasMany
    {
        return $this->hasMany(ItemVenda::class);
    }

    public function movimentosEstoque(): HasMany
    {
        return $this->hasMany(MovimentoEstoque::class);
    }

    // Accessors para formatação
    public function getTotalFormatadoAttribute(): string
    {
        return 'R$ ' . number_format($this->total, 2, ',', '.');
    }

    public function getSubtotalFormatadoAttribute(): string
    {
        return 'R$ ' . number_format($this->subtotal, 2, ',', '.');
    }

    public function getDescontoFormatadoAttribute(): string
    {
        return 'R$ ' . number_format($this->desconto, 2, ',', '.');
    }

    public function getTrocoFormatadoAttribute(): string
    {
        return 'R$ ' . number_format($this->troco ?? 0, 2, ',', '.');
    }

    // Scopes
    public function scopeConcluidas($query)
    {
        return $query->where('status', 'concluida');
    }

    public function scopePendentes($query)
    {
        return $query->where('status', 'pendente');
    }

    public function scopeContaFiada($query)
    {
        return $query->where('status', 'conta_fiada');
    }
}