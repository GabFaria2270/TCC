import ClientesEmptyState from '@/components/Clientes/ClientesEmptyState';
import ClientesHeader from '@/components/Clientes/ClientesHeader';
import ClientesTabela from '@/components/Clientes/ClientesTabela';
import ClienteCreateModal from '@/components/PDVcomponents/ClienteCreateModal';
import ClienteDetalhesModal from '@/components/PDVcomponents/ClienteDetalhesModal';
import ClienteEditModal from '@/components/PDVcomponents/ClienteEditModal';
import ConfirmarPagamentoModal from '@/components/PDVcomponents/ConfirmarPagamentoModal';
import NotificationContainer from '@/components/PDVcomponents/NotificationContainer';
import { useClienteFilters } from '@/hooks/clientes/useClienteFilters';
import { useClienteModals } from '@/hooks/clientes/useClienteModals';
import { useNotifications } from '@/hooks/PDVhooks/useNotifications';
import GerenciamentoLayout from '@/layouts/GerenciamentoLayout';
import { useRoute } from '@/lib/route';
import type { Cliente, ClientesPageProps } from '@/types/gerenciamento/Clientes';
import type { PageWithLayout } from '@/types/inertia';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const Clientes: PageWithLayout<ClientesPageProps> = ({ clientes = [], error, fiadoHistorico = [] }) => {
    const clientesLista = useMemo(() => (Array.isArray(clientes) ? clientes : []), [clientes]);
    const h1Ref = useRef<HTMLHeadingElement>(null);
    const [loading, setLoading] = useState(false);
    const { route } = useRoute();
    const { notifications, addNotification, removeNotification } = useNotifications();
    const {
        form: { isOpen: formOpen, mode: formMode, clienteId: formClienteId, openCreate, openEdit, close: closeForm },
        detalhes: { isOpen: detalhesOpen, clienteId: detalhesClienteId, open: openDetalhes, close: closeDetalhes },
        confirmacao: { isOpen: confirmacaoOpen, clienteId: confirmacaoClienteId, open: openConfirmacao, close: closeConfirmacao },
    } = useClienteModals();
    const { search, status, setSearch, setStatus, filteredClientes, totalClientes, filteredCount, hasFilters, resetFilters } =
        useClienteFilters(clientesLista);

    useEffect(() => {
        h1Ref.current?.focus();
    }, []);

    const reloadClientes = useCallback(() => {
        router.reload({
            only: ['clientes', 'fiadoHistorico'],
        });
    }, [router]);

    const handleRefresh = () => {
        setLoading(true);
        router.reload({
            only: ['clientes', 'fiadoHistorico'],
            onFinish: () => setLoading(false),
        });
    };

    const clientePorId = useCallback(
        (id: number | null) => (id ? (clientesLista.find((cliente) => cliente.id === id) ?? null) : null),
        [clientesLista],
    );

    const clienteDetalhes = clientePorId(detalhesClienteId);
    const clienteParaEditar = clientePorId(formClienteId);
    const clienteParaPagar = clientePorId(confirmacaoClienteId);

    const fecharComEsc = useCallback(
        (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            if (detalhesOpen) {
                closeDetalhes();
                return;
            }
            if (formOpen) {
                closeForm();
                return;
            }
            if (confirmacaoOpen) {
                closeConfirmacao();
            }
        },
        [closeConfirmacao, closeDetalhes, closeForm, detalhesOpen, formOpen, confirmacaoOpen],
    );

    useEffect(() => {
        document.addEventListener('keydown', fecharComEsc);
        return () => document.removeEventListener('keydown', fecharComEsc);
    }, [fecharComEsc]);

    const clienteComContaFiada = (cliente?: Cliente | null) => {
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

    const pagarContaFiada = () => {
        if (!confirmacaoClienteId) return;
        router.delete(route('clientes.pagarContaFiada', confirmacaoClienteId), {
            preserveScroll: true,
            onSuccess: () => {
                reloadClientes();
            },
            onError: () => {
                addNotification({
                    type: 'error',
                    title: 'Conta fiada',
                    message: 'Não foi possível quitar a conta fiada. Tente novamente.',
                });
            },
            onFinish: closeConfirmacao,
        });
    };

    return (
        <>
            <NotificationContainer notifications={notifications} onRemove={removeNotification} />
            <h2 className="visually-hidden" ref={h1Ref} tabIndex={-1}>
                Clientes
            </h2>

            {error && (
                <div className="clientes-error-alert">
                    <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                    <span>{error}</span>
                </div>
            )}

            <ClientesHeader
                loading={loading}
                search={search}
                status={status}
                total={totalClientes}
                filtered={filteredCount}
                hasFilters={hasFilters}
                onRefresh={handleRefresh}
                onSearchChange={(value) => setSearch(value)}
                onStatusChange={(value) => setStatus(value)}
                onResetFilters={resetFilters}
                historicoInicial={fiadoHistorico}
            />

            {clientesLista.length === 0 ? (
                <ClientesEmptyState />
            ) : (
                <div className="elemento-clientes-5">
                    <ClientesTabela
                        clientes={filteredClientes}
                        abrirDetalhes={(cliente) => openDetalhes(cliente.id)}
                        abrirConfirmarPagamento={(cliente) => openConfirmacao(cliente.id)}
                        abrirModal={(modo, cliente) => {
                            if (modo === 'create') {
                                openCreate();
                                return;
                            }
                            if (cliente) openEdit(cliente.id);
                        }}
                    />
                </div>
            )}

            {formMode === 'create' && formOpen && (
                <ClienteCreateModal
                    show={formOpen}
                    onClose={closeForm}
                    onSuccess={() => {
                        closeForm();
                        reloadClientes();
                    }}
                />
            )}

            {formMode === 'edit' && formOpen && clienteParaEditar && (
                <ClienteEditModal
                    show={formOpen}
                    cliente={clienteComContaFiada(clienteParaEditar)!}
                    onClose={closeForm}
                    onSuccess={() => {
                        closeForm();
                        addNotification({ type: 'success', title: 'Cliente', message: 'Cliente atualizado com sucesso!' });
                        reloadClientes();
                    }}
                />
            )}

            {detalhesOpen && clienteDetalhes && <ClienteDetalhesModal cliente={clienteDetalhes} fechar={closeDetalhes} />}

            {confirmacaoOpen && clienteParaPagar && (
                <ConfirmarPagamentoModal cliente={clienteParaPagar} fechar={closeConfirmacao} confirmar={pagarContaFiada} />
            )}
        </>
    );
};

Clientes.layout = (page) => <GerenciamentoLayout title="Clientes">{page}</GerenciamentoLayout>;

export default Clientes;
