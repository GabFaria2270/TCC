interface FinalizarVendaParams {
    carrinho: any[];
    calcularTotal: () => number;
    formaPagamento: string;
    valorRecebido: string; // Alterado para string
    clienteSelecionado: any;
    getDadosVenda: () => any;
    limparCarrinho: () => void;
    setLoadingVenda: (loading: boolean) => void;
    setAbaAtiva: (aba: 'lista' | 'nova') => void;
    addNotification: (notification: any) => void;
    setPaymentFeedback: (payload: PaymentFeedback | null) => void;
    onVendaFinalizada?: (payload: { venda: any; payment: PaymentFeedback['payment'] | null; forma_pagamento: string }) => void;
    messages: {
        carrinho_vazio: string;
        valor_insuficiente: string;
        cliente_obrigatorio: string;
        venda_processada: string;
        erro_finalizar?: string;
    };
}

interface PaymentFeedback {
    venda: any;
    payment: {
        provider: string;
        reference: string;
        status: string;
        method: string;
        pix_qr_code?: string | null;
        pix_qr_code_base64?: string | null;
    } | null;
}

export const useFinalizarVenda = () => {
    const finalizarVenda = async ({
        carrinho,
        calcularTotal,
        formaPagamento,
        valorRecebido,
        clienteSelecionado,
        getDadosVenda,
        limparCarrinho,
        setLoadingVenda,
        setAbaAtiva,
        addNotification,
        setPaymentFeedback,
        onVendaFinalizada,
        messages,
    }: FinalizarVendaParams) => {
        // Validações
        if (carrinho.length === 0) {
            addNotification({
                type: 'warning',
                title: 'Carrinho Vazio',
                message: messages.carrinho_vazio,
            });
            return;
        }

        const total = calcularTotal();

        if (formaPagamento === 'dinheiro' && (!valorRecebido || parseFloat(valorRecebido.replace(/[^\d,]/g, '').replace(',', '.')) < total)) {
            addNotification({
                type: 'error',
                title: 'Valor Insuficiente',
                message: messages.valor_insuficiente,
            });
            return;
        }

        if (formaPagamento === 'conta_fiada' && !clienteSelecionado) {
            addNotification({
                type: 'warning',
                title: 'Cliente Obrigatório',
                message: messages.cliente_obrigatorio,
            });
            return;
        }

        setLoadingVenda(true);

        const dadosVenda = getDadosVenda();

        // Converter valorRecebido para número quando necessário
        const valorRecebidoNumero = parseFloat(valorRecebido.replace(/[^\d,]/g, '').replace(',', '.')) || 0;

        const usaGateway = ['pix', 'cartao_credito', 'cartao_debito'].includes(formaPagamento);

        const dados: any = {
            itens: carrinho.map(item => ({
                produto_id: item.produto.id,
                quantidade: item.quantidade,
                preco_unitario: item.produto.preco,
            })),
            forma_pagamento: formaPagamento,
            desconto: dadosVenda.desconto || 0,
            observacoes: dadosVenda.observacoes || null,
        };

        // Só adicionar cliente_id se for conta fiada
        if (formaPagamento === 'conta_fiada' && clienteSelecionado?.id) {
            dados.cliente_id = clienteSelecionado.id;
        }

        // Só adicionar valor_recebido se for dinheiro
        if (formaPagamento === 'dinheiro') {
            dados.valor_recebido = valorRecebidoNumero;
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        try {
            const response = await fetch('/api/pdv/pagamentos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify(dados),
            });

            const data = await response
                .json()
                .catch(() => ({ message: 'Erro inesperado ao processar a venda.' }));

            if (!response.ok) {
                const errors = data?.errors
                    ? Object.values(data.errors).flat()
                    : [data?.message || messages.erro_finalizar || 'Erro ao finalizar venda'];

                errors.forEach((errorMsg: unknown) => {
                    addNotification({
                        type: 'error',
                        title: 'Erro na Venda',
                        message: typeof errorMsg === 'string' ? errorMsg : messages.venda_processada,
                    });
                });
                setLoadingVenda(false);
                return;
            }

            addNotification({
                type: 'success',
                title: 'Venda Realizada',
                message: messages.venda_processada,
            });

            setPaymentFeedback(data?.payment ? { payment: data.payment, venda: data.venda } : null);

            limparCarrinho();
            setAbaAtiva(usaGateway ? 'nova' : 'lista');

            onVendaFinalizada?.({
                venda: data.venda,
                payment: data.payment ?? null,
                forma_pagamento: formaPagamento,
            });
        } catch (error) {
            console.error('💥 Erro crítico:', error);
            addNotification({
                type: 'error',
                title: 'Erro na Venda',
                message: 'Não foi possível finalizar a venda. Tente novamente em instantes.',
            });
        } finally {
            setLoadingVenda(false);
        }
    };

    return { finalizarVenda };
};
