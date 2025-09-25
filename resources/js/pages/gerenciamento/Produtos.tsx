import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';

interface Categoria {
  id: number;
  nome: string;
}

interface Produto {
  id: number;
  nome: string;
  preco: string | number;
  quantidade_estoque: number;
  categoria?: Categoria | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  produtos?: Produto[];
  categorias?: Categoria[];
  error?: string;
}

type ProdutoFormData = {
  nome: string;
  preco: string;
  quantidade: string;
  categoria_id: string;
  nova_categoria_nome: string;
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function Produtos({ produtos = [], categorias = [], error }: Props) {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm<ProdutoFormData>({
    nome: '',
    preco: '',
    quantidade: '0',
    categoria_id: '',
    nova_categoria_nome: '',
  });

  useEffect(() => {
    h1Ref.current?.focus();
  }, []);

  const produtosFiltrados = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();

    return produtos.filter((produto) => {
      const atendePesquisa =
        lowerSearch.length === 0 ||
        produto.nome.toLowerCase().includes(lowerSearch) ||
        (produto.categoria?.nome ?? '').toLowerCase().includes(lowerSearch);

      const atendeCategoria =
        categoriaFiltro === '' || produto.categoria?.id === Number(categoriaFiltro);

      return atendePesquisa && atendeCategoria;
    });
  }, [produtos, searchTerm, categoriaFiltro]);

  const handleRefresh = () => {
    setLoading(true);
    router.get(
      '/gerenciamento/produtos',
      {},
      {
        preserveScroll: true,
        onFinish: () => setLoading(false),
      },
    );
  };

  const abrirModal = () => {
    setShowModal(true);
    reset();
    setData('quantidade', '0');
    setTimeout(() => {
      document.getElementById('produto-nome')?.focus();
    }, 100);
  };

  const fecharModal = () => {
    setShowModal(false);
    reset();
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        fecharModal();
      }
    };

    if (showModal) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showModal]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    post('/gerenciamento/produtos', {
      preserveScroll: true,
      onSuccess: () => {
        fecharModal();
        router.get('/gerenciamento/produtos', {}, { preserveScroll: true });
      },
    });
  };

  return (
    <GerenciamentoLayout title="Produtos">
      <Head title="Produtos" />
      <h2 className="visually-hidden" ref={h1Ref} tabIndex={-1}>
        Produtos
      </h2>

      <div className="container-fluid">
        <div className="d-flex flex-wrap justify-content-between gap-3 align-items-center mb-4">
          <div>
            <h1 className="h3 m-0">Gestão de Produtos</h1>
            <p className="text-secondary mb-0">Cadastre e acompanhe os itens da sua mercearia.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={handleRefresh} disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> : <i className="bi bi-arrow-clockwise" />} Atualizar
            </button>
            <button className="btn btn-primary" onClick={abrirModal}>
              <i className="bi bi-plus-lg" /> Novo produto
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2" />
            {error}
          </div>
        )}

        <div className="card shadow-sm mb-4">
          <div className="card-body row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="filtro-busca" className="form-label">
                Buscar
              </label>
              <div className="input-group">
                <span className="input-group-text" id="icone-busca">
                  <i className="bi bi-search" />
                </span>
                <input
                  id="filtro-busca"
                  type="text"
                  className="form-control"
                  placeholder="Nome ou categoria"
                  aria-describedby="icone-busca"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-4">
              <label htmlFor="filtro-categoria" className="form-label">
                Categoria
              </label>
              <select
                id="filtro-categoria"
                className="form-select"
                value={categoriaFiltro}
                onChange={(event) => setCategoriaFiltro(event.target.value)}
              >
                <option value="">Todas</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-2 d-flex align-items-end">
              <div className="text-secondary small">
                {produtosFiltrados.length} de {produtos.length} produtos
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <strong>Produtos cadastrados</strong>
            <div className="small text-secondary">Atualizados em tempo real conforme cadastros</div>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th className="text-end">Preço</th>
                  <th className="text-end">Estoque</th>
                  <th>Atualizado em</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-secondary">
                      Nenhum produto encontrado. {produtos.length === 0 ? (
                        <button className="btn btn-link p-0" type="button" onClick={abrirModal}>
                          Cadastre o primeiro produto
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ) : (
                  produtosFiltrados.map((produto) => (
                    <tr key={produto.id}>
                      <td>
                        <div className="fw-semibold">{produto.nome}</div>
                        <small className="text-secondary">ID: {produto.id}</small>
                      </td>
                      <td>{produto.categoria?.nome ?? '—'}</td>
                      <td className="text-end">{currencyFormatter.format(Number(produto.preco ?? 0))}</td>
                      <td className="text-end">{produto.quantidade_estoque}</td>
                      <td>{new Date(produto.updated_at).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <>
          <div className="modal-backdrop fade show" onClick={fecharModal} />
          <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Novo produto</h5>
                  <button type="button" className="btn-close" aria-label="Fechar" onClick={fecharModal} />
                </div>
                <form onSubmit={submit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="produto-nome" className="form-label">
                          Nome*
                        </label>
                        <input
                          id="produto-nome"
                          type="text"
                          className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                          value={data.nome}
                          onChange={(event) => setData('nome', event.target.value)}
                          required
                          disabled={processing}
                        />
                        {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
                      </div>

                      <div className="col-12 col-md-6">
                        <label htmlFor="produto-preco" className="form-label">
                          Preço (R$)*
                        </label>
                        <input
                          id="produto-preco"
                          type="number"
                          min="0"
                          step="0.01"
                          className={`form-control ${errors.preco ? 'is-invalid' : ''}`}
                          value={data.preco}
                          onChange={(event) => setData('preco', event.target.value)}
                          required
                          disabled={processing}
                        />
                        {errors.preco && <div className="invalid-feedback">{errors.preco}</div>}
                      </div>

                      <div className="col-12 col-md-6">
                        <label htmlFor="produto-quantidade" className="form-label">
                          Quantidade em estoque*
                        </label>
                        <input
                          id="produto-quantidade"
                          type="number"
                          min="0"
                          step="1"
                          className={`form-control ${errors.quantidade ? 'is-invalid' : ''}`}
                          value={data.quantidade}
                          onChange={(event) => setData('quantidade', event.target.value)}
                          required
                          disabled={processing}
                        />
                        {errors.quantidade && <div className="invalid-feedback">{errors.quantidade}</div>}
                      </div>

                      <div className="col-12 col-md-6">
                        <label htmlFor="produto-categoria" className="form-label">
                          Categoria
                        </label>
                        <select
                          id="produto-categoria"
                          className={`form-select ${errors.categoria_id ? 'is-invalid' : ''}`}
                          value={data.categoria_id}
                          onChange={(event) => setData('categoria_id', event.target.value)}
                          disabled={processing}
                        >
                          <option value="">Selecione uma categoria</option>
                          {categorias.map((categoria) => (
                            <option key={categoria.id} value={String(categoria.id)}>
                              {categoria.nome}
                            </option>
                          ))}
                        </select>
                        {errors.categoria_id && <div className="invalid-feedback">{errors.categoria_id}</div>}
                      </div>

                      <div className="col-12 col-md-6">
                        <label htmlFor="produto-nova-categoria" className="form-label">
                          Nova categoria (opcional)
                        </label>
                        <input
                          id="produto-nova-categoria"
                          type="text"
                          className={`form-control ${errors.nova_categoria_nome ? 'is-invalid' : ''}`}
                          value={data.nova_categoria_nome}
                          onChange={(event) => setData('nova_categoria_nome', event.target.value)}
                          placeholder="Informe para criar automaticamente"
                          disabled={processing}
                        />
                        {errors.nova_categoria_nome && <div className="invalid-feedback">{errors.nova_categoria_nome}</div>}
                        <small className="text-secondary">
                          Você pode escolher uma categoria existente ou informar uma nova.
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer d-flex justify-content-between">
                    <button type="button" className="btn btn-outline-secondary" onClick={fecharModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={processing}>
                      {processing ? 'Salvando…' : 'Salvar produto'}
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
