interface Props {
    tipo: string;
}

export default function FormaPagamentoBadge({ tipo }: Props) {
    switch (tipo) {
        case 'dinheiro':
            return (
                <span className="badge text-bg-success">
                    <i className="bi bi-cash-coin me-1"></i>
                    Dinheiro
                </span>
            );
        case 'pix':
        case 'PIX':
            return (
                <span className="badge text-bg-info">
                    <i className="bi bi-qr-code me-1"></i>
                    PIX
                </span>
            );
        case 'debito':
        case 'cartao_debito':
            return (
                <span className="badge text-bg-primary">
                    <i className="bi bi-credit-card-2-front me-1"></i>
                    Débito
                </span>
            );
        case 'credito':
        case 'cartao_credito':
            return (
                <span className="badge text-bg-warning text-dark">
                    <i className="bi bi-credit-card me-1"></i>
                    Crédito
                </span>
            );
        case 'conta_fiada':
        case 'fiado':
            return (
                <span className="badge text-bg-secondary">
                    <i className="bi bi-wallet2 me-1"></i>
                    Conta Fiada
                </span>
            );
        default:
            return (
                <span className="badge text-bg-light text-dark">
                    <i className="bi bi-question-circle me-1"></i>
                    {tipo || 'Não informado'}
                </span>
            );
    }
}
