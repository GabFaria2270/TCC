import PagamentoGatewayModal from '@/components/PDVcomponents/PagamentoGatewayModal';
import VendaDetalhesModal from '@/components/PDVcomponents/VendaDetalhesModal';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import CarrinhoVenda from '../../components/PDVcomponents/CarrinhoVenda';
import ClienteCreateModal from '../../components/PDVcomponents/ClienteCreateModal';
import NotificationContainer from '../../components/PDVcomponents/NotificationContainer';
import VendasList from '../../components/PDVcomponents/VendasList';
import ProdutosList from '../../components/ProdutosList';
import { useBuscaProdutos } from '../../hooks/PDVhooks/useBuscaProdutos';
import { useCancelarVenda } from '../../hooks/PDVhooks/useCancelarVenda';
import useCarrinho from '../../hooks/PDVhooks/useCarrinho'; // ✅ CORRIGIDO: default import
import { useFiltros } from '../../hooks/PDVhooks/useFiltros';
import { useFinalizarVenda } from '../../hooks/PDVhooks/useFinalizarVenda';
import { useNotifications } from '../../hooks/PDVhooks/useNotifications';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';

import type { Cliente, Produto, Venda } from '../../types';

interface Props {
    vendas?: Venda[];
    produtos: Produto[];
    clientes: Cliente[];
    error?: string;
    messages: {
        produto_adicionado: string;
        produto_removido: string;
        quantidade_atualizada: string;
        estoque_insuficiente: string;
        produto_indisponivel: string;
        erro_adicionar: string;
        erro_remover: string;
        erro_finalizar: string;
        venda_processada: string;
        carrinho_vazio: string;
        valor_insuficiente: string;
        produto_ja_no_carrinho: string;
        cliente_obrigatorio: string;
        venda_cancelada: string;
        erro_cancelar: string;
        venda_ja_cancelada: string;
    };
}

export default function Vendas({ vendas = [], produtos = [], clientes = [], error, messages }: Props) {
    // Estados para controlar as abas
    const [abaAtiva, setAbaAtiva] = useState<'lista' | 'nova'>('lista');
    // Hook para busca de produtos
    const { busca, setBusca, produtosFiltrados, limparBusca } = useBuscaProdutos(produtos);
    // Hook para filtros e listagem de vendas
    const {
        filtroStatus,
        filtroCliente,
        filtroClienteTexto, // <- novo
        vendaSelecionada,
        showDetalhes,
        setFiltroStatus,
        setFiltroCliente,
        setFiltroClienteTexto, // <- novo
        vendasFiltradas,
        abrirDetalhes,
        fecharDetalhes,
        limparFiltros,
    } = useFiltros(vendas, clientes); // <- passa clientes aqui
    // Estados para modal de cliente
    const [showClienteModal, setShowClienteModal] = useState(false);
    // Estados para modal de detalhes da venda
    const [showVendaModal, setShowVendaModal] = useState(false);
    const [vendaDetalhes, setVendaDetalhes] = useState<any | null>(null);
    const [loadingDetalhes, setLoadingDetalhes] = useState(false);
    const [cancelandoVenda, setCancelandoVenda] = useState(false);
    const [paymentFeedback, setPaymentFeedback] = useState<any | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [pixCodeCopied, setPixCodeCopied] = useState(false);
    const [refreshingPayment, setRefreshingPayment] = useState(false);
    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const paymentStatusKey = (paymentFeedback?.payment?.status || '').toLowerCase();
    const allowManualClose = ['rejected', 'cancelled', 'refunded'].includes(paymentStatusKey);
    // Hooks para funcionalidades
    const { notifications, addNotification, removeNotification } = useNotifications();
    const { finalizarVenda: executarFinalizacao } = useFinalizarVenda();
    const {
        carrinho,
        clienteSelecionado,
        desconto,
        formaPagamento,
        valorRecebido,
        observacoes,
        loadingVenda,
        setClienteSelecionado,
        setDesconto,
        setFormaPagamento,
        setValorRecebido,
        setObservacoes,
        setLoadingVenda,
        adicionarAoCarrinho,
        editarQuantidade,
        removerDoCarrinho,
        limparCarrinho,
        calcularSubtotal,
        calcularTotal,
        calcularTroco,
        getDadosVenda,
    } = useCarrinho(messages);
    const { cancelarVenda } = useCancelarVenda();
    // Lista de clientes usada no carrinho (atualiza após criar novo cliente)
    const [clientesAtualizados, setClientesAtualizados] = useState<typeof clientes>(clientes);
    // Sincroniza quando o prop 'clientes' mudar
    useEffect(() => {
        setClientesAtualizados(clientes);
    }, [clientes]);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
        };
    }, []);
    // Funções para modal de cliente
    const abrirModalCliente = () => {
        setShowClienteModal(true);
    };
    const fecharModalCliente = () => {
        setShowClienteModal(false);
    };
    // ✅ Quando criar, adiciona à lista e seleciona automaticamente no carrinho
    const onClienteCriado = (novoCliente?: any) => {
        if (!novoCliente) {
            fecharModalCliente();
            return;
        }
        setClientesAtualizados((prev) => {
            // evita duplicar se já existir
            const exists = prev.some((c: any) => String(c.id) === String(novoCliente.id));
            return exists ? prev : [...prev, novoCliente];
        });
        // Seleciona no carrinho
        setClienteSelecionado(novoCliente);
        // Fecha o modal
        fecharModalCliente();
        // (opcional) feedback
        if (addNotification) {
            addNotification({
                type: 'success',
                title: 'Cliente',
                message: 'Cliente cadastrado e selecionado no carrinho.',
            });
        }
    };

    const closePaymentModal = useCallback(() => {
        setShowPaymentModal(false);
        setPaymentFeedback(null);
        setPixCodeCopied(false);
        if (copyTimeoutRef.current) {
            clearTimeout(copyTimeoutRef.current);
            copyTimeoutRef.current = null;
        }
    }, [setPaymentFeedback, setShowPaymentModal]);

    const handleCopyPixCode = useCallback(() => {
        const pixCode = paymentFeedback?.payment?.pix_qr_code;
        if (!pixCode) {
            return;
        }

        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            addNotification({
                type: 'warning',
                title: 'Copiar manualmente',
                message: 'Seu navegador não permite copiar automaticamente. Copie o código manualmente.',
            });
            return;
        }

        navigator.clipboard
            .writeText(pixCode)
            .then(() => {
                setPixCodeCopied(true);
                if (copyTimeoutRef.current) {
                    clearTimeout(copyTimeoutRef.current);
                }
                copyTimeoutRef.current = setTimeout(() => setPixCodeCopied(false), 2000);
            })
            .catch((error) => {
                console.error('Erro ao copiar PIX', error);
                addNotification({
                    type: 'error',
                    title: 'Falha ao copiar',
                    message: 'Não foi possível copiar o código. Tente novamente.',
                });
            });
    }, [paymentFeedback?.payment?.pix_qr_code, addNotification, setPixCodeCopied]);

    const refreshPaymentStatus = useCallback(
        async (showSpinner = true) => {
            if (!paymentFeedback?.venda?.id) {
                return;
            }

            if (refreshingPayment && showSpinner) {
                return;
            }

            if (showSpinner) {
                setRefreshingPayment(true);
            }

            try {
                const response = await fetch(`/api/pdv/pagamentos/${paymentFeedback.venda.id}/status`, {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                const data = await response.json().catch(() => null);

                if (!response.ok) {
                    addNotification({
                        type: 'error',
                        title: 'Pagamento',
                        message: data?.message || 'Não foi possível atualizar o status do pagamento.',
                    });
                    return;
                }

                if (data?.payment) {
                    setPaymentFeedback({ payment: data.payment, venda: data.venda });
                }

                router.reload({ only: ['vendas'] });

                const status = (data?.payment?.status || '').toLowerCase();
                if (status === 'approved') {
                    addNotification({
                        type: 'success',
                        title: 'Pagamento aprovado',
                        message: 'O Mercado Pago confirmou o pagamento. Venda finalizada.',
                    });
                    closePaymentModal();
                    setAbaAtiva('lista');
                } else if (['rejected', 'cancelled', 'refunded'].includes(status)) {
                    addNotification({
                        type: 'error',
                        title: 'Pagamento não aprovado',
                        message: 'O provedor retornou o pagamento como não aprovado. Revise antes de tentar novamente.',
                    });
                }
            } catch (error) {
                console.error('Erro ao atualizar pagamento', error);
                addNotification({
                    type: 'error',
                    title: 'Pagamento',
                    message: 'Não foi possível atualizar o status do pagamento. Tente novamente em instantes.',
                });
            } finally {
                if (showSpinner) {
                    setRefreshingPayment(false);
                }
            }
        },
        [paymentFeedback?.venda?.id, addNotification, closePaymentModal, refreshingPayment, setPaymentFeedback, setAbaAtiva]
    );

    useEffect(() => {
        if (!showPaymentModal || !paymentFeedback?.payment) {
            return;
        }

        const status = (paymentFeedback.payment.status || '').toLowerCase();
        if (['approved', 'rejected', 'cancelled', 'refunded'].includes(status)) {
            return;
        }

        const interval = setInterval(() => {
            refreshPaymentStatus(false);
        }, 7000);

        return () => clearInterval(interval);
    }, [showPaymentModal, paymentFeedback?.payment, refreshPaymentStatus]);
    // Função de finalizar venda usando hook
    const finalizarVenda = () =>
        executarFinalizacao({
            carrinho,
            calcularTotal,
            formaPagamento,
            valorRecebido,
            clienteSelecionado,
            getDadosVenda,
            limparCarrinho,
            setLoadingVenda,
            setAbaAtiva,
            addNotification,
            setPaymentFeedback,
            onVendaFinalizada: ({ payment }) => {
                router.reload({ only: ['vendas', 'produtos'] });
                if (payment) {
                    setShowPaymentModal(true);
                    setPixCodeCopied(false);
                } else {
                    closePaymentModal();
                }
            },
            messages,
        });
    // Funções para modal de detalhes da venda
    const abrirDetalhesVenda = async (vendaBasica: any) => {
        setShowVendaModal(true);
        setLoadingDetalhes(true);
        setVendaDetalhes({ id: vendaBasica.id }); // placeholder
        try {
            const resp = await fetch(`/gerenciamento/vendas/${vendaBasica.id}`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (!resp.ok) throw new Error('Erro ao carregar detalhes');
            const json = await resp.json();
            setVendaDetalhes(json.venda);
        } catch (e) {
            // fallback: mostra dados básicos enquanto isso
            setVendaDetalhes(vendaBasica);
        } finally {
            setLoadingDetalhes(false);
        }
    };
    const fecharDetalhesVenda = () => {
        setShowVendaModal(false);
        setVendaDetalhes(null);
    };

    const cancelarVendaAtual = () =>
        cancelarVenda({
            carrinho,
            calcularTotal,
            formaPagamento,
            valorRecebido,
            clienteSelecionado,
            getDadosVenda,
            limparCarrinho,
            setCancelandoVenda,
            setAbaAtiva,
            addNotification,
            messages,
        });
    return (
        <GerenciamentoLayout title="Vendas">
            <Head title="Vendas" />
            <NotificationContainer notifications={notifications} onRemove={removeNotification} />
            <div className="container-fluid py-4">
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                        <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                )}
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center elemento-vendas-header gap-lg-0 mb-4 gap-2">
                    <h2 className="elemento-vendas-titulo d-flex align-items-center mb-0 flex-nowrap gap-2">
                        <i className="bi bi-receipt text-primary fs-4"></i>
                        <span className="text-nowrap">Vendas</span>
                    </h2>
                    <ul className="nav nav-pills elemento-vendas-abas d-flex w-lg-auto mt-lg-0 justify-content-center justify-content-lg-end mt-2 w-100 flex-nowrap gap-2 overflow-auto">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${abaAtiva === 'lista' ? 'active' : ''} elemento-vendas-aba-lista`}
                                onClick={() => setAbaAtiva('lista')}
                            >
                                <i className="bi bi-list me-2"></i>
                                Histórico
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${abaAtiva === 'nova' ? 'active' : ''} elemento-vendas-aba-nova`}
                                onClick={() => setAbaAtiva('nova')}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Nova Venda
                            </button>
                        </li>
                    </ul>
                </div>
                {abaAtiva === 'lista' ? (
                    <div className="elemento-vendas-lista">
                        <VendasList
                            clientes={clientes}
                            filtroStatus={filtroStatus}
                            filtroCliente={filtroCliente}
                            filtroClienteTexto={filtroClienteTexto}
                            setFiltroStatus={setFiltroStatus}
                            setFiltroCliente={setFiltroCliente}
                            setFiltroClienteTexto={setFiltroClienteTexto}
                            vendasFiltradas={vendasFiltradas}
                            abrirDetalhes={abrirDetalhesVenda}
                            limparFiltros={limparFiltros}
                        />
                    </div>
                ) : null}
                {abaAtiva === 'nova' ? (
                    <div className={`row fade-in vendas-container ${loadingVenda || cancelandoVenda ? 'processing' : ''}`}>
                        <div className="col-lg-8 mb-lg-0 col-12 mb-3">
                            <ProdutosList
                                busca={busca}
                                setBusca={setBusca}
                                produtosFiltrados={produtosFiltrados}
                                limparBusca={limparBusca}
                                adicionarAoCarrinho={adicionarAoCarrinho}
                                addNotification={addNotification}
                            />
                        </div>
                        <div className="col-lg-4 col-12">
                            <CarrinhoVenda
                                carrinho={carrinho}
                                clienteSelecionado={clienteSelecionado}
                                clientesAtualizados={clientesAtualizados}
                                desconto={desconto}
                                formaPagamento={formaPagamento}
                                valorRecebido={String(valorRecebido)}
                                observacoes={observacoes}
                                loadingVenda={loadingVenda}
                                paymentFeedback={paymentFeedback}
                                setClienteSelecionado={setClienteSelecionado}
                                setDesconto={setDesconto}
                                setFormaPagamento={setFormaPagamento}
                                setValorRecebido={setValorRecebido}
                                setObservacoes={setObservacoes}
                                editarQuantidade={editarQuantidade}
                                removerDoCarrinho={removerDoCarrinho}
                                limparCarrinho={limparCarrinho}
                                calcularSubtotal={calcularSubtotal}
                                calcularTotal={calcularTotal}
                                finalizarVenda={finalizarVenda}
                                cancelarVenda={cancelarVendaAtual}
                                cancelandoVenda={cancelandoVenda}
                                abrirModalCliente={abrirModalCliente}
                                addNotification={addNotification}
                            />
                        </div>
                    </div>
                ) : null}
            </div>
            <ClienteCreateModal show={showClienteModal} onClose={fecharModalCliente} onSuccess={onClienteCriado} carrinhoItens={carrinho} />
                <PagamentoGatewayModal
                    show={showPaymentModal && Boolean(paymentFeedback?.payment)}
                    feedback={paymentFeedback}
                    onCopyPix={handleCopyPixCode}
                    pixCopied={pixCodeCopied}
                    onRefreshStatus={() => refreshPaymentStatus(true)}
                    refreshing={refreshingPayment}
                    allowManualClose={allowManualClose}
                    onClose={allowManualClose ? closePaymentModal : undefined}
                />
                <VendaDetalhesModal show={showVendaModal} venda={vendaDetalhes} loading={loadingDetalhes} fechar={fecharDetalhesVenda} />
        </GerenciamentoLayout>
    );
}
