import { router, useForm } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';
import { formatarMoeda } from '@/utils/formatters';
import { normalizarMoedaBR, reloadProdutosList } from '@/utils/produtos';
import type { Produto, ProdutoFormData } from '@/types/gerenciamento/Produtos';

interface UseProdutoFormModalReturn {
    showModal: boolean;
    modalMode: 'create' | 'edit';
    produtoSelecionado: Produto | null;
    setProdutoSelecionado: (produto: Produto | null) => void;
    data: ProdutoFormData;
    errors: Record<string, string | undefined>;
    processing: boolean;
    abrirModalCriar: () => void;
    abrirModalEditar: (produto: Produto) => void;
    fecharModal: () => void;
    submit: (event: FormEvent) => void;
    setFormField: (field: keyof ProdutoFormData, value: string) => void;
}

export function useProdutoFormModal(): UseProdutoFormModalReturn {
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

    const { data, setData, post, processing, errors, reset, transform } = useForm<ProdutoFormData>({
        nome: '',
        preco: '',
        quantidade: '',
        categoria_id: '',
        nova_categoria_nome: '',
        estoque_minimo: '',
    });

    const setFormField = (field: keyof ProdutoFormData, value: string) => setData(field, value);

    const abrirModalCriar = () => {
        setModalMode('create');
        setProdutoSelecionado(null);
        setShowModal(true);
        reset();
        setData('quantidade', '');
        setData('estoque_minimo', '');
        setTimeout(() => {
            document.getElementById('produto-nome')?.focus();
        }, 100);
    };

    const abrirModalEditar = (produto: Produto) => {
        setModalMode('edit');
        setProdutoSelecionado(produto);
        setShowModal(true);
        reset();
        setData({
            nome: produto.nome,
            preco: formatarMoeda(String(produto.preco ?? '')),
            quantidade: String(produto.estoque?.quantidade ?? '0'),
            categoria_id: produto.categoria ? String(produto.categoria.id) : '',
            nova_categoria_nome: '',
            estoque_minimo: String(produto.estoque_minimo ?? '0'),
        });
        setTimeout(() => {
            document.getElementById('produto-nome')?.focus();
        }, 100);
    };

    const fecharModal = () => {
        setShowModal(false);
        reset();
    };

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showModal) {
                fecharModal();
            }
        };

        if (showModal) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEsc);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleEsc);
        };
    }, [showModal]);

    const refreshProdutos = () => {
        reloadProdutosList();
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (modalMode === 'create') {
            transform((formData) => ({ ...formData, preco: normalizarMoedaBR(formData.preco) }));
            post('/gerenciamento/produtos', {
                preserveScroll: true,
                onSuccess: () => {
                    fecharModal();
                    refreshProdutos();
                },
            });
        } else if (modalMode === 'edit' && produtoSelecionado) {
            router.put(
                `/gerenciamento/produtos/${produtoSelecionado.id}`,
                { ...data, preco: normalizarMoedaBR(data.preco) },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        fecharModal();
                        refreshProdutos();
                    },
                },
            );
        }
    };

    return {
        showModal,
        modalMode,
        produtoSelecionado,
        setProdutoSelecionado,
        data,
        errors,
        processing,
        abrirModalCriar,
        abrirModalEditar,
        fecharModal,
        submit,
        setFormField,
    };
}
