<?php
// filepath: c:\Users\User\Desktop\TCC\app\Models\Contafiada.php

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
        'comercio_id',
        'saldo',
        'descricao', // ✅ CAMPO DESCRIÇÃO
    ];

    protected $casts = [
        'saldo' => 'decimal:2',
        'cliente_id' => 'integer',
        'comercio_id' => 'integer',
        'descricao' => 'string',
    ];

    // ✅ ADICIONAR CAMPOS NO RETORNO JSON
    protected $appends = [
        'saldo_formatado',
        'status'
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

    /**
     * ✅ ACCESSORS (CORRIGIDOS)
     */
    public function getSaldoFormatadoAttribute()
    {
        return 'R$ ' . number_format($this->saldo, 2, ',', '.');
    }

    public function getStatusAttribute()
    {
        if ($this->saldo > 0) {
            return 'positivo';
        } elseif ($this->saldo < 0) {
            return 'negativo';
        } else {
            return 'zero';
        }
    }

    /**
     * ✅ MÉTODOS DE NEGÓCIO
     */
    public function atualizarSaldo($novoSaldo, $novaDescricao)
    {
        $this->saldo = $novoSaldo;
        $this->descricao = $novaDescricao;
        $this->save();
        
        return $this;
    }

    public function adicionarCompra($valor, $descricaoCompra)
    {
        $this->saldo -= $valor;
        $this->descricao = $descricaoCompra;
        $this->save();
        
        return $this;
    }

    public function adicionarPagamento($valor, $descricaoPagamento)
    {
        $this->saldo += $valor;
        $this->descricao = $descricaoPagamento;
        $this->save();
        
        return $this;
    }

    /**
     * SCOPES
     */
    public function scopeByCliente($query, $clienteId)
    {
        return $query->where('cliente_id', $clienteId);
    }

    public function scopeByComercio($query, $comercioId)
    {
        return $query->where('comercio_id', $comercioId);
    }
}