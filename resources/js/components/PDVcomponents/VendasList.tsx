import ClienteCombobox from '@/components/PDVcomponents/ClienteCombobox';
import type { Cliente } from '../../types';

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

type VendasListProps = {
    clientes: { id: number; nome: string; email?: string }[];
    filtroStatus: string;
    filtroCliente: string;
    filtroClienteTexto: string; // <- novo
    setFiltroStatus: (v: string) => void;
    setFiltroCliente: (v: string) => void;
    setFiltroClienteTexto: (v: string) => void; // <- novo
    vendasFiltradas: any[];
    abrirDetalhes: (venda: any) => void;
    limparFiltros: () => void;
};

export default function VendasList({
    clientes,
    filtroStatus,
    filtroCliente,
    filtroClienteTexto,
    setFiltroStatus,
    setFiltroCliente,
    setFiltroClienteTexto,
    vendasFiltradas,
    abrirDetalhes,
    limparFiltros,
}: VendasListProps) {
    return (
        <div className="row fade-in">
            <div className="col-12">
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
                                {/* ✅ Combobox único (pesquisa + seleção) */}
                                <ClienteCombobox
                                    clientes={clientes}
                                    valueId={filtroCliente}
                                    query={filtroClienteTexto}
                                    setValueId={setFiltroCliente}
                                    setQuery={setFiltroClienteTexto}
                                    label="Cliente (digite e selecione)"
                                    placeholder="Ex.: Maria Silva ou maria@email.com"
                                />
                            </div>

                            <div className="col-md-3 d-flex align-items-end">
                                <button className="btn btn-outline-secondary btn-limpar-filtros me-2" onClick={limparFiltros}>
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    Limpar Filtros
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabela de Vendas */}
                <div className="card">
                    <div className="card-header bg-body">
                        <h5 className="mb-0">
                            <i className="bi bi-receipt-cutoff me-2"></i>
                            Histórico ({vendasFiltradas.length} vendas)
                        </h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive scroll-shadow">
                            <table className="table-hover vendas-table data-table mb-0 table">
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
                                    {vendasFiltradas.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="estado-vazio">
                                                <i className="bi bi-receipt display-6 d-block mb-2"></i>
                                                Nenhuma venda encontrada
                                            </td>
                                        </tr>
                                    ) : (
                                        vendasFiltradas.map((venda) => {
                                            // Normaliza: 'conta_fiada' => 'pendente'
                                            const status = venda.status === 'conta_fiada' ? 'pendente' : venda.status;
                                            const isCritical = status === 'pendente' || status === 'cancelada';

                                            const badgeClass =
                                                status === 'concluida'
                                                    ? 'bg-success'
                                                    : status === 'pendente'
                                                      ? 'bg-warning'
                                                      : status === 'cancelada'
                                                        ? 'bg-danger'
                                                        : 'bg-info';

                                            const statusLabel =
                                                status === 'concluida'
                                                    ? '✅ Concluída'
                                                    : status === 'pendente'
                                                      ? '⏳ Pendente'
                                                      : status === 'cancelada'
                                                        ? '❌ Cancelada'
                                                        : status || '—';

                                            return (
                                                <tr key={venda.id}>
                                                    <td data-label="Data/Hora">
                                                        {new Date(venda.created_at).toLocaleString('pt-BR', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </td>
                                                    <td data-label="Cliente">
                                                        {venda.cliente ? (
                                                            <div className="cliente-info">
                                                                <div className="cliente-nome">{venda.cliente.nome}</div>
                                                                <small className="cliente-email">{venda.cliente.email}</small>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted">Venda avulsa</span>
                                                        )}
                                                    </td>
                                                    <td data-label="Total">
                                                        <strong className="text-success">{venda.total_formatado}</strong>
                                                        {venda.desconto > 0 && (
                                                            <small className="d-block text-muted">
                                                                Desconto: R$ {venda.desconto.toFixed(2).replace('.', ',')}
                                                            </small>
                                                        )}
                                                    </td>
                                                    {/* Coluna Forma de Pagamento */}
                                                    <td data-label="Pagamento">
                                                        {(() => {
                                                            switch (venda.forma_pagamento) {
                                                                case 'dinheiro':
                                                                    return (
                                                                        <span className="badge bg-success">
                                                                            <i className="bi bi-cash-coin me-1"></i>
                                                                            Dinheiro
                                                                        </span>
                                                                    );
                                                                case 'pix':
                                                                    return (
                                                                        <span className="badge bg-info">
                                                                            <i className="bi bi-qr-code me-1"></i>
                                                                            PIX
                                                                        </span>
                                                                    );
                                                                case 'debito':
                                                                case 'cartao_debito':
                                                                    return (
                                                                        <span className="badge bg-primary">
                                                                            <i className="bi bi-credit-card-2-front me-1"></i>
                                                                            Débito
                                                                        </span>
                                                                    );
                                                                case 'credito':
                                                                case 'cartao_credito':
                                                                    return (
                                                                        <span className="badge bg-warning">
                                                                            <i className="bi bi-credit-card me-1"></i>
                                                                            Crédito
                                                                        </span>
                                                                    );
                                                                case 'conta_fiada':
                                                                case 'fiado':
                                                                    return (
                                                                        <span className="badge bg-secondary">
                                                                            <i className="bi bi-wallet2 me-1"></i>
                                                                            Conta Fiada
                                                                        </span>
                                                                    );
                                                                default:
                                                                    return (
                                                                        <span className="badge bg-light text-dark">
                                                                            <i className="bi bi-question-circle me-1"></i>
                                                                            {venda.forma_pagamento || 'Não informado'}
                                                                        </span>
                                                                    );
                                                            }
                                                        })()}
                                                    </td>
                                                    <td data-label="Status">
                                                        <span className={`badge ${badgeClass}`}>{statusLabel}</span>
                                                    </td>
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
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
