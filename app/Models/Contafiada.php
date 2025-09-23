<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContaFiada extends Model
{
    use HasFactory;

    protected $table = 'conta_fiada';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'cliente_id',
        'saldo',
        'comercio_id',
    ];

    protected $casts = [
        'saldo' => 'decimal:2',
    ];

    /**
     * RELACIONAMENTOS
     */
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function comercio()
    {
        return $this->belongsTo(Comercio::class, 'comercio_id');
    }

    public function historicosPagamento()
    {
        return $this->hasMany(HistoricoDePagamento::class, 'conta_fiada_id');
    }

    /**
     * MÉTODOS DE NEGÓCIO
     */
    public function adicionarSaldo($valor)
    {
        $this->saldo += $valor;
        return $this->save();
    }

    public function subtrairSaldo($valor)
    {
        if ($this->saldo >= $valor) {
            $this->saldo -= $valor;
            return $this->save();
        }
        return false;
    }

    /**
     * ACCESSORS
     */
    public function getSaldoFormatadoAttribute()
    {
        return 'R$ ' . number_format($this->saldo, 2, ',', '.');
    }
}