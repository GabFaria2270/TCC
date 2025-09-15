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
  // outros props globais podem ser adicionados aqui
};
