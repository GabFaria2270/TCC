import type { KeyboardEvent } from 'react';

interface CategoriaOption {
    id: number | string;
    nome: string;
}

interface ProdutosFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    onSearchBlur: () => void;
    categorias: CategoriaOption[];
    categoriaFiltro: string;
    onCategoriaChange: (value: string) => void;
    perPage: string;
    onPerPageChange: (value: string) => void;
    onlyLow: boolean;
    onToggleOnlyLow: () => void;
    onClearFilters: () => void;
}

export default function ProdutosFilters({
    searchTerm,
    onSearchChange,
    onSearchKeyDown,
    onSearchBlur,
    categorias,
    categoriaFiltro,
    onCategoriaChange,
    perPage,
    onPerPageChange,
    onlyLow,
    onToggleOnlyLow,
    onClearFilters,
}: ProdutosFiltersProps) {
    return (
        <div className="card filtros-card fade-in mb-4 border-0 shadow-sm">
            <div className="card-body produtos-filtros-grid">
                <div className="filtro-item">
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
                            onChange={(event) => onSearchChange(event.target.value)}
                            onKeyDown={onSearchKeyDown}
                            onBlur={onSearchBlur}
                        />
                    </div>
                </div>
                <div className="filtro-item">
                    <label htmlFor="filtro-categoria" className="form-label">
                        Categoria
                    </label>
                    <select
                        id="filtro-categoria"
                        className="form-select"
                        value={categoriaFiltro}
                        onChange={(event) => onCategoriaChange(event.target.value)}
                    >
                        <option value="">Todas</option>
                        {categorias.map((categoria) => (
                            <option key={categoria.id} value={categoria.id}>
                                {categoria.nome}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filtro-item filtro-per-page">
                    <label htmlFor="per-page" className="form-label">
                        Por página
                    </label>
                    <select id="per-page" className="form-select" value={perPage} onChange={(event) => onPerPageChange(event.target.value)}>
                        {[10, 15, 25, 50, 100].map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filtro-item filtro-baixos">
                    <button
                        type="button"
                        className={`btn btn-outline-warning btn-baixos ${onlyLow ? 'active' : ''}`}
                        aria-pressed={onlyLow}
                        onClick={onToggleOnlyLow}
                    >
                        <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
                        <span>Baixo estoque</span>
                    </button>
                </div>
                <div className="filtro-item filtro-limpar">
                    <button className="btn btn-outline-secondary btn-limpar-filtros" type="button" onClick={onClearFilters}>
                        Limpar filtros
                    </button>
                </div>
            </div>
        </div>
    );
}
