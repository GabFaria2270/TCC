import { Head, router } from '@inertiajs/react';
import React from 'react';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';

interface ProdutoRef { id: number; nome: string; }
interface Movimento {
  id: number;
  tipo: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  saldo_apos: number;
  motivo?: string | null;
  created_at: string;
}
interface Paginacao<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
interface Props {
  produto: ProdutoRef;
  movimentos: Paginacao<Movimento>;
}

export default function ProdutoHistorico({ produto, movimentos }: Props) {
  return (
    <GerenciamentoLayout title={`Histórico de ${produto.nome}`}>
      <Head title={`Histórico — ${produto.nome}`} />
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h1 className="h4 m-0">Histórico de estoque — {produto.nome}</h1>
          <div>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => router.get('/gerenciamento/produtos', {}, { preserveScroll: true })}
            >
              <i className="bi bi-arrow-left me-1" /> Voltar para produtos
            </button>
          </div>
        </div>
        <div className="card">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Quando</th>
                  <th>Tipo</th>
                  <th className="text-end">Quantidade</th>
                  <th className="text-end">Saldo após</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {movimentos.data.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-secondary py-4">Sem movimentos</td></tr>
                ) : movimentos.data.map((m) => (
                  <tr key={m.id}>
                    <td>{new Date(m.created_at).toLocaleString('pt-BR')}</td>
                    <td>
                      {m.tipo === 'entrada' ? 'Entrada' : m.tipo === 'saida' ? 'Saída' : 'Ajuste'}
                    </td>
                    <td className="text-end">
                      {m.tipo === 'saida' ? '-' : '+'}{Math.abs(m.quantidade)}
                    </td>
                    <td className="text-end">{m.saldo_apos}</td>
                    <td>{m.motivo ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {movimentos.last_page > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="small text-secondary">Mostrando {movimentos.data.length} de {movimentos.total} registros</div>
          </div>
        )}
      </div>
    </GerenciamentoLayout>
  );
}
