import type { AbaVendas } from '@/types/gerenciamento/Vendas';

interface VendasTabsHeaderProps {
    abaAtiva: AbaVendas;
    onChange: (aba: AbaVendas) => void;
}

export default function VendasTabsHeader({ abaAtiva, onChange }: VendasTabsHeaderProps) {
    return (
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center elemento-vendas-header gap-lg-0 mb-4 gap-2">
            <h2 className="elemento-vendas-titulo d-flex align-items-center mb-0 flex-nowrap gap-2">
                <i className="bi bi-receipt text-primary fs-4" aria-hidden />
                <span className="text-nowrap">Vendas</span>
            </h2>
            <ul className="nav nav-pills elemento-vendas-abas d-flex w-lg-auto mt-lg-0 justify-content-center justify-content-lg-end mt-2 w-100 flex-nowrap gap-2 overflow-auto">
                <li className="nav-item">
                    <button
                        type="button"
                        className={`nav-link ${abaAtiva === 'lista' ? 'active' : ''} elemento-vendas-aba-lista`}
                        onClick={() => onChange('lista')}
                    >
                        <i className="bi bi-list me-2" aria-hidden />
                        Histórico
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        type="button"
                        className={`nav-link ${abaAtiva === 'nova' ? 'active' : ''} elemento-vendas-aba-nova`}
                        onClick={() => onChange('nova')}
                    >
                        <i className="bi bi-plus-circle me-2" aria-hidden />
                        Nova Venda
                    </button>
                </li>
            </ul>
        </div>
    );
}
