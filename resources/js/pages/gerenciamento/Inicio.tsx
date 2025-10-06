import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';
import type { SharedProps } from '../../types/inertia';

export default function Inicio() {
    const h1Ref = useRef<HTMLHeadingElement>(null);
    const { props } = usePage<SharedProps>();
    const user = props.auth?.user;
    const comercio = props.comercio;

    useEffect(() => {
        h1Ref.current?.focus();
    }, []);

    return (
        <GerenciamentoLayout title="Início">
            <h2 className="visually-hidden" ref={h1Ref} tabIndex={-1}>
                Início
            </h2>

            <div className="card welcome-hero shadow-sm">
                <div className="card-body d-flex flex-column flex-lg-row align-items-lg-center gap-3">
                    <div className="flex-grow-1">
                        <h3 className="h3 m-0">Bem-vindo(a), {user?.NOME ?? 'Usuário'} 👋</h3>
                        <p className="text-secondary mb-0">Aqui você gerencia sua mercearia de forma simples e acessível.</p>
                    </div>
                    <div>
                        <Link href={'/gerenciamento/clientes'} className="btn btn-primary">
                            Começar agora
                        </Link>
                    </div>
                </div>
            </div>

            <div className="card mt-3 shadow-sm">
                <div className="card-header bg-body">
                    <strong>Informações da mercearia</strong>
                </div>
                <div className="card-body">
                    <dl className="row mb-0">
                        <dt className="col-sm-4 col-12">Nome</dt>
                        <dd className="col-sm-8 col-12">{comercio?.nome ?? '—'}</dd>
                        <dt className="col-sm-4 col-12">CNPJ</dt>
                        <dd className="col-sm-8 col-12">{comercio?.cnpj ?? '—'}</dd>
                        <dt className="col-sm-4 col-12">Responsável</dt>
                        <dd className="col-sm-8 col-12">{user?.NOME ?? '—'}</dd>
                        <dt className="col-sm-4 col-12">Perfil</dt>
                        <dd className="col-sm-8 col-12">{user?.PERFIL ?? '—'}</dd>
                    </dl>
                </div>
            </div>
        </GerenciamentoLayout>
    );
}
