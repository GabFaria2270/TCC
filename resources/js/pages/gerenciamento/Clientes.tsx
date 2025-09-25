import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone_formatado?: string;
  conta_fiada: {
    saldo: number;
    saldo_formatado: string;
    descricao?: string; 
    status: string;
  };
  created_at: string;
}

interface ClienteFormData {
  nome: string;
  email: string;
  telefone: string;
  saldo_inicial: string;
  descricao: string;
  [key: string]: string; 
}

interface Props {
  clientes?: Cliente[];
  error?: string;
}

export default function Clientes({ clientes = [], error }: Props) {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);
  
  
  const { data, setData, post, put, processing, errors, reset } = useForm<ClienteFormData>({
    nome: '',
    email: '',
    telefone: '',
    saldo_inicial: '',
    descricao: '',
  });

  useEffect(() => { 
    h1Ref.current?.focus(); 
  }, []);


  const clientesArray = Array.isArray(clientes) ? clientes : [];
  const clientesFiltrados = clientesArray.filter(cliente =>
    cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
    cliente.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRefresh = () => {
    setLoading(true);
    router.get('/gerenciamento/clientes', {}, {
      onFinish: () => setLoading(false)
    });
  };


  const abrirModal = (modo: 'create' | 'edit', cliente?: Cliente) => {
    setModalMode(modo);
    setShowModal(true);
    reset();
    
    if (modo === 'edit' && cliente) {
      setClienteId(cliente.id);
      setData({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone_formatado || '',
        saldo_inicial: String(cliente.conta_fiada.saldo),
        descricao: '',
      });
    } else {
      setClienteId(null);
    }
    
    setTimeout(() => {
      const nomeInput = document.getElementById('nome');
      if (nomeInput) nomeInput.focus();
    }, 100);
  };

  
  const fecharModal = () => {
    setShowModal(false);
    reset();
  };

  const abrirDetalhesConta = (cliente: Cliente) => {
    setClienteDetalhes(cliente);
    setShowDetailsModal(true);
  };

  const fecharDetalhesConta = () => {
    setShowDetailsModal(false);
    setClienteDetalhes(null);
  };
  
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const onSuccess = () => {
      fecharModal();
      router.get('/gerenciamento/clientes');
    };
    
    if (modalMode === 'create') {
      post('/gerenciamento/clientes', { 
        onSuccess,
        onError: () => {
          console.log('Erro ao cadastrar cliente:', errors);
        }
      });
    } else if (clienteId) { 
      put(`/gerenciamento/clientes/${clienteId}`, { 
        onSuccess,
        onError: () => {
          console.log('Erro ao atualizar cliente:', errors);
        }
      });
    }
  };

  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDetailsModal) {
          fecharDetalhesConta();
        } else if (showModal) {
          fecharModal();
        }
      }
    };

    if (showModal || showDetailsModal) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [showModal, showDetailsModal]);

  return (
    <GerenciamentoLayout title="Clientes">
      <Head title="Clientes" />
      <h2 className="visually-hidden" ref={h1Ref} tabIndex={-1}>Clientes</h2>

      <div className="container-fluid">
        {/* Header */}
        <div className="clientes-header">
          <div className="clientes-header-content">
            <div className="clientes-title-section">
              <h1 className="clientes-title">Gestão de Clientes</h1>
              <p className="clientes-subtitle">
                Gerencie seus clientes e contas fiadas
              </p>
            </div>
            <div className="clientes-actions">
              <button
                className="btn-refresh"
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-loading" />
                ) : (
                  <i className="bi bi-arrow-clockwise"></i>
                )}
                Atualizar
              </button>
              <button
                onClick={() => abrirModal('create')}
                className="btn-new-client"
              >
                <i className="bi bi-plus-lg"></i>
                Novo Cliente
              </button>
            </div>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="clientes-error-alert" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            {error}
          </div>
        )}

        {/* Filtros de Busca */}
        <div className="clientes-filters">
          <div className="clientes-search-container">
            <div className="search-input-group">
              <span className="search-icon">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Pesquisar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="clientes-counter">
            {clientesFiltrados.length} de {clientesArray.length} clientes
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="clientes-card">
          <div className="clientes-card-header">
            <h5 className="clientes-card-title">
              <i className="bi bi-people"></i>
              Clientes Cadastrados
            </h5>
          </div>
          <div className="clientes-card-body">
            {clientesFiltrados.length > 0 ? (
              <div className="clientes-table-container">
                <table className="clientes-table">
                  <thead className="clientes-table-header">
                    <tr>
                      <th>Cliente</th>
                      <th>Contato</th>
                      <th>Conta Fiada</th>
                      <th>Cadastrado em</th>
                      <th className="actions-column">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map((cliente) => (
                      <tr key={cliente.id} className="cliente-row">
                        <td>
                          <div className="cliente-info">
                            <strong className="cliente-nome">{cliente.nome}</strong>
                          
                          </div>
                        </td>
                        <td>
                          <div className="cliente-contato">
                            <div className="cliente-email">{cliente.email}</div>
                            {cliente.telefone_formatado && (
                              <small className="cliente-telefone">
                                {cliente.telefone_formatado}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="conta-fiada-info">
                            <span 
                              className={`saldo-badge ${
                                cliente.conta_fiada.saldo > 0 
                                  ? 'saldo-positivo' 
                                  : cliente.conta_fiada.saldo < 0 
                                  ? 'saldo-negativo' 
                                  : 'saldo-zero'
                              }`}
                            >
                              {cliente.conta_fiada.saldo_formatado}
                            </span>
                          </div>
                        </td>
                        <td>
                          <small className="data-cadastro">
                            {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                          </small>
                        </td>
                        <td>
                          <div className="cliente-actions">
                            <button 
                              className="btn-action btn-view"
                              title="Ver detalhes"
                              onClick={() => abrirDetalhesConta(cliente)}
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="btn-action btn-wallet"
                              title="Conta fiada"
                            >
                              <i className="bi bi-wallet2"></i>
                            </button>
                            <button
                              onClick={() => abrirModal('edit', cliente)}
                              className="btn-action btn-edit"
                              title="Editar cliente"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="clientes-empty-state">
                <i className="bi bi-people empty-icon"></i>
                <h5 className="empty-title">Nenhum cliente encontrado</h5>
                <p className="empty-description">
                  {search ? 'Tente ajustar os filtros de busca' : 'Comece cadastrando seu primeiro cliente'}
                </p>
                {!search && (
                  <button
                    onClick={() => abrirModal('create')}
                    className="btn-first-client"
                  >
                    <i className="bi bi-plus-lg"></i>
                    Cadastrar Primeiro Cliente
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL: CADASTRO DE CLIENTE ================= */}
      {showModal && (
        <>
          <div 
            className="modal-backdrop fade show"
            onClick={fecharModal}
          ></div>
          
          <div 
            className="modal fade show" 
            style={{display: 'block'}} 
            tabIndex={-1}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-person-plus me-2"></i>
                    {modalMode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={fecharModal}
                    aria-label="Fechar modal"
                  ></button>
                </div>
                <form onSubmit={submit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="nome" className="form-label">Nome *</label>
                        <input
                          id="nome"
                          type="text"
                          className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                          value={data.nome}
                          onChange={(e) => setData('nome', e.target.value)}
                          required
                          autoFocus
                          disabled={processing}
                        />
                        {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">E-mail *</label>
                        <input
                          id="email"
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          value={data.email}
                          onChange={(e) => setData('email', e.target.value)}
                          required
                          disabled={processing}
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="telefone" className="form-label">Telefone</label>
                        <input
                          id="telefone"
                          type="tel"
                          className={`form-control ${errors.telefone ? 'is-invalid' : ''}`}
                          value={data.telefone}
                          onChange={(e) => setData('telefone', e.target.value)}
                          placeholder="(00) 00000-0000"
                          disabled={processing}
                        />
                        {errors.telefone && <div className="invalid-feedback">{errors.telefone}</div>}
                      </div>

                      {modalMode === 'create' && (
                        <div className="col-md-6 mb-3">
                          <label htmlFor="saldo_inicial" className="form-label">
                            Saldo Inicial (opcional)
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              className={`form-control ${errors.saldo_inicial ? 'is-invalid' : ''}`}
                              id="saldo_inicial"
                              value={data.saldo_inicial}
                              onChange={(e) => setData('saldo_inicial', e.target.value)}
                              placeholder="0,00"
                            />
                          </div>
                          {errors.saldo_inicial && (
                            <div className="invalid-feedback d-block">
                              {errors.saldo_inicial}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ✅ CAMPO DESCRIÇÃO */}
                    {modalMode === 'create' && (
                      <div className="row">
                        <div className="col-12">
                          <label htmlFor="descricao" className="form-label">
                            Descrição da Conta (opcional)
                          </label>
                          <textarea
                            className={`form-control ${errors.descricao ? 'is-invalid' : ''}`}
                            id="descricao"
                            rows={3}
                            value={data.descricao}
                            onChange={(e) => setData('descricao', e.target.value)}
                            placeholder="Ex: Compras do mês, Produtos diversos, etc..."
                            maxLength={500}
                          />
                          <div className="form-text">
                            <small className="text-muted">
                              Descreva o que foi comprado ou o motivo do saldo inicial.
                            </small>
                          </div>
                          {errors.descricao && (
                            <div className="invalid-feedback d-block">
                              {errors.descricao}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={fecharModal}
                      disabled={processing}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          {modalMode === 'create' ? 'Salvar Cliente' : 'Atualizar Cliente'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= MODAL: DETALHES DO CLIENTE ================= */}
      {showDetailsModal && clienteDetalhes && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={fecharDetalhesConta}
          ></div>

          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-eye me-2"></i>
                    Detalhes do Cliente
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={fecharDetalhesConta}
                    aria-label="Fechar modal"
                  ></button>
                </div>
                <div className="modal-body">
                  <dl className="row mb-0 cliente-detalhes-list">
                    <dt className="col-sm-4 cliente-detalhes-label">Nome</dt>
                    <dd className="col-sm-8 cliente-detalhes-text cliente-detalhes-value text-break">
                      {clienteDetalhes.nome}
                    </dd>

                    <dt className="col-sm-4 cliente-detalhes-label">E-mail</dt>
                    <dd className="col-sm-8 cliente-detalhes-text cliente-detalhes-value text-break">
                      {clienteDetalhes.email}
                    </dd>

                    {clienteDetalhes.telefone_formatado && (
                      <>
                        <dt className="col-sm-4 cliente-detalhes-label">Telefone</dt>
                        <dd className="col-sm-8 cliente-detalhes-text cliente-detalhes-value text-break">
                          {clienteDetalhes.telefone_formatado}
                        </dd>
                      </>
                    )}

                    <dt className="col-sm-4 cliente-detalhes-label">Status da Conta</dt>
                    <dd className="col-sm-8 cliente-detalhes-text cliente-detalhes-value text-break">
                      {clienteDetalhes.conta_fiada.status}
                    </dd>

                    <dt className="col-sm-4 cliente-detalhes-label">Saldo</dt>
                    <dd className="col-sm-8 cliente-detalhes-text cliente-detalhes-value text-break">
                      {clienteDetalhes.conta_fiada.saldo_formatado}
                    </dd>

                    <dt className="col-sm-4 cliente-detalhes-label">Descrição</dt>
                    <dd className="col-sm-8 cliente-detalhes-text cliente-detalhes-value cliente-detalhes-descricao text-break">
                      {clienteDetalhes.conta_fiada.descricao || 'Sem descrição informada.'}
                    </dd>

                    <dt className="col-sm-4 cliente-detalhes-label">Cadastrado em</dt>
                    <dd className="col-sm-8 cliente-detalhes-text cliente-detalhes-value">
                      {new Date(clienteDetalhes.created_at).toLocaleDateString('pt-BR')}
                    </dd>
                  </dl>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={fecharDetalhesConta}>
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </GerenciamentoLayout>
  );
}
