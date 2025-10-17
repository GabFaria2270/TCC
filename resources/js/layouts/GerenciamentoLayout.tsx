import { Head, Link, usePage } from '@inertiajs/react';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import Toast from '../components/Toast';
import { useAppearance, type Appearance } from '../hooks/use-appearance';
import type { SharedProps } from '../types/inertia';

import '../../css/gerenciamento/tour-glass.css';
import TourGuideShepherd from '../components/TourGuideShepherd';


export default function GerenciamentoLayout({ children, title }: { children: React.ReactNode; title?: string }) {
    const { props } = usePage<SharedProps>();
    const user = props.auth?.user;
    // Notificações removidas conforme solicitação
    const flash: any = (usePage() as any).props.flash || {};
    const fontDefaults = useMemo(() => ({ base: 18, min: 16, max: 22 }), []);
    const getInitialFontSize = () => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return fontDefaults.base;
        try {
            const storedStr = localStorage.getItem('a11y.fontSize');
            const stored = storedStr ? Number(storedStr) : NaN;
            if (!Number.isNaN(stored) && stored >= fontDefaults.min && stored <= fontDefaults.max) {
                return stored;
            }
            const current = parseFloat(getComputedStyle(document.documentElement).fontSize);
            if (!Number.isNaN(current)) {
                return Math.round(current);
            }
        } catch {}
        return fontDefaults.base;
    };
    const [fontSize, setFontSize] = useState<number>(() => getInitialFontSize());
    const { appearance, updateAppearance } = useAppearance();
    const [isDesktop, setIsDesktop] = useState<boolean>(true);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

    // Estado inicial já carregado acima (evita salto visual)

    useLayoutEffect(() => {
        if (typeof document === 'undefined') return;
        document.documentElement.style.fontSize = `${fontSize}px`;

        try {
            localStorage.setItem('a11y.fontSize', String(fontSize));
        } catch (error) {
            console.error('Falha ao salvar tamanho de fonte', error);
        }
    }, [fontSize]);

    // Nada aqui: o hook useAppearance já aplica data-bs-theme e colorScheme, early applied no Blade evita flicker

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            const desktop = window.innerWidth >= 992;
            setIsDesktop(desktop);
            setSidebarOpen(desktop);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        if (!isDesktop && sidebarOpen) {
            document.body.classList.add('sidebar-open');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.classList.remove('sidebar-open');
            document.body.style.overflow = '';
        }

        return () => {
            document.body.classList.remove('sidebar-open');
            document.body.style.overflow = '';
        };
    }, [isDesktop, sidebarOpen]);

    const decreaseFont = () => setFontSize((prev) => Math.max(fontDefaults.min, prev - 1));
    const increaseFont = () => setFontSize((prev) => Math.min(fontDefaults.max, prev + 1));
    const toggleContrast = () => {
        const next: Appearance = appearance === 'dark' ? 'light' : 'dark';
        updateAppearance(next);
    };
    const toggleSidebar = () => {
        if (isDesktop) return;
        setSidebarOpen((prev) => !prev);
    };
    const closeSidebar = () => {
        if (isDesktop) return;
        setSidebarOpen(false);
    };

    const renderSidebar = () => (
    <nav id="sidebar" className={`sidebar border-end bg-body ${!isDesktop && !sidebarOpen ? 'd-none' : ''}`} aria-label="Navegação principal">
            <div className="border-bottom d-flex align-items-center justify-content-between p-3">
                <div className="brand-title">Mercearia Fácil</div>
                {!isDesktop && (
                    <button
                        id="sidebarClose"
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        aria-label="Fechar menu"
                        onClick={closeSidebar}
                    >
                        ×
                    </button>
                )}
            </div>
            <div className="list-group list-group-flush">
                <Link
                    href={'/gerenciamento'}
                    className="list-group-item list-group-item-action d-flex align-items-center justify-content-between btn-tour-inicio"
                    onClick={closeSidebar}
                >
                    <span>
                        <span className="large-icon me-2">🏠</span> Início
                    </span>
                </Link>
                <Link
                    href={'/gerenciamento/vendas'}
                    className="list-group-item list-group-item-action d-flex align-items-center justify-content-between btn-tour-vendas"
                    onClick={closeSidebar}
                >
                    <span>
                        <span className="large-icon me-2">🧾</span> Vendas
                    </span>
                </Link>
                <Link
                    href={'/gerenciamento/clientes'}
                    className="list-group-item list-group-item-action d-flex align-items-center btn-tour-clientes"
                    onClick={closeSidebar}
                >
                    <span className="large-icon me-2">🧑</span> Clientes
                </Link>
                <Link
                    href={'/gerenciamento/produtos'}
                    className="list-group-item list-group-item-action d-flex align-items-center btn-tour-produtos"
                    onClick={closeSidebar}
                >
                    <span className="large-icon me-2">🛒</span> Produtos
                </Link>
                <Link
                    href={'/gerenciamento/relatorio'}
                    className="list-group-item list-group-item-action d-flex align-items-center btn-tour-relatorio"
                    onClick={closeSidebar}
                >
                    <span className="large-icon me-2">📊</span> Relatório
                </Link>
            </div>
        </nav>
    );

    // Fecha a sidebar ao clicar no conteúdo principal em telas pequenas
    const onMainClick = () => {
        if (!isDesktop && sidebarOpen) {
            closeSidebar();
        }
    };

    // Detectar mudança de rota para acionar animação de entrada
    const page = usePage();
    const [enterKey, setEnterKey] = useState<string>('');
    useEffect(() => {
        const url = (page as any).url as string;
        setEnterKey(url);
    }, [page]);

    return (
        <>
            <Head title={title ?? 'Gerenciamento'} />
            <div className="d-flex min-vh-100 bg-body-tertiary">
                <Toast message={flash.success} type="success" />
                <Toast message={flash.error} type="error" />
                <Toast message={flash.info} type="info" />
                {renderSidebar()}
                <main className="flex-grow-1" onClick={onMainClick}>
                    <header className="d-flex align-items-center justify-content-between border-bottom bg-body gerenciamento-header-fixed p-3">
                        <div className="d-flex align-items-center gap-2">
                            {!isDesktop && (
                                <button
                                    id="sidebarToggle"
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    aria-controls="sidebar"
                                    aria-expanded={sidebarOpen}
                                    aria-label="Abrir menu"
                                    onClick={toggleSidebar}
                                >
                                    ☰
                                </button>
                            )}
                            <h1 className="h4 m-0">{title ?? 'Painel de Gerenciamento'}</h1>
                        </div>
                        <div className="text-end">
                            <div className="fw-semibold">Olá, {user?.NOME ?? 'Usuário'}</div>
                            <small className="text-secondary">Perfil: {user?.PERFIL ?? '—'}</small>
                        </div>
                    </header>

                    <section key={enterKey} className="container-fluid page-view is-entering p-4">
                        <div className="d-flex align-items-center mb-3 flex-wrap gap-2" role="region" aria-label="Acessibilidade">
                            <span className="text-secondary">Acessibilidade:</span>
                            <button
                                id="a11y-font-dec"
                                type="button"
                                className="btn btn-sm btn-outline-secondary elemento-a11y-dec"
                                onClick={decreaseFont}
                                disabled={fontSize <= fontDefaults.min}
                                aria-label="Diminuir tamanho do texto"
                            >
                                A-
                            </button>
                            <button
                                id="a11y-font-inc"
                                type="button"
                                className="btn btn-sm btn-outline-secondary elemento-a11y-inc"
                                onClick={increaseFont}
                                disabled={fontSize >= fontDefaults.max}
                                aria-label="Aumentar tamanho do texto"
                            >
                                A+
                            </button>
                            <button
                                id="a11y-contrast"
                                type="button"
                                className="btn btn-sm btn-outline-dark elemento-a11y-contrast"
                                aria-pressed={appearance === 'dark'}
                                aria-label="Alternar modo escuro"
                                onClick={toggleContrast}
                            >
                                Modo escuro
                            </button>
                            <button
                                id="a11y-tour-restart"
                                type="button"
                                className="btn btn-sm btn-outline-primary ms-2"
                                aria-label="Reiniciar tour guiado"
                                // onClick={handleRestartTour}
                            >
                                ? Tour do sistema
                            </button>
                        </div>
                        {children}
                    </section>
                </main>
            </div>
            <TourGuideShepherd />
        </>
    );
}
