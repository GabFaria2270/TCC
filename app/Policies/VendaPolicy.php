<?php


namespace App\Policies;

use App\Models\Usuario;
use App\Models\Venda;

class VendaPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Usuario $user): bool
    {
        return $user->PERFIL === 'ADMIN' || $user->PERFIL === 'FUNCIONARIO';
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Usuario $user, Venda $venda): bool
    {
        return $user->ID === $venda->usuario_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Usuario $user): bool
    {
        return $user->PERFIL === 'ADMIN' || $user->PERFIL === 'FUNCIONARIO';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Usuario $user, Venda $venda): bool
    {
        return $user->ID === $venda->usuario_id && $venda->status !== 'cancelada';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Usuario $user, Venda $venda): bool
    {
        return $user->ID === $venda->usuario_id && $venda->status !== 'cancelada';
    }
}