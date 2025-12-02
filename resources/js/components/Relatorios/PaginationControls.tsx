import type { PaginacaoMeta } from '@/types/gerenciamento/Relatorio';

interface Props {
    meta: PaginacaoMeta | null;
    onChange: (page: number) => void;
    disabled?: boolean;
}

export default function PaginationControls({ meta, onChange, disabled = false }: Props) {
    if (!meta || meta.last_page <= 1) return null;

    const previousDisabled = disabled || meta.current_page <= 1;
    const nextDisabled = disabled || meta.current_page >= meta.last_page;

    return (
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <button className="btn btn-outline-secondary" type="button" disabled={previousDisabled} onClick={() => onChange(meta.current_page - 1)}>
                <i className="bi bi-arrow-left-short me-1" /> Anterior
            </button>
            <div className="text-secondary small">
                Página {meta.current_page} de {meta.last_page} · {meta.total} registros
            </div>
            <button className="btn btn-outline-secondary" type="button" disabled={nextDisabled} onClick={() => onChange(meta.current_page + 1)}>
                Próxima <i className="bi bi-arrow-right-short ms-1" />
            </button>
        </div>
    );
}
