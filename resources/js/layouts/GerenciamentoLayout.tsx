import React, { useEffect, useMemo, useState } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';
import type { SharedProps } from '../types/inertia';
import Toast from '../components/Toast';

export default function GerenciamentoLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const { props } = usePage<SharedProps>();
  const user = props.auth?.user;
  const flash: any = (usePage() as any).props.flash || {};
  const fontDefaults = useMemo(() => ({ base: 18, min: 16, max: 22 }), []);
  const [fontSize, setFontSize] = useState<number>(fontDefaults.base);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedFont = Number(localStorage.getItem('a11y.fontSize'));
      if (!Number.isNaN(storedFont) && storedFont >= fontDefaults.min && storedFont <= fontDefaults.max) {
        setFontSize(storedFont);
      }

      const storedContrast = localStorage.getItem('a11y.highContrast');
      if (storedContrast !== null) {
        setHighContrast(storedContrast === 'true');
      }
    } catch (error) {
      console.error('Falha ao carregar preferências de acessibilidade', error);
    }
  }, [fontDefaults.max, fontDefaults.min]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.fontSize = `${fontSize}px`;

    try {
      localStorage.setItem('a11y.fontSize', String(fontSize));
    } catch (error) {
      console.error('Falha ao salvar tamanho de fonte', error);
    }

    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontSize]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.body.classList.toggle('high-contrast', highContrast);

    try {
      localStorage.setItem('a11y.highContrast', String(highContrast));
    } catch (error) {
      console.error('Falha ao salvar modo de contraste', error);
    }

    return () => {
      document.body.classList.remove('high-contrast');
    };
  }, [highContrast]);

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
  const toggleContrast = () => setHighContrast((prev) => !prev);
  const toggleSidebar = () => {
    if (isDesktop) return;
    setSidebarOpen((prev) => !prev);
  };
  const closeSidebar = () => {
    if (isDesktop) return;
    setSidebarOpen(false);
  };

  const renderSidebar = () => (
    <nav
      id="sidebar"
      className={`sidebar bg-white border-end ${!isDesktop && !sidebarOpen ? 'd-none' : ''}`}
      aria-label="Navegação principal"
    >
      <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
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
          className="list-group-item list-group-item-action d-flex align-items-center"
          onClick={closeSidebar}
        >
          <span className="me-2 large-icon">🏠</span> Início
        </Link>
        <Link
          href={'/gerenciamento/clientes'}
          className="list-group-item list-group-item-action d-flex align-items-center"
          onClick={closeSidebar}
        >
          <span className="me-2 large-icon">🧑</span> Clientes
        </Link>
        <Link
          href={'/gerenciamento/produtos'}
          className="list-group-item list-group-item-action d-flex align-items-center"
          onClick={closeSidebar}
        >
          <span className="me-2 large-icon">🛒</span> Produtos
        </Link>
      </div>
    </nav>
  );

  return (
    <>
      <Head title={title ?? 'Gerenciamento'} />
      <div className="d-flex min-vh-100 bg-body-tertiary">
        <Toast message={flash.success} type="success" />
        <Toast message={flash.error} type="error" />
        <Toast message={flash.info} type="info" />
        {renderSidebar()}
        {!isDesktop && sidebarOpen && <div className="offcanvas-backdrop fade show" onClick={closeSidebar} />}

        <main className="flex-grow-1">
          <header className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white">
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
                  ☰ Menu
                </button>
              )}
              <h1 className="h4 m-0">{title ?? 'Painel de Gerenciamento'}</h1>
            </div>
            <div className="text-end">
              <div className="fw-semibold">Olá, {user?.NOME ?? 'Usuário'}</div>
              <small className="text-secondary">Perfil: {user?.PERFIL ?? '—'}</small>
            </div>
          </header>

          <section className="container-fluid p-4">
            <div className="d-flex flex-wrap gap-2 align-items-center mb-3" role="region" aria-label="Acessibilidade">
              <span className="text-secondary">Acessibilidade:</span>
              <button
                id="a11y-font-dec"
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={decreaseFont}
                disabled={fontSize <= fontDefaults.min}
                aria-label="Diminuir tamanho do texto"
              >
                A-
              </button>
              <button
                id="a11y-font-inc"
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={increaseFont}
                disabled={fontSize >= fontDefaults.max}
                aria-label="Aumentar tamanho do texto"
              >
                A+
              </button>
              <button
                id="a11y-contrast"
                type="button"
                className="btn btn-sm btn-outline-dark"
                aria-pressed={highContrast}
                onClick={toggleContrast}
              >
                Alto contraste
              </button>
            </div>
            {children}
          </section>
        </main>
      </div>
    </>
  );
}
