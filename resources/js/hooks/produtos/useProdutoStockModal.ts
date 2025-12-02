import { router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { reloadProdutosList } from '@/utils/produtos';
import type { Produto } from '@/types/gerenciamento/Produtos';

interface UseProdutoStockModalOptions {
    produtoSelecionado: Produto | null;
    setProdutoSelecionado: (produto: Produto | null) => void;
}

interface UseProdutoStockModalReturn {
    showStockModal: boolean;
    stockMode: 'entrada' | 'saida' | 'ajuste';
    estoqueQuantidade: string;
    estoqueNovoSaldo: string;
    estoqueMotivo: string;
    setStockMode: (mode: 'entrada' | 'saida' | 'ajuste') => void;
    setEstoqueQuantidade: (value: string) => void;
    setEstoqueNovoSaldo: (value: string) => void;
    setEstoqueMotivo: (value: string) => void;
    abrirModalEstoque: (produto: Produto, modo?: 'entrada' | 'saida' | 'ajuste') => void;
    fecharModalEstoque: () => void;
    submitMovimentoEstoque: (event: FormEvent) => void;
}

export function useProdutoStockModal({ produtoSelecionado, setProdutoSelecionado }: UseProdutoStockModalOptions): UseProdutoStockModalReturn {
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockMode, setStockMode] = useState<'entrada' | 'saida' | 'ajuste'>('ajuste');
    const [estoqueQuantidade, setEstoqueQuantidade] = useState('');
    const [estoqueNovoSaldo, setEstoqueNovoSaldo] = useState('0');
    const [estoqueMotivo, setEstoqueMotivo] = useState('');

    const abrirModalEstoque = (produto: Produto, modo: 'entrada' | 'saida' | 'ajuste' = 'entrada') => {
        setProdutoSelecionado(produto);
        setStockMode(modo);
        if (modo === 'ajuste') {
            setEstoqueNovoSaldo(String(produto.estoque?.quantidade ?? '0'));
        } else {
            setEstoqueQuantidade('');
        }
        setEstoqueMotivo('');
        setShowStockModal(true);
        setTimeout(() => {
            const id = modo === 'ajuste' ? 'ajuste-novo-saldo' : 'mov-quantidade';
            document.getElementById(id)?.focus();
        }, 100);
    };

    const fecharModalEstoque = () => {
        setShowStockModal(false);
        setProdutoSelecionado(null);
        setEstoqueQuantidade('');
        setEstoqueNovoSaldo('0');
        setEstoqueMotivo('');
    };

    const submitMovimentoEstoque = (event: FormEvent) => {
        event.preventDefault();
        if (!produtoSelecionado) return;
        const base = `/gerenciamento/produtos/${produtoSelecionado.id}/estoque`;

        const payload = stockMode === 'ajuste'
            ? { novoSaldo: Number(estoqueNovoSaldo), motivo: estoqueMotivo || undefined }
            : { quantidade: Number(estoqueQuantidade), motivo: estoqueMotivo || undefined };

        const endpoint =
            stockMode === 'entrada' ? `${base}/entrada` : stockMode === 'saida' ? `${base}/saida` : `${base}/ajuste`;

        router.post(endpoint, payload, {
            preserveScroll: true,
            onSuccess: () => {
                fecharModalEstoque();
                reloadProdutosList();
            },
        });
    };

    return {
        showStockModal,
        stockMode,
        estoqueQuantidade,
        estoqueNovoSaldo,
        estoqueMotivo,
        setStockMode,
        setEstoqueQuantidade,
        setEstoqueNovoSaldo,
        setEstoqueMotivo,
        abrirModalEstoque,
        fecharModalEstoque,
        submitMovimentoEstoque,
    };
}
