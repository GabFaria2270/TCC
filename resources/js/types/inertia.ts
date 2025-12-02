import type { ReactElement, ReactNode } from 'react';

export type AuthUser = {
    id: number;
    NOME: string;
    EMAIL: string;
    PERFIL: string;
};

export type Comercio = {
    nome?: string;
    cnpj?: string;
};

export type SharedProps = {
    auth?: { user?: AuthUser };
    comercio?: Comercio;
    csrf_token?: string;
    // outros props globais podem ser adicionados aqui
};

export type PageWithLayout<P = Record<string, unknown>> = ((props: P) => ReactElement) & {
    layout?: (page: ReactNode) => ReactNode;
};
