import { Head, router, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ClienteCreateModal from '../../components/PDVcomponents/ClienteCreateModal';
import ClienteDetalhesModal from '../../components/PDVcomponents/ClienteDetalhesModal';
import ClienteEditModal from '../../components/PDVcomponents/ClienteEditModal';
import ClienteTabela from '../../components/PDVcomponents/ClienteTabela';
import ConfirmarPagamentoModal from '../../components/PDVcomponents/ConfirmarPagamentoModal';
import HistoricoContaFiada from '../../components/PDVcomponents/HistoricoContaFiada';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';

export interface Cliente {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
    telefone_formatado?: string;
    conta_fiada: {
        saldo: number;
        saldo_formatado: string;
        descricao?: string;
        status: string;
    };
    created_at: string;
}

type Props = {
  clientes: any[];
  error?: string | null;
  fiadoHistorico?: Array<{ id: number; cliente: string; valor: number; data: string; status: 'pendente'|'pago'; }>;
};

export default function Clientes({ clientes = [], error, fiadoHistorico = [] }: Props) {
    const h1Ref = useRef<HTMLHeadingElement>(null);
    const [search, setSearch] = useState('');
    const [filtroStatus, setFiltroStatus] = useState(''); // Novo estado para filtro de status
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [clienteId, setClienteId] = useState<number | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [clienteParaPagar, setClienteParaPagar] = useState<Cliente | null>(null);

    useEffect(() => {
        h1Ref.current?.focus();
    }, []);

    const clientesArray = Array.isArray(clientes) ? clientes : [];
    
    // Filtros combinados: busca por nome/email + status da conta fiada
    const clientesFiltrados = clientesArray.filter((cliente) => {
        // Filtro de busca por nome ou e-mail
        const matchSearch = cliente.nome.toLowerCase().includes(search.toLowerCase()) || 
                           cliente.email.toLowerCase().includes(search.toLowerCase());
        
        // Filtro por status da conta fiada
        let matchStatus = true;
        if (filtroStatus) {
            if (filtroStatus === 'pendente') {
                matchStatus = cliente.conta_fiada && cliente.conta_fiada.saldo > 0;
            } else if (filtroStatus === 'quitada') {
                matchStatus = !cliente.conta_fiada || cliente.conta_fiada.saldo <= 0;
            }
        }
        
        return matchSearch && matchStatus;
    });

    const handleRefresh = () => {
        setLoading(true);
        router.get(
            '/gerenciamento/clientes',
            {},
            {
                onFinish: () => setLoading(false),
            },
        );
    };

    const limparFiltros = () => {
        setSearch('');
        setFiltroStatus('');
    };

    const abrirModal = (modo: 'create' | 'edit', cliente?: Cliente) => {
        setModalMode(modo);
        setShowModal(true);
        setClienteId(cliente?.id ?? null);
    };

    const fecharModal = () => {
        setShowModal(false);
        setClienteId(null);
    };

    const abrirDetalhesConta = (cliente: Cliente) => {
        setClienteDetalhes(cliente);
        setShowDetailsModal(true);
    };

    const fecharDetalhesConta = () => {
        setShowDetailsModal(false);
        setClienteDetalhes(null);
    };

    const abrirConfirmarPagamento = (cliente: Cliente) => {
        setClienteParaPagar(cliente);
        setShowConfirmModal(true);
    };

    const fecharConfirmarPagamento = () => {
        setShowConfirmModal(false);
        setClienteParaPagar(null);
    };

    const pagarContaFiada = () => {
        if (!clienteParaPagar) return;
        router.delete(`/gerenciamento/clientes/${clienteParaPagar.id}/conta-fiada`, {
            preserveScroll: true,
            onSuccess: fecharConfirmarPagamento,
            onError: fecharConfirmarPagamento,
        });
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showDetailsModal) fecharDetalhesConta();
                else if (showModal) fecharModal();
                else if (showConfirmModal) fecharConfirmarPagamento();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [showModal, showDetailsModal, showConfirmModal]);

    const clienteComContaFiada = (cliente?: Cliente) => {
        if (!cliente) return undefined;
        return {
            ...cliente,
            conta_fiada: {
                saldo: cliente.conta_fiada?.saldo ?? 0,
                saldo_formatado: cliente.conta_fiada?.saldo_formatado ?? 'R$ 0,00',
                descricao: cliente.conta_fiada?.descricao ?? '',
                status: cliente.conta_fiada?.status ?? '',
            },
        };
    };

    return (
        <GerenciamentoLayout title="Clientes">
            <Head title="Clientes" />
            {/* Cabeçalho, busca e contador */}
            <div className="clientes-header elemento-clientes-1">
                <div className="clientes-header-content elemento-clientes-2">
                    <div className="clientes-title-section elemento-clientes-3">
                        <h1 className="clientes-title">Gestão de Clientes</h1>
                        <p className="clientes-subtitle">Gerencie seus clientes e contas fiadas</p>
                    </div>
                    <div className="clientes-actions elemento-clientes-4">
                        <button className="btn-refresh" onClick={handleRefresh} disabled={loading}>
                            {loading ? <span className="spinner-loading" /> : <i className="bi bi-arrow-clockwise"></i>}
                            Atualizar
                        </button>
                        <HistoricoContaFiada initialData={fiadoHistorico} />
                    </div>
                </div>
                
                {/* Filtros: Barra de busca + Status */}
                <div className="clientes-filtros-responsive">
                    <div className="search-input-group-responsive">
                        <i className="bi bi-search search-icon"></i>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar por nome ou e-mail..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            maxLength={100}
                            aria-label="Buscar clientes"
                        />
                    </div>
                    <div className="clientes-filtros-row">
                        <select 
                            className="form-select" 
                            style={{ width: '200px', flexShrink: 0 }}
                            value={filtroStatus} 
                            onChange={(e) => setFiltroStatus(e.target.value)}
                        >
                            <option value="">Todas as contas</option>
                            <option value="pendente">📋 Conta Pendente</option>
                            <option value="quitada">✅ Conta Quitada</option>
                        </select>
                        <button 
                            className="btn btn-outline-secondary flex-shrink-0" 
                            onClick={limparFiltros}
                            title="Limpar filtros"
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>
                </div>
                
                {/* Contador */}
                <div className="clientes-counter">
                    {clientesFiltrados.length} de {clientesArray.length} clientes
                    {(search || filtroStatus) && (
                        <small className="text-muted ms-2">
                            (filtros aplicados)
                        </small>
                    )}
                </div>
            </div>

            {/* Mensagem de vazio ou tabela */}
            {clientesArray.length === 0 ? (
                <div className="clientes-empty-state elemento-clientes-6">
                    <i className="bi bi-people clientes-empty-icon"></i>
                    <h3>Cadastre um cliente durante uma venda</h3>
                    <p>Abra sua Aba de vendas e crie o cliente no metodo Conta Fiada.</p>
                    <Link href="/gerenciamento/vendas" className="btn btn-primary">
                        <i className="bi bi-cash-register"></i> Ir para Vendas
                    </Link>
                </div>
            ) : (
                <div className="elemento-clientes-5">
                    <ClienteTabela
                        clientes={clientesFiltrados}
                        abrirDetalhes={abrirDetalhesConta}
                        abrirConfirmarPagamento={abrirConfirmarPagamento}
                        abrirModal={abrirModal}
                    />
                </div>
            )}

            {modalMode === 'create' && showModal && (
                <ClienteCreateModal
                    show={showModal}
                    onClose={fecharModal}
                    onSuccess={() => {
                        fecharModal();
                        router.get('/gerenciamento/clientes');
                    }}
                />
            )}
            {modalMode === 'edit' && showModal && clienteId !== null && (
                <ClienteEditModal
                    show={showModal}
                    cliente={clienteComContaFiada(clientesArray.find((c) => c.id === clienteId))!}
                    onClose={fecharModal}
                    onSuccess={() => {
                        fecharModal();
                        router.get('/gerenciamento/clientes');
                    }}
                />
            )}

            {showDetailsModal && clienteDetalhes && <ClienteDetalhesModal cliente={clienteDetalhes} fechar={fecharDetalhesConta} />}

            {showConfirmModal && clienteParaPagar && (
                <ConfirmarPagamentoModal cliente={clienteParaPagar} fechar={fecharConfirmarPagamento} confirmar={pagarContaFiada} />
            )}
        </GerenciamentoLayout>
    );
}
