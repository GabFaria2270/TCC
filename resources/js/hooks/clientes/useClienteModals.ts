import { useCallback, useState } from 'react';

type ModalMode = 'create' | 'edit';

type Nullable<T> = T | null;

export function useClienteModals() {
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<ModalMode>('create');
    const [formClienteId, setFormClienteId] = useState<Nullable<number>>(null);

    const [detalhesClienteId, setDetalhesClienteId] = useState<Nullable<number>>(null);
    const [confirmClienteId, setConfirmClienteId] = useState<Nullable<number>>(null);

    const openCreate = useCallback(() => {
        setFormMode('create');
        setFormClienteId(null);
        setFormOpen(true);
    }, []);

    const openEdit = useCallback((clienteId: number) => {
        setFormMode('edit');
        setFormClienteId(clienteId);
        setFormOpen(true);
    }, []);

    const closeForm = useCallback(() => {
        setFormOpen(false);
        setFormClienteId(null);
    }, []);

    const openDetalhes = useCallback((clienteId: number) => {
        setDetalhesClienteId(clienteId);
    }, []);

    const closeDetalhes = useCallback(() => {
        setDetalhesClienteId(null);
    }, []);

    const openConfirmacao = useCallback((clienteId: number) => {
        setConfirmClienteId(clienteId);
    }, []);

    const closeConfirmacao = useCallback(() => {
        setConfirmClienteId(null);
    }, []);

    return {
        form: {
            isOpen: formOpen,
            mode: formMode,
            clienteId: formClienteId,
            openCreate,
            openEdit,
            close: closeForm,
        },
        detalhes: {
            isOpen: detalhesClienteId !== null,
            clienteId: detalhesClienteId,
            open: openDetalhes,
            close: closeDetalhes,
        },
        confirmacao: {
            isOpen: confirmClienteId !== null,
            clienteId: confirmClienteId,
            open: openConfirmacao,
            close: closeConfirmacao,
        },
    };
}
