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
        'descricao',
        'status', // ✅ novo
    ];

    protected $casts = [
        'saldo' => 'decimal:2',
        'cliente_id' => 'integer',
        'comercio_id' => 'integer',
        'descricao' => 'string',
        'status' => 'string', // ✅ novo
    ];

    // ✅ Ajuste dos appends: não exponha mais "status" calculado
    protected $appends = [
        'saldo_formatado',
        // 'status' REMOVIDO para não conflitar com a coluna
        // Se quiser expor a situação do saldo (positivo/zero/negativo), use um novo accessor:
        'saldo_situacao',
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

    // ❌ Remover este accessor antigo (conflitava com a coluna 'status')
    // public function getStatusAttribute() { ... }

    // ✅ Novo accessor apenas para situação do saldo (opcional no front)
    public function getSaldoSituacaoAttribute()
    {
        if ($this->saldo > 0) return 'positivo';
        if ($this->saldo < 0) return 'negativo';
        return 'zero';
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
