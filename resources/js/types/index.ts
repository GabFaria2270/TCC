export interface Produto {
    id: number;
    nome: string;
    preco: number;
    categoria?: { nome: string };
    quantidade_estoque: number;
    codigo_barras?: string;
    preco_formatado: string;
}

export interface ItemVenda {
    produto_id: number;
    produto: Produto;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
}

export interface Cliente {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
    telefone_formatado?: string;
    conta_fiada: {
        saldo: number;
        saldo_formatado: string;
        descricao?: string;
    };
}

export interface Venda {
    id: number;
    total: number;
    total_formatado: string;
    desconto: number;
    forma_pagamento: string;
    status: string;
    cliente?: Cliente;
}

export interface NotificationConfig {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export interface PdvMessages {
    notifications: {
        vendaRealizada: string;
        vendaAnulada: string;
        carrinhoVazio: string;
        produtoAdicionado: string;
        estoqueInsuficiente: string;
        produtoRemovido: string;
        carrinhoLimpo: string;
        clienteSelecionado: string;
        clienteRemovido: string;
        descontoAplicado: string;
        descontoRemovido: string;
        formaPagamentoSelecionada: string;
        dadosIncompletos: string;
        erroGenerico: string;
        sucessoGenerico: string;
    };
    placeholders: {
        buscarProduto: string;
        buscarCliente: string;
        valorDesconto: string;
        observacoes: string;
    };
    labels: {
        vendas: string;
        carrinho: string;
        finalizarVenda: string;
        limparCarrinho: string;
        produto: string;
        quantidade: string;
        preco: string;
        subtotal: string;
        cliente: string;
        desconto: string;
        formaPagamento: string;
        total: string;
        dinheiro: string;
        cartao: string;
        pix: string;
        contaFiada: string;
        observacoes: string;
        buscar: string;
        limpar: string;
        remover: string;
        selecionar: string;
        adicionar: string;
        anular: string;
        confirmar: string;
        cancelar: string;
        estoque: string;
        codigo: string;
        categoria: string;
    };
}
