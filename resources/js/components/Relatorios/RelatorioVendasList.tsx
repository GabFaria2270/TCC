import FormaPagamentoBadge from '@/components/Relatorios/FormaPagamentoBadge';
import PaginationControls from '@/components/Relatorios/PaginationControls';
import StatusBadge from '@/components/Relatorios/StatusBadge';
import type { PaginacaoMeta, RelatorioItem, VendaPreparada } from '@/types/gerenciamento/Relatorio';

interface Props {
    isDesktop: boolean;
    vendasPreparadas: VendaPreparada[];
    erro: string | null;
    loading: boolean;
    paginacao: PaginacaoMeta | null;
    onPaginar: (page: number) => void;
    onAbrirVenda: (venda: RelatorioItem) => void;
    totalFallback: number;
}

export default function RelatorioVendasList({
    isDesktop,
    vendasPreparadas,
    erro,
    loading,
    paginacao,
    onPaginar,
    onAbrirVenda,
    totalFallback,
}: Props) {
    const total = paginacao?.total ?? totalFallback;

    if (isDesktop) {
        return (
            <div className="card fade-in elemento-relatorio-3 border-0 shadow-sm">
                <div className="card-header bg-body">
                    <h5 className="mb-0">
                        <i className="bi bi-receipt-cutoff me-2"></i>
                        Histórico ({total} vendas)
                    </h5>
                </div>
                <div className="table-responsive scroll-shadow">
                    <table className="table-hover vendas-table data-table mb-0 table align-middle">
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th>Cliente</th>
                                <th>Total</th>
                                <th>Pagamento</th>
                                <th>Status</th>
                                <th>Responsável</th>
                                <th className="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {erro && (
                                <tr>
                                    <td colSpan={7} className="text-danger text-center">
                                        {erro}
                                    </td>
                                </tr>
                            )}
                            {!erro && vendasPreparadas.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={7} className="estado-vazio p-0">
                                        <div className="text-muted p-5 text-center">
                                            <i className="bi bi-receipt display-4 d-block mb-3"></i>
                                            <h5 className="mb-0">Nenhuma venda encontrada</h5>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!erro &&
                                vendasPreparadas.map(({ original, possuiDesconto, totalFormatado, descontoFormatado, exibicaoData, clienteNome, responsavel }) => (
                                    <tr key={original.id}>
                                        <td data-label="Data/Hora">{exibicaoData}</td>
                                        <td data-label="Cliente">
                                            {clienteNome ? (
                                                <div className="cliente-nome">{clienteNome}</div>
                                            ) : (
                                                <span className="text-muted">Venda avulsa</span>
                                            )}
                                        </td>
                                        <td data-label="Total">
                                            <strong className="text-success">{totalFormatado}</strong>
                                            {possuiDesconto && <small className="d-block text-muted">Desconto: {descontoFormatado}</small>}
                                        </td>
                                        <td data-label="Pagamento">
                                            <FormaPagamentoBadge tipo={original.forma_pagamento} />
                                        </td>
                                        <td data-label="Status">
                                            <StatusBadge status={original.status} />
                                        </td>
                                        <td data-label="Responsável">{responsavel ?? <span className="text-muted">Não informado</span>}</td>
                                        <td className="text-center" data-label="Ações">
                                            <button
                                                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
                                                onClick={() => onAbrirVenda(original)}
                                                title="Ver observação completa"
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
                <PaginationControls meta={paginacao} onChange={onPaginar} disabled={loading} />
            </div>
        );
    }

    return (
        <div className="card fade-in elemento-relatorio-3 border-0 shadow-sm">
            <div className="card-header bg-body">
                <h5 className="mb-0">
                    <i className="bi bi-receipt-cutoff me-2"></i>
                    Histórico ({total} vendas)
                </h5>
            </div>
            <div className="d-flex flex-column gap-3 p-3">
                {erro && <div className="alert alert-danger mb-0">{erro}</div>}
                {!erro && vendasPreparadas.length === 0 && !loading && (
                    <div className="text-muted py-5 text-center">
                        <i className="bi bi-receipt display-4 d-block mb-3"></i>
                        <h5 className="mb-0">Nenhuma venda encontrada</h5>
                    </div>
                )}
                {!erro &&
                    vendasPreparadas.map(({ original, possuiDesconto, totalFormatado, descontoFormatado, exibicaoData, clienteNome, responsavel }) => (
                        <div key={original.id} className="card border-0 shadow-sm">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2 gap-3">
                                    <div>
                                        <div className="small text-secondary mb-1">
                                            <i className="bi bi-clock me-2" aria-hidden="true"></i>
                                            {exibicaoData}
                                        </div>
                                        <h6 className="fw-semibold text-break mb-0">{clienteNome ?? 'Venda avulsa'}</h6>
                                    </div>
                                    <span className={`badge ${possuiDesconto ? 'text-bg-danger' : 'text-bg-success'} fs-6 flex-shrink-0`}>
                                        {totalFormatado}
                                    </span>
                                </div>
                                {possuiDesconto && <div className="small text-muted mb-2">Desconto aplicado: {descontoFormatado}</div>}
                                <div className="d-flex align-items-center mb-2 flex-wrap gap-2">
                                    <FormaPagamentoBadge tipo={original.forma_pagamento} />
                                    <StatusBadge status={original.status} />
                                </div>
                                <div className="small text-secondary mb-1">
                                    <i className="bi bi-person me-2" aria-hidden="true"></i>
                                    {responsavel ?? 'Responsável não informado'}
                                </div>
                                {original.observacoes && (
                                    <div className="small text-secondary text-break mb-2">
                                        <i className="bi bi-chat-text me-2" aria-hidden="true"></i>
                                        {original.observacoes.length > 120 ? `${original.observacoes.slice(0, 117)}...` : original.observacoes}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className="btn btn-outline-primary w-100"
                                    onClick={() => onAbrirVenda(original)}
                                    title="Ver observação completa"
                                >
                                    <i className="bi bi-eye me-2"></i>
                                    Ver detalhes
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
            <PaginationControls meta={paginacao} onChange={onPaginar} disabled={loading} />
        </div>
    );
}
