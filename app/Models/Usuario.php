<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * MODEL USUARIO - CORRIGIDO PARA SESSIONS
 */
class Usuario extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'usuario';
    protected $primaryKey = 'id'; // ✅ CORRIGIDO: usa 'id' das migrations
    public $timestamps = true; // ✅ ATIVADO: migrations têm timestamps

    protected $fillable = ['NOME', 'EMAIL', 'SENHA_HASH', 'PERFIL'];
    protected $hidden = ['SENHA_HASH'];

    /**
     * ✅ CONFIGURAÇÃO CORRIGIDA PARA SESSÕES
     */
    public function getAuthPassword()
    {
        return $this->SENHA_HASH;
    }

    public function getAuthIdentifierName()
    {
        return 'EMAIL'; // Campo para login
    }

    public function getAuthIdentifier()
    {
        return $this->id; // ✅ CORRIGIDO: RETORNA ID NUMÉRICO
    }

    /**
     * CAST AUTOMÁTICO
     */
    protected $casts = [
        'EMAIL' => 'string',
    'PERFIL' => 'string',
    ];

    /**
     * MUTATOR AUTOMÁTICO
     */
    public function setSenhaHashAttribute($value)
    {
        $this->attributes['SENHA_HASH'] = Hash::make($value);
    }

    /**
     * SCOPES
     */
    public function scopeByEmail($query, $email)
    {
        return $query->where('EMAIL', strtolower($email));
    }

    public function scopeByPerfil($query, $perfil)
    {
        return $query->where('PERFIL', strtolower($perfil));
    }

    /**
     * RELACIONAMENTOS
     */
    public function comercio()
    {
        return $this->hasOne(Comercio::class, 'usuario_id');
    }

    public function scopeWithComercio($query)
    {
        return $query->with('comercio');
    }

    /**
     * ✅ MÉTODO PARA VINCULAR SESSÃO AO USUÁRIO
     */
    public function linkCurrentSession(Request $request): bool
    {
        $sessionId = $request->session()->getId();
        if (!$sessionId) return false;

        try {
            // ✅ CORRIGIDO: Usa json_encode + base64_encode
            $sessionData = json_encode($request->session()->all());
            
            return (bool) DB::table('sessions')->updateOrInsert(
                ['id' => $sessionId],
                [
                    'user_id' => $this->getKey(), // ✅ USA user_id
                    'ip_address' => $request->ip(),
                    'user_agent' => substr((string) $request->userAgent(), 0, 500),
                    'last_activity' => time(),
                    'payload' => base64_encode($sessionData), // ✅ CORRIGIDO
                ]
            );
        } catch (\Exception $e) {
            Log::error('Erro ao vincular sessão', [
                'user_id' => $this->id,
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}