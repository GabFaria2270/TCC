import type { ReactNode } from 'react';

export type ProdutosSortField = 'nome' | 'categoria' | 'preco' | 'quantidade' | 'updated_at';

export interface ProdutoListBase {
    id: number;
    nome: string;
    preco: number | string;
    categoria?: {
        id?: number;
        nome?: string;
    } | null;
    estoque?: {
        quantidade?: number;
    };
    estoque_minimo?: number | null;
    updated_at: string;
}

export interface ProdutosListSectionProps<T extends ProdutoListBase = ProdutoListBase> {
    isDesktop: boolean;
    produtosArray: T[];
    produtosOrdenados: T[];
    onSort: (field: ProdutosSortField) => void;
    renderSortIcon: (field: ProdutosSortField) => ReactNode;
    onCreate: () => void;
    onEdit: (produto: T) => void;
    onMoveStock: (produto: T) => void;
    onDelete: (produto: T) => void;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

function isEstoqueBaixo(produto: ProdutoListBase): boolean {
    const minimo = produto.estoque_minimo ?? 0;
    const quantidade = produto.estoque?.quantidade ?? 0;
    if (minimo <= 0) {
        return false;
    }
    return quantidade <= minimo;
}

export default function ProdutosListSection<T extends ProdutoListBase = ProdutoListBase>({
    isDesktop,
    produtosArray,
    produtosOrdenados,
    onSort,
    renderSortIcon,
    onCreate,
    onEdit,
    onMoveStock,
    onDelete,
}: ProdutosListSectionProps<T>) {
    if (isDesktop) {
        return (
            <div className="card fade-in elemento-produtos-2 border-0 shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center bg-body-tertiary border-0">
                    <strong>Produtos cadastrados</strong>
                    <div className="small text-secondary">Atualizados em tempo real conforme cadastros</div>
                </div>
                <div className="table-responsive scroll-shadow">
                    <table className="table-hover data-table mb-0 table align-middle">
                        <thead>
                            <tr>
                                <th role="button" onClick={() => onSort('nome')} className="user-select-none">
                                    Produto {renderSortIcon('nome')}
                                </th>
                                <th className="user-select-none">Categoria</th>
                                <th role="button" onClick={() => onSort('preco')} className="user-select-none text-end">
                                    Preço {renderSortIcon('preco')}
                                </th>
                                <th role="button" onClick={() => onSort('quantidade')} className="user-select-none text-end">
                                    Estoque {renderSortIcon('quantidade')}
                                </th>
                                <th role="button" onClick={() => onSort('updated_at')} className="user-select-none">
                                    Atualizado em {renderSortIcon('updated_at')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {produtosArray.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="estado-vazio">
                                        <i className="bi bi-box-seam display-6 d-block mb-2"></i>
                                        Nenhum produto encontrado.
                                        <button className="btn btn-link p-0" type="button" onClick={onCreate}>
                                            Cadastre o primeiro produto
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                produtosOrdenados.map((produto) => {
                                    const baixa = isEstoqueBaixo(produto);
                                    const quantidade = produto.estoque?.quantidade ?? 0;
                                    return (
                                        <tr key={produto.id} className={baixa ? 'table-warning' : ''}>
                                            <td data-label="Produto">
                                                <div className="fw-semibold">{produto.nome}</div>
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
                                                {quantidade}
                                                {baixa && <span className="badge text-bg-warning ms-2">Baixo</span>}
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
                                                            onClick={() => onEdit(produto)}
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                            <span className="d-none d-sm-inline ms-2">Editar</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-primary btn-sm px-3"
                                                            title="Movimentar estoque"
                                                            aria-label="Movimentar estoque do produto"
                                                            onClick={() => onMoveStock(produto)}
                                                        >
                                                            <i className="bi bi-arrow-left-right"></i>
                                                            <span className="d-none d-sm-inline ms-2">Movimentar</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm px-3"
                                                            title="Excluir"
                                                            aria-label="Excluir produto"
                                                            onClick={() => onDelete(produto)}
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
        );
    }

    return (
        <div className="card fade-in elemento-produtos-2 border-0 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center bg-body-tertiary border-0">
                <strong>Produtos cadastrados</strong>
                <div className="small text-secondary">Atualizados em tempo real conforme cadastros</div>
            </div>
            <div className="produtos-card-list d-flex flex-column gap-3 p-3">
                {produtosArray.length === 0 ? (
                    <div className="text-muted py-5 text-center">
                        <i className="bi bi-box-seam display-6 d-block mb-2"></i>
                        Nenhum produto encontrado.
                        <div className="mt-2">
                            <button className="btn btn-link p-0" type="button" onClick={onCreate}>
                                Cadastre o primeiro produto
                            </button>
                        </div>
                    </div>
                ) : (
                    produtosOrdenados.map((produto) => {
                        const baixa = isEstoqueBaixo(produto);
                        const precoFormatado = currencyFormatter.format(Number(produto.preco ?? 0));
                        const atualizadoEm = new Date(produto.updated_at).toLocaleString('pt-BR');
                        const quantidade = produto.estoque?.quantidade ?? 0;
                        const minimo = produto.estoque_minimo ?? 0;
                        return (
                            <div key={produto.id} className={`card border-0 shadow-sm ${baixa ? 'border-warning-subtle border' : ''}`}>
                                <div className="card-body d-flex flex-column gap-2 p-3">
                                    <div className="d-flex justify-content-between align-items-start gap-3">
                                        <div className="min-w-0">
                                            <h5 className="text-break mb-1">{produto.nome}</h5>
                                        </div>
                                        <div className="text-end">
                                            <span className="badge text-bg-primary fs-6">{precoFormatado}</span>
                                            {baixa && <div className="badge text-bg-warning text-dark d-block mt-2">Estoque baixo</div>}
                                        </div>
                                    </div>
                                    <div className="small text-secondary d-flex align-items-center text-break">
                                        <i className="bi bi-tag me-2" aria-hidden="true"></i>
                                        Categoria:
                                        {produto.categoria?.nome ? (
                                            <span className="badge text-bg-secondary ms-2">{produto.categoria.nome}</span>
                                        ) : (
                                            <span className="ms-2">Sem categoria</span>
                                        )}
                                    </div>
                                    <div className="small text-secondary d-flex align-items-center">
                                        <i className="bi bi-box-seam me-2" aria-hidden="true"></i>
                                        Estoque:
                                        <span className="fw-semibold text-body ms-2">{quantidade}</span>
                                        {minimo > 0 && <span className="text-muted ms-2">mín: {minimo}</span>}
                                    </div>
                                    <div className="small text-secondary d-flex align-items-center text-break">
                                        <i className="bi bi-clock-history me-2" aria-hidden="true"></i>
                                        Atualizado em {atualizadoEm}
                                    </div>
                                    <div className="d-flex mt-3 flex-wrap gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary flex-fill"
                                            title="Editar"
                                            aria-label="Editar produto"
                                            onClick={() => onEdit(produto)}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-success flex-fill"
                                            title="Movimentar estoque"
                                            aria-label="Movimentar estoque do produto"
                                            onClick={() => onMoveStock(produto)}
                                        >
                                            <i className="bi bi-arrow-left-right"></i>
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-outline-danger flex-fill"
                                            title="Excluir"
                                            aria-label="Excluir produto"
                                            onClick={() => onDelete(produto)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
