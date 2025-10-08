import { useState, useMemo } from 'react';
import type { Cliente } from '../../types';

interface Venda {
    id: number;
    total: number;
    total_formatado: string;
    desconto: number;
    forma_pagamento: string;
    status: string;
    cliente?: Cliente | { id?: number; nome?: string; email?: string } | null;
    cliente_id?: number;
    created_at: string;
    observacoes?: string;
}

interface UseFiltrosReturn {
    filtroStatus: string;
    filtroCliente: string;
    filtroClienteTexto: string;
    vendaSelecionada: Venda | null;
    showDetalhes: boolean;
    setFiltroStatus: (status: string) => void;
    setFiltroCliente: (cliente: string) => void;
    setFiltroClienteTexto: (texto: string) => void;
    setVendaSelecionada: (venda: Venda | null) => void;
    setShowDetalhes: (show: boolean) => void;
    vendasFiltradas: Venda[];
    abrirDetalhes: (venda: Venda) => void;
    fecharDetalhes: () => void;
    limparFiltros: () => void;
}

const normalizar = (s: string) =>
  s ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

export const useFiltros = (vendas: Venda[], clientes: Cliente[]): UseFiltrosReturn => {
    const [filtroStatus, setFiltroStatus] = useState('');
    const [filtroCliente, setFiltroCliente] = useState('');
    const [filtroClienteTexto, setFiltroClienteTexto] = useState('');
    const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
    const [showDetalhes, setShowDetalhes] = useState(false);

    // Texto -> ids (usado só quando NÃO há cliente selecionado)
    const matchingClienteIds = useMemo(() => {
        const t = normalizar(filtroClienteTexto);
        if (!t) return null;
        const ids = clientes
            .filter(c => normalizar(c.nome).includes(t) || normalizar(c.email || '').includes(t))
            .map(c => c.id);
        return new Set(ids);
    }, [clientes, filtroClienteTexto]);

    // Cliente selecionado (objeto completo) para fallback por nome/email
    const selectedCliente = useMemo(
        () => clientes.find(c => String(c.id) === String(filtroCliente)) || null,
        [clientes, filtroCliente]
    );

    const getVendaClienteId = (v: any): number | null =>
        v?.cliente?.id ?? v?.cliente_id ?? v?.clienteId ?? null;
    const getVendaClienteNome = (v: any): string =>
        (v?.cliente?.nome ?? v?.cliente_nome ?? '') as string;
    const getVendaClienteEmail = (v: any): string =>
        (v?.cliente?.email ?? v?.cliente_email ?? '') as string;

    // Filtro final
    const vendasFiltradas = useMemo(() => {
        const hasClienteSelecionado = !!filtroCliente;

        return vendas.filter((venda) => {
            const statusOk = !filtroStatus || venda.status === filtroStatus;

            const vClienteId = getVendaClienteId(venda);

            // Se há cliente selecionado: aceita por ID OU por nome/email (fallback)
            let clienteOk = true;
            if (hasClienteSelecionado) {
                const idMatch = vClienteId !== null && String(vClienteId) === String(filtroCliente);

                let nameEmailMatch = false;
                if (!idMatch && selectedCliente) {
                    const nomeVenda = normalizar(getVendaClienteNome(venda));
                    const emailVenda = normalizar(getVendaClienteEmail(venda));
                    const nomeSel = normalizar(selectedCliente.nome);
                    const emailSel = normalizar(selectedCliente.email || '');
                    // match por igualdade/contain (para bases onde vem “Nome - Email”)
                    nameEmailMatch =
                        (!!nomeSel && (nomeVenda === nomeSel || nomeVenda.includes(nomeSel))) ||
                        (!!emailSel && (emailVenda === emailSel || emailVenda.includes(emailSel)));
                }

                clienteOk = idMatch || nameEmailMatch;
            } else {
                // Sem cliente selecionado: usa texto se houver
                if (matchingClienteIds) {
                    if (vClienteId !== null) {
                        clienteOk = matchingClienteIds.has(Number(vClienteId));
                    } else {
                        const nome = normalizar(getVendaClienteNome(venda));
                        const email = normalizar(getVendaClienteEmail(venda));
                        const t = normalizar(filtroClienteTexto);
                        clienteOk = !t || nome.includes(t) || email.includes(t);
                    }
                } else {
                    clienteOk = true;
                }
            }

            return statusOk && clienteOk;
        });
    }, [vendas, filtroStatus, filtroCliente, filtroClienteTexto, matchingClienteIds, selectedCliente]);

    return {
        filtroStatus,
        filtroCliente,
        filtroClienteTexto,
        vendaSelecionada,
        showDetalhes,
        setFiltroStatus,
        setFiltroCliente,
        setFiltroClienteTexto,
        setVendaSelecionada,
        setShowDetalhes,
        vendasFiltradas,
        abrirDetalhes: (v) => { setVendaSelecionada(v); setShowDetalhes(true); },
        fecharDetalhes: () => { setShowDetalhes(false); setVendaSelecionada(null); },
        limparFiltros: () => { setFiltroStatus(''); setFiltroCliente(''); setFiltroClienteTexto(''); },
    };
};
