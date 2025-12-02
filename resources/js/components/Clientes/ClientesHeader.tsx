import HistoricoContaFiada from '@/components/PDVcomponents/HistoricoContaFiada';
import type { HistoricoFiadoItem } from '@/types/gerenciamento/Clientes';

type StatusFiltro = '' | 'pendente' | 'quitada';

interface ClientesHeaderProps {
    loading: boolean;
    search: string;
    status: StatusFiltro;
    total: number;
    filtered: number;
    hasFilters: boolean;
    onRefresh: () => void;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: StatusFiltro) => void;
    onResetFilters: () => void;
    historicoInicial?: HistoricoFiadoItem[];
}

export default function ClientesHeader({
    loading,
    search,
    status,
    total,
    filtered,
    hasFilters,
    onRefresh,
    onSearchChange,
    onStatusChange,
    onResetFilters,
    historicoInicial = [],
}: ClientesHeaderProps) {
    return (
        <div className="clientes-header elemento-clientes-1">
            <div className="clientes-header-content elemento-clientes-2">
                <div className="clientes-title-section elemento-clientes-3">
                    <h1 className="clientes-title">Gestão de Clientes</h1>
                    <p className="clientes-subtitle">Gerencie seus clientes e contas fiadas</p>
                </div>
                <div className="clientes-actions elemento-clientes-4">
                    <button className="btn-refresh" onClick={onRefresh} disabled={loading}>
                        {loading ? <span className="spinner-loading" /> : <i className="bi bi-arrow-clockwise" />}
                        Atualizar
                    </button>
                    <HistoricoContaFiada initialData={historicoInicial} />
                </div>
            </div>

            <div className="clientes-filtros-responsive">
                <div className="search-input-group-responsive">
                    <i className="bi bi-search search-icon" aria-hidden="true" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar por nome ou e-mail..."
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        maxLength={100}
                        aria-label="Buscar clientes"
                    />
                </div>
                <div className="clientes-filtros-row">
                    <select
                        className="form-select"
                        style={{ width: '200px', flexShrink: 0 }}
                        value={status}
                        onChange={(event) => onStatusChange(event.target.value as StatusFiltro)}
                    >
                        <option value="">Todas as contas</option>
                        <option value="pendente">📋 Conta Pendente</option>
                        <option value="quitada">✅ Conta Quitada</option>
                    </select>
                    <button
                        className="btn btn-outline-secondary flex-shrink-0"
                        onClick={onResetFilters}
                        title="Limpar filtros"
                        disabled={!hasFilters}
                    >
                        <i className="bi bi-arrow-clockwise" />
                    </button>
                </div>
            </div>

            <div className="clientes-counter">
                {filtered} de {total} clientes
                {hasFilters && <small className="text-muted ms-2">(filtros aplicados)</small>}
            </div>
        </div>
    );
}
