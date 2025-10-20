import { useState, useMemo } from 'react';
import { ItemVenda, Produto, Cliente } from '../../types';

interface UseCarrinhoReturn {
    // Estado do carrinho
    carrinho: ItemVenda[];
    clienteSelecionado: Cliente | null; // ✅ ADICIONADO
    valorRecebido: string; // ✅ string
    desconto: number;
    formaPagamento: string;
    observacoes: string;
    loadingVenda: boolean; // ✅ ADICIONADO
    
    // Setters
    setClienteSelecionado: (cliente: Cliente | null) => void; // ✅ ADICIONADO
    setValorRecebido: (valor: string) => void; // ✅ aceita string
    setDesconto: (desconto: number) => void;
    setFormaPagamento: (forma: string) => void;
    setObservacoes: (obs: string) => void;
    setLoadingVenda: (loading: boolean) => void; // ✅ ADICIONADO
    
    // Ações do carrinho
    adicionarAoCarrinho: (produto: Produto, onNotification?: (notification: any) => void) => void;
    editarQuantidade: (produtoId: number, novaQuantidade: number, onNotification?: (notification: any) => void) => void;
    removerDoCarrinho: (produtoId: number, onNotification?: (notification: any) => void) => void;
    limparCarrinho: () => void;
    
    // Cálculos
    calcularSubtotal: () => number;
    calcularTotal: () => number;
    calcularTroco: () => number; // ✅ ADICIONADO
    getDadosVenda: () => any;
}

export default function useCarrinho(messages?: any): UseCarrinhoReturn { // ✅ CORRIGIDO: aceita messages
    const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
    const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null); // ✅ ADICIONADO
    const [valorRecebido, setValorRecebido] = useState<string>(''); // ✅ string
    const [desconto, setDesconto] = useState<number>(0);
    const [formaPagamento, setFormaPagamento] = useState<string>('');
    const [observacoes, setObservacoes] = useState<string>('');
    const [loadingVenda, setLoadingVenda] = useState<boolean>(false); // ✅ ADICIONADO

    // Função para converter moeda para número
    const converterMoedaParaNumero = (valorFormatado: string): number => {
        if (!valorFormatado || valorFormatado === '') return 0;
        
        const numeroLimpo = valorFormatado
            .replace(/R\$\s?/g, '')
            .replace(/\./g, '')
            .replace(',', '.');
        
        const numero = parseFloat(numeroLimpo);
        return isNaN(numero) ? 0 : numero;
    };

    // ✅ FUNÇÃO CALCULAR TROCO
    const calcularTroco = (): number => {
        const valorRecebidoNumero = converterMoedaParaNumero(valorRecebido);
        const totalVenda = calcularTotal();
        
        if (valorRecebidoNumero > totalVenda) {
            return valorRecebidoNumero - totalVenda;
        }
        return 0;
    };

    const getDadosVenda = () => {
        return {
            desconto,
            observacoes,
            valorRecebido,
            valorRecebidoNumero: converterMoedaParaNumero(valorRecebido),
            troco: calcularTroco(),
            total: calcularTotal(),
        };
    };

    const adicionarAoCarrinho = (produto: Produto, onNotification?: (notification: any) => void) => {
        // Verificar se produto já está no carrinho
        const produtoExistente = carrinho.find(item => item.produto.id === produto.id);
        
        if (produtoExistente) {
            if (onNotification && messages?.produto_ja_no_carrinho) {
                onNotification({
                    type: 'warning',
                    message: messages.produto_ja_no_carrinho,
                });
            }
            return;
        }

        // Verificar estoque
        if ((produto.estoque?.quantidade ?? 0) < 1) {
            if (onNotification && messages?.estoque_insuficiente) {
                onNotification({
                    type: 'error',
                    message: messages.estoque_insuficiente.replace(':disponivel', String(produto.estoque?.quantidade ?? 0)),
                });
            }
            return;
        }

        const novoItem: ItemVenda = {
            produto_id: produto.id,
            produto,
            quantidade: 1,
            preco_unitario: produto.preco,
            subtotal: produto.preco,
        };

        setCarrinho(prev => [...prev, novoItem]);
        
        if (onNotification && messages?.produto_adicionado) {
            onNotification({
                type: 'success',
                message: messages.produto_adicionado,
            });
        }
    };

    const editarQuantidade = (produtoId: number, novaQuantidade: number, onNotification?: (notification: any) => void) => {
        if (novaQuantidade < 1) {
            removerDoCarrinho(produtoId, onNotification);
            return;
        }

        setCarrinho(prev => prev.map(item => {
            if (item.produto.id === produtoId) {
                // Verificar estoque disponível
                if (novaQuantidade > (item.produto.estoque?.quantidade ?? 0)) {
                    if (onNotification && messages?.estoque_insuficiente) {
                        onNotification({
                            type: 'error',
                            message: messages.estoque_insuficiente.replace(':disponivel', String(item.produto.estoque?.quantidade ?? 0)),
                        });
                    }
                    return item; // Não alterar se não há estoque
                }

                return {
                    ...item,
                    quantidade: novaQuantidade,
                    subtotal: novaQuantidade * item.preco_unitario,
                };
            }
            return item;
        }));

      
    };

    const removerDoCarrinho = (produtoId: number, onNotification?: (notification: any) => void) => {
        setCarrinho(prev => prev.filter(item => item.produto.id !== produtoId));
        
        if (onNotification && messages?.produto_removido) {
            onNotification({
                type: 'success',
                message: messages.produto_removido,
            });
        }
    };

    const limparCarrinho = () => {
        setCarrinho([]);
        setValorRecebido('');
        setDesconto(0);
        setFormaPagamento('');
        setObservacoes('');
        setClienteSelecionado(null);
    };

    const calcularSubtotal = (): number => {
        return carrinho.reduce((total, item) => {
            return total + (item.produto.preco * item.quantidade);
        }, 0);
    };

    const calcularTotal = (): number => {
        const subtotal = calcularSubtotal();
        return subtotal - desconto;
    };

    return {
        // Estado
        carrinho,
        clienteSelecionado, // ✅ RETORNADO
        valorRecebido, // ✅ string
        desconto,
        formaPagamento,
        observacoes,
        loadingVenda, // ✅ RETORNADO
        
        // Setters
        setClienteSelecionado, // ✅ RETORNADO
        setValorRecebido, // ✅ função que aceita string
        setDesconto,
        setFormaPagamento,
        setObservacoes,
        setLoadingVenda, // ✅ RETORNADO
        
        // Ações
        adicionarAoCarrinho,
        editarQuantidade,
        removerDoCarrinho,
        limparCarrinho,
        
        // Cálculos
        calcularSubtotal,
        calcularTotal,
        calcularTroco, // ✅ RETORNADO
        getDadosVenda,
    };
}
