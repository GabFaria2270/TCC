import { useState, useEffect, useMemo } from 'react';
import type { Produto } from '../../types';

interface UseBuscaProdutosReturn {
    // Estado da busca
    busca: string;
    setBusca: (busca: string) => void;
    
    // Produtos filtrados
    produtosFiltrados: Produto[];
    
    // Ações
    limparBusca: () => void;
}

export const useBuscaProdutos = (produtos: Produto[]): UseBuscaProdutosReturn => {
    const [busca, setBusca] = useState('');

    // Filtrar produtos com useMemo para otimização
    const produtosFiltrados = useMemo(() => {
        if (!busca.trim()) return produtos;
        
        const termoBusca = busca.toLowerCase().trim();
        
        return produtos.filter((produto) =>
            produto.nome.toLowerCase().includes(termoBusca) ||
            produto.codigo_barras?.toLowerCase().includes(termoBusca) ||
            produto.categoria?.nome.toLowerCase().includes(termoBusca)
        );
    }, [busca, produtos]);

    const limparBusca = () => {
        setBusca('');
    };

    return {
        busca,
        setBusca,
        produtosFiltrados,
        limparBusca,
    };
};
