<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    protected $table = 'sessions';
    public $timestamps = false;
    
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'id', 'user_id', 'ip_address', 'user_agent', 'payload', 'last_activity',
    ];
    
    protected $casts = [
        'last_activity' => 'integer',
    ];
    
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'user_id', 'id');
    }
}