import React, { useState } from 'react';

interface HistoricoContaFiadaProps {
  className?: string;
}

interface VendaFiada {
  id: number;
  cliente: string;
  valor: number;
  data: string;
  status: 'pendente' | 'pago';
}

// Mock data - posteriormente será substituído por dados reais do backend
const vendasFiadas: VendaFiada[] = [
  {
    id: 1,
    cliente: "João Silva",
    valor: 150.50,
    data: "2024-01-15",
    status: "pendente"
  },
  {
    id: 2,
    cliente: "Maria Santos",
    valor: 89.90,
    data: "2024-01-14",
    status: "pago"
  },
  {
    id: 3,
    cliente: "Pedro Oliveira",
    valor: 245.00,
    data: "2024-01-13",
    status: "pendente"
  },
];

export default function HistoricoContaFiada({ className = "" }: HistoricoContaFiadaProps) {
  const [showModal, setShowModal] = useState(false);

  const totalPendente = vendasFiadas
    .filter(venda => venda.status === 'pendente')
    .reduce((total, venda) => total + venda.valor, 0);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <>
      <button 
        className={`btn-historico-fiada ${className}`}
        onClick={() => setShowModal(true)}
        title="Ver histórico de contas fiadas"
      >
        <i className="bi bi-wallet2"></i>
        Histórico Fiadas
        <span className="badge-total">{formatarMoeda(totalPendente)}</span>
      </button>

      {/* Modal de Histórico */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-wallet2 me-2"></i>
                    Histórico de Contas Fiadas
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Resumo */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="card border-warning">
                        <div className="card-body text-center">
                          <h6 className="card-title text-warning">
                            <i className="bi bi-clock me-2"></i>
                            Pendentes
                          </h6>
                          <h4 className="text-warning mb-0">
                            {formatarMoeda(totalPendente)}
                          </h4>
                          <small className="text-muted">
                            {vendasFiadas.filter(v => v.status === 'pendente').length} vendas
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border-success">
                        <div className="card-body text-center">
                          <h6 className="card-title text-success">
                            <i className="bi bi-check-circle me-2"></i>
                            Pagas
                          </h6>
                          <h4 className="text-success mb-0">
                            {formatarMoeda(
                              vendasFiadas
                                .filter(v => v.status === 'pago')
                                .reduce((total, venda) => total + venda.valor, 0)
                            )}
                          </h4>
                          <small className="text-muted">
                            {vendasFiadas.filter(v => v.status === 'pago').length} vendas
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Vendas */}
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Cliente</th>
                          <th>Valor</th>
                          <th>Data</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendasFiadas.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-4">
                              <i className="bi bi-wallet2 display-6 d-block mb-2 text-muted"></i>
                              Nenhuma venda fiada encontrada
                            </td>
                          </tr>
                        ) : (
                          vendasFiadas.map(venda => (
                            <tr key={venda.id}>
                              <td>
                                <span className="badge bg-secondary">#{venda.id}</span>
                              </td>
                              <td>
                                <strong>{venda.cliente}</strong>
                              </td>
                              <td>
                                <strong className="text-success">
                                  {formatarMoeda(venda.valor)}
                                </strong>
                              </td>
                              <td>
                                {new Date(venda.data).toLocaleDateString('pt-BR')}
                              </td>
                              <td>
                                <span 
                                  className={`badge ${
                                    venda.status === 'pendente' 
                                      ? 'bg-warning text-dark' 
                                      : 'bg-success'
                                  }`}
                                >
                                  {venda.status === 'pendente' ? (
                                    <>
                                      <i className="bi bi-clock me-1"></i>
                                      Pendente
                                    </>
                                  ) : (
                                    <>
                                      <i className="bi bi-check-circle me-1"></i>
                                      Pago
                                    </>
                                  )}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
