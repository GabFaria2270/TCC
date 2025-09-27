import React, { useState, useEffect } from 'react';

interface ClienteEditModalProps {
  show: boolean;
  cliente: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClienteEditModal({ show, cliente, onClose, onSuccess }: ClienteEditModalProps) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    descricao: '',
    saldo_inicial: '',
  });

  // Preenche os campos ao abrir o modal
  useEffect(() => {
    if (show && cliente) {
      setForm({
        nome: cliente.nome || '',
        email: cliente.email || '',
        telefone: cliente.telefone_formatado || cliente.telefone || '',
        descricao: cliente.conta_fiada?.descricao || '',
        saldo_inicial: cliente.conta_fiada?.saldo?.toString() || '',
      });
    }
  }, [show, cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  return !show ? null : (
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
                    <input id="nome" className="form-control" required type="text" value={form.nome} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">E-mail *</label>
                    <input id="email" className="form-control" required type="email" value={form.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="telefone" className="form-label">Telefone</label>
                    <input id="telefone" className="form-control" placeholder="(00) 00000-0000" type="tel" value={form.telefone} onChange={handleChange} />
                  </div>
                  <div className="col-md-6 mb-3 campo-saldo">
                    <label htmlFor="saldo_inicial" className="form-label">Saldo da Conta Fiada</label>
                    <div className="input-group">
                      <span className="input-group-text">R$</span>
                      <input
                        id="saldo_inicial"
                        className="form-control"
                        type="text"
                        value={form.saldo_inicial}
                        onChange={handleChange}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 mb-3">
                    <label htmlFor="descricao" className="form-label">
                      Descrição da Conta <span className="text-muted">(opcional)</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="descricao"
                      rows={3}
                      value={form.descricao}
                      onChange={handleChange}
                      placeholder="Ex: Compras do mês, Produtos diversos, etc..."
                      maxLength={500}
                    />
                    <small className="form-text text-muted">
                      Descreva o que foi comprado ou o motivo do saldo inicial.
                    </small>
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
