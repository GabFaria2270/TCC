<?php
// app/Models/Comercio.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comercio extends Model
{
    protected $table = 'comercio';
    protected $primaryKey = 'id'; // ajuste conforme sua migration
    public $timestamps = true; // ou false, conforme sua tabela

    // Proteção contra mass assignment
    protected $fillable = [
        'nome',
        'cnpj',
        'usuario_id',
    ];

    // Ocultação de campos sensíveis (adicione se necessário)
    protected $hidden = [
        // exemplo: 'api_token',
    ];

    // Relacionamento com usuário
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id');
    }

    // Exemplo de scope para consulta segura
    public function scopeByCnpj($query, $cnpj)
    {
        return $query->where('cnpj', $cnpj);
    }
}