import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
    const DESKTOP_BREAKPOINT = 1180;
    const getInitialIsDesktop = () => {
        if (typeof window === 'undefined') return true;
        return window.innerWidth >= DESKTOP_BREAKPOINT;
    };
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
    const [isDesktop, setIsDesktop] = useState<boolean>(() => getInitialIsDesktop());
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => getInitialIsDesktop());
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
    const [logoutMessage, setLogoutMessage] = useState<string>('');
    const logoutFormRef = useRef<HTMLFormElement | null>(null);

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
            const desktop = window.innerWidth >= DESKTOP_BREAKPOINT;
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

    const handleLogout = () => {
        if (isLoggingOut) {
            return;
        }
        setLogoutMessage('Encerrando sessão com segurança...');
        setIsLoggingOut(true);

        router.post(
            '/logout',
            { all_devices: true },
            {
                preserveScroll: false,
                onSuccess: () => {
                    setLogoutMessage('Sessão encerrada. Redirecionando...');
                },
                onError: () => {
                    setLogoutMessage('Falha ao encerrar sessão. Tente novamente.');
                },
                onFinish: () => {
                    setIsLoggingOut(false);
                },
            },
        );
    };

    const sidebarStateClass = isDesktop ? 'is-open' : sidebarOpen ? 'is-open' : 'is-closed';

    const renderSidebar = () => (
        <nav id="sidebar" className={`sidebar ${sidebarStateClass}`} aria-label="Navegação principal" aria-hidden={!isDesktop && !sidebarOpen}>
            <div className="border-bottom d-flex align-items-center justify-content-between p-3">
                <div className="brand-title">Mais Conectado</div>
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
                <Link href={'/gerenciamento'} className="list-group-item list-group-item-action btn-tour-inicio" onClick={closeSidebar}>
                    <span className="large-icon">🏠</span>
                    <span className="sidebar-label">Início</span>
                </Link>
                <Link href={'/gerenciamento/vendas'} className="list-group-item list-group-item-action btn-tour-vendas" onClick={closeSidebar}>
                    <span className="large-icon">🧾</span>
                    <span className="sidebar-label">Vendas</span>
                </Link>
                <Link href={'/gerenciamento/clientes'} className="list-group-item list-group-item-action btn-tour-clientes" onClick={closeSidebar}>
                    <span className="large-icon">🧑</span>
                    <span className="sidebar-label">Clientes</span>
                </Link>
                <Link href={'/gerenciamento/produtos'} className="list-group-item list-group-item-action btn-tour-produtos" onClick={closeSidebar}>
                    <span className="large-icon">🛒</span>
                    <span className="sidebar-label">Produtos</span>
                </Link>
                <Link href={'/gerenciamento/relatorio'} className="list-group-item list-group-item-action btn-tour-relatorio" onClick={closeSidebar}>
                    <span className="large-icon">📊</span>
                    <span className="sidebar-label">Relatório</span>
                </Link>
            </div>
            <div className="border-top mt-auto p-3">
                <button
                    type="button"
                    className="btn btn-outline-danger d-flex align-items-center justify-content-center w-100 gap-2"
                    onClick={() => {
                        handleLogout();
                        closeSidebar();
                    }}
                    disabled={isLoggingOut}
                >
                    {isLoggingOut ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    ) : (
                        <i className="bi bi-box-arrow-right" aria-hidden="true" />
                    )}
                    <span className="fw-semibold">Sair</span>
                </button>
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
                <main className="bg-body-tertiary flex-grow-1" onClick={onMainClick}>
                    <header className="d-flex align-items-center justify-content-between border-bottom bg-body-tertiary gerenciamento-header-fixed p-3">
                        <div className="d-flex align-items-center gap-2" style={{ minHeight: '3.5rem' }}>
                            {!isDesktop && (
                                <button
                                    id="sidebarToggle"
                                    type="button"
                                    className="btn btn-outline-secondary d-flex justify-content-center align-items-center p-0"
                                    style={{ width: '2.5rem', height: '2.5rem', minWidth: '2.5rem', minHeight: '2.5rem', fontSize: '1.5rem' }}
                                    aria-controls="sidebar"
                                    aria-expanded={sidebarOpen}
                                    aria-label="Abrir menu"
                                    onClick={toggleSidebar}
                                >
                                    <span style={{ lineHeight: 1 }}>☰</span>
                                </button>
                            )}
                            <h1 className="h4 d-flex align-items-center m-0" style={{ height: '2.5rem' }}>
                                {title ?? 'Painel de Gerenciamento'}
                            </h1>
                        </div>
                        <div className="text-end">
                            <div className="fw-semibold">Olá, {user?.NOME ?? 'Usuário'}</div>
                            <small className="text-secondary">Perfil: {user?.PERFIL ?? '—'}</small>
                            <div className="mt-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-2"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                    ) : (
                                        <i className="bi bi-box-arrow-right" aria-hidden="true" />
                                    )}
                                    <span>Sair</span>
                                </button>
                            </div>
                        </div>
                    </header>

                    <section key={enterKey} className="container-fluid page-view is-entering px-md-4 p-4 px-2">
                        <div className="d-flex align-items-center mb-3 flex-wrap gap-2" role="region" aria-label="Acessibilidade">
                            <div className="d-flex align-items-center" style={{ gap: '0.25rem', paddingLeft: '5px' }}>
                                <button
                                    id="a11y-font-dec"
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary elemento-a11y-dec"
                                    onClick={decreaseFont}
                                    disabled={fontSize <= fontDefaults.min}
                                    aria-label="Diminuir tamanho do texto"
                                    style={{ minHeight: '2.25rem' }}
                                >
                                    A-
                                </button>
                                <button
                                    id="a11y-font-inc"
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary elemento-a11y-inc ms-1"
                                    onClick={increaseFont}
                                    disabled={fontSize >= fontDefaults.max}
                                    aria-label="Aumentar tamanho do texto"
                                    style={{ minHeight: '2.25rem' }}
                                >
                                    A+
                                </button>
                                <button
                                    id="a11y-contrast"
                                    type="button"
                                    className="btn btn-sm btn-outline-dark elemento-a11y-contrast align-self-stretch ms-2"
                                    aria-pressed={appearance === 'dark'}
                                    aria-label="Alternar modo escuro"
                                    onClick={toggleContrast}
                                    style={{ minHeight: '2.25rem' }}
                                >
                                    Modo escuro
                                </button>
                            </div>
                        </div>
                        <div className="visually-hidden" aria-live="polite">
                            {isLoggingOut ? logoutMessage : ''}
                        </div>
                        {children}
                    </section>
                </main>
            </div>
            <TourGuideShepherd userId={user?.id} />
            <form ref={logoutFormRef} method="POST" action="/logout" className="d-none">
                <input type="hidden" name="_token" value={props.csrf_token ?? ''} />
                <input type="hidden" name="all_devices" value="true" />
            </form>
        </>
    );
}
