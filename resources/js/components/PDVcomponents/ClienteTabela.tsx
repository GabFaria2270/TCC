import { useEffect, useState } from 'react';
import type { Cliente } from '../../pages/gerenciamento/Clientes';
import { formatarTelefone } from '../../utils/formatters';

// --- INTERFACE DE PROPS ---
interface Props {
    clientes: Cliente[];
    abrirDetalhes: (cliente: Cliente) => void;
    abrirConfirmarPagamento: (cliente: Cliente) => void;
    abrirModal: (modo: 'create' | 'edit', cliente?: Cliente) => void;
}

// --- HOOK CUSTOMIZADO (COLE ISSO NO ARQUIVO) ---
/**
 * Hook de React para detectar media queries (tamanho da tela).
 * Retorna 'true' se a query corresponder (ex: se for desktop).
 */
function useMediaQuery(query: string): boolean {
    const getMatches = (q: string): boolean => {
        if (typeof window === 'undefined') {
            return false;
        }
        return window.matchMedia(q).matches;
    };

    const [matches, setMatches] = useState<boolean>(() => getMatches(query));

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };
        setMatches(mediaQueryList.matches);

        try {
            mediaQueryList.addEventListener('change', listener);
        } catch (e) {
            mediaQueryList.addListener(listener);
        }

        return () => {
            try {
                mediaQueryList.removeEventListener('change', listener);
            } catch (e) {
                mediaQueryList.removeListener(listener);
            }
        };
    }, [query]);

    return matches;
}

// --- HELPERS (Funções Auxiliares) ---

const getSaldoBadge = (conta: Cliente['conta_fiada']) => {
    if (!conta || conta.saldo === 0) {
        return (
            <span className="badge text-bg-secondary fw-normal" style={{ fontSize: '0.9rem' }}>
                —
            </span>
        );
    }
    const { saldo, saldo_formatado } = conta;
    const className = saldo > 0 ? 'text-bg-danger' : 'text-bg-success';
    return <span className={`badge ${className} fs-6`}>{saldo_formatado}</span>;
};

const renderEmptyState = (isTable: boolean = false) => {
    const content = (
        <div className="text-center text-muted p-5">
            <i className="bi bi-people display-4 d-block mb-3"></i>
            <h5>Nenhum cliente encontrado</h5>
        </div>
    );

    if (isTable) {
        return (
            <tr>
                <td colSpan={5} className="estado-vazio" style={{ padding: 0 }}>
                    {content}
                </td>
            </tr>
        );
    }
    return content;
};

// --- SUB-COMPONENTES (Tabela e Cards) ---

/**
 * Renderiza a Tabela para Desktop
 */
const formatarContato = (cliente: Cliente) => {
    const telefoneOriginal = cliente.telefone_formatado || cliente.telefone;
    if (!telefoneOriginal) return 'Não informado';
    return formatarTelefone(telefoneOriginal);
};

const TabelaDesktop = ({ clientes, abrirDetalhes, abrirConfirmarPagamento, abrirModal }: Props) => (
    <div className="clientes-table-container table-responsive scroll-shadow fade-in">
        <table className="table-hover data-table clientes-table mb-0 table align-middle">
            <thead className="clientes-table-header">
                <tr>
                    <th>Cliente</th>
                    <th>Contato</th>
                    <th>Conta Fiada</th>
                    <th>Cadastrado em</th>
                    <th className="actions-column">Ações</th>
                </tr>
            </thead>
            <tbody>
                {clientes.length === 0
                    ? renderEmptyState(true) // Renderiza o <tr> de estado vazio
                    : clientes.map((cliente) => (
                          <tr key={cliente.id} className="cliente-row">
                              <td data-label="Cliente">
                                  <div className="cliente-info">
                                      <strong className="cliente-nome">{cliente.nome}</strong>
                                  </div>
                              </td>
                              <td data-label="Contato">
                                  <div className="cliente-contato">
                                      <div className="cliente-email">{cliente.email}</div>
                                      <small className="cliente-telefone">{formatarContato(cliente)}</small>
                                  </div>
                              </td>
                              <td data-label="Conta Fiada">{getSaldoBadge(cliente.conta_fiada)}</td>
                              <td data-label="Cadastrado">
                                  <small className="data-cadastro">
                                      {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                                  </small>
                              </td>
                              <td data-label="Ações">
                                  <div className="cliente-actions">
                                      <button
                                          className="btn-action btn-view"
                                          title="Ver detalhes"
                                          onClick={() => abrirDetalhes(cliente)}
                                      >
                                          <i className="bi bi-eye"></i>
                                      </button>
                                      <button
                                          className="btn-action btn-wallet"
                                          title="Conta fiada"
                                          onClick={() => abrirConfirmarPagamento(cliente)}
                                      >
                                          <i className="bi bi-wallet2"></i>
                                      </button>
                                      <button
                                          onClick={() => abrirModal('edit', cliente)}
                                          className="btn-action btn-edit"
                                          title="Editar cliente"
                                      >
                                          <i className="bi bi-pencil"></i>
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
            </tbody>
        </table>
    </div>
);

/**
 * Renderiza os Cards para Mobile
 */
const CardsMobile = ({ clientes, abrirDetalhes, abrirConfirmarPagamento, abrirModal }: Props) => (
    <div className="fade-in p-2">
        {clientes.length === 0
            ? renderEmptyState(false) // Renderiza a <div> de estado vazio
            : clientes.map((cliente) => (
                  <div key={cliente.id} className="card mb-2 shadow-sm">
                      <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                              <div style={{ flex: 1, minWidth: 0 }}>
                                  <h5 className="card-title mb-1 text-break">{cliente.nome}</h5>
                              </div>
                              <div className="ps-2">{getSaldoBadge(cliente.conta_fiada)}</div>
                          </div>

                          <div className="mb-3">
                              <div className="small text-muted text-truncate" title={cliente.email}>
                                  <i className="bi bi-envelope me-2" style={{ width: '1.2rem' }}></i>
                                  {cliente.email || 'Sem email'}
                              </div>
                              <div className="small text-muted">
                                  <i className="bi bi-telephone me-2" style={{ width: '1.2rem' }}></i>
                                  {formatarContato(cliente)}
                              </div>
                              <div className="small text-muted mt-1">
                                  <i className="bi bi-calendar-event me-2" style={{ width: '1.2rem' }}></i>
                                  Cadastrado em: {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                              </div>
                          </div>

                          <div className="btn-group w-100" role="group">
                              <button
                                  type="button"
                                  className="btn btn-outline-primary"
                                  title="Ver detalhes"
                                  onClick={() => abrirDetalhes(cliente)}
                              >
                                  <i className="bi bi-eye"></i>
                              </button>
                              <button
                                  type="button"
                                  className="btn btn-outline-success"
                                  title="Conta fiada"
                                  onClick={() => abrirConfirmarPagamento(cliente)}
                              >
                                  <i className="bi bi-wallet2"></i>
                              </button>
                              <button
                                  type="button"
                                  className="btn btn-outline-warning"
                                  title="Editar cliente"
                                  onClick={() => abrirModal('edit', cliente)}
                              >
                                  <i className="bi bi-pencil"></i>
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
    </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function ClienteTabela(props: Props) {
    // Usamos o breakpoint 'md' (768px) do Bootstrap
    const isDesktop = useMediaQuery('(min-width: 768px)');

    // Renderiza o componente correto com base no tamanho da tela
    return isDesktop ? <TabelaDesktop {...props} /> : <CardsMobile {...props} />;
}