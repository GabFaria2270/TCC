import { useEffect, useState } from 'react';
import ModalPortal from '../common/ModalPortal';

interface HistoricoContaFiadaProps {
    className?: string;
    initialData?: VendaFiada[]; // ✅ recebe pré-carregado
}

type VendaFiada = {
    id: number;
    cliente: string;
    valor: number;
    data: string; // ISO
    status: 'pendente' | 'pago';
};

export default function HistoricoContaFiada({ className = '', initialData = [] }: HistoricoContaFiadaProps) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [vendasFiadas, setVendasFiadas] = useState<VendaFiada[]>(initialData);

    // ✅ atualiza quando a página já envia os dados
    useEffect(() => {
        setVendasFiadas(initialData || []);
    }, [initialData]);

    // (opcional) atualizar do backend quando abrir, se não houver dados
    useEffect(() => {
        if (!showModal) return;
        if (vendasFiadas.length > 0) return; // já tem dados

        let abort = false;
        (async () => {
            try {
                setLoading(true);
                const resp = await fetch('/gerenciamento/fiado/historico', {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                if (!resp.ok) throw new Error('Falha ao carregar histórico');
                const json = await resp.json();
                if (!abort) setVendasFiadas(json.vendas_fiadas || []);
            } catch {
                if (!abort) setVendasFiadas([]);
            } finally {
                if (!abort) setLoading(false);
            }
        })();

        return () => {
            abort = true;
        };
    }, [showModal, vendasFiadas.length]);

    const formatarMoeda = (valor: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

    const totalPendente = vendasFiadas.filter((v) => v.status === 'pendente').reduce((total, v) => total + (v.valor || 0), 0);

    return (
        <>
            <button className={`btn-historico-fiada ${className}`} onClick={() => setShowModal(true)} title="Ver histórico de contas fiadas">
                <i className="bi bi-wallet2"></i>
                Histórico Fiadas
                <span className="badge-total">{formatarMoeda(totalPendente)}</span>
            </button>

            {showModal && (
                <ModalPortal>
                    <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div>
                    <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="bi bi-wallet2 me-2"></i>
                                        Histórico de Contas Fiadas
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>

                                <div className="modal-body">
                                    {loading && (
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="spinner-border me-2" role="status" />
                                            Carregando…
                                        </div>
                                    )}

                                    {/* Resumo */}
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <div className="card border-warning">
                                                <div className="card-body text-center">
                                                    <h6 className="card-title text-warning">
                                                        <i className="bi bi-clock me-2"></i>
                                                        Pendentes
                                                    </h6>
                                                    <h4 className="text-warning mb-0">{formatarMoeda(totalPendente)}</h4>
                                                    <small className="text-muted">
                                                        {vendasFiadas.filter((v) => v.status === 'pendente').length} vendas
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
                                                            vendasFiadas.filter((v) => v.status === 'pago').reduce((tot, v) => tot + v.valor, 0),
                                                        )}
                                                    </h4>
                                                    <small className="text-muted">
                                                        {vendasFiadas.filter((v) => v.status === 'pago').length} vendas
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lista */}
                                    <div className="table-responsive">
                                        <table className="table-hover table">
                                            <thead>
                                                <tr>
                                                    <th>Cliente</th>
                                                    <th>Valor</th>
                                                    <th>Data</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {vendasFiadas.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="text-muted py-4 text-center">
                                                            Nenhuma venda fiada encontrada
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    vendasFiadas.map((venda) => (
                                                        <tr key={venda.id}>
                                                            <td>
                                                                <strong>{venda.cliente}</strong>
                                                            </td>
                                                            <td>
                                                                <strong className="text-success">{formatarMoeda(venda.valor)}</strong>
                                                            </td>
                                                            <td>{new Date(venda.data).toLocaleString('pt-BR')}</td>
                                                            <td>
                                                                <span
                                                                    className={`badge ${venda.status === 'pendente' ? 'text-bg-warning' : 'text-bg-success'}`}
                                                                >
                                                                    {venda.status === 'pendente' ? 'Pendente' : 'Pago'}
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
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </>
    );
}
