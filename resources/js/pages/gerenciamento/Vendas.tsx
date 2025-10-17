import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ClienteCreateModal from '../../components/PDVcomponents/ClienteCreateModal';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';
import NotificationContainer from '../../components/PDVcomponents/NotificationContainer';
import { useNotifications } from '../../hooks/PDVhooks/useNotifications';
import useCarrinho from '../../hooks/PDVhooks/useCarrinho'; // ✅ CORRIGIDO: default import
import { useFiltros } from '../../hooks/PDVhooks/useFiltros';
import { useBuscaProdutos } from '../../hooks/PDVhooks/useBuscaProdutos';
import { useFinalizarVenda } from '../../hooks/PDVhooks/useFinalizarVenda';
import VendasList from '../../components/PDVcomponents/VendasList';
import CarrinhoVenda from '../../components/PDVcomponents/CarrinhoVenda';
import ProdutosList from '../../components/ProdutosList';
import VendaDetalhesModal from '@/components/PDVcomponents/VendaDetalhesModal';
import type { Produto, ItemVenda, Cliente } from '../../types';

// ✅ Interface para Venda com itens
interface Venda {
    id: number;
    total: number;
    total_formatado: string;
    desconto: number;
    forma_pagamento: string;
    status: string;
    cliente?: Cliente;
    itens: ItemVenda[];
    created_at: string;
    observacoes?: string;
}

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
        filtroClienteTexto,                // <- novo
        vendaSelecionada,
        showDetalhes,
        setFiltroStatus,
        setFiltroCliente,
        setFiltroClienteTexto,            // <- novo
        vendasFiltradas,
        abrirDetalhes,
        fecharDetalhes,
        limparFiltros,
    } = useFiltros(vendas, clientes);     // <- passa clientes aqui

    // Estados para modal de cliente
    const [showClienteModal, setShowClienteModal] = useState(false);

    // Estados para modal de detalhes da venda
    const [showVendaModal, setShowVendaModal] = useState(false);
    const [vendaDetalhes, setVendaDetalhes] = useState<any | null>(null);
    const [loadingDetalhes, setLoadingDetalhes] = useState(false);

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

    // Lista de clientes usada no carrinho (atualiza após criar novo cliente)
    const [clientesAtualizados, setClientesAtualizados] = useState<typeof clientes>(clientes);

    // Sincroniza quando o prop 'clientes' mudar
    useEffect(() => {
        setClientesAtualizados(clientes);
    }, [clientes]);

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

    // Função de finalizar venda usando hook
    const finalizarVenda = () => executarFinalizacao({
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

    return (
        <GerenciamentoLayout>
            <Head title="Vendas" />

            {/* ✅ Sistema de Notificações Inline */}
            <NotificationContainer notifications={notifications} onRemove={removeNotification} />

            <div className="container-fluid py-4">
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                        <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                )}

                {/* ====== INÍCIO DA TELA DE VENDAS (FOCO DO TOUR) ====== */}
                <div className="d-flex justify-content-between align-items-center mb-4 elemento-vendas-header">
                    <h2 className="mb-0 elemento-vendas-titulo">
                        <i className="bi bi-receipt text-primary me-2"></i>
                        Vendas
                    </h2>
                    {/* Navegação por Abas */}
                    <ul className="nav nav-pills elemento-vendas-abas">
                        <li className="nav-item">
                            <button className={`nav-link ${abaAtiva === 'lista' ? 'active' : ''} elemento-vendas-aba-lista`} onClick={() => setAbaAtiva('lista')}>
                                <i className="bi bi-list me-2"></i>
                                Histórico de Vendas
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link ${abaAtiva === 'nova' ? 'active' : ''} elemento-vendas-aba-nova`} onClick={() => setAbaAtiva('nova')}>
                                <i className="bi bi-plus-circle me-2"></i>
                                Nova Venda
                            </button>
                        </li>
                    </ul>
                </div>

                {abaAtiva === 'lista' ? (
                    /* ABA 1: LISTA DE VENDAS */
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
                {/* ====== FIM DA TELA INICIAL DE VENDAS ====== */}

                {/* ====== INÍCIO DO PDV (NÃO ALTERAR PARA TOUR) ====== */}
                {abaAtiva === 'nova' ? (
                    <div className={`row fade-in vendas-container ${loadingVenda ? 'processing' : ''}`}> 
                        {/* Coluna Esquerda - Produtos */}
                        <ProdutosList
                            busca={busca}
                            setBusca={setBusca}
                            produtosFiltrados={produtosFiltrados}
                            limparBusca={limparBusca}
                            adicionarAoCarrinho={adicionarAoCarrinho}
                            addNotification={addNotification}
                        />

                        {/* Coluna Direita - Carrinho */}
                        <CarrinhoVenda
                            carrinho={carrinho}
                            clienteSelecionado={clienteSelecionado}
                            clientesAtualizados={clientesAtualizados}
                            desconto={desconto}
                            formaPagamento={formaPagamento}
                            valorRecebido={String(valorRecebido)}
                            observacoes={observacoes}
                            loadingVenda={loadingVenda}
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
                            abrirModalCliente={abrirModalCliente}
                            addNotification={addNotification}
                        />
                    </div>
                ) : null}
                {/* ====== FIM DO PDV ====== */}
            </div>

            {/* Modal de Cadastro de Cliente */}
            <ClienteCreateModal show={showClienteModal} onClose={fecharModalCliente} onSuccess={onClienteCriado} carrinhoItens={carrinho} />

            {/* Modal de Detalhes da Venda */}
            <VendaDetalhesModal
                show={showVendaModal}
                venda={vendaDetalhes}
                loading={loadingDetalhes}
                fechar={fecharDetalhesVenda}
            />
        </GerenciamentoLayout>
    );
}