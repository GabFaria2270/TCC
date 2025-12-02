import useMediaQuery from '@/hooks/useMediaQuery';
import type { MovimentoEstoque } from '@/types/gerenciamento/Relatorio';
import { formatarDataMovimento, formatarNumero, movimentoTipoInfo } from '@/utils/relatorios';

interface Props {
    movimentos: MovimentoEstoque[];
}

export default function MovimentosEstoqueTable({ movimentos }: Props) {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const emptyState = (
        <div className="text-muted py-5 text-center">
            <i className="bi bi-clipboard-data display-6 d-block mb-3"></i>
            <h5 className="mb-0">Nenhum movimento encontrado</h5>
        </div>
    );

    if (isDesktop) {
        return (
            <div className="card fade-in border-0 shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center bg-body-tertiary border-0">
                    <strong>Movimentos de Estoque</strong>
                    <div className="small text-secondary">Exibe o histórico de entradas, saídas e ajustes de estoque</div>
                </div>
                <div className="table-responsive scroll-shadow">
                    <table className="table-hover table-striped data-table mb-0 table align-middle">
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th>Produto</th>
                                <th>Tipo</th>
                                <th>Quantidade</th>
                                <th>Usuário</th>
                                <th>Motivo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimentos.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="estado-vazio">
                                        <i className="bi bi-clipboard-data display-6 d-block mb-2"></i>
                                        Nenhum movimento encontrado.
                                    </td>
                                </tr>
                            )}
                            {movimentos.map((mov) => {
                                const tipoInfo = movimentoTipoInfo(mov.tipo);
                                const quantidadeAtual = formatarNumero(mov.quantidade_atual);
                                const quantidadeAnterior = formatarNumero(mov.quantidade_anterior);
                                const quantidadeMovimentada = formatarNumero(mov.quantidade);

                                return (
                                    <tr key={mov.id}>
                                        <td data-label="Data/Hora">{formatarDataMovimento(mov.created_at_iso, mov.data)}</td>
                                        <td data-label="Produto">
                                            <span className="fw-semibold text-break">{mov.produto}</span>
                                        </td>
                                        <td data-label="Tipo">
                                            <span className={`badge ${tipoInfo.badge}`}>
                                                <i className={`bi ${tipoInfo.icon} me-1`} aria-hidden="true"></i>
                                                {tipoInfo.label}
                                            </span>
                                        </td>
                                        <td className="text-end" data-label="Quantidade">
                                            {quantidadeMovimentada ? (
                                                <>
                                                    {tipoInfo.prefix}
                                                    {quantidadeMovimentada}
                                                </>
                                            ) : (
                                                '—'
                                            )}
                                            {quantidadeAnterior && quantidadeAtual && (
                                                <small className="d-block text-secondary mt-1">
                                                    Saldo: {quantidadeAnterior} {'->'} {quantidadeAtual}
                                                </small>
                                            )}
                                        </td>
                                        <td data-label="Usuário">{mov.usuario || '—'}</td>
                                        <td data-label="Motivo">{mov.motivo || '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="card fade-in border-0 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center bg-body-tertiary border-0">
                <strong>Movimentos de Estoque</strong>
                <div className="small text-secondary">Exibe o histórico de entradas, saídas e ajustes de estoque</div>
            </div>
            <div className="d-flex flex-column gap-3 p-3">
                {movimentos.length === 0
                    ? emptyState
                    : movimentos.map((mov) => {
                          const tipoInfo = movimentoTipoInfo(mov.tipo);
                          const quantidadeAtual = formatarNumero(mov.quantidade_atual);
                          const quantidadeAnterior = formatarNumero(mov.quantidade_anterior);
                          const quantidadeMovimentada = formatarNumero(mov.quantidade);

                          return (
                              <div key={mov.id} className="card border shadow-sm">
                                  <div className="card-body p-3">
                                      <div className="d-flex justify-content-between align-items-start mb-2 gap-3">
                                          <div>
                                              <div className="small text-secondary">
                                                  <i className="bi bi-clock me-2" aria-hidden="true"></i>
                                                  {formatarDataMovimento(mov.created_at_iso, mov.data)}
                                              </div>
                                              <h6 className="fw-semibold text-break mb-0">{mov.produto}</h6>
                                          </div>
                                          <span className={`badge ${tipoInfo.badge} flex-shrink-0`}>
                                              <i className={`bi ${tipoInfo.icon} me-1`} aria-hidden="true"></i>
                                              {tipoInfo.label}
                                          </span>
                                      </div>
                                      <div className="small text-secondary d-flex align-items-center mb-1">
                                          <i className="bi bi-arrow-left-right me-2" aria-hidden="true"></i>
                                          <span>Quantidade: {quantidadeMovimentada ? `${tipoInfo.prefix}${quantidadeMovimentada}` : '—'}</span>
                                      </div>
                                      {quantidadeAnterior && quantidadeAtual && (
                                          <div className="small text-secondary mb-1">
                                              <i className="bi bi-arrow-repeat me-2" aria-hidden="true"></i>
                                              Saldo: {quantidadeAnterior} {'->'} {quantidadeAtual}
                                          </div>
                                      )}
                                      <div className="small text-secondary mb-1">
                                          <i className="bi bi-person me-2" aria-hidden="true"></i>
                                          {mov.usuario || 'Usuário não informado'}
                                      </div>
                                      <div className="small text-secondary">
                                          <i className="bi bi-chat-square-text me-2" aria-hidden="true"></i>
                                          {mov.motivo || 'Sem motivo registrado'}
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
            </div>
        </div>
    );
}
