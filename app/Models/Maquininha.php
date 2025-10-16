<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Maquininha extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'modelo',
        'status',
        'comercio_id',
    ];

    public function comercio()
    {
        return $this->belongsTo(Comercio::class);
    }
}
