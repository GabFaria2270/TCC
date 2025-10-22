<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RememberToken extends Model
{
    protected $table = 'remember_tokens';
    protected $fillable = ['user_id', 'token_hash', 'ip_address', 'user_agent', 'expires_at', 'last_used_at'];
    public $timestamps = true;

    protected $dates = ['expires_at', 'last_used_at', 'created_at', 'updated_at'];
}
