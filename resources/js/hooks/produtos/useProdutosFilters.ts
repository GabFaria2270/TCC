import type { ProdutosSortField as SortField } from '@/components/Produtos/ProdutosListSection';
import type { Paginacao, Produto, ServerFilters } from '@/types/gerenciamento/Produtos';
import { hideFiltersInUrl, isPaginated } from '@/utils/produtos';
import type { VisitOptions } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

interface UseProdutosFiltersArgs {
    produtos: Paginacao<Produto> | Produto[];
    filters?: ServerFilters;
}

interface UseProdutosFiltersResult {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    categoriaFiltro: string;
    handleCategoriaChange: (value: string) => void;
    perPage: string;
    handlePerPageChange: (value: string) => void;
    onlyLow: boolean;
    handleToggleOnlyLow: () => void;
    produtosArray: Produto[];
    produtosOrdenados: Produto[];
    sortBy: SortField;
    sortDir: 'asc' | 'desc';
    toggleSort: (field: SortField) => void;
    onSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    onSearchBlur: () => void;
    navegarComFiltros: (overrides?: Partial<ServerFilters & { page: number }>, options?: VisitOptions) => void;
    handleRefresh: () => void;
    handleClearFilters: () => void;
    loading: boolean;
}

const toServerSort = (field: SortField): ServerFilters['sort'] => {
    switch (field) {
        case 'quantidade':
            return 'quantidade_estoque';
        case 'categoria':
            return 'nome';
        default:
            return field;
    }
};

const fromServerSort = (field: ServerFilters['sort'] | undefined): SortField => {
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
};

export function useProdutosFilters({ produtos, filters }: UseProdutosFiltersArgs): UseProdutosFiltersResult {
    const initialQ = filters?.q ?? '';
    const initialCategoria = filters?.categoriaId ? String(filters.categoriaId) : '';
    const initialSort: SortField = fromServerSort(filters?.sort ?? 'nome');
    const initialDir = (filters?.dir as 'asc' | 'desc') ?? 'asc';
    const initialPerPage = typeof filters?.perPage === 'number' ? String(filters.perPage) : '10';
    const initialOnlyLow = Boolean(filters?.onlyLow ?? false);

    const [searchTerm, setSearchTerm] = useState(initialQ);
    const [categoriaFiltro, setCategoriaFiltro] = useState(initialCategoria);
    const [perPage, setPerPage] = useState<string>(initialPerPage);
    const [onlyLow, setOnlyLow] = useState<boolean>(initialOnlyLow);
    const [sortBy, setSortBy] = useState<SortField>(initialSort);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialDir);
    const [loading, setLoading] = useState(false);

    const immediateNavRef = useRef(false);

    const produtosArray: Produto[] = useMemo(() => (isPaginated<Produto>(produtos) ? produtos.data : produtos), [produtos]);

    const produtosOrdenados = useMemo(() => {
        if (isPaginated<Produto>(produtos)) {
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

    const navegarComFiltros = useCallback(
        (overrides?: Partial<ServerFilters & { page: number }>, options?: VisitOptions) => {
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
                ...options,
                onSuccess: (...args) => {
                    hideFiltersInUrl();
                    options?.onSuccess?.(...args);
                },
            });
        },
        [searchTerm, categoriaFiltro, sortBy, sortDir, perPage, onlyLow],
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            if (immediateNavRef.current) {
                immediateNavRef.current = false;
                return;
            }
            if (filters?.q === searchTerm) return;
            navegarComFiltros({ page: 1, q: searchTerm || undefined });
        }, 750);

        return () => clearTimeout(handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
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

    const handleRefresh = () => {
        navegarComFiltros(undefined, {
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
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

    const handleCategoriaChange = (value: string) => {
        setCategoriaFiltro(value);
        navegarComFiltros({ page: 1, categoriaId: value || undefined });
    };

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        navegarComFiltros({ page: 1, perPage: Number(value) });
    };

    const handleToggleOnlyLow = () => {
        const next = !onlyLow;
        setOnlyLow(next);
        navegarComFiltros({ page: 1, onlyLow: next || undefined });
    };

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

    return {
        searchTerm,
        setSearchTerm,
        categoriaFiltro,
        handleCategoriaChange,
        perPage,
        handlePerPageChange,
        onlyLow,
        handleToggleOnlyLow,
        produtosArray,
        produtosOrdenados,
        sortBy,
        sortDir,
        toggleSort,
        onSearchKeyDown,
        onSearchBlur,
        navegarComFiltros,
        handleRefresh,
        handleClearFilters,
        loading,
    };
}
