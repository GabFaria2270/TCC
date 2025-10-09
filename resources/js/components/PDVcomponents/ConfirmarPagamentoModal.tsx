import type { Cliente } from '../../pages/gerenciamento/Clientes';
import ModalPortal from '../common/ModalPortal';

interface Props {
    cliente: Cliente;
    fechar: () => void;
    confirmar: () => void;
}

export default function ConfirmarPagamentoModal({ cliente, fechar, confirmar }: Props) {
    if (!cliente) return null;
    return (
        <ModalPortal>
            <div className="modal-backdrop fade show" onClick={fechar}></div>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content p-4 text-center">
                        <div className="modal-body">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 1.2s linear infinite' }}>
                                <i className="bi bi-wallet2 text-warning wallet-animated"></i>
                            </div>
                            <h5 className="mb-3">Tem certeza que deseja pagar (deletar) a conta fiada deste cliente?</h5>
                            <p className="mb-4">
                                Esta ação é <strong>irreversível</strong>! O saldo da conta fiada será zerado e o histórico removido.
                            </p>
                            <div className="d-flex justify-content-center gap-3">
                                <button className="btn btn-secondary" onClick={fechar}>
                                    Cancelar
                                </button>
                                <button className="btn btn-danger" onClick={confirmar}>
                                    <i className="bi bi-check-circle me-2"></i>
                                    Sim, pagar conta fiada
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                {`
          @keyframes spin {
            0% { transform: rotate(-10deg);}
            50% { transform: rotate(10deg);}
            100% { transform: rotate(-10deg);}
          }
        `}
            </style>
        </ModalPortal>
    );
}
