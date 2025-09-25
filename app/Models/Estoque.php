<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estoque extends Model
{
    use HasFactory;

    protected $table = 'estoque';

    protected $fillable = [
        'produto_id',
        'quantidade',
        'comercio_id',
    ];

    protected $casts = [
        'produto_id' => 'integer',
        'quantidade' => 'integer',
        'comercio_id' => 'integer',
    ];

    public function produto()
    {
        return $this->belongsTo(Produto::class, 'produto_id');
    }

    public function comercio()
    {
        return $this->belongsTo(Comercio::class, 'comercio_id');
    }

    public function scopeByComercio($query, int $comercioId)
    {
        return $query->where('comercio_id', $comercioId);
    }
}
