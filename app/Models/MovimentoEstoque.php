<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MovimentoEstoque extends Model
{
    use HasFactory;

    protected $table = 'movimento_estoque';

    protected $fillable = [
        'produto_id',
        'comercio_id',
        'tipo',
        'quantidade',
        'saldo_apos',
        'motivo',
        'user_id',
    ];

    protected $casts = [
        'produto_id' => 'integer',
        'comercio_id' => 'integer',
        'quantidade' => 'integer',
        'saldo_apos' => 'integer',
        'user_id' => 'integer',
    ];

    public function produto()
    {
        return $this->belongsTo(Produto::class, 'produto_id');
    }

    public function comercio()
    {
        return $this->belongsTo(Comercio::class, 'comercio_id');
    }
}
