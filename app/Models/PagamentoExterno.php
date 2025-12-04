<?php

namespace App\Models;

use App\Models\Venda;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PagamentoExterno extends Model
{
    use HasFactory;

    protected $table = 'pagamentos_externos';

    protected $fillable = [
        'venda_id',
        'provider',
        'external_reference',
        'status',
        'method',
        'amount',
        'currency',
        'payload',
        'metadata',
        'pix_qr_code',
        'pix_qr_code_base64',
    ];

    protected $casts = [
        'amount' => 'float',
        'payload' => 'array',
        'metadata' => 'array',
    ];

    public function venda(): BelongsTo
    {
        return $this->belongsTo(Venda::class);
    }
}
