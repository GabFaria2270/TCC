import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance, withTransition = false) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());

    const html = document.documentElement;
    if (withTransition) {
        html.classList.add('theme-transition');
    }
    // Bootstrap 5.3 (color modes)
    html.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    // Melhora aparência de inputs/scrollbars
    (html.style as any).colorScheme = isDark ? 'dark' : 'light';

    if (withTransition) {
        const durationVar = getComputedStyle(document.documentElement).getPropertyValue('--theme-switch-duration') || '260ms';
        // Extrair apenas o tempo em ms
        let timeout = 260;
        try {
            const match = durationVar.trim().match(/(\d+(?:\.\d+)?)(ms|s)/);
            if (match) {
                const value = parseFloat(match[1]);
                const unit = match[2];
                timeout = unit === 's' ? Math.round(value * 1000) : Math.round(value);
            }
        } catch {}
        window.setTimeout(() => html.classList.remove('theme-transition'), timeout);
    }
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';

    applyTheme(savedAppearance);

    // Add the event listener for system theme changes...
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', mode);

        // Store in cookie for SSR...
        setCookie('appearance', mode);

        applyTheme(mode, true);
    }, []);

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') as Appearance | null;
        // aplicação inicial sem transição
        applyTheme(savedAppearance || 'system', false);

        return () => mediaQuery()?.removeEventListener('change', handleSystemThemeChange);
    }, [updateAppearance]);

    return { appearance, updateAppearance } as const;
}
