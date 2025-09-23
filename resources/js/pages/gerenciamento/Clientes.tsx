import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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

  useEffect(() => { 
    h1Ref.current?.focus(); 
    
    // ✅ CORREÇÃO: Verificação segura com tipagem
    const initClienteSystem = () => {
      if (typeof window !== 'undefined' && window.ClienteSystem) {
        try {
          window.ClienteSystem.init();
          console.log('✅ ClienteSystem inicializado');
        } catch (error) {
          console.warn('⚠️ Erro ao inicializar ClienteSystem:', error);
        }
      } else {
        console.log('📝 ClienteSystem não encontrado - carregando...');
        
        // Tenta novamente após um pequeno delay (para garantir que JS carregou)
        setTimeout(() => {
          if (window.ClienteSystem) {
            window.ClienteSystem.init();
            console.log('✅ ClienteSystem inicializado (delay)');
          }
        }, 100);
      }
    };

    initClienteSystem();
  }, []);

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
              <Link
                href="/gerenciamento/clientes/create"
                className="btn-new-client"
              >
                <i className="bi bi-plus-lg"></i>
                Novo Cliente
              </Link>
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
                  <Link
                    href="/gerenciamento/clientes/create"
                    className="btn-first-client"
                  >
                    <i className="bi bi-plus-lg"></i>
                    Cadastrar Primeiro Cliente
                  </Link>
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
    </GerenciamentoLayout>
  );
}
