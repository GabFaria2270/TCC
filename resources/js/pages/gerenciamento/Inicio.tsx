import React, { useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';
import type { SharedProps } from '../../types/inertia';

export default function Inicio() {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const { props } = usePage<SharedProps>();
  const user = props.auth?.user;
  const comercio = props.comercio;

  useEffect(() => { h1Ref.current?.focus(); }, []);

  return (
    <GerenciamentoLayout title="Início">
      <h2 className="visually-hidden" ref={h1Ref} tabIndex={-1}>Início</h2>

      <div className="card shadow-sm welcome-hero">
        <div className="card-body d-flex flex-column flex-lg-row align-items-lg-center gap-3">
          <div className="flex-grow-1">
            <h3 className="h3 m-0">Bem-vindo(a), {user?.NOME ?? 'Usuário'} 👋</h3>
            <p className="text-secondary mb-0">Aqui você gerencia sua mercearia de forma simples e acessível.</p>
          </div>
          <div>
            <Link href={'/gerenciamento/clientes'} className="btn btn-primary">Começar agora</Link>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-3">
        <div className="card-header bg-white"><strong>Informações da mercearia</strong></div>
        <div className="card-body">
          <dl className="row mb-0">
            <dt className="col-12 col-sm-4">Nome</dt>
            <dd className="col-12 col-sm-8">{comercio?.nome ?? '—'}</dd>
            <dt className="col-12 col-sm-4">CNPJ</dt>
            <dd className="col-12 col-sm-8">{comercio?.cnpj ?? '—'}</dd>
            <dt className="col-12 col-sm-4">Responsável</dt>
            <dd className="col-12 col-sm-8">{user?.NOME ?? '—'}</dd>
            <dt className="col-12 col-sm-4">Perfil</dt>
            <dd className="col-12 col-sm-8">{user?.PERFIL ?? '—'}</dd>
          </dl>
        </div>
      </div>
    </GerenciamentoLayout>
  );
}
