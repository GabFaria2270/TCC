import { useMemo, useState } from 'react';
import type { Cliente } from '@/types/gerenciamento/Clientes';

type StatusFiltro = '' | 'pendente' | 'quitada';

const normalizarTexto = (valor: string) => valor.trim().toLowerCase();

const possuiContaPendente = (cliente: Cliente) => {
    const saldo = cliente.conta_fiada?.saldo ?? 0;
    return saldo > 0;
};

const contaQuitada = (cliente: Cliente) => {
    const saldo = cliente.conta_fiada?.saldo ?? 0;
    return saldo <= 0;
};

export function useClienteFilters(clientes: Cliente[]) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<StatusFiltro>('');

    const searchValue = normalizarTexto(search);

    const filteredClientes = useMemo(() => {
        const list = Array.isArray(clientes) ? clientes : [];
        if (!searchValue && !status) {
            return list;
        }

        return list.filter((cliente) => {
            const nomeMatch = cliente.nome?.toLowerCase().includes(searchValue);
            const emailMatch = cliente.email?.toLowerCase().includes(searchValue);
            const matchSearch = searchValue ? Boolean(nomeMatch || emailMatch) : true;

            let matchStatus = true;
            if (status === 'pendente') {
                matchStatus = possuiContaPendente(cliente);
            } else if (status === 'quitada') {
                matchStatus = contaQuitada(cliente);
            }

            return matchSearch && matchStatus;
        });
    }, [clientes, searchValue, status]);

    const totalClientes = Array.isArray(clientes) ? clientes.length : 0;
    const filteredCount = filteredClientes.length;
    const hasFilters = Boolean(searchValue || status);

    const resetFilters = () => {
        setSearch('');
        setStatus('');
    };

    return {
        search,
        status,
        setSearch,
        setStatus,
        filteredClientes,
        totalClientes,
        filteredCount,
        hasFilters,
        resetFilters,
    };
}
