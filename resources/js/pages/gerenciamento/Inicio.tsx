import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';
import type { SharedProps } from '../../types/inertia';

export default function Inicio() {
    const h1Ref = useRef<HTMLHeadingElement>(null);
    const { props } = usePage<SharedProps>();
    const user = props.auth?.user;
    const comercio = props.comercio;
    const dashboard: any = (props as any).dashboard ?? {};
    const vendasHojeQtd: number = Number(dashboard?.vendasHoje?.quantidade ?? 0);
    const vendasHojeTotal: string = String(dashboard?.vendasHoje?.total ?? '0,00');
    const estoqueBaixo: number = Number(dashboard?.estoqueBaixo ?? 0);
    const ultimasVendas: Array<{ id: number; cliente: string; total: string; status: string; data: string }> = Array.isArray(dashboard?.ultimasVendas)
        ? dashboard.ultimasVendas
        : [];
    const fiadoClientes: number = Number(dashboard?.fiado?.clientes ?? 0);
    const fiadoTotal: string = String(dashboard?.fiado?.total ?? '0,00');

    // Status de conexão com a internet (útil para informar usuário idoso sobre falhas)
    const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
    useEffect(() => {
        const on = () => setOnline(true);
        const off = () => setOnline(false);
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => {
            window.removeEventListener('online', on);
            window.removeEventListener('offline', off);
        };
    }, []);

    useEffect(() => {
        h1Ref.current?.focus();
    }, []);

    return (
        <GerenciamentoLayout title="Início">
            <h2 className="visually-hidden" ref={h1Ref} tabIndex={-1}>
                Início
            </h2>

            <div className="card welcome-hero shadow-sm ">
                <div className="card-body d-flex flex-column flex-lg-row align-items-lg-center gap-3">
                    <div className="flex-grow-1">
                        <h3 className="h3 m-0 elemento-home-usuario">Bem-vindo(a), {user?.NOME ?? 'Usuário'} 👋</h3>
                        <p className="text-secondary mb-0 elemento-home-dica">Navegue entre Clientes, Produtos, Vendas e Estoque usando a barra lateral.</p>
                    </div>
                    {/* Removido botão redundante; a navegação já está na barra lateral */}
                </div>
            </div>

            {/* Aviso de conexão (apenas quando offline) */}
            {!online && (
                <div className="alert alert-warning mt-3" role="status" aria-live="polite">
                    Sem conexão com a internet no momento. Algumas funções podem não funcionar.
                </div>
            )}

            {/* Como usar (orientação simples e direta) */}
            <div className="card mt-3 shadow-sm elemento-home-2">
                <div className="card-header bg-body elemento-home-comousar">
                    <strong>Como usar</strong>
                </div>
                <div className="card-body elemento-home-lista">
                    <ol className="mb-0">
                        <li>
                            Para registrar uma venda, clique em <strong>Vendas</strong> na barra lateral.
                        </li>
                        <li>
                            Para cadastrar ou atualizar um produto, clique em <strong>Produtos</strong>.
                        </li>
                        <li>
                            Para ver ou cadastrar clientes, clique em <strong>Clientes</strong>.
                        </li>
                    </ol>
                </div>
            </div>

            {/* Resumo de hoje (funcional) */}
            <div className="card mt-3 shadow-sm elemento-home-resumo">
                <div className="card-header bg-body d-flex justify-content-between align-items-center" id="resumo-hoje">
                    <strong>Resumo de hoje</strong>
                </div>
                <div className="card-body elemento-home-resumo-body">
                    <div className="row g-3">
                        <div className="col-lg-6 col-12 elemento-home-vendas">
                            <div className="rounded-3 bg-body-tertiary h-100 border p-3">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="text-secondary">Vendas</div>
                                        <div className="display-6 fw-semibold mb-0">{vendasHojeQtd}</div>
                                        <div className="text-secondary">Total: R$ {vendasHojeTotal}</div>
                                    </div>
                                    <i className="bi bi-cash-coin fs-2 text-secondary" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-end">
                                    <Link href="/gerenciamento/vendas" className="btn btn-primary">
                                        Ir para Vendas
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-12 elemento-home-estoque">
                            <div className="rounded-3 bg-body-tertiary h-100 border p-3">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="text-secondary">Estoque</div>
                                        <div className="display-6 fw-semibold mb-0">{estoqueBaixo}</div>
                                        <div className="text-secondary">Abaixo do mínimo</div>
                                    </div>
                                    <i className="bi bi-exclamation-triangle fs-2 text-warning" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-end">
                                    <button
                                        type="button"
                                        className="btn btn-outline-warning"
                                        onClick={() => {
                                            router.post(
                                                '/gerenciamento/produtos/filtros',
                                                {
                                                    page: 1,
                                                    q: undefined,
                                                    categoriaId: undefined,
                                                    sort: 'nome',
                                                    dir: 'asc',
                                                    perPage: 10,
                                                    onlyLow: true,
                                                },
                                                { preserveScroll: true, replace: true, preserveState: true },
                                            );
                                        }}
                                        aria-label="Ver produtos com baixo estoque"
                                    >
                                        Ver produtos com baixo estoque
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Últimas vendas e Fiado em aberto */}
            <div className="row g-3 mt-3 elemento-home-listas">
                <div className="col-lg-6 col-12 elemento-home-ultimasvendas">
                    <div className="card h-100 shadow-sm" aria-labelledby="ultimas-vendas">
                        <div className="card-header bg-body d-flex justify-content-between align-items-center" id="ultimas-vendas">
                            <strong>Últimas vendas</strong>
                            <Link href="/gerenciamento/vendas" className="btn btn-sm btn-outline-secondary">
                                Ver todas
                            </Link>
                        </div>
                        <div className="card-body">
                            {ultimasVendas.length === 0 ? (
                                <p className="text-secondary mb-0">Nenhuma venda registrada recentemente.</p>
                            ) : (
                                <ul className="list-group list-group-flush">
                                    {ultimasVendas.map((v) => (
                                        <li key={v.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <div className="me-2">
                                                <div className="fw-semibold">{v.cliente}</div>
                                                <small className="text-secondary">
                                                    {v.data} · {v.status}
                                                </small>
                                            </div>
                                            <div className="fw-semibold text-nowrap">{v.total}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-6 col-12 elemento-home-fiado">
                    <div className="card h-100 shadow-sm" aria-labelledby="fiado-aberto">
                        <div className="card-header bg-body d-flex justify-content-between align-items-center" id="fiado-aberto">
                            <strong>Fiado em aberto</strong>
                            <Link href="/gerenciamento/clientes" className="btn btn-sm btn-outline-secondary">
                                Ver clientes
                            </Link>
                        </div>
                        <div className="card-body d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <div className="text-secondary">Clientes devendo</div>
                                    <div className="display-6 fw-semibold mb-0">{fiadoClientes}</div>
                                    <div className="text-secondary">Total em aberto: R$ {fiadoTotal}</div>
                                </div>
                                <i className="bi bi-wallet2 fs-2 text-secondary" aria-hidden="true" />
                            </div>
                            <div className="mt-auto pt-2 text-end">
                                <Link href="/gerenciamento/clientes" className="btn btn-outline-primary">
                                    Gerenciar fiados
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mt-3 shadow-sm elemento-home-mercearia">
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
