import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ClienteCreateModal from '@/components/PDVcomponents/ClienteCreateModal';
import NotificationContainer from '@/components/PDVcomponents/NotificationContainer';
import VendaDetalhesModal from '@/components/PDVcomponents/VendaDetalhesModal';
import NovaVendaSection from '@/components/Vendas/NovaVendaSection';
import VendasHistoricoSection from '@/components/Vendas/VendasHistoricoSection';
import VendasTabsHeader from '@/components/Vendas/VendasTabsHeader';
import { useBuscaProdutos } from '@/hooks/PDVhooks/useBuscaProdutos';
import { useCancelarVenda } from '@/hooks/PDVhooks/useCancelarVenda';
import useCarrinho from '@/hooks/PDVhooks/useCarrinho';
import { useFiltros } from '@/hooks/PDVhooks/useFiltros';
import { useFinalizarVenda } from '@/hooks/PDVhooks/useFinalizarVenda';
import { useNotifications } from '@/hooks/PDVhooks/useNotifications';
import { useVendaDetalhesModal } from '@/hooks/vendas/useVendaDetalhesModal';
import GerenciamentoLayout from '@/layouts/GerenciamentoLayout';
import type { Cliente, Produto, Venda } from '@/types';
import type { AbaVendas } from '@/types/gerenciamento/Vendas';

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
    const [abaAtiva, setAbaAtiva] = useState<AbaVendas>('lista');
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
    const [cancelandoVenda, setCancelandoVenda] = useState(false);
    // Hooks para funcionalidades
    const { notifications, addNotification, removeNotification } = useNotifications();
    const { finalizarVenda: executarFinalizacao } = useFinalizarVenda();
    const { showVendaModal, vendaDetalhes, loadingDetalhes, abrirDetalhesVenda, fecharDetalhesVenda } = useVendaDetalhesModal();
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
            messages,
        });
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

    const produtosListProps = {
        busca,
        setBusca,
        produtosFiltrados,
        limparBusca,
        adicionarAoCarrinho,
        addNotification,
    } as const;

    const carrinhoProps = {
        carrinho,
        clienteSelecionado,
        clientesAtualizados,
        desconto,
        formaPagamento,
        valorRecebido: String(valorRecebido),
        observacoes,
        loadingVenda,
        setClienteSelecionado,
        setDesconto,
        setFormaPagamento,
        setValorRecebido,
        setObservacoes,
        editarQuantidade,
        removerDoCarrinho,
        limparCarrinho,
        calcularSubtotal,
        calcularTotal,
        finalizarVenda,
        cancelarVenda: cancelarVendaAtual,
        cancelandoVenda,
        abrirModalCliente,
        addNotification,
    } as const;
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
                <VendasTabsHeader abaAtiva={abaAtiva} onChange={setAbaAtiva} />
                {abaAtiva === 'lista' && (
                    <VendasHistoricoSection
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
                )}
                {abaAtiva === 'nova' && (
                    <NovaVendaSection
                        produtosListProps={produtosListProps}
                        carrinhoProps={carrinhoProps}
                        loadingVenda={loadingVenda}
                        cancelandoVenda={cancelandoVenda}
                    />
                )}
            </div>
            <ClienteCreateModal show={showClienteModal} onClose={fecharModalCliente} onSuccess={onClienteCriado} carrinhoItens={carrinho} />
            <VendaDetalhesModal show={showVendaModal} venda={vendaDetalhes} loading={loadingDetalhes} fechar={fecharDetalhesVenda} />
        </GerenciamentoLayout>
    );
}
