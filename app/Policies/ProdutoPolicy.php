<?php

namespace App\Policies;

use App\Models\Produto;

class ProdutoPolicy
{
    /**
     * Retorna o ID do comércio associado ao usuário autenticado, se houver.
     */
    private function getComercioId($user): ?int
    {
        try {
            if (method_exists($user, 'comercio')) {
                // Relacionamento Eloquent: $user->comercio()->first()?->id
                return optional($user->comercio)->id ?? optional($user->comercio()->first())->id;
            }
            if (property_exists($user, 'comercio_id')) {
                return (int) ($user->comercio_id ?? 0) ?: null;
            }
        } catch (\Throwable $e) {
            // Ignora e retorna null
        }
        return null;
    }

    /**
     * Qualquer listagem exige que o usuário possua um comércio vinculado.
     */
    public function viewAny($user): bool
    {
        return (bool) $this->getComercioId($user);
    }

    /**
     * Pode ver se o produto pertence ao mesmo comércio do usuário.
     */
    public function view($user, Produto $produto): bool
    {
        $comercioId = $this->getComercioId($user);
        return $comercioId !== null && $produto->comercio_id === $comercioId;
    }

    /**
     * Pode criar se possuir comércio.
     */
    public function create($user): bool
    {
        return (bool) $this->getComercioId($user);
    }

    /**
     * Pode atualizar se o produto for do mesmo comércio.
     */
    public function update($user, Produto $produto): bool
    {
        $comercioId = $this->getComercioId($user);
        return $comercioId !== null && $produto->comercio_id === $comercioId;
    }

    /**
     * Pode excluir se o produto for do mesmo comércio.
     */
    public function delete($user, Produto $produto): bool
    {
        $comercioId = $this->getComercioId($user);
        return $comercioId !== null && $produto->comercio_id === $comercioId;
    }
}
