// Toggle estilizado para alternar entre Vendas e Movimentos
function RelatorioToggle({ value, onChange }: { value: 'vendas' | 'estoque'; onChange: (v: 'vendas' | 'estoque') => void }) {
    const roxo = '#7c3aed'; // Roxo do site
    return (
        <div style={{ minWidth: 220 }}>
            <div
                className="relatorio-toggle d-flex align-items-center position-relative"
                style={{
                    background: roxo,
                    borderRadius: 999,
                    padding: 4,
                    width: 220,
                    height: 40,
                    cursor: 'pointer',
                    userSelect: 'none',
                }}
            >
                <div
                    className="relatorio-toggle-slider"
                    style={{
                        position: 'absolute',
                        top: 4,
                        left: value === 'vendas' ? 4 : 110,
                        width: 106,
                        height: 32,
                        borderRadius: 999,
                        background: '#fff',
                        boxShadow: '0 2px 8px #0001',
                        transition: 'left 0.25s cubic-bezier(.4,1.5,.5,1)',
                        zIndex: 1,
                    }}
                />
                <div
                    className="relatorio-toggle-btn flex-grow-1 text-center"
                    style={{
                        width: 106,
                        zIndex: 2,
                        color: value === 'vendas' ? roxo : '#fff',
                        fontWeight: 600,
                        fontSize: 16,
                        transition: 'color 0.2s',
                        cursor: 'pointer',
                    }}
                    onClick={() => onChange('vendas')}
                >
                    Vendas
                </div>
                <div
                    className="relatorio-toggle-btn flex-grow-1 text-center"
                    style={{
                        width: 106,
                        zIndex: 2,
                        color: value === 'estoque' ? roxo : '#fff',
                        fontWeight: 600,
                        fontSize: 16,
                        transition: 'color 0.2s',
                        cursor: 'pointer',
                    }}
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
// Componente de tabela de movimentos de estoque
function MovimentosEstoqueTable({ movimentos }: { movimentos: MovimentoEstoque[] }) {
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
                        {movimentos.map((mov) => (
                            <tr key={mov.id}>
                                <td>{mov.data}</td>
                                <td>{mov.produto}</td>
                                <td>{mov.tipo}</td>
                                <td>{mov.quantidade}</td>
                                <td>{mov.usuario}</td>
                                <td>{mov.motivo || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PaginationControls({ meta, onChange, disabled = false }: { meta: PaginacaoMeta | null; onChange: (page: number) => void; disabled?: boolean }) {
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
import ObservacaoModal from '../../components/ObservacaoModal';
import { exportarParaExcel } from '../../exports/ExcelExport';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';

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

export default function Relatorio({ dados = [], movimentosEstoque = [] }: { dados?: RelatorioItem[]; movimentosEstoque?: MovimentoEstoque[] }) {
    const [tabela, setTabela] = useState<'vendas' | 'estoque'>('vendas');
    const h1Ref = useRef<HTMLHeadingElement>(null);
    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');
    const [filtroPagamento, setFiltroPagamento] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultados, setResultados] = useState<RelatorioItem[]>([]);
    const [movimentosFiltrados, setMovimentosFiltrados] = useState<MovimentoEstoque[]>([]);
    const [paginacaoVendas, setPaginacaoVendas] = useState<PaginacaoMeta | null>(null);
    const [paginacaoMovimentos, setPaginacaoMovimentos] = useState<PaginacaoMeta | null>(null);
    const [resumoVendas, setResumoVendas] = useState<RelatorioResumo>({ quantidade: 0, totalFaturado: 0, totalDescontos: 0 });
    const [resumoMovimentos, setResumoMovimentos] = useState<MovimentoResumo | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [modalObs, setModalObs] = useState<{ show: boolean; texto: string; itens: Item[] }>({ show: false, texto: '', itens: [] });
    const currencyFormatter = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), []);
    const csrfToken = useMemo(() => {
        if (typeof document === 'undefined') return '';
        const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
        return meta?.content ?? '';
    }, []);

    useEffect(() => {
        h1Ref.current?.focus();
    }, []);

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

    useEffect(() => {
        const vendasOrdenadas = ordenarVendas(dados);
        setResultados(vendasOrdenadas);
        setResumoVendas(calcularResumoVendas(vendasOrdenadas));
        setPaginacaoVendas({
            current_page: 1,
            last_page: 1,
            per_page: vendasOrdenadas.length || 1,
            total: vendasOrdenadas.length,
        });
    }, [dados]);

    useEffect(() => {
        const movimentosOrdenados = ordenarMovimentos(movimentosEstoque);
        setMovimentosFiltrados(movimentosOrdenados);
        setResumoMovimentos(calcularResumoMovimentos(movimentosOrdenados));
        setPaginacaoMovimentos({
            current_page: 1,
            last_page: 1,
            per_page: movimentosOrdenados.length || 1,
            total: movimentosOrdenados.length,
        });
    }, [movimentosEstoque]);

    useEffect(() => {
        if (tabela === 'estoque') {
            setFiltroStatus('');
            setFiltroPagamento('');
        } else {
            setFiltroTipo('');
        }
        setErro(null);
    }, [tabela]);

    async function buscarRelatorio(page = 1) {
        setLoading(true);
        setErro(null);

        const payload: Record<string, unknown> = {
            tabela,
            data_inicio: filtroDataInicio || null,
            data_fim: filtroDataFim || null,
            page,
        };

        if (tabela === 'vendas') {
            if (filtroStatus) payload.status = filtroStatus;
            if (filtroPagamento) payload.forma_pagamento = filtroPagamento;
        } else if (filtroTipo) {
            payload.tipo_movimento = filtroTipo;
        }

        const body = JSON.stringify(
            Object.fromEntries(
                Object.entries(payload).filter(([, value]) => value !== null && value !== '')
            )
        );

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
                        : calcularResumoMovimentos(lista)
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
                        : calcularResumoVendas(lista)
                );
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro inesperado ao buscar relatórios.';
            setErro(message);
        } finally {
            setLoading(false);
        }
    }

    function limparFiltros() {
        setFiltroDataInicio('');
        setFiltroDataFim('');
        setFiltroTipo('');
        setFiltroStatus('');
        setFiltroPagamento('');
        const vendasOrdenadas = ordenarVendas(dados);
        const movimentosOrdenados = ordenarMovimentos(movimentosEstoque);
        setResultados(vendasOrdenadas);
        setResumoVendas(calcularResumoVendas(vendasOrdenadas));
        setPaginacaoVendas({
            current_page: 1,
            last_page: 1,
            per_page: vendasOrdenadas.length || 1,
            total: vendasOrdenadas.length,
        });
        setMovimentosFiltrados(movimentosOrdenados);
        setResumoMovimentos(calcularResumoMovimentos(movimentosOrdenados));
        setPaginacaoMovimentos({
            current_page: 1,
            last_page: 1,
            per_page: movimentosOrdenados.length || 1,
            total: movimentosOrdenados.length,
        });
        setErro(null);
    }

    async function exportarExcel() {
        if (tabela === 'estoque') {
            const dadosExportar = movimentosFiltrados.map((mov) => ({
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

        const dadosExportar = resultados.map((item) => ({
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
    }

    return (
        <GerenciamentoLayout title="Relatório">
            <Head title="Relatório" />
            <h2 className="visually-hidden" ref={h1Ref} tabIndex={-1}>
                Relatório
            </h2>

            <ObservacaoModal
                show={modalObs.show}
                onClose={() => setModalObs({ show: false, texto: '', itens: [] })}
                texto={modalObs.texto}
                itens={modalObs.itens}
            />

            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center rounded-3 bg-body-tertiary elemento-relatorio-1 mb-4 flex-wrap gap-3 border p-3">
                    <div>
                        <h1 className="h3 m-0">Relatórios</h1>
                        <p className="text-secondary mb-0">Gere relatórios de vendas, estoque e mais.</p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <RelatorioToggle value={tabela} onChange={setTabela} />
                        <button className="btn btn-success ms-2" onClick={exportarExcel} type="button">
                            <i className="bi bi-file-earmark-excel me-2" /> Exportar Excel
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="card filtros-card fade-in elemento-relatorio-2 mb-4 border-0 shadow-sm">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6 col-lg-3 col-12">
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
                            <div className="col-md-6 col-lg-3 col-12">
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
                                    <div className="col-md-6 col-lg-3 col-12">
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
                                            <option value="pendente">⏳ Pendente (inclui Conta Fiada)</option>
                                            <option value="cancelada">❌ Cancelada</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 col-lg-3 col-12">
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
                                <div className="col-md-6 col-lg-3 col-12">
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
                            <div className="col-md-6 col-lg-3 d-flex align-items-end col-12 gap-2">
                                <button className="btn btn-primary w-100" onClick={() => buscarRelatorio(1)} disabled={loading}>
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                    ) : (
                                        <i className="bi bi-search" />
                                    )}{' '}
                                    Buscar
                                </button>
                                <button className="btn btn-outline-secondary w-100" onClick={limparFiltros} disabled={loading}>
                                    Limpar
                                </button>
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

                {/* Tabela dinâmica */}
                {tabela === 'vendas' ? (
                    <div className="card fade-in elemento-relatorio-3 border-0 shadow-sm">
                        <div className="card-header bg-body">
                            <h5 className="mb-0">
                                <i className="bi bi-receipt-cutoff me-2"></i>
                                Histórico ({resultados.length} vendas)
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
                                    {!erro && resultados.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={7} className="estado-vazio" style={{ padding: 0 }}>
                                                <div className="text-muted p-5 text-center">
                                                    <i className="bi bi-receipt display-4 d-block mb-3"></i>
                                                    <h5 className="mb-0">Nenhuma venda encontrada</h5>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {!erro &&
                                        resultados.map((item) => {
                                            const possuiDesconto = (item.desconto ?? 0) > 0;
                                            const totalFormatado = item.total_formatado ?? `R$ ${(item.total ?? 0).toFixed(2).replace('.', ',')}`;
                                            const descontoFormatado =
                                                item.desconto_formatado ?? `R$ ${(item.desconto ?? 0).toFixed(2).replace('.', ',')}`;
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

                                            return (
                                                <tr key={item.id}>
                                                    <td data-label="Data/Hora">{exibicaoData}</td>
                                                    <td data-label="Cliente">
                                                        {item.cliente && item.cliente !== '-' ? (
                                                            <div className="cliente-nome">{item.cliente}</div>
                                                        ) : (
                                                            <span className="text-muted">Venda avulsa</span>
                                                        )}
                                                    </td>
                                                    <td data-label="Total">
                                                        <strong className="text-success">{totalFormatado}</strong>
                                                        {possuiDesconto && (
                                                            <small className="d-block text-muted">Desconto: {descontoFormatado}</small>
                                                        )}
                                                    </td>
                                                    <td data-label="Pagamento">
                                                        <FormaPagamentoBadge tipo={item.forma_pagamento} />
                                                    </td>
                                                    <td data-label="Status">
                                                        <StatusBadge status={item.status} />
                                                    </td>
                                                    <td data-label="Responsável">
                                                        {item.usuario && item.usuario !== '-' ? (
                                                            item.usuario
                                                        ) : (
                                                            <span className="text-muted">Não informado</span>
                                                        )}
                                                    </td>
                                                    <td className="text-center" data-label="Ações">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
                                                            onClick={() =>
                                                                setModalObs({
                                                                    show: true,
                                                                    texto: item.observacoes,
                                                                    itens: item.itens || [],
                                                                })
                                                            }
                                                            title="Ver observação completa"
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                            <span className="ms-2">Abrir</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls meta={paginacaoVendas} onChange={buscarRelatorio} disabled={loading} />
                    </div>
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
