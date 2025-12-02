import axios from 'axios';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import VendaDetalhesModal from '@/components/PDVcomponents/VendaDetalhesModal';
import RelatorioFilters from '@/components/Relatorios/RelatorioFilters';
import RelatorioResumoCards from '@/components/Relatorios/RelatorioResumoCards';
import RelatorioToggle from '@/components/Relatorios/RelatorioToggle';
import RelatorioVendasList from '@/components/Relatorios/RelatorioVendasList';
import MovimentosEstoqueTable from '@/components/Relatorios/MovimentosEstoqueTable';
import PaginationControls from '@/components/Relatorios/PaginationControls';
import GerenciamentoLayout from '@/layouts/GerenciamentoLayout';
import useMediaQuery from '@/hooks/useMediaQuery';
import http from '@/lib/http';
import { useRoute } from '@/lib/route';
import type {
    ModalVendaState,
    MovimentoEstoque,
    MovimentoResumo,
    PaginacaoMeta,
    RelatorioItem,
    RelatorioPayload,
    RelatorioResumo,
    RelatorioTabela,
    ResumoMovimentosResponse,
    ResumoVendasResponse,
} from '@/types/gerenciamento/Relatorio';
import {
    aplicarResetPorTabela,
    calcularResumoMovimentos,
    calcularResumoVendas,
    criarModalState,
    mapRelatorioItemParaVendaModal,
    mapResumoMovimentos,
    mapResumoVendas,
    metaFallback,
    montarPayload,
    ordenarMovimentos,
    ordenarVendas,
    prepararVenda,
} from '@/utils/relatorios';

interface RelatorioProps {
    initialVendas?: RelatorioPayload<RelatorioItem, ResumoVendasResponse> | null;
    initialMovimentos?: RelatorioPayload<MovimentoEstoque, ResumoMovimentosResponse> | null;
}

export default function Relatorio({ initialVendas, initialMovimentos }: RelatorioProps) {
    const [tabela, setTabela] = useState<RelatorioTabela>('vendas');
    const h1Ref = useRef<HTMLHeadingElement>(null);
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const { route } = useRoute();
    const requestControllerRef = useRef<AbortController | null>(null);

    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');
    const [filtroPagamento, setFiltroPagamento] = useState('');

    const [loading, setLoading] = useState(false);
    const [exportando, setExportando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const [resultados, setResultados] = useState<RelatorioItem[]>(initialVendas?.data ?? []);
    const [movimentosFiltrados, setMovimentosFiltrados] = useState<MovimentoEstoque[]>(initialMovimentos?.data ?? []);
    const [paginacaoVendas, setPaginacaoVendas] = useState<PaginacaoMeta | null>(initialVendas?.meta ?? null);
    const [paginacaoMovimentos, setPaginacaoMovimentos] = useState<PaginacaoMeta | null>(initialMovimentos?.meta ?? null);
    const [resumoVendas, setResumoVendas] = useState<RelatorioResumo>(() => mapResumoVendas(initialVendas?.resumo ?? null, initialVendas?.data ?? []));
    const [resumoMovimentos, setResumoMovimentos] = useState<MovimentoResumo>(() =>
        mapResumoMovimentos(initialMovimentos?.resumo ?? null, initialMovimentos?.data ?? []),
    );
    const [modalVenda, setModalVenda] = useState<ModalVendaState>(criarModalState());

    const currencyFormatter = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), []);

    useEffect(() => {
        h1Ref.current?.focus();
    }, []);

    useEffect(() => {
        return () => {
            requestControllerRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        aplicarResetPorTabela(tabela, setFiltroStatus, setFiltroPagamento, setFiltroTipo);
        setErro(null);
    }, [tabela]);

    const vendasPreparadas = useMemo(() => resultados.map(prepararVenda), [resultados]);
    const vendaSelecionada = useMemo(() => mapRelatorioItemParaVendaModal(modalVenda.venda), [modalVenda.venda]);

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

    const filtrosAtuais = {
        dataInicio: filtroDataInicio,
        dataFim: filtroDataFim,
        status: filtroStatus,
        pagamento: filtroPagamento,
        tipo: filtroTipo,
    };

    function abortPendingRequest() {
        if (requestControllerRef.current) {
            requestControllerRef.current.abort();
            requestControllerRef.current = null;
        }
    }

    async function buscarRelatorio(page = 1) {
        abortPendingRequest();
        const controller = new AbortController();
        requestControllerRef.current = controller;
        setLoading(true);
        setErro(null);

        const body = montarPayload(tabela, filtrosAtuais, page);

        try {
            const { data: json } = await http.post(
                route('relatorio.filter'),
                body,
                {
                    signal: controller.signal,
                },
            );

            if (!json?.success) {
                throw new Error(json?.message ?? 'Não foi possível carregar os relatórios.');
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
            if (axios.isCancel(error) || (error as DOMException)?.name === 'AbortError') {
                return;
            }
            const message = error instanceof Error ? error.message : 'Erro inesperado ao buscar relatórios.';
            setErro(message);
        } finally {
            if (requestControllerRef.current === controller) {
                requestControllerRef.current = null;
            }
            setLoading(false);
        }
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
        setExportando(true);
        setErro(null);

        const params = {
            tabela,
            data_inicio: filtroDataInicio || undefined,
            data_fim: filtroDataFim || undefined,
            status: tabela === 'vendas' ? filtroStatus || undefined : undefined,
            forma_pagamento: tabela === 'vendas' ? filtroPagamento || undefined : undefined,
            tipo_movimento: tabela === 'estoque' ? filtroTipo || undefined : undefined,
        } as const;

        const queryParams = Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
        );

        try {
            const response = await http.get(route('relatorio.exportarExcel'), {
                params: queryParams,
                responseType: 'blob',
            });

            const headers = response.headers as Record<string, string | undefined>;
            const disposition = headers['content-disposition'];
            const matches = disposition?.match(/filename="?([^";]+)"?/i);
            const fallbackName = `relatorio_${tabela}_${new Date().toISOString().replace(/[:T]/g, '-').split('.')[0]}.xlsx`;
            const filename = matches?.[1] ?? fallbackName;

            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            if (axios.isCancel(error) || (error as DOMException)?.name === 'AbortError') {
                return;
            }
            const defaultMessage = 'Falha ao exportar relatórios para Excel.';
            if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
                try {
                    const parsed = await error.response.data.text();
                    setErro(parsed || defaultMessage);
                    return;
                } catch {
                    setErro(defaultMessage);
                    return;
                }
            }
            const axiosMessage = axios.isAxiosError(error)
                ? (error.response?.data as { message?: string } | undefined)?.message
                : undefined;
            setErro(axiosMessage ?? (error instanceof Error ? error.message : defaultMessage));
        } finally {
            setExportando(false);
        }
    }

    const totalVendas = paginacaoVendas?.total ?? resultados.length;

    return (
        <GerenciamentoLayout title="Relatório">
            <Head title="Relatório" />
            <h2 className="visually-hidden" ref={h1Ref} tabIndex={-1}>
                Relatório
            </h2>

            <VendaDetalhesModal show={modalVenda.show} venda={vendaSelecionada} fechar={() => setModalVenda(criarModalState())} />

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

                <RelatorioFilters
                    tabela={tabela}
                    filtroDataInicio={filtroDataInicio}
                    filtroDataFim={filtroDataFim}
                    filtroStatus={filtroStatus}
                    filtroPagamento={filtroPagamento}
                    filtroTipo={filtroTipo}
                    onChangeDataInicio={setFiltroDataInicio}
                    onChangeDataFim={setFiltroDataFim}
                    onChangeStatus={setFiltroStatus}
                    onChangePagamento={setFiltroPagamento}
                    onChangeTipo={setFiltroTipo}
                    onBuscar={() => buscarRelatorio(1)}
                    onLimpar={limparFiltros}
                    loading={loading}
                />

                <RelatorioResumoCards
                    tabela={tabela}
                    resumoVendas={resumoVendas}
                    resumoMovimentos={resumoMovimentos}
                    currencyFormatter={currencyFormatter}
                />

                {tabela === 'vendas' ? (
                    <RelatorioVendasList
                        isDesktop={isDesktop}
                        vendasPreparadas={vendasPreparadas}
                        erro={erro}
                        loading={loading}
                        paginacao={paginacaoVendas}
                        onPaginar={buscarRelatorio}
                        onAbrirVenda={(venda) => setModalVenda({ show: true, venda })}
                        totalFallback={totalVendas}
                    />
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
