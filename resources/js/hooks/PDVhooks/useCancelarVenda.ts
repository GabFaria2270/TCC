import { router } from '@inertiajs/react';

import type { Notification } from './useNotifications';

interface CancelarVendaParams {
    carrinho: any[];
    calcularTotal: () => number;
    formaPagamento: string;
    valorRecebido: string;
    clienteSelecionado: any;
    getDadosVenda: () => any;
    limparCarrinho: () => void;
    setCancelandoVenda: (loading: boolean) => void;
    setAbaAtiva: (aba: 'lista' | 'nova') => void;
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    messages: {
        carrinho_vazio: string;
        venda_cancelada: string;
        erro_cancelar: string;
    };
}

const formatarValorRecebido = (valor: string) => {
    if (!valor) return 0;
    const limpo = valor.replace(/[^0-9,]/g, '').replace(',', '.');
    const numero = parseFloat(limpo);
    return Number.isFinite(numero) ? numero : 0;
};

export const useCancelarVenda = () => {
    const cancelarVenda = ({
        carrinho,
        calcularTotal,
        formaPagamento,
        valorRecebido,
        clienteSelecionado,
        getDadosVenda,
        limparCarrinho,
        setCancelandoVenda,
        setAbaAtiva,
        addNotification,
        messages,
    }: CancelarVendaParams) => {
        if (carrinho.length === 0) {
            addNotification({
                type: 'warning',
                title: 'Carrinho',
                message: messages.carrinho_vazio,
            });
            return;
        }

        if (!formaPagamento) {
            addNotification({
                type: 'warning',
                title: 'Pagamento',
                message: 'Selecione uma forma de pagamento antes de cancelar.',
            });
            return;
        }

        setCancelandoVenda(true);

        const dadosVenda = getDadosVenda();
        const valorRecebidoNumero = formatarValorRecebido(valorRecebido);

        const payload: any = {
            itens: carrinho.map((item) => ({
                produto_id: item.produto.id,
                quantidade: item.quantidade,
                preco_unitario: item.produto.preco,
            })),
            forma_pagamento: formaPagamento,
            desconto: dadosVenda.desconto || 0,
            observacoes: dadosVenda.observacoes || null,
        };

        if (formaPagamento === 'conta_fiada' && clienteSelecionado?.id) {
            payload.cliente_id = clienteSelecionado.id;
        }

        if (formaPagamento === 'dinheiro') {
            payload.valor_recebido = valorRecebidoNumero;
        }

        router.post('/gerenciamento/vendas/cancelar-aberta', payload, {
            preserveScroll: true,
            headers: {
                'X-PDV-Inline': 'true',
            },
            onSuccess: () => {
                addNotification({
                    type: 'success',
                    title: 'Venda Cancelada',
                    message: messages.venda_cancelada,
                });

                limparCarrinho();
                setAbaAtiva('lista');
            },
            onError: (errors) => {
                const flattened = Object.values(errors);
                const firstMessage = flattened.length > 0 ? flattened[0] : messages.erro_cancelar;
                addNotification({
                    type: 'error',
                    title: 'Erro ao Cancelar',
                    message: Array.isArray(firstMessage) ? firstMessage[0] : (firstMessage as string),
                });
            },
            onFinish: () => setCancelandoVenda(false),
        });
    };

    return { cancelarVenda };
};
