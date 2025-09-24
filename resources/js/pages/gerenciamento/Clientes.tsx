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
  };
  created_at: string;
}

interface Props {
  clientes?: Cliente[];
  error?: string;
}

export default function Clientes({ clientes = [], error }: Props) {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ✅ Estado do modal
  const [showModal, setShowModal] = useState(false);
  
  // ✅ Formulário do modal
  const { data, setData, post, processing, errors, reset } = useForm({
    nome: '',
    email: '',
    telefone: '',
    saldo_inicial: '',
  });

  useEffect(() => { 
    h1Ref.current?.focus(); 
    
    // ✅ REMOVIDO: Não precisa mais do ClienteSystem JavaScript
    // O React agora gerencia tudo sozinho
    console.log('✅ Sistema React de clientes inicializado');
  }, []);

  // ✅ Função para abrir o modal
  const abrirModal = () => {
    setShowModal(true);
    reset(); // Limpa o formulário
    
    // ✅ IMPORTANTE: Foca no primeiro campo após abrir
    setTimeout(() => {
      const nomeInput = document.getElementById('nome');
      if (nomeInput) nomeInput.focus();
    }, 100);
  };

  // ✅ Função para fechar o modal
  const fecharModal = () => {
    setShowModal(false);
    reset();
  };

  // ✅ Função para submeter o formulário
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('clientes.store'), {
      onSuccess: () => {
        fecharModal();
        // Recarrega a lista de clientes
        router.get('/gerenciamento/clientes');
      },
      onError: () => {
        console.log('Erro ao cadastrar cliente:', errors);
      }
    });
  };

  // ✅ Função para fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        fecharModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEsc);
      // Previne scroll da página quando modal está aberto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  // Garante que clientes é sempre um array
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
                onClick={abrirModal}
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
                            <small className="cliente-id">ID: {cliente.id}</small>
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
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button 
                              className="btn-action btn-wallet"
                              title="Conta fiada"
                            >
                              <i className="bi bi-wallet2"></i>
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
                    onClick={abrirModal}
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

        {/* Estatísticas */}
        {clientesArray.length > 0 && (
          <div className="clientes-stats">
            <div className="stat-card stat-total">
              <div className="stat-content">
                <h5 className="stat-number">{clientesArray.length}</h5>
                <p className="stat-label">Total de Clientes</p>
              </div>
            </div>
            <div className="stat-card stat-positive">
              <div className="stat-content">
                <h5 className="stat-number">
                  {clientesArray.filter(c => c.conta_fiada.saldo > 0).length}
                </h5>
                <p className="stat-label">Com Saldo Positivo</p>
              </div>
            </div>
            <div className="stat-card stat-negative">
              <div className="stat-content">
                <h5 className="stat-number">
                  {clientesArray.filter(c => c.conta_fiada.saldo < 0).length}
                </h5>
                <p className="stat-label">Em Débito</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Modal de Cadastro - ESTRUTURA CORRIGIDA */}
      {showModal && (
        <>
          {/* Backdrop separado */}
          <div 
            className="modal-backdrop fade show"
            onClick={fecharModal}
          ></div>
          
          {/* Modal principal */}
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
                    Novo Cliente
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

                      <div className="col-md-6 mb-3">
                        <label htmlFor="saldo_inicial" className="form-label">Saldo Inicial</label>
                        <input
                          id="saldo_inicial"
                          type="number"
                          step="0.01"
                          min="0"
                          className={`form-control ${errors.saldo_inicial ? 'is-invalid' : ''}`}
                          value={data.saldo_inicial}
                          onChange={(e) => setData('saldo_inicial', e.target.value)}
                          placeholder="0.00"
                          disabled={processing}
                        />
                        {errors.saldo_inicial && <div className="invalid-feedback">{errors.saldo_inicial}</div>}
                      </div>
                    </div>
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
                          Salvar Cliente
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
    </GerenciamentoLayout>
  );
}
