export type ContaFiada = {
    saldo: number;
    saldo_formatado: string;
    descricao?: string;
    status: string;
};

export interface Cliente {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
    telefone_formatado?: string;
    conta_fiada?: ContaFiada | null;
    created_at: string;
}

export type HistoricoFiadoItem = {
    id: number;
    cliente: string;
    valor: number;
    data: string;
    status: 'pendente' | 'pago';
};

export interface ClientesPageProps {
    clientes: Cliente[];
    error?: string | null;
    fiadoHistorico?: HistoricoFiadoItem[];
}
