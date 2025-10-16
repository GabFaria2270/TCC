import React, { useState } from 'react';
import type { JSX } from 'react';
import '../../../css/gerenciamento/maquininhas-cards.css';
import MaquininhaForm from '../../components/PDVcomponents/MaquininhaForm';
import GerenciamentoLayout from '@/layouts/GerenciamentoLayout';
import { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

// Tipagem do objeto Maquininha
interface Maquininha {
  id: number;
  modelo: string;
  nome: string;
  comercio: string;
  status: 'ativa' | 'inativa';
}



function getMaquininhaIcon(modelo: string): JSX.Element | null {
  switch (modelo) {
    case 'PagSeguro':
      return <img src="/img/pagseguro-logo.png" alt="PagSeguro" className="maquininha-icone-img" />;
    case 'Cielo':
      return <img src="/img/cielo.png" alt="Cielo" className="maquininha-icone-img" />;
    case 'Stone':
      return <img src="/img/stone.png" alt="Stone" className="maquininha-icone-img" />;
    case 'Rede':
      return <img src="/img/rede.png" alt="Rede" className="maquininha-icone-img" />;
    case 'Getnet':
      return <img src="/img/getnet.png" alt="Getnet" className="maquininha-icone-img" />;
    default:
      return <span className="maquininha-icone-default">💳</span>;
  }
}

export default function MaquininhasPage() {
  // Recebe maquininhas do backend via props
  const { maquininhas } = (usePage().props as unknown as { maquininhas: Maquininha[] | null });
  const listaMaquininhas = maquininhas ?? [];
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Maquininha | null>(null);
  const [loading, setLoading] = useState(false);

  function handleCadastrar() {
    setEditData(null);
    setShowModal(true);
  }

  function handleEditar(maq: Maquininha) {
    setEditData(maq);
    setShowModal(true);
  }

  function handleSalvar(data: Maquininha) {
    const payload = {
      modelo: data.modelo,
      nome: data.nome,
      status: data.status,
    };
    if (editData) {
      router.put(`/gerenciamento/maquininhas/${editData.id}`, { ...payload });
    } else {
      router.post('/gerenciamento/maquininhas', payload);
    }
  setShowModal(false);
  // Após salvar, recarrega a página para garantir que os dados do backend sejam exibidos
  router.reload({ only: ['maquininhas'] });
  }

  function handleCancelar() {
    setShowModal(false);
  }

  function handleExcluir(id: number) {
    if (confirm('Tem certeza que deseja excluir esta maquininha?')) {
      router.delete(`/maquininhas/${id}`);
    }
  }

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }

  return (
    <GerenciamentoLayout title="Maquininhas">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center rounded-3 bg-body-tertiary mb-4 flex-wrap gap-3 border p-3">
          <div>
            <h1 className="h3 m-0">Gestão de Maquininhas</h1>
            <p className="text-secondary mb-0">Cadastre e gerencie as maquininhas do seu comércio.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={handleRefresh} disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              ) : (
                <i className="bi bi-arrow-clockwise" />
              )}{' '}
              Atualizar
            </button>
            <button className="btn btn-primary" onClick={handleCadastrar}>
              <i className="bi bi-plus-lg" /> Cadastrar Maquininha
            </button>
          </div>
        </div>
  {listaMaquininhas.length === 0 ? (
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
            <h2 className="mb-3 text-center">Gerenciamento de Maquininhas</h2>
            <p className="mb-4 text-center">Nenhuma maquininha cadastrada ainda.</p>
            <button className="btn btn-primary" onClick={handleCadastrar}>
              <i className="bi bi-plus-lg" /> Cadastrar Maquininha
            </button>
          </div>
        ) : (
          <div className="maquininhas-page">
            <div className="maquininhas-list">
              {listaMaquininhas.map((maq: Maquininha) => (
                <div key={maq.id} className={`maquininha-card ${maq.modelo.toLowerCase()}`}>
                  <div className="maquininha-icone">
                    {getMaquininhaIcon(maq.modelo)}
                  </div>
                  <div className="maquininha-info">
                    <strong>{maq.nome}</strong>
                    <span>Modelo: {maq.modelo}</span>
                    <span>Comércio: {maq.comercio}</span>
                    <span>Status: {maq.status === 'ativa' ? 'Ativa' : 'Inativa'}</span>
                  </div>
                  <div className="maquininha-actions">
                    <button className="btn-editar" onClick={() => handleEditar(maq)}>Editar</button>
                    <button className="btn-excluir" onClick={() => handleExcluir(maq.id)}>Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {showModal && (
          <MaquininhaForm
            initialData={editData || undefined}
            onSave={handleSalvar}
            onCancel={handleCancelar}
            showModal={showModal}
          />
        )}
      </div>
    </GerenciamentoLayout>
  );
}
