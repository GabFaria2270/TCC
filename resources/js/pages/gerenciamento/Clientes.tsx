import React, { useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';
import ClienteForm from '../../components/ClienteForm';
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
        {/* Adicione o contador aqui */}
        <div className="clientes-counter">
          {clientesFiltrados.length} de {clientesArray.length} clientes
        </div>
      </div>

      <ClienteTabela
        clientes={clientesFiltrados}
        abrirDetalhes={abrirDetalhesConta}
        abrirConfirmarPagamento={abrirConfirmarPagamento}
        abrirModal={abrirModal}
      />

      {showModal && (
        <ClienteForm
          cliente={modalMode === 'edit' ? clientesArray.find(c => c.id === clienteId) : undefined}
          modo={modalMode}
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
