import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ModalPortal from '../../components/common/ModalPortal';
import CategoriaSelectCustom from '../../components/PDVcomponents/CategoriaSelectCustom';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';
import { formatarMoeda } from '../../utils/formatters';
// =============================================================
// Tipos e interfaces
// =============================================================

interface Categoria {
    id: number;
    nome: string;
}

interface Produto {
    id: number;
    nome: string;
    preco: string | number;
    estoque?: { quantidade: number };
    estoque_minimo?: number;
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
    onlyLow?: boolean;
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
    estoque_minimo?: string;
};

// =============================================================
// Formatadores e utilidades
// =============================================================
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

// Garante string numérica não-negativa (ou vazia)
function clampNonNegativeString(value: string): string {
    if (value === '') return '';
    const n = Number(value);
    if (Number.isNaN(n)) return '';
    return String(Math.max(0, Math.trunc(n)));
}

// Converte string BR (ex: 1.234,56) para número em string com ponto decimal (ex: 1234.56)
function normalizarMoedaBR(valor: string): string {
    if (!valor) return '';
    let v = valor.replace(/\./g, ''); // remove separador de milhar
    v = v.replace(',', '.'); // vírgula decimal -> ponto
    return v;
}

// Remove parâmetros de query da URL atual, mantendo o estado do Inertia
function hideFiltersInUrl() {
    try {
        const { state } = window.history;
        const clean = window.location.pathname + (window.location.hash || '');
        window.history.replaceState(state, '', clean);
    } catch {
        // silencioso, sem quebrar UX
    }
}

export default function Produtos({ produtos = [], categorias = [], error, filters }: Props) {
    const h1Ref = useRef<HTMLHeadingElement>(null);
    // =========================================================
    // Definições locais (tipos e mapeamentos de ordenação)
    // =========================================================
    // Campos de ordenação exibidos na UI
    type SortField = 'nome' | 'categoria' | 'preco' | 'quantidade' | 'updated_at';

    // Mapeia o sort da UI para o esperado pelo servidor
    function toServerSort(field: SortField): ServerFilters['sort'] {
        switch (field) {
            case 'quantidade':
                return 'quantidade_estoque'; // Mantém para compatibilidade backend, mas frontend usa estoque.quantidade
            case 'categoria':
                return 'nome';
            default:
                return field as ServerFilters['sort'];
        }
    }

    // Converte o sort vindo do servidor para o campo usado na UI
    function fromServerSort(field: ServerFilters['sort'] | undefined): SortField {
        switch (field) {
            case 'quantidade_estoque':
                return 'quantidade';
            case 'nome':
            case 'preco':
            case 'updated_at':
                return field;
            default:
                return 'nome';
        }
    }
    // Util: detecta paginação vinda do servidor ou array simples
    const isPaginated = (p: any): p is Paginacao<Produto> =>
        p && typeof p === 'object' && Array.isArray(p.data) && typeof p.current_page === 'number';

    // =========================================================
    // Estado inicial derivado de filtros do servidor
    // =========================================================
    const initialQ = filters?.q ?? '';
    const initialCategoria = filters?.categoriaId ? String(filters.categoriaId) : '';
    const initialSort: SortField = fromServerSort(filters?.sort ?? 'nome');
    const initialDir = (filters?.dir as any) ?? 'asc';
    const initialPerPage = typeof filters?.perPage === 'number' ? String(filters!.perPage) : '10';
    const initialOnlyLow = Boolean(filters?.onlyLow ?? false);

    // =========================================================
    // Estados (filtros, UI/modais e ordenação)
    // =========================================================
    const [searchTerm, setSearchTerm] = useState(initialQ);
    const [categoriaFiltro, setCategoriaFiltro] = useState(initialCategoria);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [perPage, setPerPage] = useState<string>(initialPerPage);
    const [onlyLow, setOnlyLow] = useState<boolean>(initialOnlyLow);

    // Estado para movimentos de estoque
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockMode, setStockMode] = useState<'entrada' | 'saida' | 'ajuste'>('ajuste');
    const [estoqueQuantidade, setEstoqueQuantidade] = useState<string>('');
    const [estoqueNovoSaldo, setEstoqueNovoSaldo] = useState<string>('0');
    const [estoqueMotivo, setEstoqueMotivo] = useState<string>('');

    const [sortBy, setSortBy] = useState<SortField>(initialSort);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialDir);

    // =========================================================
    // Formulário (create/update)
    // =========================================================
    const { data, setData, post, processing, errors, reset, transform } = useForm<ProdutoFormData>({
        nome: '',
        preco: '',
        quantidade: '',
        categoria_id: '',
        nova_categoria_nome: '',
        estoque_minimo: '',
    });

    // =========================================================
    // Efeitos de montagem/UX
    // =========================================================
    useEffect(() => {
        h1Ref.current?.focus();
        // Limpa qualquer query string inicial
        hideFiltersInUrl();
    }, []);

    // =========================================================
    // Derivados (useMemo): normalização e ordenação local
    // =========================================================
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
                    return Number(p.estoque?.quantidade ?? 0);
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

    // =========================================================
    // Ordenação (UI -> servidor)
    // =========================================================
    const toggleSort = (field: SortField) => {
        if (sortBy === field) {
            const newDir = sortDir === 'asc' ? 'desc' : 'asc';
            setSortDir(newDir);
            navegarComFiltros({ page: 1, sort: toServerSort(field), dir: newDir });
        } else {
            setSortBy(field);
            setSortDir('asc');
            navegarComFiltros({ page: 1, sort: toServerSort(field), dir: 'asc' });
        }
    };

    const renderSortIcon = (field: SortField) => {
        if (sortBy !== field) return <i className="bi bi-arrow-down-up text-muted ms-1" />;
        return sortDir === 'asc' ? <i className="bi bi-caret-up-fill ms-1" /> : <i className="bi bi-caret-down-fill ms-1" />;
    };

    // =========================================================
    // Busca com debounce: aplica filtro no servidor após digitação
    // =========================================================
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

    // =========================================================
    // Navegação com filtros/paginação
    // =========================================================
    const navegarComFiltros = (overrides?: Partial<ServerFilters & { page: number }>) => {
        const payload = {
            q: searchTerm || undefined,
            categoriaId: categoriaFiltro || undefined,
            sort: toServerSort(sortBy),
            dir: sortDir,
            perPage: Number(perPage) || 10,
            onlyLow: onlyLow || undefined,
            ...(overrides ?? {}),
        };
        router.post('/gerenciamento/produtos/filtros', payload, {
            preserveScroll: true,
            replace: true,
            preserveState: true,
            onSuccess: () => hideFiltersInUrl(),
        });
    };

    const handleRefresh = () => {
        setLoading(true);
        navegarComFiltros();
        setLoading(false);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setCategoriaFiltro('');
        setPerPage('10');
        setSortBy('nome');
        setSortDir('asc');
        setOnlyLow(false);
        router.post(
            '/gerenciamento/produtos/filtros',
            {},
            {
                preserveScroll: true,
                replace: true,
                preserveState: true,
                onSuccess: () => hideFiltersInUrl(),
            },
        );
    };

    // =========================================================
    // Abertura/fechamento de modal de produto (create/edit)
    // =========================================================
    const abrirModalCriar = () => {
        setModalMode('create');
        setProdutoSelecionado(null);
        setShowModal(true);
        reset();
        setData('quantidade', '');
        setData('estoque_minimo', '');
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
            preco: formatarMoeda(String(produto.preco ?? '')),
            quantidade: String(produto.estoque?.quantidade ?? '0'),
            categoria_id: produto.categoria ? String(produto.categoria.id) : '',
            nova_categoria_nome: '',
            estoque_minimo: String(produto.estoque_minimo ?? '0'),
        });
        setTimeout(() => {
            document.getElementById('produto-nome')?.focus();
        }, 100);
    };

    const fecharModal = () => {
        setShowModal(false);
        reset();
    };

    // Abre ajuste a partir do modal de edição, fechando o modal atual antes
    const abrirAjusteAPartirDoEditar = () => {
        if (!produtoSelecionado) return;
        const prod = produtoSelecionado;
        fecharModal();
        setTimeout(() => abrirModalEstoque(prod, 'ajuste'), 120);
    };

    // =========================================================
    // Modal de movimentos de estoque (entrada/saída/ajuste)
    // =========================================================
    const abrirModalEstoque = (produto: Produto, modo?: 'entrada' | 'saida' | 'ajuste') => {
        setProdutoSelecionado(produto);
        const m = modo ?? 'entrada';
        setStockMode(m);
        if (m === 'ajuste') {
            setEstoqueNovoSaldo(String(produto.estoque?.quantidade ?? '0'));
        } else {
            setEstoqueQuantidade('');
        }
        setEstoqueMotivo('');
        setShowStockModal(true);
        setTimeout(() => {
            const id = m === 'ajuste' ? 'ajuste-novo-saldo' : 'mov-quantidade';
            document.getElementById(id)?.focus();
        }, 100);
    };

    const fecharModalEstoque = () => {
        setShowStockModal(false);
        setProdutoSelecionado(null);
        setEstoqueQuantidade('');
        setEstoqueNovoSaldo('0');
        setEstoqueMotivo('');
    };

    // Submissão do movimento de estoque
    const submitMovimentoEstoque = (event: React.FormEvent) => {
        event.preventDefault();
        if (!produtoSelecionado) return;
        const base = `/gerenciamento/produtos/${produtoSelecionado.id}/estoque`;
        if (stockMode === 'entrada') {
            router.post(
                `${base}/entrada`,
                { quantidade: Number(estoqueQuantidade), motivo: estoqueMotivo || undefined },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        fecharModalEstoque();
                        router.get(
                            '/gerenciamento/produtos',
                            {},
                            {
                                preserveScroll: true,
                                onSuccess: () => hideFiltersInUrl(),
                            },
                        );
                    },
                },
            );
        } else if (stockMode === 'saida') {
            router.post(
                `${base}/saida`,
                { quantidade: Number(estoqueQuantidade), motivo: estoqueMotivo || undefined },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        fecharModalEstoque();
                        router.get(
                            '/gerenciamento/produtos',
                            {},
                            {
                                preserveScroll: true,
                                onSuccess: () => hideFiltersInUrl(),
                            },
                        );
                    },
                },
            );
        } else {
            router.post(
                `${base}/ajuste`,
                { novoSaldo: Number(estoqueNovoSaldo), motivo: estoqueMotivo || undefined },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        fecharModalEstoque();
                        router.get(
                            '/gerenciamento/produtos',
                            {},
                            {
                                preserveScroll: true,
                                onSuccess: () => hideFiltersInUrl(),
                            },
                        );
                    },
                },
            );
        }
    };

    // =========================================================
    // UX: fechar modal com ESC e bloquear scroll de fundo
    // =========================================================
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

    // =========================================================
    // Submissão de formulário (create/update)
    // =========================================================
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (modalMode === 'create') {
            // normaliza preço para padrão numérico antes do envio
            transform((formData) => ({ ...formData, preco: normalizarMoedaBR(formData.preco) }));
            post('/gerenciamento/produtos', {
                preserveScroll: true,
                onSuccess: () => {
                    fecharModal();
                    router.get(
                        '/gerenciamento/produtos',
                        {},
                        {
                            preserveScroll: true,
                            onSuccess: () => hideFiltersInUrl(),
                        },
                    );
                },
            });
        } else if (modalMode === 'edit' && produtoSelecionado) {
            router.put(
                `/gerenciamento/produtos/${produtoSelecionado.id}`,
                { ...data, preco: normalizarMoedaBR(data.preco) },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        fecharModal();
                        router.get(
                            '/gerenciamento/produtos',
                            {},
                            {
                                preserveScroll: true,
                                onSuccess: () => hideFiltersInUrl(),
                            },
                        );
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
                {/* ===================================================== */}
                {/* Cabeçalho / Ações principais                         */}
                {/* ===================================================== */}
                <div className="d-flex justify-content-between align-items-center rounded-3 bg-body-tertiary elemento-produtos-1 mb-4 flex-wrap gap-3 border p-3">
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
                        <button className="btn btn-primary elemento-produtos-3" onClick={abrirModalCriar}>
                            <i className="bi bi-plus-lg" /> Novo produto
                        </button>
                    </div>
                </div>

                {/* ===================================================== */}
                {/* Alerta de erro                                        */}
                {/* ===================================================== */}
                {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2" />
                        {error}
                    </div>
                )}

                {/* ===================================================== */}
                {/* Filtros e controles                                   */}
                {/* ===================================================== */}
                <div className="card filtros-card fade-in mb-4 border-0 shadow-sm">
                    <div className="card-body row g-1 align-items-end">
                        <div className="col">
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
                        <div className="col-auto">
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
                        <div className="col-auto">
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
                        <div className="d-flex align-items-end col-auto">
                            <div className="form-check ms-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="only-low"
                                    checked={onlyLow}
                                    onChange={(e) => {
                                        setOnlyLow(e.target.checked);
                                        navegarComFiltros({ page: 1, onlyLow: e.target.checked || undefined });
                                    }}
                                />
                                <label className="form-check-label" htmlFor="only-low">
                                    Baixos
                                </label>
                            </div>
                        </div>
                        <div className="d-flex align-items-end justify-content-end col-auto">
                            <button className="btn btn-outline-secondary" type="button" onClick={handleClearFilters}>
                                Limpar filtros
                            </button>
                        </div>
                    </div>
                </div>

                {/* ===================================================== */}
                {/* Tabela de produtos                                    */}
                {/* ===================================================== */}
                <div className="card fade-in elemento-produtos-2 border-0 shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center bg-body-tertiary border-0">
                        <strong>Produtos cadastrados</strong>
                        <div className="small text-secondary">Atualizados em tempo real conforme cadastros</div>
                    </div>
                    <div className="table-responsive scroll-shadow">
                        <table className="table-hover table-striped data-table mb-0 table align-middle">
                            <thead>
                                <tr>
                                    <th role="button" onClick={() => toggleSort('nome')} className="user-select-none">
                                        Produto {renderSortIcon('nome')}
                                    </th>
                                    <th className="user-select-none">Categoria</th>
                                    <th role="button" onClick={() => toggleSort('preco')} className="user-select-none text-end">
                                        Preço {renderSortIcon('preco')}
                                    </th>
                                    <th role="button" onClick={() => toggleSort('quantidade')} className="user-select-none text-end">
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
                                        <td colSpan={5} className="estado-vazio">
                                            <i className="bi bi-box-seam display-6 d-block mb-2"></i>
                                            Nenhum produto encontrado.{' '}
                                            {produtosArray.length === 0 ? (
                                                <button className="btn btn-link p-0" type="button" onClick={abrirModalCriar}>
                                                    Cadastre o primeiro produto
                                                </button>
                                            ) : null}
                                        </td>
                                    </tr>
                                ) : (
                                    produtosOrdenados.map((produto) => {
                                        const min = produto.estoque_minimo ?? 0;
                                        const qtd = produto.estoque?.quantidade ?? 0;
                                        // Considera "baixo" quando quantidade <= mínimo, mesmo que mínimo seja 0
                                        const isLow = qtd <= min;
                                        return (
                                            <tr key={produto.id} className={isLow ? 'table-warning' : ''}>
                                                <td data-label="Produto">
                                                    <div className="fw-semibold">{produto.nome}</div>
                                                    <small className="text-secondary">ID: {produto.id}</small>
                                                </td>
                                                <td data-label="Categoria">
                                                    {produto.categoria?.nome ? (
                                                        <span className="badge text-bg-secondary">{produto.categoria.nome}</span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="text-end" data-label="Preço">
                                                    {currencyFormatter.format(Number(produto.preco ?? 0))}
                                                </td>
                                                <td className="text-end" data-label="Estoque">
                                                    {produto.estoque?.quantidade ?? 0}
                                                    {isLow && <span className="badge text-bg-warning ms-2">Baixo</span>}
                                                </td>
                                                <td data-label="Atualizado em">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <span>{new Date(produto.updated_at).toLocaleString('pt-BR')}</span>
                                                        <div className="d-flex ms-3 flex-wrap gap-2">
                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary btn-sm px-3"
                                                                title="Editar"
                                                                aria-label="Editar produto"
                                                                onClick={() => abrirModalEditar(produto)}
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                                <span className="d-none d-sm-inline ms-2">Editar</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-primary btn-sm px-3"
                                                                title="Movimentar estoque"
                                                                aria-label="Movimentar estoque do produto"
                                                                onClick={() => abrirModalEstoque(produto)}
                                                            >
                                                                <i className="bi bi-arrow-left-right"></i>
                                                                <span className="d-none d-sm-inline ms-2">Movimentar</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-info btn-sm px-3"
                                                                title="Histórico de estoque"
                                                                aria-label="Ver histórico de estoque"
                                                                onClick={() =>
                                                                    router.get(
                                                                        `/gerenciamento/produtos/${produto.id}/historico`,
                                                                        {},
                                                                        { preserveScroll: true },
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-clock-history"></i>
                                                                <span className="d-none d-sm-inline ms-2">Histórico</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm px-3"
                                                                title="Excluir"
                                                                aria-label="Excluir produto"
                                                                onClick={() => {
                                                                    setProdutoSelecionado(produto);
                                                                    setShowDeleteConfirm(true);
                                                                }}
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                                <span className="d-none d-sm-inline ms-2">Excluir</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ===================================================== */}
                {/* Paginação                                              */}
                {/* ===================================================== */}
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

            {/* ========================================================= */}
            {/* Modal: Criar/Editar produto                               */}
            {/* ========================================================= */}
            {showModal && (
                <ModalPortal>
                    <div className="modal-backdrop fade show" onClick={fecharModal}></div>
                    <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header border-0">
                                    <h5 className="modal-title">{modalMode === 'create' ? 'Novo produto' : 'Editar produto'}</h5>
                                    <button type="button" className="btn-close" aria-label="Fechar" onClick={fecharModal} />
                                </div>
                                <form onSubmit={submit}>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <label htmlFor="produto-nome" className="form-label">
                                                    Nome*
                                                </label>
                                                <input
                                                    id="produto-nome"
                                                    type="text"
                                                    className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                                                    value={data.nome}
                                                    onChange={(e) => setData('nome', e.target.value)}
                                                    required
                                                    disabled={processing}
                                                />
                                                {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="produto-preco" className="form-label">
                                                    Preço (R$)*
                                                </label>
                                                <div className="input-group">
                                                    <span className="input-group-text">R$</span>
                                                    <input
                                                        id="produto-preco"
                                                        type="text"
                                                        className={`form-control ${errors.preco ? 'is-invalid' : ''}`}
                                                        value={data.preco}
                                                        onChange={(e) => setData('preco', formatarMoeda(e.target.value))}
                                                        placeholder="0,00"
                                                        inputMode="numeric"
                                                        disabled={processing}
                                                        required
                                                    />
                                                </div>
                                                {errors.preco && <div className="invalid-feedback">{errors.preco}</div>}
                                            </div>
                                            {modalMode === 'create' ? (
                                                <div className="col-md-6 mb-3">
                                                    <label htmlFor="produto-quantidade" className="form-label">
                                                        Quantidade em estoque*
                                                    </label>
                                                    <input
                                                        id="produto-quantidade"
                                                        type="number"
                                                        min={0}
                                                        step="1"
                                                        className={`form-control ${errors.quantidade ? 'is-invalid' : ''}`}
                                                        value={data.quantidade}
                                                        onChange={(event) => setData('quantidade', clampNonNegativeString(event.target.value))}
                                                        onKeyDown={(e) => {
                                                            if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        placeholder=""
                                                        required
                                                        disabled={processing}
                                                    />
                                                    {errors.quantidade && <div className="invalid-feedback">{errors.quantidade}</div>}
                                                </div>
                                            ) : (
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Estoque atual</label>
                                                    <div className="form-control-plaintext fw-semibold">
                                                        {produtoSelecionado?.estoque?.quantidade ?? 0}
                                                    </div>
                                                    <small className="text-secondary">
                                                        Para alterar estoque, use os movimentos.{' '}
                                                        <button
                                                            type="button"
                                                            className="btn btn-link btn-sm p-0 align-baseline"
                                                            onClick={abrirAjusteAPartirDoEditar}
                                                        >
                                                            Abrir ajuste de estoque
                                                        </button>
                                                    </small>
                                                </div>
                                            )}
                                            <div className="col-md-6 d-flex flex-column mb-3 gap-2">
                                                <CategoriaSelectCustom
                                                    categorias={[
                                                        { value: '', label: 'Categoria' },
                                                        ...categorias.map((c) => ({ value: String(c.id), label: c.nome })),
                                                    ]}
                                                    value={(() => {
                                                        const found = categorias.find((c) => String(c.id) === String(data.categoria_id));
                                                        return found
                                                            ? { value: String(found.id), label: found.nome }
                                                            : { value: '', label: 'Categoria' };
                                                    })()}
                                                    onChange={(option: any) => setData('categoria_id', option ? option.value : '')}
                                                    isDisabled={processing}
                                                    placeholder="Selecione ou busque uma categoria"
                                                />
                                                <div>
                                                    <label htmlFor="produto-nova-categoria" className="form-label mb-1">
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
                                                    {errors.nova_categoria_nome && (
                                                        <div className="invalid-feedback">{errors.nova_categoria_nome}</div>
                                                    )}
                                                    <small className="text-secondary">
                                                        Você pode escolher uma categoria existente ou informar uma nova.
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="produto-estoque-minimo" className="form-label">
                                                    Estoque mínimo (alerta)
                                                </label>
                                                <input
                                                    id="produto-estoque-minimo"
                                                    type="number"
                                                    min={0}
                                                    step={1}
                                                    className={`form-control ${errors.estoque_minimo ? 'is-invalid' : ''}`}
                                                    value={data.estoque_minimo ?? ''}
                                                    onChange={(e) => setData('estoque_minimo', clampNonNegativeString(e.target.value))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    placeholder=""
                                                    disabled={processing}
                                                />
                                                {errors.estoque_minimo && <div className="invalid-feedback">{errors.estoque_minimo}</div>}
                                                <small className="text-secondary">Usado para destacar produtos com estoque baixo.</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer d-flex justify-content-between border-0">
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
                </ModalPortal>
            )}

            {/* ========================================================= */}
            {/* Modal: Confirmar exclusão                                 */}
            {/* ========================================================= */}
            {showDeleteConfirm && produtoSelecionado && (
                <ModalPortal>
                    <div className="modal-backdrop fade show" onClick={() => setShowDeleteConfirm(false)}></div>
                    <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header border-0">
                                    <h5 className="modal-title">Remover produto</h5>
                                    <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setShowDeleteConfirm(false)} />
                                </div>
                                <div className="modal-body">
                                    Tem certeza que deseja remover o produto "{produtoSelecionado.nome}"? Esta ação não pode ser desfeita.
                                </div>
                                <div className="modal-footer d-flex justify-content-between border-0">
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
                                                    router.get(
                                                        '/gerenciamento/produtos',
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                            onSuccess: () => hideFiltersInUrl(),
                                                        },
                                                    );
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
                </ModalPortal>
            )}

            {/* ========================================================= */}
            {/* Modal: Movimentos de estoque                              */}
            {/* ========================================================= */}
            {showStockModal && produtoSelecionado && (
                <ModalPortal>
                    <div className="modal-backdrop fade show" onClick={fecharModalEstoque}></div>
                    <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header border-0">
                                    <h5 className="modal-title">
                                        {stockMode === 'entrada' && 'Entrada de estoque'}
                                        {stockMode === 'saida' && 'Saída de estoque'}
                                        {stockMode === 'ajuste' && 'Ajustar estoque'}
                                    </h5>
                                    <button type="button" className="btn-close" aria-label="Fechar" onClick={fecharModalEstoque} />
                                </div>
                                <form onSubmit={submitMovimentoEstoque}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label htmlFor="mov-tipo" className="form-label">
                                                Tipo de movimento
                                            </label>
                                            <select
                                                id="mov-tipo"
                                                className="form-select"
                                                value={stockMode}
                                                onChange={(e) => setStockMode(e.target.value as any)}
                                            >
                                                <option value="entrada">Entrada</option>
                                                <option value="saida">Saída</option>
                                                <option value="ajuste">Ajuste</option>
                                            </select>
                                        </div>

                                        {stockMode === 'ajuste' ? (
                                            <div className="mb-3">
                                                <label htmlFor="ajuste-novo-saldo" className="form-label">
                                                    Novo estoque
                                                </label>
                                                <input
                                                    id="ajuste-novo-saldo"
                                                    type="number"
                                                    min={0}
                                                    step={1}
                                                    className="form-control"
                                                    value={estoqueNovoSaldo}
                                                    onChange={(e) => setEstoqueNovoSaldo(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            <div className="mb-3">
                                                <label htmlFor="mov-quantidade" className="form-label">
                                                    Quantidade*
                                                </label>
                                                <input
                                                    id="mov-quantidade"
                                                    type="number"
                                                    min={1}
                                                    step={1}
                                                    className="form-control"
                                                    value={estoqueQuantidade}
                                                    onChange={(e) => setEstoqueQuantidade(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        )}
                                        <div className="mb-3">
                                            <label htmlFor="mov-motivo" className="form-label">
                                                Motivo (opcional)
                                            </label>
                                            <input
                                                id="mov-motivo"
                                                type="text"
                                                className="form-control"
                                                value={estoqueMotivo}
                                                onChange={(e) => setEstoqueMotivo(e.target.value)}
                                                maxLength={255}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer d-flex justify-content-between border-0">
                                        <button type="button" className="btn btn-outline-secondary" onClick={fecharModalEstoque}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={processing}>
                                            Confirmar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </GerenciamentoLayout>
    );
}

// Modal de movimentos de estoque
// Inserido fora do retorno principal para manter o arquivo organizado (poderia ser componente separado)
// Será renderizado condicionalmente acima do fechamento do layout
