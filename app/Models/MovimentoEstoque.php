<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MovimentoEstoque extends Model
{
    use HasFactory;

    protected $table = 'movimentos_estoque';

    protected $fillable = [
        'produto_id',
        'usuario_id',
        'venda_id',
        'tipo',
        'quantidade_anterior',
        'quantidade_movimentada',
        'quantidade_atual',
        'motivo',
        'observacoes',
    ];

    protected $casts = [
        'quantidade_anterior' => 'integer',
        'quantidade_movimentada' => 'integer',
        'quantidade_atual' => 'integer',
    ];

    // Relacionamentos
    public function produto(): BelongsTo
    {
        return $this->belongsTo(Produto::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class);
    }

    public function venda(): BelongsTo
    {
        return $this->belongsTo(Venda::class);
    }

    // Scopes
    public function scopeEntradas($query)
    {
        return $query->where('tipo', 'entrada');
    }

    public function scopeSaidas($query)
    {
        return $query->where('tipo', 'saida');
    }

    public function scopeAjustes($query)
    {
        return $query->where('tipo', 'ajuste');
    }
}
