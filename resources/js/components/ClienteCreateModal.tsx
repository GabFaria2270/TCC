import React from 'react';
import ClienteForm from './ClienteForm';

interface ClienteCreateModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClienteCreateModal({ show, onClose, onSuccess }: ClienteCreateModalProps) {
  if (!show) return null;
  return (
    <div>
      {/* Modal backdrop e estrutura visual igual ao ClienteModal */}
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-person-plus me-2"></i>
                Novo Cliente
              </h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar modal"></button>
            </div>
            <ClienteForm
              modo="create"
              onClose={onClose}
              onSuccess={onSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
