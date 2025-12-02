import type { MovimentoResumo, RelatorioResumo, RelatorioTabela } from '@/types/gerenciamento/Relatorio';

interface Props {
    tabela: RelatorioTabela;
    resumoVendas: RelatorioResumo;
    resumoMovimentos: MovimentoResumo;
    currencyFormatter: Intl.NumberFormat;
}

export default function RelatorioResumoCards({ tabela, resumoVendas, resumoMovimentos, currencyFormatter }: Props) {
    if (tabela === 'estoque') {
        return (
            <div className="row g-3 elemento-relatorio-2 mb-4">
                <div className="col-md-6 col-xl-6 col-12">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                            <span className="text-uppercase text-secondary small">Total de movimentos</span>
                            <h4 className="fw-bold mt-2 mb-0">{resumoMovimentos.quantidade}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-xl-6 col-12">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                            <span className="text-uppercase text-secondary small">Quantidade movimentada</span>
                            <h4 className="fw-bold text-primary mt-2 mb-0">{resumoMovimentos.totalMovimentado}</h4>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="row g-3 elemento-relatorio-2 mb-4">
            <div className="col-md-6 col-xl-4 col-12">
                <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                        <span className="text-uppercase text-secondary small">Total faturado</span>
                        <h4 className="fw-bold mt-2 mb-0">{currencyFormatter.format(resumoVendas.totalFaturado)}</h4>
                    </div>
                </div>
            </div>
            <div className="col-md-6 col-xl-4 col-12">
                <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                        <span className="text-uppercase text-secondary small">Total de descontos</span>
                        <h4 className="fw-bold text-danger mt-2 mb-0">{currencyFormatter.format(resumoVendas.totalDescontos)}</h4>
                    </div>
                </div>
            </div>
            <div className="col-md-6 col-xl-4 col-12">
                <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                        <span className="text-uppercase text-secondary small">Quantidade de vendas</span>
                        <h4 className="fw-bold mt-2 mb-0">{resumoVendas.quantidade}</h4>
                    </div>
                </div>
            </div>
        </div>
    );
}
