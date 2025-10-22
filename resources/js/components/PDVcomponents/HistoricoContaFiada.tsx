import { useEffect, useState } from 'react';
import ModalPortal from '../common/ModalPortal';

// --- TIPO E INTERFACE ---
interface HistoricoContaFiadaProps {
    className?: string;
    initialData?: VendaFiada[]; // ✅ recebe pré-carregado
}

type VendaFiada = {
    id: number;
    cliente: string;
    valor: number;
    data: string; // ISO
    status: 'pendente' | 'pago';
};

// --- HOOK CUSTOMIZADO ---
/**
 * Hook de React para detectar media queries (tamanho da tela).
 * Retorna 'true' se a query corresponder (ex: se for desktop).
 */
function useMediaQuery(query: string): boolean {
    const getMatches = (q: string): boolean => {
        // Previne erros durante o Server-Side Rendering (SSR)
        if (typeof window === 'undefined') {
            return false;
        }
        return window.matchMedia(q).matches;
    };

    const [matches, setMatches] = useState<boolean>(() => getMatches(query));

    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);

        // Atualiza o estado quando o tamanho da tela muda
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Garante que o estado está correto após a montagem inicial
        setMatches(mediaQueryList.matches);

        try {
            // Nova API (Chrome, Firefox, Safari >= 14)
            mediaQueryList.addEventListener('change', listener);
        } catch (e) {
            // API antiga (outros navegadores / Safari < 14)
            mediaQueryList.addListener(listener);
        }

        return () => {
            try {
                mediaQueryList.removeEventListener('change', listener);
            } catch (e) {
                mediaQueryList.removeListener(listener);
            }
        };
    }, [query]);

    return matches;
}

// --- FUNÇÕES DE FORMATAÇÃO E HELPERS ---
const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

const formatarData = (dataIso: string) => {
    return new Date(dataIso).toLocaleString('pt-BR');
};

const getStatusBadge = (status: 'pendente' | 'pago') => {
    const isPendente = status === 'pendente';
    const className = isPendente ? 'text-bg-warning' : 'text-bg-success';
    const text = isPendente ? 'Pendente' : 'Pago';
    return <span className={`badge ${className}`}>{text}</span>;
};


// --- SUB-COMPONENTES DA LISTA ---
// (Isso limpa o render principal)

/**
 * Componente que renderiza a Tabela para Desktop
 */
const TabelaVendas = ({ vendas }: { vendas: VendaFiada[] }) => (
    <div className="table-responsive">
        <table className="table table-hover table-sm table-bordered mb-0 align-middle">
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Valor</th>
                    <th>Data</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {vendas.map((venda) => (
                    <tr key={venda.id}>
                        <td className="text-break">
                            <strong>{venda.cliente}</strong>
                        </td>
                        <td className="text-success text-nowrap">
                            <strong>{formatarMoeda(venda.valor)}</strong>
                        </td>
                        <td className="text-nowrap">{formatarData(venda.data)}</td>
                        <td>{getStatusBadge(venda.status)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

/**
 * Componente que renderiza os Cards para Mobile
 */
const CardsVendas = ({ vendas }: { vendas: VendaFiada[] }) => (
    <>
        {vendas.map((venda) => (
            <div key={venda.id} className="card mb-2 shadow-sm">
                <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="fw-bold text-break pe-2">{venda.cliente}</div>
                        {getStatusBadge(venda.status)}
                    </div>
                    <div className="text-success fw-bold fs-5 mb-1">{formatarMoeda(venda.valor)}</div>
                    <div className="text-muted small">{formatarData(venda.data)}</div>
                </div>
            </div>
        ))}
    </>
);


// --- COMPONENTE PRINCIPAL ---

export default function HistoricoContaFiada({ className = '', initialData = [] }: HistoricoContaFiadaProps) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [vendasFiadas, setVendasFiadas] = useState<VendaFiada[]>(initialData);
    
    // ✅ AQUI ESTÁ A NOVA LÓGICA:
    // Usamos o hook para verificar o breakpoint 'md' (768px)
    const isDesktop = useMediaQuery('(min-width: 768px)');

    // Efeito para atualizar dados
    useEffect(() => {
        setVendasFiadas(initialData || []);
    }, [initialData]);

    // Efeito para carregar dados do backend
    useEffect(() => {
        if (!showModal) return;
        if (vendasFiadas.length > 0) return; 

        let abort = false;
        (async () => {
            try {
                setLoading(true);
                const resp = await fetch('/gerenciamento/fiado/historico', {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                if (!resp.ok) throw new Error('Falha ao carregar histórico');
                const json = await resp.json();
                if (!abort) setVendasFiadas(json.vendas_fiadas || []);
            } catch {
                if (!abort) setVendasFiadas([]);
            } finally {
                if (!abort) setLoading(false);
            }
        })();

        return () => {
            abort = true;
        };
    }, [showModal, vendasFiadas.length]);

    // Cálculos para o resumo
    const pendentes = vendasFiadas.filter((v) => v.status === 'pendente');
    const pagas = vendasFiadas.filter((v) => v.status === 'pago');
    const totalPendente = pendentes.reduce((total, v) => total + (v.valor || 0), 0);
    const totalPago = pagas.reduce((total, v) => total + (v.valor || 0), 0);

    return (
        <>
            <button className={`btn-historico-fiada ${className}`} onClick={() => setShowModal(true)} title="Ver histórico de contas fiadas">
                <i className="bi bi-wallet2"></i>
                Histórico Fiadas
                <span className="badge-total">{formatarMoeda(totalPendente)}</span>
            </button>

            {showModal && (
                <ModalPortal>
                    <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div>
                    <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                        {/* Você ainda precisa do modal-lg para o modal ter espaço suficiente (800px) para ATIVAR o hook (768px) */}
                        <div className="modal-dialog modal-lg modal-dialog-centered"> 
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="bi bi-wallet2 me-2"></i>
                                        Histórico de Contas Fiadas
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>

                                <div className="modal-body">
                                    {loading && (
                                        <div className="d-flex align-items-center justify-content-center py-5">
                                            <div className="spinner-border me-2" role="status" />
                                            Carregando…
                                        </div>
                                    )}

                                    {!loading && (
                                        <>
                                            {/* Resumo */}
                                            <div className="row mb-4">
                                                <div className="col-md-6 mb-2 mb-md-0">
                                                    <div className="card border-warning h-100">
                                                        <div className="card-body text-center">
                                                            <h6 className="card-title text-warning"><i className="bi bi-clock me-2"></i>Pendentes</h6>
                                                            <h4 className="text-warning mb-0">{formatarMoeda(totalPendente)}</h4>
                                                            <small className="text-muted">{pendentes.length} vendas</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card border-success h-100">
                                                        <div className="card-body text-center">
                                                            <h6 className="card-title text-success"><i className="bi bi-check-circle me-2"></i>Pagas</h6>
                                                            <h4 className="text-success mb-0">{formatarMoeda(totalPago)}</h4>
                                                            <small className="text-muted">{pagas.length} vendas</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* --- NOVA LÓGICA DE RENDERIZAÇÃO --- */}
                                            {vendasFiadas.length === 0 ? (
                                                <div className="text-muted py-4 text-center">Nenhuma venda fiada encontrada</div>
                                            ) : (
                                                // Se for desktop, renderiza TabelaVendas
                                                // Se não for, renderiza CardsVendas
                                                isDesktop ? (
                                                    <TabelaVendas vendas={vendasFiadas} />
                                                ) : (
                                                    <CardsVendas vendas={vendasFiadas} />
                                                )
                                            )}
                                            {/* --- FIM DA NOVA LÓGICA --- */}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </>
    );
}

// ⚠️ AVISO IMPORTANTE ⚠️
//
// Esta nova abordagem com JavaScript (useMediaQuery) é mais limpa,
// mas ela AINDA DEPENDE EXATAMENTE DA MESMA COISA que a
// abordagem antiga com CSS (d-md-block):
//
// O NAVEGADOR PRECISA DA META TAG VIEWPORT.
//
// Se a tabela AINDA não aparecer no desktop, o problema
// NÃO está neste código React. O problema está no seu arquivo
// HTML principal (provavelmente `public/index.html`).
//
// Certifique-se de que esta linha está no <head> do seu HTML:
//
// <meta name="viewport" content="width=device-width, initial-scale=1">
//
// Sem ela, o navegador não entende media queries (nem de CSS, nem de JS)
// e o `isDesktop` será sempre `false`.