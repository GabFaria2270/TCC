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
// Badge visual igual ao VendasList
function FormaPagamentoBadge({ tipo }: { tipo: string }) {
    switch (tipo) {
        case 'dinheiro':
            return (
                <span className="badge bg-success">
                    <i className="bi bi-cash-coin me-1"></i>
                    Dinheiro
                </span>
            );
        case 'pix':
        case 'PIX':
            return (
                <span className="badge bg-info">
                    <i className="bi bi-qr-code me-1"></i>
                    PIX
                </span>
            );
        case 'debito':
        case 'cartao_debito':
            return (
                <span className="badge bg-primary">
                    <i className="bi bi-credit-card-2-front me-1"></i>
                    Débito
                </span>
            );
        case 'credito':
        case 'cartao_credito':
            return (
                <span className="badge bg-warning">
                    <i className="bi bi-credit-card me-1"></i>
                    Crédito
                </span>
            );
        case 'conta_fiada':
        case 'fiado':
            return (
                <span className="badge bg-secondary">
                    <i className="bi bi-wallet2 me-1"></i>
                    Conta Fiada
                </span>
            );
        default:
            return (
                <span className="badge bg-light text-dark">
                    <i className="bi bi-question-circle me-1"></i>
                    {tipo || 'Não informado'}
                </span>
            );
    }
}

// Badge de status igual ao VendasList
function StatusBadge({ status }: { status: string }) {
    let badgeClass = 'bg-info';
    let statusLabel = status;
    if (status === 'concluida') {
        badgeClass = 'bg-success';
        statusLabel = '✅ Concluída';
    } else if (status === 'pendente' || status === 'conta_fiada') {
        badgeClass = 'bg-warning';
        statusLabel = '⏳ Pendente';
    } else if (status === 'cancelada') {
        badgeClass = 'bg-danger';
        statusLabel = '❌ Cancelada';
    }
    return <span className={`badge ${badgeClass}`}>{statusLabel}</span>;
}
import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ObservacaoModal from '../../components/ObservacaoModal';
import { exportarParaExcel } from '../../exports/ExcelExport';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';

interface Item {
    produto: string;
    quantidade: number;
    valor_unitario: number;
    subtotal: number;
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

export default function Relatorio({ dados = [], movimentosEstoque = [] }: { dados?: RelatorioItem[]; movimentosEstoque?: MovimentoEstoque[] }) {
    const [tabela, setTabela] = useState<'vendas' | 'estoque'>('vendas');
    const h1Ref = useRef<HTMLHeadingElement>(null);
    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultados, setResultados] = useState<RelatorioItem[]>([]);
    const [movimentosFiltrados, setMovimentosFiltrados] = useState<MovimentoEstoque[]>([]);
    const [erro, setErro] = useState<string | null>(null);
    const [modalObs, setModalObs] = useState<{ show: boolean; texto: string; itens: Item[] }>({ show: false, texto: '', itens: [] });

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

    function ordenarVendas(lista: RelatorioItem[]) {
        return [...lista].sort((a, b) => timestampFrom(b.data_iso, b.data) - timestampFrom(a.data_iso, a.data));
    }

    function ordenarMovimentos(lista: MovimentoEstoque[]) {
        return [...lista].sort((a, b) => timestampFrom(b.created_at_iso, b.data) - timestampFrom(a.created_at_iso, a.data));
    }

    useEffect(() => {
        setResultados(ordenarVendas(dados));
    }, [dados]);

    useEffect(() => {
        setMovimentosFiltrados(ordenarMovimentos(movimentosEstoque));
    }, [movimentosEstoque]);

    useEffect(() => {
        setFiltroTipo('');
    }, [tabela]);

    function buscarRelatorio() {
        setLoading(true);
        setErro(null);
        setTimeout(() => {
            const inicioTs = filtroDataInicio ? Date.parse(`${filtroDataInicio}T00:00:00`) : null;
            const fimTs = filtroDataFim ? Date.parse(`${filtroDataFim}T23:59:59.999`) : null;

            const dentroDoPeriodo = (ts: number | null) => {
                if (ts === null) return false;
                if (inicioTs !== null && ts < inicioTs) return false;
                if (fimTs !== null && ts > fimTs) return false;
                return true;
            };

            if (tabela === 'vendas') {
                let filtrados = ordenarVendas(dados);
                if (filtroDataInicio || filtroDataFim) {
                    filtrados = filtrados.filter((item) => dentroDoPeriodo(timestampOrNull(item.data_iso, item.data)));
                }
                setResultados(filtrados);
            } else {
                let filtrados = ordenarMovimentos(movimentosEstoque);
                if (filtroDataInicio || filtroDataFim) {
                    filtrados = filtrados.filter((item) => dentroDoPeriodo(timestampOrNull(item.created_at_iso, item.data)));
                }
                if (filtroTipo) {
                    filtrados = filtrados.filter((mov) => mov.tipo === filtroTipo);
                }
                setMovimentosFiltrados(filtrados);
            }
            setLoading(false);
        }, 500);
    }

    function limparFiltros() {
        setFiltroDataInicio('');
        setFiltroDataFim('');
        setFiltroTipo('');
        setResultados(ordenarVendas(dados));
        setMovimentosFiltrados(ordenarMovimentos(movimentosEstoque));
        setErro(null);
    }

    async function exportarExcel() {
        if (tabela === 'estoque') {
            const dadosExportar = movimentosFiltrados.map((mov) => ({
                Data: mov.data,
                Produto: mov.produto,
                Tipo: mov.tipo,
                Quantidade: mov.quantidade,
                Usuário: mov.usuario,
                Motivo: mov.motivo ?? '-',
            }));
            await exportarParaExcel(dadosExportar, 'movimentos_estoque.xlsx');
            return;
        }

        const dadosExportar = resultados.map((item) => ({
            Data: item.data,
            Cliente: item.cliente,
            Usuário: item.usuario,
            'Total (R$)': item.total_formatado,
            'Desconto (R$)': item.desconto_formatado,
            'Forma de Pagamento': item.forma_pagamento,
            Status: item.status,
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
                    <div className="card-body row g-3">
                        <div className="col-md-3 col-12">
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
                        <div className="col-md-3 col-12">
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
                        {tabela === 'estoque' && (
                            <div className="col-md-3 col-12">
                                <label htmlFor="filtro-tipo" className="form-label">
                                    Tipo de movimento
                                </label>
                                <select id="filtro-tipo" className="form-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                                    <option value="">Todos</option>
                                    <option value="entrada">Entrada</option>
                                    <option value="saida">Saída</option>
                                    <option value="ajuste">Ajuste</option>
                                </select>
                            </div>
                        )}
                        <div className="col-md-3 d-flex align-items-end col-12 gap-2">
                            <button className="btn btn-primary w-100" onClick={buscarRelatorio} disabled={loading}>
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

                {/* Tabela dinâmica */}
                {tabela === 'vendas' ? (
                    <div className="card fade-in elemento-relatorio-3 border-0 shadow-sm">
                        <div className="card-header d-flex justify-content-between align-items-center bg-body-tertiary border-0">
                            <strong>Resultados</strong>
                            <div className="small text-secondary">Exibe os dados conforme filtros selecionados</div>
                        </div>
                        <div className="table-responsive scroll-shadow">
                            <table className="table-hover vendas-table data-table mb-0 table align-middle">
                                <thead>
                                    <tr>
                                        <th style={{ minWidth: 140 }}>Data/Hora</th>
                                        <th style={{ minWidth: 180 }}>Cliente</th>
                                        <th style={{ minWidth: 140 }}>Total</th>
                                        <th style={{ minWidth: 150 }}>Pagamento</th>
                                        <th style={{ minWidth: 130 }}>Status</th>
                                        <th style={{ minWidth: 140 }}>Usuário</th>
                                        <th className="text-center" style={{ width: 90 }}>
                                            Ações
                                        </th>
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
                                            <td colSpan={7} className="estado-vazio">
                                                <i className="bi bi-clipboard-data display-6 d-block mb-2"></i>
                                                Nenhum resultado encontrado.
                                            </td>
                                        </tr>
                                    )}
                                    {!erro &&
                                        resultados.map((item) => {
                                            const status = item.status === 'conta_fiada' ? 'pendente' : item.status;
                                            const possuiDesconto = (item.desconto ?? 0) > 0;
                                            const totalFormatado = item.total_formatado ?? `R$ ${(item.total ?? 0).toFixed(2).replace('.', ',')}`;
                                            const descontoFormatado =
                                                item.desconto_formatado ?? `R$ ${(item.desconto ?? 0).toFixed(2).replace('.', ',')}`;
                                            return (
                                                <tr key={item.id}>
                                                    <td>{item.data}</td>
                                                    <td>
                                                        {item.cliente && item.cliente !== '-' ? (
                                                            item.cliente
                                                        ) : (
                                                            <span className="text-muted">Venda avulsa</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <strong className="text-success">{totalFormatado}</strong>
                                                        {possuiDesconto && (
                                                            <small className="d-block text-muted">Desconto: {descontoFormatado}</small>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <FormaPagamentoBadge tipo={item.forma_pagamento} />
                                                    </td>
                                                    <td>
                                                        <StatusBadge status={status} />
                                                    </td>
                                                    <td>{item.usuario}</td>
                                                    <td className="text-center">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary d-flex flex-column align-items-center justify-content-center"
                                                            style={{ minWidth: 56, minHeight: 56, lineHeight: 1.1 }}
                                                            onClick={() =>
                                                                setModalObs({ show: true, texto: item.observacoes, itens: item.itens || [] })
                                                            }
                                                            title="Ver observação completa"
                                                        >
                                                            <i className="bi bi-eye" style={{ fontSize: 18 }}></i>
                                                            <span style={{ fontSize: 14, marginTop: 2 }}>Abrir</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <MovimentosEstoqueTable movimentos={movimentosFiltrados} />
                )}
            </div>
        </GerenciamentoLayout>
    );
}
