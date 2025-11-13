<?php

namespace App\Services\Auth;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * SessionService
 * 
 * Gerencia operações de sessão de forma centralizada, respeitando
 * o Single Responsibility Principle e evitando acoplamento direto
 * dos models com a camada de persistência de sessões.
 */
class SessionService
{
    /**
     * Vincula a sessão atual ao usuário autenticado.
     * 
     * IMPORTANTE: Este método NÃO manipula diretamente a tabela sessions.
     * O Laravel gerencia sessions automaticamente via SessionHandler.
     * Apenas garantimos que a sessão está vinculada ao user_id correto.
     * 
     * @param Usuario $user
     * @param Request $request
     * @return bool
     */
    public function linkSessionToUser(Usuario $user, Request $request): bool
    {
        try {
            // Regenera o ID da sessão para prevenir session fixation
            $request->session()->regenerate();
            
            // Armazena o user_id na sessão (Laravel gerencia persistência)
            $request->session()->put('user_id', $user->getKey());
            
            // Atualiza dados de auditoria na sessão
            $request->session()->put('session_meta', [
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 500),
                'last_activity' => time(),
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Erro ao vincular sessão ao usuário', [
                'user_id' => $user->getKey(),
                'session_id' => $request->session()->getId(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return false;
        }
    }
    
    /**
     * Remove a vinculação da sessão ao usuário.
     * 
     * @param Request $request
     * @return bool
     */
    public function unlinkSession(Request $request): bool
    {
        try {
            $request->session()->forget(['user_id', 'session_meta']);
            $request->session()->regenerate();
            
            return true;
        } catch (\Exception $e) {
            Log::error('Erro ao desvincular sessão', [
                'session_id' => $request->session()->getId(),
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }
    
    /**
     * Obtém o user_id da sessão atual.
     * 
     * @param Request $request
     * @return int|null
     */
    public function getUserIdFromSession(Request $request): ?int
    {
        return $request->session()->get('user_id');
    }
    
    /**
     * Valida se a sessão está vinculada a um usuário válido.
     * 
     * @param Request $request
     * @return bool
     */
    public function hasValidUserSession(Request $request): bool
    {
        $userId = $this->getUserIdFromSession($request);
        
        if (!$userId) {
            return false;
        }
        
        // Verifica se o usuário ainda existe
        return Usuario::where('id', $userId)->exists();
    }
}
