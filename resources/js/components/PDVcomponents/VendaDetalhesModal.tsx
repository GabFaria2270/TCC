import ModalPortal from '../common/ModalPortal';

type ProdutoItem = {
    id: number;
    nome: string;
};

type ItemVenda = {
    id: number;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
    produto?: ProdutoItem;
};

type Cliente = { id: number; nome: string } | null;
type Usuario = { id: number; NOME?: string; nome?: string } | null;

type Venda = {
    id: number;
    cliente?: Cliente;
    usuario?: Usuario;
    status: string;
    forma_pagamento: string | null;
    subtotal: number;
    desconto: number;
    total: number;
    valor_recebido?: number | null;
    troco?: number | null;
    observacoes?: string | null;
    created_at?: string;
    itens?: ItemVenda[];
};

export default function VendaDetalhesModal({
    show,
    venda,
    fechar,
    loading = false,
}: {
    show: boolean;
    venda: Venda | null;
    loading?: boolean;
    fechar: () => void;
}) {
    if (!show) return null;

    const fmt = (v?: number | string | null) => {
        if (v === null || v === undefined) return '—';
        const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/\./g, '').replace(',', '.'));
        return Number.isFinite(n) ? n.toFixed(2).replace('.', ',') : '—';
    };

    const formatStatus = (s?: string | null) => (s === 'conta_fiada' ? 'pendente' : (s ?? '—'));
    const formatPagamento = (p?: string | null) => {
        switch (p) {
            case 'conta_fiada':
                return 'fiado';
            case 'dinheiro':
                return 'dinheiro';
            case 'pix':
                return 'pix';
            case 'debito':
                return 'débito';
            case 'credito':
                return 'crédito';
            default:
                return p ?? '—';
        }
    };

    const nomeUsuario = venda?.usuario?.NOME || venda?.usuario?.nome || '—';
    const nomeCliente = venda?.cliente ? ((venda.cliente as any).nome ?? '—') : '—';
    const data = venda?.created_at ? new Date(venda.created_at).toLocaleString('pt-BR') : '—';

    return (
        <ModalPortal>
            <div className="modal-backdrop fade show" onClick={fechar}></div>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} role="dialog" aria-modal="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="bi bi-receipt-cutoff me-2"></i>
                                Detalhes da Venda #{venda?.id ?? '—'}
                            </h5>
                            <button type="button" className="btn-close" onClick={fechar} aria-label="Fechar"></button>
                        </div>

                        <div className="modal-body">
                            {loading && (
                                <div className="d-flex align-items-center mb-3">
                                    <div className="spinner-border me-2" role="status" />
                                    Carregando detalhes…
                                </div>
                            )}

                            <dl className="row mb-3">
                                <dt className="col-sm-3">Data/Hora</dt>
                                <dd className="col-sm-9">{data}</dd>

                                <dt className="col-sm-3">Operador</dt>
                                <dd className="col-sm-9">{nomeUsuario}</dd>

                                <dt className="col-sm-3">Cliente</dt>
                                <dd className="col-sm-9">{nomeCliente}</dd>

                                <dt className="col-sm-3">Status</dt>
                                <dd className="col-sm-9">{formatStatus(venda?.status)}</dd>

                                <dt className="col-sm-3">Pagamento</dt>
                                <dd className="col-sm-9">{formatPagamento(venda?.forma_pagamento)}</dd>

                                <dt className="col-sm-3">Subtotal</dt>
                                <dd className="col-sm-9">R$ {fmt(venda?.subtotal)}</dd>

                                <dt className="col-sm-3">Desconto</dt>
                                <dd className="col-sm-9">R$ {fmt(venda?.desconto)}</dd>

                                <dt className="col-sm-3">Total</dt>
                                <dd className="col-sm-9">
                                    <strong>R$ {fmt(venda?.total)}</strong>
                                </dd>

                                {venda?.forma_pagamento === 'dinheiro' && (
                                    <>
                                        <dt className="col-sm-3">Recebido</dt>
                                        <dd className="col-sm-9">R$ {fmt(venda?.valor_recebido ?? undefined)}</dd>
                                        <dt className="col-sm-3">Troco</dt>
                                        <dd className="col-sm-9">R$ {fmt(venda?.troco ?? undefined)}</dd>
                                    </>
                                )}

                                <dt className="col-sm-3">Observações</dt>
                                <dd className="col-sm-9">
                                    <div className="bg-light text-break rounded border p-2">{venda?.observacoes || '—'}</div>
                                </dd>
                            </dl>

                            <div className="table-responsive">
                                <table className="table-sm table align-middle">
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th className="text-end">Qtd</th>
                                            <th className="text-end">Unit.</th>
                                            <th className="text-end">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {venda?.itens && venda.itens.length > 0 ? (
                                            venda.itens.map((it) => (
                                                <tr key={it.id}>
                                                    <td>{it.produto?.nome ?? '—'}</td>
                                                    <td className="text-end">{it.quantidade}</td>
                                                    <td className="text-end">R$ {fmt(it.preco_unitario as any)}</td>
                                                    <td className="text-end">R$ {fmt(it.subtotal as any)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="text-muted py-3 text-center">
                                                    Sem itens
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={fechar}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
