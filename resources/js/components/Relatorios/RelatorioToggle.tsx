import type { RelatorioTabela } from '@/types/gerenciamento/Relatorio';

export default function RelatorioToggle({ value, onChange }: { value: RelatorioTabela; onChange: (v: RelatorioTabela) => void }) {
    return (
        <div className="relatorio-toggle-wrapper">
            <div className="relatorio-toggle d-flex align-items-center position-relative">
                <div className={`relatorio-toggle-slider ${value}`} />
                <div
                    className={`relatorio-toggle-btn flex-grow-1 text-center ${value === 'vendas' ? 'active' : ''}`}
                    onClick={() => onChange('vendas')}
                >
                    Vendas
                </div>
                <div
                    className={`relatorio-toggle-btn flex-grow-1 text-center ${value === 'estoque' ? 'active' : ''}`}
                    onClick={() => onChange('estoque')}
                >
                    Movimentos
                </div>
            </div>
        </div>
    );
}
