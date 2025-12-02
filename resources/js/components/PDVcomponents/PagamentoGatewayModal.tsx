import React from 'react';

interface PagamentoGatewayModalProps {
    show: boolean;
    feedback: any | null;
    pixCopied: boolean;
    onCopyPix: () => void;
    onRefreshStatus: () => void;
    refreshing: boolean;
    allowManualClose: boolean;
    onClose?: () => void;
}

const statusMetaMap: Record<string, { label: string; badge: string }> = {
    approved: { label: 'Aprovado', badge: 'success' },
    pending: { label: 'Pendente', badge: 'warning' },
    in_process: { label: 'Em análise', badge: 'info' },
    authorized: { label: 'Autorizado', badge: 'primary' },
    rejected: { label: 'Recusado', badge: 'danger' },
    cancelled: { label: 'Cancelado', badge: 'secondary' },
    refunded: { label: 'Estornado', badge: 'secondary' },
};

export default function PagamentoGatewayModal({
    show,
    feedback,
    pixCopied,
    onCopyPix,
    onRefreshStatus,
    refreshing,
    allowManualClose,
    onClose,
}: PagamentoGatewayModalProps) {
    if (!show || !feedback?.payment) {
        return null;
    }

    const payment = feedback.payment;
    const venda = feedback.venda;
    const statusKey = (payment.status || '').toLowerCase();
    const statusMeta = statusMetaMap[statusKey] ?? { label: payment.status || 'Desconhecido', badge: 'secondary', tone: 'info' };
    const isPix = (payment.method || '').toLowerCase() === 'pix';
    const pixCode = payment.pix_qr_code || '';
    const pixQrImage = payment.pix_qr_code_base64 ? `data:image/png;base64,${payment.pix_qr_code_base64}` : null;

    return (
        <>
            <div className={`modal fade ${show ? 'show d-block' : ''}`} role="dialog" aria-modal="true" tabIndex={-1}>
                <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header align-items-start">
                            <div>
                                <small className="text-uppercase text-muted fw-semibold">{payment.provider || 'Mercado Pago'}</small>
                                <h5 className="mb-1">Pagamento {payment.method ? payment.method.replace(/_/g, ' ').toUpperCase() : ''}</h5>
                                <small className="text-muted d-block">Referência: {payment.reference || '—'}</small>
                                <small className="text-muted">Venda #{venda?.id ?? '—'}</small>
                            </div>
                            <span className={`badge bg-${statusMeta.badge} align-self-center`}>{statusMeta.label}</span>
                        </div>
                        <div className="modal-body">
                            <p className="text-muted small mb-3">
                                Confirme o pagamento diretamente no aplicativo bancário. O sistema atualiza o status automaticamente assim que o Mercado
                                Pago confirmar a transação.
                            </p>

                            {isPix && (pixQrImage || pixCode) ? (
                                <div className="row g-3 align-items-stretch">
                                    {pixQrImage && (
                                        <div className="col-md-4">
                                            <div className="border rounded p-3 h-100 d-flex flex-column align-items-center justify-content-center">
                                                <img src={pixQrImage} alt="QR Code PIX" className="img-fluid" />
                                                <small className="text-muted mt-2">Escaneie pelo app do banco</small>
                                            </div>
                                        </div>
                                    )}
                                    <div className={pixQrImage ? 'col-md-8' : 'col-12'}>
                                        <label className="form-label small text-muted">Código copia e cola</label>
                                        <div className="input-group">
                                            <textarea className="form-control" rows={3} readOnly value={pixCode} spellCheck={false} style={{ resize: 'none' }} />
                                            <button type="button" className="btn btn-outline-primary" onClick={onCopyPix}>
                                                <i className="bi bi-clipboard-check me-1"></i>
                                                Copiar
                                            </button>
                                        </div>
                                        {pixCopied && <small className="text-success d-block mt-2">Código copiado!</small>}
                                        <ol className="small text-muted mt-3 mb-0 ps-3">
                                            <li>Acesse o app do banco.</li>
                                            <li>Escolha pagar com PIX via QR Code ou Copia e Cola.</li>
                                            <li>Escaneie o QR ou cole o código acima.</li>
                                        </ol>
                                    </div>
                                </div>
                            ) : (
                                <div className="alert alert-info mb-0">
                                    Aguardando o provedor confirmar a transação. Acompanhe o status do cartão diretamente no painel do Mercado Pago.
                                </div>
                            )}
                        </div>
                        <div className="modal-footer flex-wrap justify-content-between gap-2">
                            <small className="text-muted">
                                Status atual: <strong>{statusMeta.label}</strong>. Atualize manualmente se precisar forçar a sincronização.
                            </small>
                            <div className="d-flex gap-2">
                                {allowManualClose && onClose ? (
                                    <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                                        Fechar
                                    </button>
                                ) : null}
                                <button type="button" className="btn btn-primary" onClick={onRefreshStatus} disabled={refreshing}>
                                    {refreshing ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Atualizando
                                        </>
                                    ) : (
                                        'Atualizar status'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show"></div>
        </>
    );
}
