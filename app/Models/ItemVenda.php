<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ItemVenda extends Model
{
    use HasFactory;

    protected $table = 'itens_venda';

    protected $fillable = [
        'venda_id',
        'produto_id',
        'quantidade',
        'preco_unitario',
        'subtotal',
    ];

    protected $casts = [
        'quantidade' => 'integer',
        'preco_unitario' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    // Relacionamentos
    public function venda(): BelongsTo
    {
        return $this->belongsTo(Venda::class);
    }

    public function produto(): BelongsTo
    {
        return $this->belongsTo(Produto::class);
    }

    // Accessors
    public function getPrecoUnitarioFormatadoAttribute(): string
    {
        return 'R$ ' . number_format($this->preco_unitario, 2, ',', '.');
    }

    public function getSubtotalFormatadoAttribute(): string
    {
        return 'R$ ' . number_format($this->subtotal, 2, ',', '.');
    }
}