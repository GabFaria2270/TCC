import { router } from '@inertiajs/react';
import type { Paginacao } from '@/types/gerenciamento/Produtos';

export function normalizarMoedaBR(valor: string): string {
    if (!valor) return '';
    let v = valor.replace(/\./g, '');
    v = v.replace(',', '.');
    return v;
}

export function hideFiltersInUrl(): void {
    try {
        const { state } = window.history;
        const clean = window.location.pathname + (window.location.hash || '');
        window.history.replaceState(state, '', clean);
    } catch {
        // Silently ignore errors to avoid breaking the UX
    }
}

export function isPaginated<T>(payload: unknown): payload is Paginacao<T> {
    if (!payload || typeof payload !== 'object') return false;
    const candidate = payload as Partial<Paginacao<T>>;
    return Array.isArray(candidate.data) && typeof candidate.current_page === 'number';
}

export function reloadProdutosList(): void {
    router.get(
        '/gerenciamento/produtos',
        {},
        {
            preserveScroll: true,
            onSuccess: () => hideFiltersInUrl(),
        },
    );
}
