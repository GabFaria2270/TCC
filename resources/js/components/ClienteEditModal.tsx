import React from 'react';

interface ClienteEditModalProps {
  show: boolean;
  cliente: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClienteEditModal({ show, cliente, onClose, onSuccess }: ClienteEditModalProps) {
  if (!show) return null;
  return (
    <div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar Cliente</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar modal"></button>
            </div>
            <form>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="nome" className="form-label">Nome *</label>
                    <input id="nome" className="form-control " required type="text" value={cliente?.nome || ''} onChange={() => {}} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">E-mail *</label>
                    <input id="email" className="form-control " required type="email" value={cliente?.email || ''} onChange={() => {}} />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="telefone" className="form-label">Telefone</label>
                    <input id="telefone" className="form-control " placeholder="(00) 00000-0000" type="tel" value={cliente?.telefone_formatado || cliente?.telefone || ''} onChange={() => {}} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="descricao" className="form-label">Descrição da Conta</label>
                    <input id="descricao" className="form-control " type="text" value={cliente?.conta_fiada?.descricao || ''} onChange={() => {}} />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="saldo_inicial" className="form-label">Saldo da Conta Fiada</label>
                    <input id="saldo_inicial" className="form-control " type="text" value={cliente?.conta_fiada?.saldo || ''} onChange={() => {}} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-check-lg me-2"></i>Atualizar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
