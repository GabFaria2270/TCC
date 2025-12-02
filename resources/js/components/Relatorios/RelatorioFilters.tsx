import type { RelatorioTabela } from '@/types/gerenciamento/Relatorio';
import { buildFiltroClasses } from '@/utils/relatorios';

interface RelatorioFiltersProps {
    tabela: RelatorioTabela;
    filtroDataInicio: string;
    filtroDataFim: string;
    filtroStatus: string;
    filtroPagamento: string;
    filtroTipo: string;
    onChangeDataInicio: (value: string) => void;
    onChangeDataFim: (value: string) => void;
    onChangeStatus: (value: string) => void;
    onChangePagamento: (value: string) => void;
    onChangeTipo: (value: string) => void;
    onBuscar: () => void;
    onLimpar: () => void;
    loading: boolean;
}

export default function RelatorioFilters({
    tabela,
    filtroDataInicio,
    filtroDataFim,
    filtroStatus,
    filtroPagamento,
    filtroTipo,
    onChangeDataInicio,
    onChangeDataFim,
    onChangeStatus,
    onChangePagamento,
    onChangeTipo,
    onBuscar,
    onLimpar,
    loading,
}: RelatorioFiltersProps) {
    const classes = buildFiltroClasses(tabela);

    return (
        <div className="card filtros-card fade-in elemento-relatorio-2 mb-4 border-0 shadow-sm">
            <div className="card-body">
                <div className="relatorio-filtros row g-2 g-md-3 align-items-end">
                    <div className={classes.data}>
                        <label htmlFor="filtro-data-inicio" className="form-label">
                            Data início
                        </label>
                        <input
                            id="filtro-data-inicio"
                            type="date"
                            className="form-control"
                            value={filtroDataInicio}
                            onChange={(e) => onChangeDataInicio(e.target.value)}
                        />
                    </div>
                    <div className={classes.data}>
                        <label htmlFor="filtro-data-fim" className="form-label">
                            Data fim
                        </label>
                        <input
                            id="filtro-data-fim"
                            type="date"
                            className="form-control"
                            value={filtroDataFim}
                            onChange={(e) => onChangeDataFim(e.target.value)}
                        />
                    </div>
                    {tabela === 'vendas' && (
                        <>
                            <div className={classes.status}>
                                <label htmlFor="filtro-status" className="form-label">
                                    Status
                                </label>
                                <select
                                    id="filtro-status"
                                    className="form-select"
                                    value={filtroStatus}
                                    onChange={(e) => onChangeStatus(e.target.value)}
                                >
                                    <option value="">Todos os status</option>
                                    <option value="concluida">✅ Concluída</option>
                                    <option value="pendente">⏳ Pendente</option>
                                    <option value="cancelada">❌ Cancelada</option>
                                </select>
                            </div>
                            <div className={classes.pagamento}>
                                <label htmlFor="filtro-pagamento" className="form-label">
                                    Forma de pagamento
                                </label>
                                <select
                                    id="filtro-pagamento"
                                    className="form-select"
                                    value={filtroPagamento}
                                    onChange={(e) => onChangePagamento(e.target.value)}
                                >
                                    <option value="">Todas as formas</option>
                                    <option value="dinheiro">💵 Dinheiro</option>
                                    <option value="pix">⚡ PIX</option>
                                    <option value="debito">💳 Débito</option>
                                    <option value="credito">📄 Crédito</option>
                                    <option value="conta_fiada">📔 Conta Fiada</option>
                                </select>
                            </div>
                        </>
                    )}
                    {tabela === 'estoque' && (
                        <div className={classes.tipo}>
                            <label htmlFor="filtro-tipo" className="form-label">
                                Tipo de movimento
                            </label>
                            <select
                                id="filtro-tipo"
                                className="form-select"
                                value={filtroTipo}
                                onChange={(e) => onChangeTipo(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="entrada">Entrada</option>
                                <option value="saida">Saída</option>
                                <option value="ajuste">Ajuste</option>
                            </select>
                        </div>
                    )}
                    <div className={classes.acoes}>
                        <div className="relatorio-filtro-acoes justify-content-xl-end">
                            <button className="btn btn-primary" onClick={onBuscar} disabled={loading}>
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                ) : (
                                    <i className="bi bi-search" />
                                )}{' '}
                                Buscar
                            </button>
                            <button className="btn btn-outline-secondary" onClick={onLimpar} disabled={loading}>
                                Limpar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
