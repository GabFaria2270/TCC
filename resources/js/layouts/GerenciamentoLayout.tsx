import React from 'react';
import { Link, Head, usePage } from '@inertiajs/react';

export default function GerenciamentoLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const { props } = usePage();
  const user = (props as any).auth?.user;

  return (
    <>
      <Head title={title ?? 'Gerenciamento'} />
      <div className="d-flex min-vh-100 bg-body-tertiary">
        <nav id="sidebar" className="sidebar bg-white border-end" aria-label="Navegação principal">
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
            <div className="brand-title">Mercearia Fácil</div>
          </div>
          <div className="list-group list-group-flush">
            <Link href={'/gerenciamento'} className="list-group-item list-group-item-action d-flex align-items-center">
              <span className="me-2 large-icon">🏠</span> Início
            </Link>
            <Link href={'/gerenciamento/clientes'} className="list-group-item list-group-item-action d-flex align-items-center">
              <span className="me-2 large-icon">🧑</span> Clientes
            </Link>
          </div>
        </nav>

        <main className="flex-grow-1">
          <header className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white">
            <h1 className="h4 m-0">{title ?? 'Painel de Gerenciamento'}</h1>
            <div className="text-end">
              <div className="fw-semibold">Olá, {user?.NOME ?? 'Usuário'}</div>
              <small className="text-secondary">Perfil: {user?.PERFIL ?? '—'}</small>
            </div>
          </header>

          <section className="container-fluid p-4">
            {children}
          </section>
        </main>
      </div>
    </>
  );
}
