import { useState, useMemo } from 'react';
import type { Cliente } from '../types';

interface Venda {
    id: number;
    total: number;
    total_formatado: string;
    desconto: number;
    forma_pagamento: string;
    status: string;
    cliente?: Cliente;
    itens: any[];
    created_at: string;
    observacoes?: string;
}

interface UseFiltrosReturn {
    // Estados dos filtros
    filtroStatus: string;
    filtroCliente: string;
    vendaSelecionada: Venda | null;
    showDetalhes: boolean;
    
    // Setters
    setFiltroStatus: (status: string) => void;
    setFiltroCliente: (cliente: string) => void;
    setVendaSelecionada: (venda: Venda | null) => void;
    setShowDetalhes: (show: boolean) => void;
    
    // Dados filtrados
    vendasFiltradas: Venda[];
    
    // Ações
    abrirDetalhes: (venda: Venda) => void;
    fecharDetalhes: () => void;
    limparFiltros: () => void;
}

export const useFiltros = (vendas: Venda[]): UseFiltrosReturn => {
    const [filtroStatus, setFiltroStatus] = useState('');
    const [filtroCliente, setFiltroCliente] = useState('');
    const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
    const [showDetalhes, setShowDetalhes] = useState(false);

    // Filtrar vendas com useMemo para otimização
    const vendasFiltradas = useMemo(() => {
        return vendas.filter((venda) => {
            const filtroStatusMatch = !filtroStatus || venda.status === filtroStatus;
            const filtroClienteMatch = !filtroCliente || venda.cliente?.id === parseInt(filtroCliente);
            return filtroStatusMatch && filtroClienteMatch;
        });
    }, [vendas, filtroStatus, filtroCliente]);

    // Ações
    const abrirDetalhes = (venda: Venda) => {
        setVendaSelecionada(venda);
        setShowDetalhes(true);
    };

    const fecharDetalhes = () => {
        setShowDetalhes(false);
        setVendaSelecionada(null);
    };

    const limparFiltros = () => {
        setFiltroStatus('');
        setFiltroCliente('');
    };

    return {
        filtroStatus,
        filtroCliente,
        vendaSelecionada,
        showDetalhes,
        setFiltroStatus,
        setFiltroCliente,
        setVendaSelecionada,
        setShowDetalhes,
        vendasFiltradas,
        abrirDetalhes,
        fecharDetalhes,
        limparFiltros,
    };
};
