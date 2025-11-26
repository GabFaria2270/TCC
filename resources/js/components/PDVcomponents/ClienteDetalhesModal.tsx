import ModalPortal from '../common/ModalPortal';

// Importe a interface Cliente do local correto
import type { Cliente } from '../../pages/gerenciamento/Clientes';
import { formatarTelefone } from '../../utils/formatters';

interface Props {
    cliente: Cliente;
    fechar: () => void;
}

export default function ClienteDetalhesModal({ cliente, fechar }: Props) {
    if (!cliente) return null;
    return (
        <ModalPortal>
            <div className="modal-backdrop fade show" onClick={fechar}></div>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="bi bi-eye me-2"></i>
                                Detalhes do Cliente
                            </h5>
                            <button type="button" className="btn-close" onClick={fechar} aria-label="Fechar modal"></button>
                        </div>
                        <div className="modal-body">
                            <dl className="row cliente-detalhes-list mb-0">
                                <dt className="col-sm-4 cliente-detalhes-label">Nome</dt>
                                <dd className="col-sm-8 cliente-detalhes-text cliente-detalhes-value text-break">{cliente.nome}</dd>
                                <dt className="col-sm-4 cliente-detalhes-label">E-mail</dt>
                                <dd className="col-sm-8 cliente-detalhes-text cliente-detalhes-value text-break">{cliente.email}</dd>
                                <dt className="col-sm-4 cliente-detalhes-label">Telefone</dt>
                                <dd className="col-sm-8 cliente-detalhes-text cliente-detalhes-value text-break">
                                    {(() => {
                                        const telefone = cliente.telefone_formatado || cliente.telefone;
                                        return telefone ? formatarTelefone(telefone) : 'Não informado';
                                    })()}
                                </dd>
                                <dt className="col-sm-4 cliente-detalhes-label">Saldo</dt>
                                <dd className="col-sm-8 cliente-detalhes-text cliente-detalhes-value text-break">
                                    {cliente.conta_fiada?.saldo_formatado || ''}
                                </dd>
                                <dt className="col-sm-4 cliente-detalhes-label">Descrição</dt>
                                <dd className="col-sm-8 cliente-detalhes-text cliente-detalhes-value cliente-detalhes-descricao text-break">
                                    {cliente.conta_fiada?.descricao || ''}
                                </dd>
                                <dt className="col-sm-4 cliente-detalhes-label">Cadastrado em</dt>
                                <dd className="col-sm-8 cliente-detalhes-text cliente-detalhes-value">
                                    {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                                </dd>
                            </dl>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={fechar}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
