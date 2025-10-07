import React from 'react';
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

interface VendasListProps {
    clientes: Cliente[];
    filtroStatus: string;
    filtroCliente: string;
    setFiltroStatus: (status: string) => void;
    setFiltroCliente: (cliente: string) => void;
    vendasFiltradas: Venda[];
    abrirDetalhes: (venda: Venda) => void;
    limparFiltros: () => void;
}

export default function VendasList({
    clientes,
    filtroStatus,
    filtroCliente,
    setFiltroStatus,
    setFiltroCliente,
    vendasFiltradas,
    abrirDetalhes,
    limparFiltros,
}: VendasListProps) {
    return (
        <div className="row fade-in">
            <div className="col-12">
                {/* Filtros */}
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
                            <div className="col-md-4">
                                <label className="form-label">Cliente</label>
                                <select className="form-select" value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)}>
                                    <option value="">Todos os clientes</option>
                                    {clientes.map((cliente) => (
                                        <option key={cliente.id} value={cliente.id}>
                                            {cliente.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4 d-flex align-items-end">
                                <button
                                    className="btn btn-outline-secondary btn-limpar-filtros me-2"
                                    onClick={limparFiltros}
                                >
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
                            <table className="table-hover vendas-table mb-0 table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
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
                                            <td colSpan={7} className="estado-vazio">
                                                <i className="bi bi-receipt display-6 d-block mb-2"></i>
                                                Nenhuma venda encontrada
                                            </td>
                                        </tr>
                                    ) : (
                                        vendasFiltradas.map((venda) => (
                                            <tr key={venda.id}>
                                                <td>
                                                    <span className="badge bg-secondary venda-id">#{venda.id}</span>
                                                </td>
                                                <td>
                                                    {new Date(venda.created_at).toLocaleString('pt-BR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                                <td>
                                                    {venda.cliente ? (
                                                        <div className="cliente-info">
                                                            <div className="cliente-nome">{venda.cliente.nome}</div>
                                                            <small className="cliente-email">{venda.cliente.email}</small>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">Venda avulsa</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <strong className="text-success">{venda.total_formatado}</strong>
                                                    {venda.desconto > 0 && (
                                                        <small className="d-block text-muted">
                                                            Desconto: R$ {venda.desconto.toFixed(2).replace('.', ',')}
                                                        </small>
                                                    )}
                                                </td>
                                                {/* Coluna Forma de Pagamento */}
                                                <td>
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
                                                <td>
                                                    <span
                                                        className={`badge ${
                                                            venda.status === 'concluida'
                                                                ? 'bg-success'
                                                                : venda.status === 'conta_fiada'
                                                                  ? 'bg-info'
                                                                  : venda.status === 'cancelada'
                                                                    ? 'bg-danger'
                                                                    : 'bg-warning'
                                                        }`}
                                                    >
                                                        {venda.status === 'concluida' && '✅ Concluída'}
                                                        {venda.status === 'conta_fiada' && '📋 Fiado'}
                                                        {venda.status === 'cancelada' && '❌ Cancelada'}
                                                        {venda.status === 'pendente' && '⏳ Pendente'}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => abrirDetalhes(venda)}
                                                        title="Ver detalhes"
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
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
