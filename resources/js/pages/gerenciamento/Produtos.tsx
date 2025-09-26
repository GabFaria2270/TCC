import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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

interface Paginacao<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ServerFilters {
    q?: string;
    categoriaId?: string | number | null;
    sort?: 'nome' | 'preco' | 'quantidade_estoque' | 'updated_at';
    dir?: 'asc' | 'desc';
    perPage?: number;
}

interface Props {
    produtos?: Paginacao<Produto> | Produto[];
    categorias?: Categoria[];
    error?: string;
    filters?: ServerFilters;
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

export default function Produtos({ produtos = [], categorias = [], error, filters }: Props) {
    const h1Ref = useRef<HTMLHeadingElement>(null);
    // Detecta paginação vinda do servidor ou array simples
    const isPaginated = (p: any): p is Paginacao<Produto> => p && typeof p === 'object' && Array.isArray(p.data) && typeof p.current_page === 'number';

    const initialQ = filters?.q ?? '';
    const initialCategoria = filters?.categoriaId ? String(filters.categoriaId) : '';
    const initialSort = (filters?.sort as any) ?? 'nome';
    const initialDir = (filters?.dir as any) ?? 'asc';
    const initialPerPage = typeof filters?.perPage === 'number' ? String(filters!.perPage) : '10';

    const [searchTerm, setSearchTerm] = useState(initialQ);
    const [categoriaFiltro, setCategoriaFiltro] = useState(initialCategoria);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [perPage, setPerPage] = useState<string>(initialPerPage);

    type SortField = 'nome' | 'categoria' | 'preco' | 'quantidade' | 'updated_at';
    const [sortBy, setSortBy] = useState<SortField>(initialSort);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialDir);

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

    const produtosArray: Produto[] = useMemo(() => (isPaginated(produtos) ? produtos.data : produtos), [produtos]);

    const produtosOrdenados = useMemo(() => {
        // Se os dados vierem paginados do servidor, respeita a ordenação do servidor
        if (isPaginated(produtos)) {
            return produtosArray;
        }

        const arr = [...produtosArray];
        const dir = sortDir === 'asc' ? 1 : -1;

        const getKey = (p: Produto) => {
            switch (sortBy) {
                case 'nome':
                    return (p.nome || '').toString().toLowerCase();
                case 'categoria':
                    return (p.categoria?.nome || '').toString().toLowerCase();
                case 'preco':
                    return Number(p.preco ?? 0);
                case 'quantidade':
                    return Number(p.quantidade_estoque ?? 0);
                case 'updated_at':
                    return new Date(p.updated_at).getTime();
                default:
                    return '';
            }
        };

        arr.sort((a, b) => {
            const ka = getKey(a);
            const kb = getKey(b);

            if (typeof ka === 'number' && typeof kb === 'number') {
                return (ka - kb) * dir;
            }
            if (ka < kb) return -1 * dir;
            if (ka > kb) return 1 * dir;
            return 0;
        });

        return arr;
    }, [produtos, produtosArray, sortBy, sortDir]);

    const toggleSort = (field: SortField) => {
        if (sortBy === field) {
            const newDir = sortDir === 'asc' ? 'desc' : 'asc';
            setSortDir(newDir);
            navegarComFiltros({ page: 1, sort: field as any, dir: newDir });
        } else {
            setSortBy(field);
            setSortDir('asc');
            navegarComFiltros({ page: 1, sort: field as any, dir: 'asc' });
        }
    };

    const renderSortIcon = (field: SortField) => {
        if (sortBy !== field) return <i className="bi bi-arrow-down-up ms-1 text-muted" />;
        return sortDir === 'asc' ? (
            <i className="bi bi-caret-up-fill ms-1" />
        ) : (
            <i className="bi bi-caret-down-fill ms-1" />
        );
    };

    // Debounce para busca: aplica filtro no servidor após digitação (suave)
    const immediateNavRef = React.useRef(false);
    useEffect(() => {
        const handler = setTimeout(() => {
            // Evita navegar se a busca atual já corresponde aos filtros do servidor
            if (immediateNavRef.current) {
                immediateNavRef.current = false; // já navegou via Enter/blur
                return;
            }
            if (filters?.q === searchTerm) return;
            navegarComFiltros({ page: 1, q: searchTerm || undefined });
        }, 750);
        return () => clearTimeout(handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // Opcional: aplicar ao sair do campo ou ao pressionar Enter (melhor UX)
    const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            immediateNavRef.current = true;
            navegarComFiltros({ page: 1, q: searchTerm || undefined });
        }
    };
    const onSearchBlur = () => {
        if (filters?.q !== searchTerm) {
            immediateNavRef.current = true;
            navegarComFiltros({ page: 1, q: searchTerm || undefined });
        }
    };

    const navegarComFiltros = (overrides?: Partial<ServerFilters & { page: number }>) => {
        const payload = {
            q: searchTerm || undefined,
            categoriaId: categoriaFiltro || undefined,
            sort: sortBy as any,
            dir: sortDir,
            perPage: Number(perPage) || 10,
            ...(overrides ?? {}),
        };
        router.get('/gerenciamento/produtos', payload, { preserveScroll: true, replace: true, preserveState: true });
    };

    const handleRefresh = () => {
        setLoading(true);
        navegarComFiltros();
        setLoading(false);
    };

    const abrirModalCriar = () => {
        setModalMode('create');
        setProdutoSelecionado(null);
        setShowModal(true);
        reset();
        setData('quantidade', '0');
        setTimeout(() => {
            document.getElementById('produto-nome')?.focus();
        }, 100);
    };

    const abrirModalEditar = (produto: Produto) => {
        setModalMode('edit');
        setProdutoSelecionado(produto);
        setShowModal(true);
        reset();
        setData({
            nome: produto.nome,
            preco: String(produto.preco ?? ''),
            quantidade: String(produto.quantidade_estoque ?? '0'),
            categoria_id: produto.categoria ? String(produto.categoria.id) : '',
            nova_categoria_nome: '',
        });
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
        if (modalMode === 'create') {
            post('/gerenciamento/produtos', {
                preserveScroll: true,
                onSuccess: () => {
                    fecharModal();
                    router.get('/gerenciamento/produtos', {}, { preserveScroll: true });
                },
            });
        } else if (modalMode === 'edit' && produtoSelecionado) {
            router.put(
                `/gerenciamento/produtos/${produtoSelecionado.id}`,
                { ...data },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        fecharModal();
                        router.get('/gerenciamento/produtos', {}, { preserveScroll: true });
                    },
                },
            );
        }
    };

    return (
        <GerenciamentoLayout title="Produtos">
            <Head title="Produtos" />
            <h2 className="visually-hidden" ref={h1Ref} tabIndex={-1}>
                Produtos
            </h2>

            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <div>
                        <h1 className="h3 m-0">Gestão de Produtos</h1>
                        <p className="text-secondary mb-0">Cadastre e acompanhe os itens da sua mercearia.</p>
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
                        <button className="btn btn-primary" onClick={abrirModalCriar}>
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

                <div className="card mb-4 shadow-sm">
                    <div className="card-body row g-3">
                        <div className="col-md-6 col-12">
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
                                    placeholder="Nome"
                                    aria-describedby="icone-busca"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    onKeyDown={onSearchKeyDown}
                                    onBlur={onSearchBlur}
                                />
                            </div>
                        </div>
                        <div className="col-md-4 col-12">
                            <label htmlFor="filtro-categoria" className="form-label">
                                Categoria
                            </label>
                            <select
                                id="filtro-categoria"
                                className="form-select"
                                value={categoriaFiltro}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setCategoriaFiltro(value);
                                    navegarComFiltros({ page: 1, categoriaId: value || undefined });
                                }}
                            >
                                <option value="">Todas</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id}>
                                        {categoria.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2 col-12">
                            <label htmlFor="per-page" className="form-label">
                                Por página
                            </label>
                            <select
                                id="per-page"
                                className="form-select"
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(e.target.value);
                                    navegarComFiltros({ page: 1, perPage: Number(e.target.value) });
                                }}
                            >
                                {[10, 15, 25, 50, 100].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center bg-white">
                        <strong>Produtos cadastrados</strong>
                        <div className="small text-secondary">Atualizados em tempo real conforme cadastros</div>
                    </div>
                    <div className="table-responsive">
                        <table className="mb-0 table align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th role="button" onClick={() => toggleSort('nome')} className="user-select-none">
                                        Produto {renderSortIcon('nome')}
                                    </th>
                                    <th className="user-select-none">
                                        Categoria
                                    </th>
                                    <th role="button" onClick={() => toggleSort('preco')} className="text-end user-select-none">
                                        Preço {renderSortIcon('preco')}
                                    </th>
                                    <th role="button" onClick={() => toggleSort('quantidade')} className="text-end user-select-none">
                                        Estoque {renderSortIcon('quantidade')}
                                    </th>
                                    <th role="button" onClick={() => toggleSort('updated_at')} className="user-select-none">
                                        Atualizado em {renderSortIcon('updated_at')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {produtosArray.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-secondary py-4 text-center">
                                            Nenhum produto encontrado.{' '}
                                            {produtosArray.length === 0 ? (
                                                <button className="btn btn-link p-0" type="button" onClick={abrirModalCriar}>
                                                    Cadastre o primeiro produto
                                                </button>
                                            ) : null}
                                        </td>
                                    </tr>
                                ) : (
                                    produtosOrdenados.map((produto) => (
                                        <tr key={produto.id}>
                                            <td>
                                                <div className="fw-semibold">{produto.nome}</div>
                                                <small className="text-secondary">ID: {produto.id}</small>
                                            </td>
                                            <td>{produto.categoria?.nome ?? '—'}</td>
                                            <td className="text-end">{currencyFormatter.format(Number(produto.preco ?? 0))}</td>
                                            <td className="text-end">{produto.quantidade_estoque}</td>
                                            <td>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <span>{new Date(produto.updated_at).toLocaleString('pt-BR')}</span>
                                                    <div className="d-flex ms-3 gap-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-secondary"
                                                            title="Editar"
                                                            onClick={() => abrirModalEditar(produto)}
                                                        >
                                                            <i className="bi bi-pencil" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            title="Excluir"
                                                            onClick={() => {
                                                                setProdutoSelecionado(produto);
                                                                setShowDeleteConfirm(true);
                                                            }}
                                                        >
                                                            <i className="bi bi-trash" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Paginação */}
                {isPaginated(produtos) && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="small text-secondary">
                            Mostrando {produtos.data.length} de {produtos.total} itens
                        </div>
                        <div className="btn-group" role="group" aria-label="Paginação">
                            <button
                                className="btn btn-outline-secondary"
                                disabled={produtos.current_page <= 1}
                                onClick={() => navegarComFiltros({ page: produtos.current_page - 1 })}
                            >
                                « Anterior
                            </button>
                            <span className="btn btn-outline-secondary disabled">
                                Página {produtos.current_page} de {produtos.last_page}
                            </span>
                            <button
                                className="btn btn-outline-secondary"
                                disabled={produtos.current_page >= produtos.last_page}
                                onClick={() => navegarComFiltros({ page: produtos.current_page + 1 })}
                            >
                                Próxima »
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <>
                    <div className="modal-backdrop fade show" onClick={fecharModal} />
                    <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{modalMode === 'create' ? 'Novo produto' : 'Editar produto'}</h5>
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

                                            <div className="col-md-6 col-12">
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

                                            <div className="col-md-6 col-12">
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

                                            <div className="col-md-6 col-12">
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

                                            <div className="col-md-6 col-12">
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
                                            {processing ? 'Salvando…' : modalMode === 'create' ? 'Salvar produto' : 'Atualizar produto'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {showDeleteConfirm && produtoSelecionado && (
                <>
                    <div className="modal-backdrop fade show" onClick={() => setShowDeleteConfirm(false)} />
                    <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Remover produto</h5>
                                    <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setShowDeleteConfirm(false)} />
                                </div>
                                <div className="modal-body">
                                    Tem certeza que deseja remover o produto "{produtoSelecionado.nome}"? Esta ação não pode ser desfeita.
                                </div>
                                <div className="modal-footer d-flex justify-content-between">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowDeleteConfirm(false)}>
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => {
                                            router.delete(`/gerenciamento/produtos/${produtoSelecionado.id}`, {
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    setShowDeleteConfirm(false);
                                                    setProdutoSelecionado(null);
                                                    router.get('/gerenciamento/produtos', {}, { preserveScroll: true });
                                                },
                                            });
                                        }}
                                    >
                                        Remover
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
