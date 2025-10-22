export interface Produto {
    id: number;
    nome: string;
    preco: number;
    categoria?: { nome: string };
    estoque?: { quantidade: number };
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
    itens: ItemVenda[];
    created_at: string;
    observacoes?: string;
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

// ==========================
// Tipos de navegação e layout
// (espelhando index.d.ts para evitar erros TS com '@/types')
// ==========================
export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: any | null; // usar 'any' aqui para evitar dependência de lucide types em runtime
    isActive?: boolean;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Auth {
    user: User;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: any;
    sidebarOpen: boolean;
    [key: string]: unknown;
}
