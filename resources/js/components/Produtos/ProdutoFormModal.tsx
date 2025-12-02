import type { FormEvent } from 'react';
import { formatarMoeda } from '../../utils/formatters';
import CategoriaSelectCustom from '../PDVcomponents/CategoriaSelectCustom';
import ModalPortal from '../common/ModalPortal';

interface CategoriaOption {
    id: number;
    nome: string;
}

interface ProdutoFormData {
    nome: string;
    preco: string;
    quantidade: string;
    categoria_id: string;
    nova_categoria_nome: string;
    estoque_minimo?: string;
}

interface ProdutoFormModalProps {
    show: boolean;
    mode: 'create' | 'edit';
    categorias: CategoriaOption[];
    data: ProdutoFormData;
    errors: Record<string, string | undefined>;
    processing: boolean;
    produtoSelecionado?: { estoque?: { quantidade?: number } } | null;
    onClose: () => void;
    onSubmit: (event: FormEvent) => void;
    setData: (field: keyof ProdutoFormData, value: string) => void;
    onOpenAjuste: () => void;
}

function clampNonNegativeString(value: string): string {
    if (value === '') return '';
    const n = Number(value);
    if (Number.isNaN(n)) return '';
    return String(Math.max(0, Math.trunc(n)));
}

export default function ProdutoFormModal({
    show,
    mode,
    categorias,
    data,
    errors,
    processing,
    produtoSelecionado,
    onClose,
    onSubmit,
    setData,
    onOpenAjuste,
}: ProdutoFormModalProps) {
    if (!show) return null;

    const categoriaOptions = [{ value: '', label: 'Categoria' }, ...categorias.map((c) => ({ value: String(c.id), label: c.nome }))];
    const currentCategoria = (() => {
        const found = categorias.find((c) => String(c.id) === String(data.categoria_id));
        return found ? { value: String(found.id), label: found.nome } : { value: '', label: 'Categoria' };
    })();

    return (
        <ModalPortal>
            <div className="modal-backdrop fade show" onClick={onClose}></div>
            <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header border-0">
                            <h5 className="modal-title">{mode === 'create' ? 'Novo produto' : 'Editar produto'}</h5>
                            <button type="button" className="btn-close" aria-label="Fechar" onClick={onClose} />
                        </div>
                        <form onSubmit={onSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <label htmlFor="produto-nome" className="form-label">
                                            Nome*
                                        </label>
                                        <input
                                            id="produto-nome"
                                            type="text"
                                            className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                                            value={data.nome}
                                            onChange={(e) => setData('nome', e.target.value)}
                                            required
                                            disabled={processing}
                                        />
                                        {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="produto-preco" className="form-label">
                                            Preço (R$)*
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">R$</span>
                                            <input
                                                id="produto-preco"
                                                type="text"
                                                className={`form-control ${errors.preco ? 'is-invalid' : ''}`}
                                                value={data.preco}
                                                onChange={(e) => setData('preco', formatarMoeda(e.target.value))}
                                                placeholder="0,00"
                                                inputMode="numeric"
                                                disabled={processing}
                                                required
                                            />
                                        </div>
                                        {errors.preco && <div className="invalid-feedback">{errors.preco}</div>}
                                    </div>
                                    {mode === 'create' ? (
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="produto-quantidade" className="form-label">
                                                Quantidade em estoque*
                                            </label>
                                            <input
                                                id="produto-quantidade"
                                                type="number"
                                                min={0}
                                                step="1"
                                                className={`form-control ${errors.quantidade ? 'is-invalid' : ''}`}
                                                value={data.quantidade}
                                                onChange={(event) => setData('quantidade', clampNonNegativeString(event.target.value))}
                                                onKeyDown={(e) => {
                                                    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                required
                                                disabled={processing}
                                            />
                                            {errors.quantidade && <div className="invalid-feedback">{errors.quantidade}</div>}
                                        </div>
                                    ) : (
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Estoque atual</label>
                                            <div className="form-control-plaintext fw-semibold">{produtoSelecionado?.estoque?.quantidade ?? 0}</div>
                                            <small className="text-secondary">
                                                Para alterar estoque, use os movimentos.{' '}
                                                <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={onOpenAjuste}>
                                                    Abrir ajuste de estoque
                                                </button>
                                            </small>
                                        </div>
                                    )}
                                    <div className="col-md-6 d-flex flex-column mb-3 gap-2">
                                        <CategoriaSelectCustom
                                            categorias={categoriaOptions}
                                            value={currentCategoria}
                                            onChange={(option: any) => setData('categoria_id', option ? option.value : '')}
                                            isDisabled={processing}
                                            placeholder="Selecione ou busque uma categoria"
                                        />
                                        <div>
                                            <label htmlFor="produto-nova-categoria" className="form-label mb-1">
                                                Nova categoria (opcional)
                                            </label>
                                            <input
                                                id="produto-nova-categoria"
                                                type="text"
                                                className={`form-control ${errors.nova_categoria_nome ? 'is-invalid' : ''}`}
                                                value={data.nova_categoria_nome}
                                                onChange={(event) => setData('nova_categoria_nome', event.target.value)}
                                                placeholder="Informe para criar automaticamente"
                                                disabled={processing}
                                            />
                                            {errors.nova_categoria_nome && <div className="invalid-feedback">{errors.nova_categoria_nome}</div>}
                                            <small className="text-secondary">
                                                Você pode escolher uma categoria existente ou informar uma nova.
                                            </small>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="produto-estoque-minimo" className="form-label">
                                            Estoque mínimo (alerta)
                                        </label>
                                        <input
                                            id="produto-estoque-minimo"
                                            type="number"
                                            min={0}
                                            step={1}
                                            className={`form-control ${errors.estoque_minimo ? 'is-invalid' : ''}`}
                                            value={data.estoque_minimo ?? ''}
                                            onChange={(e) => setData('estoque_minimo', clampNonNegativeString(e.target.value))}
                                            onKeyDown={(e) => {
                                                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            disabled={processing}
                                        />
                                        {errors.estoque_minimo && <div className="invalid-feedback">{errors.estoque_minimo}</div>}
                                        <small className="text-secondary">Usado para destacar produtos com estoque baixo.</small>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer d-flex justify-content-between border-0">
                                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={processing}>
                                    {processing ? 'Salvando…' : mode === 'create' ? 'Salvar produto' : 'Atualizar produto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
