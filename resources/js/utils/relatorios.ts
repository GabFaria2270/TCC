import type {
    ModalVendaState,
    MovimentoEstoque,
    MovimentoResumo,
    PaginacaoMeta,
    RelatorioItem,
    RelatorioResumo,
    RelatorioTabela,
    ResumoMovimentosResponse,
    ResumoVendasResponse,
    VendaModalData,
    VendaPreparada,
} from '@/types/gerenciamento/Relatorio';

const STATUS_CONFIG: Record<string, { badgeClass: string; label: string }> = {
    concluida: { badgeClass: 'text-bg-success', label: '✅ Concluída' },
    pendente: { badgeClass: 'text-bg-warning', label: '⏳ Pendente' },
    cancelada: { badgeClass: 'text-bg-danger', label: '❌ Cancelada' },
};

export function normalizarStatus(status?: string) {
    const value = (status ?? '').toLowerCase();
    if (value === 'conta_fiada') return 'pendente';
    return value;
}

export function statusInfo(status?: string) {
    const normalized = normalizarStatus(status);
    const config = STATUS_CONFIG[normalized];
    return {
        normalized,
        badgeClass: config?.badgeClass ?? 'text-bg-info',
        label: config?.label ?? (normalized || '—'),
    };
}

export function movimentoTipoInfo(tipo: string) {
    const normalized = (tipo ?? '').toLowerCase();
    switch (normalized) {
        case 'entrada':
            return { label: 'Entrada', badge: 'text-bg-success', icon: 'bi-box-arrow-in-down', prefix: '+' };
        case 'saida':
        case 'saída':
            return { label: 'Saída', badge: 'text-bg-danger', icon: 'bi-box-arrow-up-right', prefix: '-' };
        case 'ajuste':
            return { label: 'Ajuste', badge: 'text-bg-warning text-dark', icon: 'bi-sliders', prefix: '~' };
        default:
            return { label: tipo || 'Movimento', badge: 'text-bg-secondary', icon: 'bi-arrow-left-right', prefix: '' };
    }
}

export function formatarDataMovimento(dataIso?: string, fallback?: string) {
    if (dataIso) {
        const dataObj = new Date(dataIso);
        if (!Number.isNaN(dataObj.getTime())) {
            return dataObj.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        }
    }
    return fallback ?? '-';
}

export function formatarNumero(valor?: number | null) {
    if (typeof valor !== 'number' || Number.isNaN(valor)) return null;
    return valor.toLocaleString('pt-BR');
}

export function normalizarIso(dataIso?: string, dataTexto?: string) {
    if (dataIso) return dataIso;
    if (!dataTexto) return undefined;
    const [data, horario = '00:00'] = dataTexto.split(' ');
    const [dia, mes, ano] = data.split('/');
    if (!dia || !mes || !ano) return undefined;
    const [horaParte, minutoParte = '00'] = horario.split(':');
    const hora = (horaParte ?? '00').padStart(2, '0');
    const minuto = minutoParte.padStart(2, '0');
    return `${ano.padStart(4, '0')}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${hora}:${minuto}:00`;
}

export function timestampOrNull(dataIso?: string, fallback?: string) {
    const iso = normalizarIso(dataIso, fallback);
    if (!iso) return null;
    const ts = Date.parse(iso);
    return Number.isNaN(ts) ? null : ts;
}

export function timestampFrom(dataIso?: string, fallback?: string) {
    return timestampOrNull(dataIso, fallback) ?? 0;
}

export function normalizarPagamento(valor?: string) {
    const val = (valor ?? '').toLowerCase();
    if (val === '') return '';
    if (val === 'cartao_debito') return 'debito';
    if (val === 'cartao_credito') return 'credito';
    if (val === 'fiado') return 'conta_fiada';
    return val;
}

export function calcularResumoVendas(lista: RelatorioItem[]): RelatorioResumo {
    const quantidade = lista.length;
    const totalFaturado = lista.reduce((acc, item) => acc + Number(item.total ?? 0), 0);
    const totalDescontos = lista.reduce((acc, item) => acc + Number(item.desconto ?? 0), 0);
    return {
        quantidade,
        totalFaturado,
        totalDescontos,
    };
}

export function calcularResumoMovimentos(lista: MovimentoEstoque[]): MovimentoResumo {
    const quantidade = lista.length;
    const totalMovimentado = lista.reduce((acc, item) => acc + Number(item.quantidade ?? 0), 0);
    return {
        quantidade,
        totalMovimentado,
    };
}

export function ordenarVendas(lista: RelatorioItem[]) {
    return [...lista].sort((a, b) => timestampFrom(b.data_iso, b.data) - timestampFrom(a.data_iso, a.data));
}

export function ordenarMovimentos(lista: MovimentoEstoque[]) {
    return [...lista].sort((a, b) => timestampFrom(b.created_at_iso, b.data) - timestampFrom(a.created_at_iso, a.data));
}

export function prepararVenda(item: RelatorioItem): VendaPreparada {
    const possuiDesconto = (item.desconto ?? 0) > 0;
    const totalFormatado = item.total_formatado ?? `R$ ${(item.total ?? 0).toFixed(2).replace('.', ',')}`;
    const descontoFormatado = item.desconto_formatado ?? `R$ ${(item.desconto ?? 0).toFixed(2).replace('.', ',')}`;
    const dataIso = normalizarIso(item.data_iso, item.data);
    const exibicaoData = dataIso
        ? new Date(dataIso).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : item.data;
    const clienteNome = item.cliente && item.cliente !== '-' ? item.cliente : null;
    const responsavel = item.usuario && item.usuario !== '-' ? item.usuario : null;

    return {
        original: item,
        possuiDesconto,
        totalFormatado,
        descontoFormatado,
        exibicaoData,
        clienteNome,
        responsavel,
    };
}

function safeNumber(value?: number | string | null) {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }
    if (typeof value === 'string') {
        const parsed = Number(value.replace(/\./g, '').replace(',', '.'));
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

export function mapRelatorioItemParaVendaModal(item: RelatorioItem | null): VendaModalData {
    if (!item) return null;

    const createdAt = normalizarIso(item.data_iso, item.data);
    const formaPagamento = normalizarPagamento(item.forma_pagamento);

    const desconto = safeNumber(item.desconto);
    const total = safeNumber(item.total);
    const subtotal = total + desconto;

    const itens = (item.itens ?? []).map((it, index) => {
        const quantidade = safeNumber(it.quantidade);
        const precoUnitario = safeNumber(it.valor_unitario);
        const subtotalItem = safeNumber(it.subtotal) || quantidade * precoUnitario;

        return {
            id: index,
            quantidade,
            preco_unitario: precoUnitario,
            subtotal: subtotalItem,
            produto: it.produto
                ? {
                      id: index,
                      nome: it.produto,
                  }
                : undefined,
        };
    });

    const status = normalizarStatus(item.status) || item.status || '';

    return {
        id: item.id,
        cliente:
            item.cliente && item.cliente !== '-'
                ? {
                      id: null,
                      nome: item.cliente,
                  }
                : null,
        usuario:
            item.usuario && item.usuario !== '-'
                ? {
                      id: null,
                      nome: item.usuario,
                      NOME: item.usuario,
                  }
                : null,
        status,
        forma_pagamento: formaPagamento || null,
        subtotal,
        desconto,
        total,
        observacoes: item.observacoes || '',
        created_at: createdAt,
        itens,
    };
}

export function metaFallback(tamanhoLista: number): PaginacaoMeta {
    const perPage = tamanhoLista > 0 ? tamanhoLista : 25;
    return {
        current_page: 1,
        last_page: 1,
        per_page: perPage,
        total: tamanhoLista,
    };
}

export function mapResumoVendas(resumo?: ResumoVendasResponse | null, lista: RelatorioItem[] = []): RelatorioResumo {
    if (resumo) {
        return {
            quantidade: Number(resumo.quantidade ?? 0),
            totalFaturado: Number(resumo.total_faturado ?? 0),
            totalDescontos: Number(resumo.total_descontos ?? 0),
        };
    }

    return calcularResumoVendas(lista);
}

export function mapResumoMovimentos(
    resumo?: ResumoMovimentosResponse | null,
    lista: MovimentoEstoque[] = [],
): MovimentoResumo {
    if (resumo) {
        return {
            quantidade: Number(resumo.quantidade ?? 0),
            totalMovimentado: Number(resumo.total_movimentado ?? 0),
        };
    }

    return calcularResumoMovimentos(lista);
}

export function buildFiltroClasses(tabela: RelatorioTabela) {
    const base = 'relatorio-filtro col-12 col-md-6';
    return {
        data: `${base} ${tabela === 'vendas' ? 'col-lg-2 col-xl-2' : 'col-lg-3 col-xl-3'}`,
        status: `${base} col-lg-3 col-xl-3`,
        pagamento: `${base} ${tabela === 'vendas' ? 'col-lg-2 col-xl-2' : 'col-lg-3 col-xl-3'}`,
        tipo: `${base} col-lg-3 col-xl-3`,
        acoes: `${base} col-lg-3 col-xl-3`,
    };
}

export function aplicarResetPorTabela(
    tabela: RelatorioTabela,
    setFiltroStatus: (value: string) => void,
    setFiltroPagamento: (value: string) => void,
    setFiltroTipo: (value: string) => void,
) {
    if (tabela === 'estoque') {
        setFiltroStatus('');
        setFiltroPagamento('');
    } else {
        setFiltroTipo('');
    }
}

export function montarPayload(
    tabela: RelatorioTabela,
    filtros: {
        dataInicio: string;
        dataFim: string;
        status: string;
        pagamento: string;
        tipo: string;
    },
    page: number,
    perPage?: number,
    tabelaOverride?: RelatorioTabela,
) {
    const alvo = tabelaOverride ?? tabela;

    const payload: Record<string, unknown> = {
        tabela: alvo,
        data_inicio: filtros.dataInicio || null,
        data_fim: filtros.dataFim || null,
        page,
    };

    if (typeof perPage === 'number') {
        payload.per_page = perPage;
    }

    if (alvo === 'vendas') {
        if (filtros.status) payload.status = filtros.status;
        if (filtros.pagamento) payload.forma_pagamento = filtros.pagamento;
    } else if (filtros.tipo) {
        payload.tipo_movimento = filtros.tipo;
    }

    return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== null && value !== ''));
}

export function criarModalState(): ModalVendaState {
    return { show: false, venda: null };
}
