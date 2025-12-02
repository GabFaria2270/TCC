import type { ProdutoListBase } from '@/components/Produtos/ProdutosListSection';

export interface Categoria {
    id: number;
    nome: string;
}

export interface Produto extends ProdutoListBase {
    categoria?: Categoria | null;
    created_at: string;
}

export interface Paginacao<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface ServerFilters {
    q?: string;
    categoriaId?: string | number | null;
    sort?: 'nome' | 'preco' | 'quantidade_estoque' | 'updated_at';
    dir?: 'asc' | 'desc';
    perPage?: number;
    onlyLow?: boolean;
}

export interface ProdutoFormData {
    nome: string;
    preco: string;
    quantidade: string;
    categoria_id: string;
    nova_categoria_nome: string;
    estoque_minimo?: string;
    [key: string]: string | undefined;
}
