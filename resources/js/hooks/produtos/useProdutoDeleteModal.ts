import { router } from '@inertiajs/react';
import { useState } from 'react';
import { reloadProdutosList } from '@/utils/produtos';
import type { Produto } from '@/types/gerenciamento/Produtos';

interface UseProdutoDeleteModalOptions {
    produtoSelecionado: Produto | null;
    setProdutoSelecionado: (produto: Produto | null) => void;
}

interface UseProdutoDeleteModalReturn {
    showDeleteConfirm: boolean;
    solicitarExclusaoProduto: (produto: Produto) => void;
    fecharDeleteModal: () => void;
    confirmarExclusao: () => void;
}

export function useProdutoDeleteModal({ produtoSelecionado, setProdutoSelecionado }: UseProdutoDeleteModalOptions): UseProdutoDeleteModalReturn {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const solicitarExclusaoProduto = (produto: Produto) => {
        setProdutoSelecionado(produto);
        setShowDeleteConfirm(true);
    };

    const fecharDeleteModal = () => {
        setShowDeleteConfirm(false);
    };

    const confirmarExclusao = () => {
        if (!produtoSelecionado) return;
        router.delete(`/gerenciamento/produtos/${produtoSelecionado.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteConfirm(false);
                setProdutoSelecionado(null);
                reloadProdutosList();
            },
        });
    };

    return {
        showDeleteConfirm,
        solicitarExclusaoProduto,
        fecharDeleteModal,
        confirmarExclusao,
    };
}
