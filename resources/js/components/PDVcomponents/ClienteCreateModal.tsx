import type { Cliente } from '../../pages/gerenciamento/Clientes';
import ModalPortal from '../common/ModalPortal';
import ClienteForm from './ClienteForm';

interface ClienteCreateModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess: (cliente?: Cliente) => void; // ✅ Tornar cliente opcional para compatibilidade
    carrinhoItens?: any[];
}

export default function ClienteCreateModal({ show, onClose, onSuccess, carrinhoItens = [] }: ClienteCreateModalProps) {
    if (!show) return null;

    return (
        <ModalPortal>
            <div className="modal-backdrop fade show" onClick={onClose}></div>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="bi bi-person-plus me-2"></i>
                                Cadastrar Cliente
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar modal"></button>
                        </div>
                        <ClienteForm
                            modo="create"
                            onClose={onClose}
                            onSuccess={onSuccess} // ✅ Agora é compatível
                            carrinhoItens={carrinhoItens}
                        />
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
