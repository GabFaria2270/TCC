import ClienteCombobox from '@/components/PDVcomponents/ClienteCombobox';
import { useEffect, useState } from 'react';

import type { Venda } from '../../types';

type VendasListProps = {
    clientes: { id: number; nome: string; email?: string }[];
    filtroStatus: string;
    filtroCliente: string;
    filtroClienteTexto: string;
    setFiltroStatus: (v: string) => void;
    setFiltroCliente: (v: string) => void;
    setFiltroClienteTexto: (v: string) => void;
    vendasFiltradas: Venda[]; // Tipo mais forte
    abrirDetalhes: (venda: Venda) => void;
    limparFiltros: () => void;
};

// --- HOOK CUSTOMIZADO ---

/**
 * Hook de React para detectar media queries (tamanho da tela).
 * Retorna 'true' se a query corresponder (ex: se for desktop).
 */
function useMediaQuery(query: string): boolean {
    const getMatches = (q: string): boolean => {
        if (typeof window === 'undefined') {
            return false;
        }
        return window.matchMedia(q).matches;
    };

    const [matches, setMatches] = useState<boolean>(() => getMatches(query));

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };
        setMatches(mediaQueryList.matches);

        try {
            mediaQueryList.addEventListener('change', listener);
        } catch (e) {
            mediaQueryList.addListener(listener);
        }

        return () => {
            try {
                mediaQueryList.removeEventListener('change', listener);
            } catch (e) {
                mediaQueryList.removeListener(listener);
            }
        };
    }, [query]);

    return matches;
}

// --- HELPERS (Funções Auxiliares) ---

/**
 * Formata a data e hora.
 */
const formatarData = (dataIso: string) => {
    if (!dataIso) return 'Data inválida';
    try {
        return new Date(dataIso).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (e) {
        return 'Data inválida';
    }
};

/**
 * Retorna o badge de Status formatado.
 */
const getStatusBadge = (statusVenda: string) => {
    // Normaliza: 'conta_fiada' => 'pendente'
    const status = statusVenda === 'conta_fiada' ? 'pendente' : statusVenda;

    const badgeClass =
        status === 'concluida'
            ? 'text-bg-success'
            : status === 'pendente'
              ? 'text-bg-warning'
              : status === 'cancelada'
                ? 'text-bg-danger'
                : 'text-bg-info';

    const statusLabel =
        status === 'concluida' ? '✅ Concluída' : status === 'pendente' ? '⏳ Pendente' : status === 'cancelada' ? '❌ Cancelada' : status || '—';

    return <span className={`badge ${badgeClass}`}>{statusLabel}</span>;
};

/**
 * Retorna o badge de Pagamento formatado.
 */
const getPagamentoBadge = (forma: string) => {
    switch (forma) {
        case 'dinheiro':
            return (
                <span className="badge text-bg-success">
                    <i className="bi bi-cash-coin me-1"></i>
                    Dinheiro
                </span>
            );
        case 'pix':
            return (
                <span className="badge text-bg-info">
                    <i className="bi bi-qr-code me-1"></i>
                    PIX
                </span>
            );
        case 'debito':
        case 'cartao_debito':
            return (
                <span className="badge text-bg-primary">
                    <i className="bi bi-credit-card-2-front me-1"></i>
                    Débito
                </span>
            );
        case 'credito':
        case 'cartao_credito':
            return (
                <span className="badge text-bg-warning text-dark">
                    <i className="bi bi-credit-card me-1"></i>
                    Crédito
                </span>
            );
        case 'conta_fiada':
        case 'fiado':
            return (
                <span className="badge text-bg-secondary">
                    <i className="bi bi-wallet2 me-1"></i>
                    Conta Fiada
                </span>
            );
        default:
            return (
                <span className="badge text-bg-light text-dark">
                    <i className="bi bi-question-circle me-1"></i>
                    {forma || 'Não informado'}
                </span>
            );
    }
};

/**
 * Renderiza o estado vazio para tabela ou cards.
 */
const renderEmptyState = (isTable: boolean = false) => {
    const content = (
        <div className="text-muted p-5 text-center">
            <i className="bi bi-receipt display-4 d-block mb-3"></i>
            <h5>Nenhuma venda encontrada</h5>
        </div>
    );

    if (isTable) {
        return (
            <tr>
                <td colSpan={6} className="estado-vazio" style={{ padding: 0 }}>
                    {content}
                </td>
            </tr>
        );
    }
    return content;
};

// --- SUB-COMPONENTES DE RENDERIZAÇÃO ---

/**
 * Componente da Tabela (Desktop)
 */
const TabelaDesktop = ({ vendasFiltradas, abrirDetalhes }: VendasListProps) => (
    <div className="card fade-in">
        <div className="card-header bg-body">
            <h5 className="mb-0">
                <i className="bi bi-receipt-cutoff me-2"></i>
                Histórico ({vendasFiltradas.length} vendas)
            </h5>
        </div>
        <div className="card-body p-0">
            <div className="table-responsive scroll-shadow">
                <table className="table-hover vendas-table data-table mb-0 table align-middle">
                    <thead>
                        <tr>
                            <th>Data/Hora</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Pagamento</th>
                            <th>Status</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendasFiltradas.length === 0
                            ? renderEmptyState(true)
                            : vendasFiltradas.map((venda) => (
                                  <tr key={venda.id}>
                                      <td data-label="Data/Hora">{formatarData(venda.created_at)}</td>
                                      <td data-label="Cliente">
                                          {venda.cliente ? (
                                              <div className="cliente-nome">{venda.cliente.nome}</div>
                                          ) : (
                                              <span className="text-muted">Venda avulsa</span>
                                          )}
                                      </td>
                                      <td data-label="Total">
                                          <strong className="text-success">{venda.total_formatado}</strong>
                                          {venda.desconto > 0 && (
                                              <small className="d-block text-muted">Desconto: R$ {venda.desconto.toFixed(2).replace('.', ',')}</small>
                                          )}
                                      </td>
                                      <td data-label="Pagamento">{getPagamentoBadge(venda.forma_pagamento)}</td>
                                      <td data-label="Status">{getStatusBadge(venda.status)}</td>
                                      <td className="text-center" data-label="Ações">
                                          <button
                                              className="btn btn-sm btn-outline-primary"
                                              onClick={() => abrirDetalhes(venda)}
                                              title="Ver detalhes"
                                          >
                                              <i className="bi bi-eye"></i>
                                              <span className="ms-2">Abrir</span>
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

/**
 * Componente dos Cards (Mobile)
 */
const CardsMobile = ({ vendasFiltradas, abrirDetalhes }: VendasListProps) => (
    <div className="fade-in">
        <h5 className="mb-3">
            <i className="bi bi-receipt-cutoff me-2"></i>
            Histórico ({vendasFiltradas.length} vendas)
        </h5>

        {vendasFiltradas.length === 0
            ? renderEmptyState(false)
            : vendasFiltradas.map((venda) => (
                  <div key={venda.id} className="card mb-2 shadow-sm">
                      <div className="card-body">
                          {/* Usamos uma Definition List (dl) com grid (row) para o layout de key-value */}
                          <dl className="row mb-0" style={{ fontSize: '0.95rem' }}>
                              <dt className="text-muted col-4">Data/Hora</dt>
                              <dd className="col-8">{formatarData(venda.created_at)}</dd>

                              <dt className="text-muted col-4">Cliente</dt>
                              <dd className="fw-bold col-8">{venda.cliente ? venda.cliente.nome : 'Venda avulsa'}</dd>

                              <dt className="text-muted col-4">Total</dt>
                              <dd className="fw-bold text-success fs-6 col-8">{venda.total_formatado}</dd>

                              <dt className="text-muted col-4">Pagamento</dt>
                              <dd className="col-8">{getPagamentoBadge(venda.forma_pagamento)}</dd>

                              <dt className="text-muted col-4">Status</dt>
                              <dd className="col-8">{getStatusBadge(venda.status)}</dd>

                              <dt className="text-muted col-4">Ações</dt>
                              <dd className="col-8">
                                  <button className="btn btn-sm btn-outline-primary" onClick={() => abrirDetalhes(venda)}>
                                      <i className="bi bi-eye"></i>
                                      <span className="ms-2">Abrir</span>
                                  </button>
                              </dd>
                          </dl>
                      </div>
                  </div>
              ))}
    </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function VendasList(props: VendasListProps) {
    // Usamos o breakpoint 'md' (768px) do Bootstrap
    const isDesktop = useMediaQuery('(min-width: 768px)');

    // Separa os props dos filtros (usados aqui)
    const { clientes, filtroStatus, filtroCliente, filtroClienteTexto, setFiltroStatus, setFiltroCliente, setFiltroClienteTexto, limparFiltros } =
        props;

    return (
        <div className="row fade-in">
            <div className="col-12">
                {/* --- 1. FILTROS (Comum a ambos) --- */}
                <div className="card filtros-card mb-3">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Status</label>
                                <select className="form-select" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                                    <option value="">Todos os status</option>
                                    <option value="concluida">✅ Concluída</option>
                                    <option value="conta_fiada">📋 Conta Fiada</option>
                                    <option value="cancelada">❌ Cancelada</option>
                                </select>
                            </div>

                            <div className="col-md-5">
                                <ClienteCombobox
                                    clientes={clientes}
                                    valueId={filtroCliente}
                                    query={filtroClienteTexto}
                                    setValueId={setFiltroCliente}
                                    setQuery={setFiltroClienteTexto}
                                    label="Cliente (digite e selecione)"
                                    placeholder="Ex.: Maria Silva"
                                />
                            </div>

                            <div className="col-md-3 mb-md-0 d-flex justify-content-end align-items-end col-12 mb-2">
                                <button
                                    className="btn btn-outline-secondary btn-limpar-filtros d-flex align-items-center w-md-auto w-100 gap-2 text-nowrap"
                                    onClick={limparFiltros}
                                >
                                    <i className="bi bi-arrow-clockwise"></i>
                                    <span>Limpar Filtros</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 2. CONTEÚDO CONDICIONAL (Tabela ou Cards) --- */}
                {isDesktop ? <TabelaDesktop {...props} /> : <CardsMobile {...props} />}
            </div>
        </div>
    );
}
