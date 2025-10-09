import type { Cliente } from '../../pages/gerenciamento/Clientes';

interface Props {
    clientes: Cliente[];
    abrirDetalhes: (cliente: Cliente) => void;
    abrirConfirmarPagamento: (cliente: Cliente) => void;
    abrirModal: (modo: 'create' | 'edit', cliente?: Cliente) => void;
}

export default function ClienteTabela({ clientes, abrirDetalhes, abrirConfirmarPagamento, abrirModal }: Props) {
    return (
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
                    {clientes.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="estado-vazio">
                                <i className="bi bi-people display-6 d-block mb-2"></i>
                                Nenhum cliente encontrado
                            </td>
                        </tr>
                    ) : (
                        clientes.map((cliente) => (
                            <tr key={cliente.id} className="cliente-row">
                                <td data-label="Cliente">
                                    <div className="cliente-info">
                                        <strong className="cliente-nome">{cliente.nome}</strong>
                                    </div>
                                </td>
                                <td data-label="Contato">
                                    <div className="cliente-contato">
                                        <div className="cliente-email">{cliente.email}</div>
                                        <small className="cliente-telefone">
                                            {cliente.telefone_formatado || cliente.telefone || 'Não informado'}
                                        </small>
                                    </div>
                                </td>
                                <td data-label="Conta Fiada">
                                    <div className="conta-fiada-info">
                                        {cliente.conta_fiada ? (
                                            <span
                                                className={`saldo-badge ${
                                                    cliente.conta_fiada.saldo > 0
                                                        ? 'saldo-positivo'
                                                        : cliente.conta_fiada.saldo < 0
                                                          ? 'saldo-negativo'
                                                          : 'saldo-zero'
                                                }`}
                                            >
                                                {cliente.conta_fiada.saldo_formatado}
                                            </span>
                                        ) : (
                                            <span className="saldo-badge saldo-zero">—</span>
                                        )}
                                    </div>
                                </td>
                                <td data-label="Cadastrado">
                                    <small className="data-cadastro">{new Date(cliente.created_at).toLocaleDateString('pt-BR')}</small>
                                </td>
                                <td data-label="Ações">
                                    <div className="cliente-actions">
                                        <button className="btn-action btn-view" title="Ver detalhes" onClick={() => abrirDetalhes(cliente)}>
                                            <i className="bi bi-eye"></i>
                                        </button>
                                        <button
                                            className="btn-action btn-wallet"
                                            title="Conta fiada"
                                            onClick={() => abrirConfirmarPagamento(cliente)}
                                        >
                                            <i className="bi bi-wallet2"></i>
                                        </button>
                                        <button onClick={() => abrirModal('edit', cliente)} className="btn-action btn-edit" title="Editar cliente">
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
