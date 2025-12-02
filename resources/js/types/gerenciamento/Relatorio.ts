import type { Venda } from '@/components/PDVcomponents/VendaDetalhesModal';

export type RelatorioTabela = 'vendas' | 'estoque';

export interface ItemRelatorio {
    produto: string;
    quantidade: number;
    valor_unitario: number;
    valor_unitario_formatado: string;
    subtotal: number;
    subtotal_formatado: string;
}

export interface RelatorioItem {
    id: number;
    data: string;
    data_iso?: string;
    cliente: string;
    usuario: string;
    total: number;
    total_formatado: string;
    desconto: number;
    desconto_formatado: string;
    forma_pagamento: string;
    status: string;
    observacoes: string;
    itens?: ItemRelatorio[];
}

export interface RelatorioResumo {
    quantidade: number;
    totalFaturado: number;
    totalDescontos: number;
}

export interface MovimentoEstoque {
    id: number;
    data: string;
    created_at_iso?: string;
    produto: string;
    tipo: string;
    quantidade: number;
    quantidade_anterior?: number | null;
    quantidade_atual?: number | null;
    usuario: string;
    motivo?: string;
}

export interface MovimentoResumo {
    quantidade: number;
    totalMovimentado: number;
}

export interface PaginacaoMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface ResumoVendasResponse {
    quantidade?: number;
    total_faturado?: number;
    total_descontos?: number;
}

export interface ResumoMovimentosResponse {
    quantidade?: number;
    total_movimentado?: number;
}

export interface RelatorioPayload<TData, TResumo> {
    data?: TData[];
    meta?: PaginacaoMeta | null;
    resumo?: TResumo | null;
}

export interface ModalVendaState {
    show: boolean;
    venda: RelatorioItem | null;
}

export interface VendaPreparada {
    original: RelatorioItem;
    possuiDesconto: boolean;
    totalFormatado: string;
    descontoFormatado: string;
    exibicaoData: string;
    clienteNome: string | null;
    responsavel: string | null;
}

export type VendaModalData = Venda | null;
