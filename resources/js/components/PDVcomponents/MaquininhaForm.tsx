import React, { useState } from 'react';
import '../../../css/gerenciamento/maquininhas-modal.css';

const modelosDisponiveis = ['Cielo', 'Stone', 'Rede', 'PagSeguro', 'Getnet'];

function getMaquininhaIcon(modelo: string) {
  switch (modelo) {
    case 'PagSeguro':
      return <img src="/img/pagseguro-logo.png" alt="PagSeguro" className="maquininha-icon-preview" />;
    case 'Cielo':
      return <img src="/img/cielo.png" alt="Cielo" className="maquininha-icon-preview" />;
    case 'Stone':
      return <img src="/img/stone.png" alt="Stone" className="maquininha-icon-preview" />;
    case 'Rede':
      return <img src="/img/rede.png" alt="Rede" className="maquininha-icon-preview" />;
    case 'Getnet':
      return <img src="/img/getnet.png" alt="Getnet" className="maquininha-icon-preview" />;
    default:
      return null;
  }
}

interface MaquininhaFormProps {
  initialData?: {
    nome: string;
    modelo: string;
    status: 'ativa' | 'inativa';
  };
  onSave: (data: any) => void;
  onCancel: () => void;
  showModal: boolean;
}

export default function MaquininhaForm({ initialData, onSave, onCancel, showModal }: MaquininhaFormProps) {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [modelo, setModelo] = useState(initialData?.modelo || modelosDisponiveis[0]);
  const [status, setStatus] = useState(initialData?.status || 'ativa');
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    if (!nome) {
      setErro('Preencha todos os campos obrigatórios.');
      setIsLoading(false);
      return;
    }
    onSave({ nome, modelo, status });
    setIsLoading(false);
  }

  if (!showModal) return null;

  return (
    <div className="maquininha-modal-bg">
      <div className="maquininha-modal">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem' }}>
            {getMaquininhaIcon(modelo)}
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="nome" className="form-label">Nome *</label>
              <input
                id="nome"
                type="text"
                className="form-control"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                autoFocus
                disabled={isLoading}
              />
            </div>
            {/* Campo de modelo só aparece no cadastro, não na edição */}
            {!initialData && (
              <div className="col-md-6 mb-3">
                <label htmlFor="modelo" className="form-label">Modelo *</label>
                <select
                  id="modelo"
                  className="form-select"
                  value={modelo}
                  onChange={e => setModelo(e.target.value)}
                  disabled={isLoading}
                >
                  {modelosDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                id="status"
                className="form-select"
                value={status}
                onChange={e => setStatus(e.target.value as 'ativa' | 'inativa')}
                disabled={isLoading}
              >
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
              </select>
            </div>
          </div>
          {erro && <div className="alert alert-danger mt-2">{erro}</div>}
          <div className="modal-footer d-flex gap-3 justify-content-end">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {initialData ? 'Salvando...' : 'Cadastrando...'}
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  {initialData ? 'Salvar Alterações' : 'Salvar Maquininha'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
