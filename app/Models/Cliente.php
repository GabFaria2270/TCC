<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cliente extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'cliente';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'nome',
        'email', 
        'telefone',
        'comercio_id',
    ];

    protected $hidden = [];

    protected $casts = [
        'nome' => 'string',
        'email' => 'string',
        'telefone' => 'string',
    ];

    /**
     * RELACIONAMENTOS
     */
    public function comercio()
    {
        return $this->belongsTo(Comercio::class, 'comercio_id');
    }

    public function contaFiada()
    {
        return $this->hasOne(ContaFiada::class, 'cliente_id');
    }

    public function vendas()
    {
        return $this->hasMany(Venda::class, 'cliente_id');
    }

    /**
     * SCOPES
     */
    public function scopeByEmail($query, $email)
    {
        return $query->where('email', strtolower($email));
    }

    public function scopeByComercio($query, $comercioId)
    {
        return $query->where('comercio_id', $comercioId);
    }

    public function scopeWithContaFiada($query)
    {
        return $query->with('contaFiada');
    }

    /**
     * ACCESSOR PARA FORMATAÇÃO
     */
    public function getTelefoneFormatadoAttribute()
    {
        if (!$this->telefone) return null;
        
        $telefone = preg_replace('/[^0-9]/', '', $this->telefone);
        
        if (strlen($telefone) === 11) {
            return '(' . substr($telefone, 0, 2) . ') ' . substr($telefone, 2, 5) . '-' . substr($telefone, 7);
        } elseif (strlen($telefone) === 10) {
            return '(' . substr($telefone, 0, 2) . ') ' . substr($telefone, 2, 4) . '-' . substr($telefone, 6);
        }
        
        return $this->telefone;
    }
}