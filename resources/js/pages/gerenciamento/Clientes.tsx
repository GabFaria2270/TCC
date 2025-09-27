import React, { useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';
import ClienteCreateModal from '../../components/ClienteCreateModal';
import ClienteEditModal from '../../components/ClienteEditModal';
import ClienteDetalhesModal from '../../components/ClienteDetalhesModal';
import ClienteTabela from '../../components/ClienteTabela';
import ConfirmarPagamentoModal from '../../components/ConfirmarPagamentoModal';

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  telefone_formatado?: string;
  conta_fiada: {
    saldo: number;
    saldo_formatado: string;
    descricao?: string; 
    status: string;
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

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [clienteParaPagar, setClienteParaPagar] = useState<Cliente | null>(null);

  useEffect(() => { h1Ref.current?.focus(); }, []);

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
    setClienteId(cliente?.id ?? null);
  };

  const fecharModal = () => {
    setShowModal(false);
    setClienteId(null);
  };

  const abrirDetalhesConta = (cliente: Cliente) => {
    setClienteDetalhes(cliente);
    setShowDetailsModal(true);
  };

  const fecharDetalhesConta = () => {
    setShowDetailsModal(false);
    setClienteDetalhes(null);
  };

  const abrirConfirmarPagamento = (cliente: Cliente) => {
    setClienteParaPagar(cliente);
    setShowConfirmModal(true);
  };

  const fecharConfirmarPagamento = () => {
    setShowConfirmModal(false);
    setClienteParaPagar(null);
  };

  const pagarContaFiada = () => {
    if (!clienteParaPagar) return;
    router.delete(`/gerenciamento/clientes/${clienteParaPagar.id}/conta-fiada`, {
      preserveScroll: true,
      onSuccess: fecharConfirmarPagamento,
      onError: fecharConfirmarPagamento
    });
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDetailsModal) fecharDetalhesConta();
        else if (showModal) fecharModal();
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

  const clienteComContaFiada = (cliente?: Cliente) => {
    if (!cliente) return undefined;
    return {
      ...cliente,
      conta_fiada: {
        saldo: cliente.conta_fiada?.saldo ?? 0,
        saldo_formatado: cliente.conta_fiada?.saldo_formatado ?? 'R$ 0,00',
        descricao: cliente.conta_fiada?.descricao ?? '',
        status: cliente.conta_fiada?.status ?? '',
      },
    };
  };

  return (
    <GerenciamentoLayout title="Clientes">
      <Head title="Clientes" />
      {/* Cabeçalho, busca e contador */}
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
        {/* Barra de busca */}
        <div className="clientes-search-container">
          <div className="search-input-group">
            <i className="bi bi-search search-icon" aria-hidden="true"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              maxLength={100}
              aria-label="Buscar clientes"
            />
          </div>
        </div>
        {/* Adicione o contador aqui */}
        <div className="clientes-counter">
          {clientesFiltrados.length} de {clientesArray.length} clientes
        </div>
      </div>

      {/* Mensagem de vazio ou tabela */}
      {clientesArray.length === 0 ? (
        <div className="clientes-empty-state">
          <i className="bi bi-people clientes-empty-icon"></i>
          <h3>Nenhum cliente cadastrado</h3>
          <p>Cadastre seu primeiro cliente para começar a gerenciar contas fiadas.</p>
          <button className="btn btn-primary" onClick={() => abrirModal('create')}>
            <i className="bi bi-plus-lg"></i> Cadastrar Primeiro Cliente
          </button>
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="clientes-empty-state">
          <i className="bi bi-search clientes-empty-icon"></i>
          <h3>Nenhum resultado encontrado</h3>
          <p>Não encontramos clientes com esse nome ou e-mail.</p>
        </div>
      ) : (
        <ClienteTabela
          clientes={clientesFiltrados}
          abrirDetalhes={abrirDetalhesConta}
          abrirConfirmarPagamento={abrirConfirmarPagamento}
          abrirModal={abrirModal}
        />
      )}

      {modalMode === 'create' && showModal && (
        <ClienteCreateModal
          show={showModal}
          onClose={fecharModal}
          onSuccess={() => {
            fecharModal();
            router.get('/gerenciamento/clientes');
          }}
        />
      )}
      {modalMode === 'edit' && showModal && clienteId !== null && (
        <ClienteEditModal
          show={showModal}
          cliente={clienteComContaFiada(clientesArray.find(c => c.id === clienteId))!}
          onClose={fecharModal}
          onSuccess={() => {
            fecharModal();
            router.get('/gerenciamento/clientes');
          }}
        />
      )}

      {showDetailsModal && clienteDetalhes && (
        <ClienteDetalhesModal
          cliente={clienteDetalhes}
          fechar={fecharDetalhesConta}
        />
      )}

      {showConfirmModal && clienteParaPagar && (
        <ConfirmarPagamentoModal
          cliente={clienteParaPagar}
          fechar={fecharConfirmarPagamento}
          confirmar={pagarContaFiada}
        />
      )}
    </GerenciamentoLayout>
  );
}
