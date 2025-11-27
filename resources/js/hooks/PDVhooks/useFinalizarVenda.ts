import { router } from '@inertiajs/react';

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
    messages: {
        carrinho_vazio: string;
        valor_insuficiente: string;
        cliente_obrigatorio: string;
        venda_processada: string;
    };
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

        try {
            await router.post('/gerenciamento/vendas', dados, {
                preserveScroll: true,
                headers: {
                    'X-PDV-Inline': 'true',
                },
                onSuccess: () => {
                    addNotification({
                        type: 'success',
                        title: 'Venda Realizada',
                        message: messages.venda_processada,
                    });

                    limparCarrinho();
                    setAbaAtiva('lista');
                },
                onError: (errors) => {
                    Object.values(errors).forEach((error) => {
                        addNotification({
                            type: 'error',
                            title: 'Erro na Venda',
                            message: Array.isArray(error) ? error[0] : (error as string),
                        });
                    });
                },
                onFinish: () => {
                    setLoadingVenda(false);
                },
            });
        } catch (error) {
            console.error('💥 Erro crítico:', error);
            setLoadingVenda(false);
        }
    };

    return { finalizarVenda };
};
