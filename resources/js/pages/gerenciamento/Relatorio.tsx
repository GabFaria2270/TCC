// Toggle estilizado para alternar entre Vendas e Movimentos
function RelatorioToggle({ value, onChange }: { value: 'vendas' | 'estoque'; onChange: (v: 'vendas' | 'estoque') => void }) {
    return (
        <div className="relatorio-toggle-wrapper">
            <div className="relatorio-toggle d-flex align-items-center position-relative">
                <div className={`relatorio-toggle-slider ${value}`} />
                <div
                    className={`relatorio-toggle-btn flex-grow-1 text-center ${value === 'vendas' ? 'active' : ''}`}
                    onClick={() => onChange('vendas')}
                >
                    Vendas
                </div>
                <div
                    className={`relatorio-toggle-btn flex-grow-1 text-center ${value === 'estoque' ? 'active' : ''}`}
                    onClick={() => onChange('estoque')}
                >
                    Movimentos
                </div>
            </div>
        </div>
    );
}
// Interface para movimento de estoque
interface MovimentoEstoque {
    id: number;
    data: string;
    created_at_iso?: string;
    produto: string;
    tipo: string; // entrada, saida, ajuste
    quantidade: number;
    quantidade_anterior?: number | null;
    quantidade_atual?: number | null;
    usuario: string;
    motivo?: string;
}

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
        const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
        setMatches(mediaQueryList.matches);

        try {
            mediaQueryList.addEventListener('change', listener);
        } catch {
            mediaQueryList.addListener(listener);
        }

        return () => {
            try {
                mediaQueryList.removeEventListener('change', listener);
            } catch {
                mediaQueryList.removeListener(listener);
            }
        };
    }, [query]);

    return matches;
}

function movimentoTipoInfo(tipo: string) {
    const normalized = (tipo ?? '').toLowerCase();
    switch (normalized) {
        case 'entrada':
            return { label: 'Entrada', badge: 'text-bg-success', icon: 'bi-box-arrow-in-down', prefix: '+' };
        case 'saida':
        case 'saída':
            return { label: 'Saída', badge: 'text-bg-danger', icon: 'bi-box-arrow-up-right', prefix: '-' };
        case 'ajuste':
            return { label: 'Ajuste', badge: 'text-bg-warning text-dark', icon: 'bi-sliders', prefix: '~' };
        default:
            return { label: tipo || 'Movimento', badge: 'text-bg-secondary', icon: 'bi-arrow-left-right', prefix: '' };
    }
}

function formatarDataMovimento(dataIso?: string, fallback?: string) {
    if (dataIso) {
        const dataObj = new Date(dataIso);
        if (!Number.isNaN(dataObj.getTime())) {
            return dataObj.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        }
    }
    return fallback ?? '-';
}

function formatarNumero(valor?: number | null) {
    if (typeof valor !== 'number' || Number.isNaN(valor)) return null;
    return valor.toLocaleString('pt-BR');
}

// Componente de tabela de movimentos de estoque
function MovimentosEstoqueTable({ movimentos }: { movimentos: MovimentoEstoque[] }) {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const emptyState = (
        <div className="text-muted py-5 text-center">
            <i className="bi bi-clipboard-data display-6 d-block mb-3"></i>
            <h5 className="mb-0">Nenhum movimento encontrado</h5>
        </div>
    );

    return (
        <div className="card fade-in border-0 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center bg-body-tertiary border-0">
                <strong>Movimentos de Estoque</strong>
                <div className="small text-secondary">Exibe o histórico de entradas, saídas e ajustes de estoque</div>
            </div>
            {isDesktop ? (
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
            ) : (
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
            )}
        </div>
    );
}

function PaginationControls({
    meta,
    onChange,
    disabled = false,
}: {
    meta: PaginacaoMeta | null;
    onChange: (page: number) => void;
    disabled?: boolean;
}) {
    if (!meta || meta.last_page <= 1) return null;

    const previousDisabled = disabled || meta.current_page <= 1;
    const nextDisabled = disabled || meta.current_page >= meta.last_page;

    return (
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <button className="btn btn-outline-secondary" type="button" disabled={previousDisabled} onClick={() => onChange(meta.current_page - 1)}>
                <i className="bi bi-arrow-left-short me-1" /> Anterior
            </button>
            <div className="text-secondary small">
                Página {meta.current_page} de {meta.last_page} · {meta.total} registros
            </div>
            <button className="btn btn-outline-secondary" type="button" disabled={nextDisabled} onClick={() => onChange(meta.current_page + 1)}>
                Próxima <i className="bi bi-arrow-right-short ms-1" />
            </button>
        </div>
    );
}
// Badge visual igual ao VendasList
function FormaPagamentoBadge({ tipo }: { tipo: string }) {
    switch (tipo) {
        case 'dinheiro':
            return (
                <span className="badge text-bg-success">
                    <i className="bi bi-cash-coin me-1"></i>
                    Dinheiro
                </span>
            );
        case 'pix':
        case 'PIX':
            return (
                <span className="badge text-bg-info">
                    <i className="bi bi-qr-code me-1"></i>
                    PIX
                </span>
            );
        case 'debito':
        case 'cartao_debito':
            return (
                <span className="badge text-bg-primary">
                    <i className="bi bi-credit-card-2-front me-1"></i>
                    Débito
                </span>
            );
        case 'credito':
        case 'cartao_credito':
            return (
                <span className="badge text-bg-warning text-dark">
                    <i className="bi bi-credit-card me-1"></i>
                    Crédito
                </span>
            );
        case 'conta_fiada':
        case 'fiado':
            return (
                <span className="badge text-bg-secondary">
                    <i className="bi bi-wallet2 me-1"></i>
                    Conta Fiada
                </span>
            );
        default:
            return (
                <span className="badge text-bg-light text-dark">
                    <i className="bi bi-question-circle me-1"></i>
                    {tipo || 'Não informado'}
                </span>
            );
    }
}

const STATUS_CONFIG: Record<string, { badgeClass: string; label: string }> = {
    concluida: { badgeClass: 'text-bg-success', label: '✅ Concluída' },
    pendente: { badgeClass: 'text-bg-warning', label: '⏳ Pendente' },
    cancelada: { badgeClass: 'text-bg-danger', label: '❌ Cancelada' },
};

function normalizarStatus(status?: string) {
    const value = (status ?? '').toLowerCase();
    if (value === 'conta_fiada') return 'pendente';
    return value;
}

function statusInfo(status?: string) {
    const normalized = normalizarStatus(status);
    const config = STATUS_CONFIG[normalized];
    return {
        normalized,
        badgeClass: config?.badgeClass ?? 'text-bg-info',
        label: config?.label ?? (normalized || '—'),
    };
}

// Badge de status igual ao VendasList
function StatusBadge({ status }: { status: string }) {
    const info = statusInfo(status);
    return <span className={`badge ${info.badgeClass}`}>{info.label}</span>;
}
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import VendaDetalhesModal from '../../components/PDVcomponents/VendaDetalhesModal';
import { exportarParaExcel } from '../../exports/ExcelExport';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';

type VendaModalData = Parameters<typeof VendaDetalhesModal>[0]['venda'];

interface Item {
    produto: string;
    quantidade: number;
    valor_unitario: number;
    valor_unitario_formatado: string;
    subtotal: number;
    subtotal_formatado: string;
}

interface RelatorioItem {
    id: number;
    data: string;
    data_iso?: string;
    cliente: string;
    usuario: string;
    total: number;
    total_formatado: string;
    desconto: number;
    desconto_formatado: string;
    forma_pagamento: string;
    status: string;
    observacoes: string;
    itens?: Item[];
}

interface RelatorioResumo {
    quantidade: number;
    totalFaturado: number;
    totalDescontos: number;
}

interface MovimentoResumo {
    quantidade: number;
    totalMovimentado: number;
}

interface PaginacaoMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ResumoVendasResponse {
    quantidade?: number;
    total_faturado?: number;
    total_descontos?: number;
}

interface ResumoMovimentosResponse {
    quantidade?: number;
    total_movimentado?: number;
}

interface RelatorioPayload<TData, TResumo> {
    data?: TData[];
    meta?: PaginacaoMeta | null;
    resumo?: TResumo | null;
}

export default function Relatorio({
    initialVendas,
    initialMovimentos,
}: {
    initialVendas?: RelatorioPayload<RelatorioItem, ResumoVendasResponse> | null;
    initialMovimentos?: RelatorioPayload<MovimentoEstoque, ResumoMovimentosResponse> | null;
}) {
    const [tabela, setTabela] = useState<'vendas' | 'estoque'>('vendas');
    const h1Ref = useRef<HTMLHeadingElement>(null);
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');
    const [filtroPagamento, setFiltroPagamento] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultados, setResultados] = useState<RelatorioItem[]>(initialVendas?.data ?? []);
    const [movimentosFiltrados, setMovimentosFiltrados] = useState<MovimentoEstoque[]>(initialMovimentos?.data ?? []);
    const [paginacaoVendas, setPaginacaoVendas] = useState<PaginacaoMeta | null>(initialVendas?.meta ?? null);
    const [paginacaoMovimentos, setPaginacaoMovimentos] = useState<PaginacaoMeta | null>(initialMovimentos?.meta ?? null);
    const [resumoVendas, setResumoVendas] = useState<RelatorioResumo>(() =>
        mapResumoVendas(initialVendas?.resumo ?? null, initialVendas?.data ?? []),
    );
    const [resumoMovimentos, setResumoMovimentos] = useState<MovimentoResumo>(() =>
        mapResumoMovimentos(initialMovimentos?.resumo ?? null, initialMovimentos?.data ?? []),
    );
    const [erro, setErro] = useState<string | null>(null);
    const [exportando, setExportando] = useState(false);
    const [modalVenda, setModalVenda] = useState<{ show: boolean; venda: RelatorioItem | null }>({ show: false, venda: null });
    const currencyFormatter = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), []);
    const csrfToken = useMemo(() => {
        if (typeof document === 'undefined') return '';
        const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
        return meta?.content ?? '';
    }, []);

    useEffect(() => {
        h1Ref.current?.focus();
    }, []);

    const filtroDataClass = `relatorio-filtro col-12 col-md-6 ${tabela === 'vendas' ? 'col-lg-2 col-xl-2' : 'col-lg-3 col-xl-3'}`;
    const filtroStatusClass = `relatorio-filtro col-12 col-md-6 ${tabela === 'vendas' ? 'col-lg-3 col-xl-3' : 'col-lg-3 col-xl-3'}`;
    const filtroPagamentoClass = `relatorio-filtro col-12 col-md-6 ${tabela === 'vendas' ? 'col-lg-2 col-xl-2' : 'col-lg-3 col-xl-3'}`;
    const filtroTipoClass = 'relatorio-filtro col-12 col-md-6 col-lg-3 col-xl-3';
    const filtroAcoesClass = `relatorio-filtro col-12 col-md-6 ${tabela === 'vendas' ? 'col-lg-3 col-xl-3' : 'col-lg-3 col-xl-3'}`;

    function normalizarIso(dataIso?: string, dataTexto?: string) {
        if (dataIso) return dataIso;
        if (!dataTexto) return undefined;
        const [data, horario = '00:00'] = dataTexto.split(' ');
        const [dia, mes, ano] = data.split('/');
        if (!dia || !mes || !ano) return undefined;
        const [horaParte, minutoParte = '00'] = horario.split(':');
        const hora = (horaParte ?? '00').padStart(2, '0');
        const minuto = minutoParte.padStart(2, '0');
        return `${ano.padStart(4, '0')}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${hora}:${minuto}:00`;
    }

    function timestampOrNull(dataIso?: string, fallback?: string) {
        const iso = normalizarIso(dataIso, fallback);
        if (!iso) return null;
        const ts = Date.parse(iso);
        return Number.isNaN(ts) ? null : ts;
    }

    function timestampFrom(dataIso?: string, fallback?: string) {
        return timestampOrNull(dataIso, fallback) ?? 0;
    }

    function normalizarPagamento(valor?: string) {
        const val = (valor ?? '').toLowerCase();
        if (val === '') return '';
        if (val === 'cartao_debito') return 'debito';
        if (val === 'cartao_credito') return 'credito';
        if (val === 'fiado') return 'conta_fiada';
        return val;
    }

    function calcularResumoVendas(lista: RelatorioItem[]): RelatorioResumo {
        const quantidade = lista.length;
        const totalFaturado = lista.reduce((acc, item) => acc + Number(item.total ?? 0), 0);
        const totalDescontos = lista.reduce((acc, item) => acc + Number(item.desconto ?? 0), 0);
        return {
            quantidade,
            totalFaturado,
            totalDescontos,
        };
    }

    function calcularResumoMovimentos(lista: MovimentoEstoque[]): MovimentoResumo {
        const quantidade = lista.length;
        const totalMovimentado = lista.reduce((acc, item) => acc + Number(item.quantidade ?? 0), 0);
        return {
            quantidade,
            totalMovimentado,
        };
    }

    function ordenarVendas(lista: RelatorioItem[]) {
        return [...lista].sort((a, b) => timestampFrom(b.data_iso, b.data) - timestampFrom(a.data_iso, a.data));
    }

    function ordenarMovimentos(lista: MovimentoEstoque[]) {
        return [...lista].sort((a, b) => timestampFrom(b.created_at_iso, b.data) - timestampFrom(a.created_at_iso, a.data));
    }

    function prepararVenda(item: RelatorioItem) {
        const possuiDesconto = (item.desconto ?? 0) > 0;
        const totalFormatado = item.total_formatado ?? `R$ ${(item.total ?? 0).toFixed(2).replace('.', ',')}`;
        const descontoFormatado = item.desconto_formatado ?? `R$ ${(item.desconto ?? 0).toFixed(2).replace('.', ',')}`;
        const dataIso = normalizarIso(item.data_iso, item.data);
        const exibicaoData = dataIso
            ? new Date(dataIso).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
              })
            : item.data;
        const clienteNome = item.cliente && item.cliente !== '-' ? item.cliente : null;
        const responsavel = item.usuario && item.usuario !== '-' ? item.usuario : null;

        return {
            original: item,
            possuiDesconto,
            totalFormatado,
            descontoFormatado,
            exibicaoData,
            clienteNome,
            responsavel,
        };
    }

    const vendasPreparadas = useMemo(() => resultados.map(prepararVenda), [resultados]);

    function mapRelatorioItemParaVendaModal(item: RelatorioItem | null): VendaModalData {
        if (!item) return null;

        const createdAt = normalizarIso(item.data_iso, item.data);
        const formaPagamento = normalizarPagamento(item.forma_pagamento);

        const safeNumber = (value?: number | string | null) => {
            if (typeof value === 'number') {
                return Number.isFinite(value) ? value : 0;
            }
            if (typeof value === 'string') {
                const parsed = Number(value.replace(/\./g, '').replace(',', '.'));
                return Number.isFinite(parsed) ? parsed : 0;
            }
            return 0;
        };

        const desconto = safeNumber(item.desconto);
        const total = safeNumber(item.total);
        const subtotal = total + desconto;

        const itens = (item.itens ?? []).map((it, index) => {
            const quantidade = safeNumber(it.quantidade);
            const precoUnitario = safeNumber(it.valor_unitario);
            const subtotalItem = safeNumber(it.subtotal) || quantidade * precoUnitario;

            return {
                id: index,
                quantidade,
                preco_unitario: precoUnitario,
                subtotal: subtotalItem,
                produto: it.produto
                    ? {
                          id: index,
                          nome: it.produto,
                      }
                    : undefined,
            };
        });

        const status = normalizarStatus(item.status) || item.status || '';

        return {
            id: item.id,
            cliente: item.cliente && item.cliente !== '-' ? { id: item.id, nome: item.cliente } : null,
            usuario: item.usuario && item.usuario !== '-' ? { id: item.id, nome: item.usuario, NOME: item.usuario } : null,
            status,
            forma_pagamento: formaPagamento || null,
            subtotal,
            desconto,
            total,
            observacoes: item.observacoes || '',
            created_at: createdAt,
            itens,
        };
    }

    const vendaSelecionada = useMemo(() => mapRelatorioItemParaVendaModal(modalVenda.venda), [modalVenda.venda]);

    function metaFallback(tamanhoLista: number): PaginacaoMeta {
        const perPage = tamanhoLista > 0 ? tamanhoLista : 25;
        return {
            current_page: 1,
            last_page: 1,
            per_page: perPage,
            total: tamanhoLista,
        };
    }

    function mapResumoVendas(resumo?: ResumoVendasResponse | null, lista: RelatorioItem[] = []): RelatorioResumo {
        if (resumo) {
            return {
                quantidade: Number(resumo.quantidade ?? 0),
                totalFaturado: Number(resumo.total_faturado ?? 0),
                totalDescontos: Number(resumo.total_descontos ?? 0),
            };
        }

        return calcularResumoVendas(lista);
    }

    function mapResumoMovimentos(resumo?: ResumoMovimentosResponse | null, lista: MovimentoEstoque[] = []): MovimentoResumo {
        if (resumo) {
            return {
                quantidade: Number(resumo.quantidade ?? 0),
                totalMovimentado: Number(resumo.total_movimentado ?? 0),
            };
        }

        return calcularResumoMovimentos(lista);
    }

    const initialVendasRef = useRef(initialVendas ?? null);
    const initialMovimentosRef = useRef(initialMovimentos ?? null);

    useEffect(() => {
        initialVendasRef.current = initialVendas ?? null;
        const lista = ordenarVendas(initialVendas?.data ?? []);
        setResultados(lista);
        setPaginacaoVendas(initialVendas?.meta ?? metaFallback(lista.length));
        setResumoVendas(mapResumoVendas(initialVendas?.resumo, lista));
    }, [initialVendas]);

    useEffect(() => {
        initialMovimentosRef.current = initialMovimentos ?? null;
        const lista = ordenarMovimentos(initialMovimentos?.data ?? []);
        setMovimentosFiltrados(lista);
        setPaginacaoMovimentos(initialMovimentos?.meta ?? metaFallback(lista.length));
        setResumoMovimentos(mapResumoMovimentos(initialMovimentos?.resumo, lista));
    }, [initialMovimentos]);

    useEffect(() => {
        if (tabela === 'estoque') {
            setFiltroStatus('');
            setFiltroPagamento('');
        } else {
            setFiltroTipo('');
        }
        setErro(null);
    }, [tabela]);

    function montarPayload(page: number, perPage?: number, tabelaOverride?: 'vendas' | 'estoque') {
        const alvo = tabelaOverride ?? tabela;

        const payload: Record<string, unknown> = {
            tabela: alvo,
            data_inicio: filtroDataInicio || null,
            data_fim: filtroDataFim || null,
            page,
        };

        if (typeof perPage === 'number') {
            payload.per_page = perPage;
        }

        if (alvo === 'vendas') {
            if (filtroStatus) payload.status = filtroStatus;
            if (filtroPagamento) payload.forma_pagamento = filtroPagamento;
        } else if (filtroTipo) {
            payload.tipo_movimento = filtroTipo;
        }

        return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== null && value !== ''));
    }

    async function buscarRelatorio(page = 1) {
        setLoading(true);
        setErro(null);

        const body = JSON.stringify(montarPayload(page));

        try {
            const response = await fetch('/gerenciamento/relatorio/buscar', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
                body,
            });

            const json = await response.json().catch(() => null);

            if (!response.ok || !json) {
                throw new Error(json?.message ?? 'Falha ao carregar os relatórios.');
            }

            if (!json.success) {
                throw new Error(json.message ?? 'Não foi possível carregar os relatórios.');
            }

            if (json.tabela === 'estoque') {
                const lista: MovimentoEstoque[] = Array.isArray(json.data) ? json.data : [];
                setMovimentosFiltrados(lista);
                setPaginacaoMovimentos(json.meta ?? null);
                setResumoMovimentos(
                    json.resumo
                        ? {
                              quantidade: Number(json.resumo.quantidade ?? 0),
                              totalMovimentado: Number(json.resumo.total_movimentado ?? 0),
                          }
                        : calcularResumoMovimentos(lista),
                );
            } else {
                const lista: RelatorioItem[] = Array.isArray(json.data) ? json.data : [];
                setResultados(lista);
                setPaginacaoVendas(json.meta ?? null);
                setResumoVendas(
                    json.resumo
                        ? {
                              quantidade: Number(json.resumo.quantidade ?? 0),
                              totalFaturado: Number(json.resumo.total_faturado ?? 0),
                              totalDescontos: Number(json.resumo.total_descontos ?? 0),
                          }
                        : calcularResumoVendas(lista),
                );
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro inesperado ao buscar relatórios.';
            setErro(message);
        } finally {
            setLoading(false);
        }
    }

    async function coletarRegistrosCompletos(alvo: 'vendas' | 'estoque'): Promise<RelatorioItem[] | MovimentoEstoque[]> {
        const itens: Array<RelatorioItem | MovimentoEstoque> = [];
        const pageSize = 100;
        let page = 1;
        let lastPage = 1;

        do {
            const payload = montarPayload(page, pageSize, alvo);
            const response = await fetch('/gerenciamento/relatorio/buscar', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });

            const json = await response.json().catch(() => null);

            if (!response.ok || !json?.success) {
                const message = json?.message ?? 'Falha ao coletar dados completos para exportação.';
                throw new Error(message);
            }

            const lista = Array.isArray(json.data) ? json.data : [];
            itens.push(...lista);
            const metaLast = Number(json.meta?.last_page ?? page);
            lastPage = Number.isFinite(metaLast) && metaLast > 0 ? metaLast : page;
            page += 1;
        } while (page <= lastPage);

        return itens as RelatorioItem[] | MovimentoEstoque[];
    }

    function limparFiltros() {
        setFiltroDataInicio('');
        setFiltroDataFim('');
        setFiltroTipo('');
        setFiltroStatus('');
        setFiltroPagamento('');
        const vendasPayload = initialVendasRef.current;
        const movimentosPayload = initialMovimentosRef.current;

        const vendasLista = ordenarVendas(vendasPayload?.data ?? []);
        setResultados(vendasLista);
        setResumoVendas(mapResumoVendas(vendasPayload?.resumo ?? null, vendasLista));
        setPaginacaoVendas(vendasPayload?.meta ?? metaFallback(vendasLista.length));

        const movimentosLista = ordenarMovimentos(movimentosPayload?.data ?? []);
        setMovimentosFiltrados(movimentosLista);
        setResumoMovimentos(mapResumoMovimentos(movimentosPayload?.resumo ?? null, movimentosLista));
        setPaginacaoMovimentos(movimentosPayload?.meta ?? metaFallback(movimentosLista.length));
        setErro(null);
    }

    async function exportarExcel() {
        try {
            setExportando(true);
            if (tabela === 'estoque') {
                const lista = (await coletarRegistrosCompletos('estoque')) as MovimentoEstoque[];
                const dadosExportar = lista.map((mov) => ({
                    Data: mov.data,
                    Produto: mov.produto,
                    Tipo: mov.tipo,
                    'Qtd Anterior': mov.quantidade_anterior ?? '',
                    'Qtd Movimentada': mov.quantidade,
                    'Qtd Atual': mov.quantidade_atual ?? '',
                    Responsável: mov.usuario || '-',
                    Motivo: mov.motivo ?? '-',
                }));
                await exportarParaExcel(dadosExportar, 'movimentos_estoque_filtrado.xlsx');
                return;
            }

            const lista = (await coletarRegistrosCompletos('vendas')) as RelatorioItem[];
            const dadosExportar = lista.map((item) => ({
                Data: item.data,
                Cliente: item.cliente,
                Responsável: item.usuario || '-',
                'Total (R$)': item.total_formatado,
                'Desconto (R$)': item.desconto_formatado,
                'Forma de Pagamento': item.forma_pagamento,
                Status: statusInfo(item.status).label,
                Observações: item.observacoes,
            }));
            await exportarParaExcel(dadosExportar, 'relatorio_vendas.xlsx');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Falha ao exportar relatórios para Excel.';
            setErro(message);
        } finally {
            setExportando(false);
        }
    }

    const renderVendasDesktop = () => (
        <div className="card fade-in elemento-relatorio-3 border-0 shadow-sm">
            <div className="card-header bg-body">
                <h5 className="mb-0">
                    <i className="bi bi-receipt-cutoff me-2"></i>
                    Histórico ({paginacaoVendas?.total ?? resultados.length} vendas)
                </h5>
            </div>
            <div className="table-responsive scroll-shadow">
                <table className="table-hover vendas-table data-table mb-0 table align-middle">
                    <thead>
                        <tr>
                            <th>Data/Hora</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Pagamento</th>
                            <th>Status</th>
                            <th>Responsável</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {erro && (
                            <tr>
                                <td colSpan={7} className="text-danger text-center">
                                    {erro}
                                </td>
                            </tr>
                        )}
                        {!erro && vendasPreparadas.length === 0 && !loading && (
                            <tr>
                                <td colSpan={7} className="estado-vazio p-0">
                                    <div className="text-muted p-5 text-center">
                                        <i className="bi bi-receipt display-4 d-block mb-3"></i>
                                        <h5 className="mb-0">Nenhuma venda encontrada</h5>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!erro &&
                            vendasPreparadas.map(
                                ({ original, possuiDesconto, totalFormatado, descontoFormatado, exibicaoData, clienteNome, responsavel }) => (
                                    <tr key={original.id}>
                                        <td data-label="Data/Hora">{exibicaoData}</td>
                                        <td data-label="Cliente">
                                            {clienteNome ? (
                                                <div className="cliente-nome">{clienteNome}</div>
                                            ) : (
                                                <span className="text-muted">Venda avulsa</span>
                                            )}
                                        </td>
                                        <td data-label="Total">
                                            <strong className="text-success">{totalFormatado}</strong>
                                            {possuiDesconto && <small className="d-block text-muted">Desconto: {descontoFormatado}</small>}
                                        </td>
                                        <td data-label="Pagamento">
                                            <FormaPagamentoBadge tipo={original.forma_pagamento} />
                                        </td>
                                        <td data-label="Status">
                                            <StatusBadge status={original.status} />
                                        </td>
                                        <td data-label="Responsável">{responsavel ?? <span className="text-muted">Não informado</span>}</td>
                                        <td className="text-center" data-label="Ações">
                                            <button
                                                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
                                                onClick={() => setModalVenda({ show: true, venda: original })}
                                                title="Ver observação completa"
                                            >
                                                <i className="bi bi-eye"></i>
                                                <span className="ms-2">Abrir</span>
                                            </button>
                                        </td>
                                    </tr>
                                ),
                            )}
                    </tbody>
                </table>
            </div>
            <PaginationControls meta={paginacaoVendas} onChange={buscarRelatorio} disabled={loading} />
        </div>
    );

    const renderVendasMobile = () => (
        <div className="card fade-in elemento-relatorio-3 border-0 shadow-sm">
            <div className="card-header bg-body">
                <h5 className="mb-0">
                    <i className="bi bi-receipt-cutoff me-2"></i>
                    Histórico ({paginacaoVendas?.total ?? resultados.length} vendas)
                </h5>
            </div>
            <div className="d-flex flex-column gap-3 p-3">
                {erro && <div className="alert alert-danger mb-0">{erro}</div>}
                {!erro && vendasPreparadas.length === 0 && !loading && (
                    <div className="text-muted py-5 text-center">
                        <i className="bi bi-receipt display-4 d-block mb-3"></i>
                        <h5 className="mb-0">Nenhuma venda encontrada</h5>
                    </div>
                )}
                {!erro &&
                    vendasPreparadas.map(
                        ({ original, possuiDesconto, totalFormatado, descontoFormatado, exibicaoData, clienteNome, responsavel }) => (
                            <div key={original.id} className="card border-0 shadow-sm">
                                <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2 gap-3">
                                        <div>
                                            <div className="small text-secondary mb-1">
                                                <i className="bi bi-clock me-2" aria-hidden="true"></i>
                                                {exibicaoData}
                                            </div>
                                            <h6 className="fw-semibold text-break mb-0">{clienteNome ?? 'Venda avulsa'}</h6>
                                        </div>
                                        <span className={`badge ${possuiDesconto ? 'text-bg-danger' : 'text-bg-success'} fs-6 flex-shrink-0`}>
                                            {totalFormatado}
                                        </span>
                                    </div>
                                    {possuiDesconto && <div className="small text-muted mb-2">Desconto aplicado: {descontoFormatado}</div>}
                                    <div className="d-flex align-items-center mb-2 flex-wrap gap-2">
                                        <FormaPagamentoBadge tipo={original.forma_pagamento} />
                                        <StatusBadge status={original.status} />
                                    </div>
                                    <div className="small text-secondary mb-1">
                                        <i className="bi bi-person me-2" aria-hidden="true"></i>
                                        {responsavel ?? 'Responsável não informado'}
                                    </div>
                                    {original.observacoes && (
                                        <div className="small text-secondary text-break mb-2">
                                            <i className="bi bi-chat-text me-2" aria-hidden="true"></i>
                                            {original.observacoes.length > 120 ? `${original.observacoes.slice(0, 117)}...` : original.observacoes}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary w-100"
                                        onClick={() => setModalVenda({ show: true, venda: original })}
                                        title="Ver observação completa"
                                    >
                                        <i className="bi bi-eye me-2"></i>
                                        Ver detalhes
                                    </button>
                                </div>
                            </div>
                        ),
                    )}
            </div>
            <PaginationControls meta={paginacaoVendas} onChange={buscarRelatorio} disabled={loading} />
        </div>
    );

    return (
        <GerenciamentoLayout title="Relatório">
            <Head title="Relatório" />
            <h2 className="visually-hidden" ref={h1Ref} tabIndex={-1}>
                Relatório
            </h2>

            <VendaDetalhesModal show={modalVenda.show} venda={vendaSelecionada} fechar={() => setModalVenda({ show: false, venda: null })} />

            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center rounded-3 bg-body-tertiary elemento-relatorio-1 mb-4 flex-wrap gap-3 border p-3">
                    <div>
                        <h1 className="h3 m-0">Relatórios</h1>
                        <p className="text-secondary mb-0">Gere relatórios de vendas, estoque e mais.</p>
                    </div>
                    <div className="relatorio-acoes d-flex align-items-center justify-content-end flex-wrap gap-2">
                        <RelatorioToggle value={tabela} onChange={setTabela} />
                        <button className="btn btn-success" onClick={exportarExcel} type="button" disabled={exportando}>
                            {exportando ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                    Exportando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-file-earmark-excel me-2" />
                                    Exportar Excel
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="card filtros-card fade-in elemento-relatorio-2 mb-4 border-0 shadow-sm">
                    <div className="card-body">
                        <div className="relatorio-filtros row g-2 g-md-3 align-items-end">
                            <div className={filtroDataClass}>
                                <label htmlFor="filtro-data-inicio" className="form-label">
                                    Data início
                                </label>
                                <input
                                    id="filtro-data-inicio"
                                    type="date"
                                    className="form-control"
                                    value={filtroDataInicio}
                                    onChange={(e) => setFiltroDataInicio(e.target.value)}
                                />
                            </div>
                            <div className={filtroDataClass}>
                                <label htmlFor="filtro-data-fim" className="form-label">
                                    Data fim
                                </label>
                                <input
                                    id="filtro-data-fim"
                                    type="date"
                                    className="form-control"
                                    value={filtroDataFim}
                                    onChange={(e) => setFiltroDataFim(e.target.value)}
                                />
                            </div>
                            {tabela === 'vendas' && (
                                <>
                                    <div className={filtroStatusClass}>
                                        <label htmlFor="filtro-status" className="form-label">
                                            Status
                                        </label>
                                        <select
                                            id="filtro-status"
                                            className="form-select"
                                            value={filtroStatus}
                                            onChange={(e) => setFiltroStatus(e.target.value)}
                                        >
                                            <option value="">Todos os status</option>
                                            <option value="concluida">✅ Concluída</option>
                                            <option value="pendente">⏳ Pendente</option>
                                            <option value="cancelada">❌ Cancelada</option>
                                        </select>
                                    </div>
                                    <div className={filtroPagamentoClass}>
                                        <label htmlFor="filtro-pagamento" className="form-label">
                                            Forma de pagamento
                                        </label>
                                        <select
                                            id="filtro-pagamento"
                                            className="form-select"
                                            value={filtroPagamento}
                                            onChange={(e) => setFiltroPagamento(e.target.value)}
                                        >
                                            <option value="">Todas as formas</option>
                                            <option value="dinheiro">💵 Dinheiro</option>
                                            <option value="pix">⚡ PIX</option>
                                            <option value="debito">💳 Débito</option>
                                            <option value="credito">📄 Crédito</option>
                                            <option value="conta_fiada">📔 Conta Fiada</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            {tabela === 'estoque' && (
                                <div className={filtroTipoClass}>
                                    <label htmlFor="filtro-tipo" className="form-label">
                                        Tipo de movimento
                                    </label>
                                    <select
                                        id="filtro-tipo"
                                        className="form-select"
                                        value={filtroTipo}
                                        onChange={(e) => setFiltroTipo(e.target.value)}
                                    >
                                        <option value="">Todos</option>
                                        <option value="entrada">Entrada</option>
                                        <option value="saida">Saída</option>
                                        <option value="ajuste">Ajuste</option>
                                    </select>
                                </div>
                            )}
                            <div className={filtroAcoesClass}>
                                <div className="relatorio-filtro-acoes justify-content-xl-end">
                                    <button className="btn btn-primary" onClick={() => buscarRelatorio(1)} disabled={loading}>
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                        ) : (
                                            <i className="bi bi-search" />
                                        )}{' '}
                                        Buscar
                                    </button>
                                    <button className="btn btn-outline-secondary" onClick={limparFiltros} disabled={loading}>
                                        Limpar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {tabela === 'vendas' && (
                    <div className="row g-3 elemento-relatorio-2 mb-4">
                        <div className="col-md-6 col-xl-4 col-12">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body">
                                    <span className="text-uppercase text-secondary small">Total faturado</span>
                                    <h4 className="fw-bold mt-2 mb-0">{currencyFormatter.format(resumoVendas.totalFaturado)}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-xl-4 col-12">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body">
                                    <span className="text-uppercase text-secondary small">Total de descontos</span>
                                    <h4 className="fw-bold text-danger mt-2 mb-0">{currencyFormatter.format(resumoVendas.totalDescontos)}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-xl-4 col-12">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body">
                                    <span className="text-uppercase text-secondary small">Quantidade de vendas</span>
                                    <h4 className="fw-bold mt-2 mb-0">{resumoVendas.quantidade}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {tabela === 'estoque' && resumoMovimentos && (
                    <div className="row g-3 elemento-relatorio-2 mb-4">
                        <div className="col-md-6 col-xl-6 col-12">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body">
                                    <span className="text-uppercase text-secondary small">Total de movimentos</span>
                                    <h4 className="fw-bold mt-2 mb-0">{resumoMovimentos.quantidade}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-xl-6 col-12">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body">
                                    <span className="text-uppercase text-secondary small">Quantidade movimentada</span>
                                    <h4 className="fw-bold text-primary mt-2 mb-0">{resumoMovimentos.totalMovimentado}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabela dinâmica */}
                {tabela === 'vendas' ? (
                    isDesktop ? (
                        renderVendasDesktop()
                    ) : (
                        renderVendasMobile()
                    )
                ) : (
                    <>
                        <MovimentosEstoqueTable movimentos={movimentosFiltrados} />
                        <PaginationControls meta={paginacaoMovimentos} onChange={buscarRelatorio} disabled={loading} />
                    </>
                )}
            </div>
        </GerenciamentoLayout>
    );
}
