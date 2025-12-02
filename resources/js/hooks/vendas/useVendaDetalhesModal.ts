import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Venda } from '@/types';
import http from '@/lib/http';
import { useRoute } from '@/lib/route';

interface UseVendaDetalhesModalResult {
    showVendaModal: boolean;
    vendaDetalhes: Venda | null;
    loadingDetalhes: boolean;
    abrirDetalhesVenda: (venda: Venda) => Promise<void>;
    fecharDetalhesVenda: () => void;
}

export function useVendaDetalhesModal(): UseVendaDetalhesModalResult {
    const [showVendaModal, setShowVendaModal] = useState(false);
    const [vendaDetalhes, setVendaDetalhes] = useState<Venda | null>(null);
    const [loadingDetalhes, setLoadingDetalhes] = useState(false);
    const controllerRef = useRef<AbortController | null>(null);
    const { route } = useRoute();

    const fecharDetalhesVenda = useCallback(() => {
        controllerRef.current?.abort();
        controllerRef.current = null;
        setShowVendaModal(false);
        setVendaDetalhes(null);
    }, []);

    const abrirDetalhesVenda = useCallback(
        async (venda: Venda) => {
            controllerRef.current?.abort();
            const controller = new AbortController();
            controllerRef.current = controller;

            setShowVendaModal(true);
            setVendaDetalhes(venda);
            setLoadingDetalhes(true);

            try {
                const { data } = await http.get(route('vendas.show', venda.id), {
                    headers: { Accept: 'application/json' },
                    signal: controller.signal,
                });

                if (data?.venda) {
                    setVendaDetalhes(data.venda as Venda);
                }
            } catch (error) {
                if (axios.isCancel(error) || (error as DOMException)?.name === 'AbortError') {
                    return;
                }
            } finally {
                if (controllerRef.current === controller) {
                    controllerRef.current = null;
                }
                setLoadingDetalhes(false);
            }
        },
        [route],
    );

    useEffect(() => () => controllerRef.current?.abort(), []);

    return { showVendaModal, vendaDetalhes, loadingDetalhes, abrirDetalhesVenda, fecharDetalhesVenda };
}
