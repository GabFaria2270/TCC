import type { Cliente } from '../../pages/gerenciamento/Clientes';
import ModalPortal from '../common/ModalPortal';
import ClienteForm from './ClienteForm';

interface ClienteEditModalProps {
    show: boolean;
    cliente: Cliente;
    onClose: () => void;
    onSuccess: (cliente?: Cliente) => void;
}

export default function ClienteEditModal({ show, cliente, onClose, onSuccess }: ClienteEditModalProps) {
    if (!show) return null;

    return (
        <ModalPortal>
            <div className="modal-backdrop fade show" onClick={onClose}></div>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="bi bi-pencil-square me-2"></i>
                                Editar Cliente
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar modal"></button>
                        </div>
                        <ClienteForm modo="edit" cliente={cliente} onClose={onClose} onSuccess={onSuccess} />
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
