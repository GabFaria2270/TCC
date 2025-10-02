<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    use HasFactory;

    protected $table = 'cliente';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'nome',
        'email', 
        'telefone',
        'comercio_id',
    ];

    protected $casts = [
        'nome' => 'string',
        'email' => 'string',
        'telefone' => 'string',
        'comercio_id' => 'integer',
    ];

    /**
     * ✅ RELACIONAMENTOS
     */
    public function comercio()
    {
        return $this->belongsTo(Comercio::class, 'comercio_id');
    }

    public function contaFiada()
    {
        return $this->hasOne(ContaFiada::class, 'cliente_id');
    }

    // ✅ Alias para compatibilidade com underscore
    public function conta_fiada()
    {
        return $this->contaFiada();
    }

    public function vendas()
    {
        return $this->hasMany(Venda::class, 'cliente_id');
    }

    /**
     * ✅ SCOPES PARA CONSULTAS
     */
    public function scopeByEmail($query, $email)
    {
        return $query->where('email', $email);
    }

    public function scopeByComercio($query, $comercioId)
    {
        return $query->where('comercio_id', $comercioId);
    }

    public function scopeWithContaFiada($query)
    {
        return $query->with('contaFiada');
    }

    public function scopeOrderByNome($query)
    {
        return $query->orderBy('nome', 'asc');
    }

    /**
     * ✅ ACCESSORS
     */
    public function getTelefoneFormatadoAttribute()
    {
        if (!$this->telefone) return 'Não informado';
        
        $telefone = preg_replace('/[^0-9]/', '', $this->telefone);
        
        if (strlen($telefone) === 10) {
            return preg_replace('/(\d{2})(\d{4})(\d{4})/', '($1) $2-$3', $telefone);
        } elseif (strlen($telefone) === 11) {
            return preg_replace('/(\d{2})(\d{5})(\d{4})/', '($1) $2-$3', $telefone);
        }
        
        return $this->telefone;
    }

    public function getContaFiadaFormatadaAttribute()
    {
        $conta = $this->contaFiada;
        
        if (!$conta) {
            return [
                'saldo' => 0,
                'saldo_formatado' => 'R$ 0,00',
                'status' => 'sem_conta'
            ];
        }
        
        return [
            'saldo' => (float) $conta->saldo,
            'saldo_formatado' => 'R$ ' . number_format($conta->saldo, 2, ',', '.'),
            'status' => $conta->saldo > 0 ? 'positivo' : ($conta->saldo < 0 ? 'negativo' : 'zero')
        ];
    }
}