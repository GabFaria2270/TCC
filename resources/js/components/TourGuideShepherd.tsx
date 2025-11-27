import { useEffect } from 'react';
import type { Tour as ShepherdTour, StepOptions } from 'shepherd.js';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

const shepherdTourRef = typeof window !== 'undefined' ? (window as any)._shepherdTourRef || { current: null } : { current: null };
if (typeof window !== 'undefined') (window as any)._shepherdTourRef = shepherdTourRef;

type TourGuideShepherdProps = {
    userId?: number | string;
};

type ExtendedStepOptions = StepOptions & {
    popperOptions?: Record<string, unknown>;
    modalOverlayOpeningPadding?: number;
};

export default function TourGuideShepherd({ userId }: TourGuideShepherdProps = {}) {
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const isGerenciamentoRoute = window.location.pathname.startsWith('/gerenciamento');
        if (!isGerenciamentoRoute) {
            if (shepherdTourRef.current) {
                try {
                    (shepherdTourRef.current as ShepherdTour).cancel();
                } catch {}
                shepherdTourRef.current = null;
            }
            return;
        }

        const suffix = userId !== undefined && userId !== null ? `:${userId}` : '';
        const FINAL_KEY_BASE = 'tourGuiadoFinalizado';
        const STEP_KEY_BASE = 'tourGuiadoStepIndex';
        const finalizadoKey = `${FINAL_KEY_BASE}${suffix}`;
        const stepKey = `${STEP_KEY_BASE}${suffix}`;

        const smallScreenQuery = window.matchMedia('(max-width: 768px)');
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const mediaAddListener = (query: MediaQueryList, handler: (event: MediaQueryListEvent | MediaQueryList) => void) => {
            if (typeof query.addEventListener === 'function') {
                query.addEventListener('change', handler as (event: MediaQueryListEvent) => void);
            } else if (typeof query.addListener === 'function') {
                query.addListener(handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
            }
        };
        const mediaRemoveListener = (query: MediaQueryList, handler: (event: MediaQueryListEvent | MediaQueryList) => void) => {
            if (typeof query.removeEventListener === 'function') {
                query.removeEventListener('change', handler as (event: MediaQueryListEvent) => void);
            } else if (typeof query.removeListener === 'function') {
                query.removeListener(handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
            }
        };
        const isSmallScreen = () => smallScreenQuery.matches;
        const prefersReducedMotion = () => reducedMotionQuery.matches;
        const scrollToTarget = (element?: Element | null) => {
            if (!element || typeof (element as HTMLElement).scrollIntoView !== 'function') {
                return;
            }
            try {
                (element as HTMLElement).scrollIntoView({
                    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                    block: isSmallScreen() ? 'center' : 'nearest',
                    inline: 'center',
                });
            } catch {
                (element as HTMLElement).scrollIntoView();
            }
        };
        const popperModifiers = [
            {
                name: 'offset',
                options: {
                    offset: () => [0, isSmallScreen() ? 8 : 14],
                },
            },
            {
                name: 'preventOverflow',
                options: {
                    boundary: document.body,
                    padding: 12,
                },
            },
            {
                name: 'flip',
                options: {
                    fallbackPlacements: ['bottom', 'top', 'right', 'left'],
                },
            },
        ];
        const toggleBodyScrollLock = (locked: boolean) => {
            const shouldLock = locked && !isSmallScreen();
            document.body.classList.toggle('tour-open', shouldLock);
        };
        const syncBodyLockWithViewport = () => {
            if (!document.body.classList.contains('tour-open')) {
                return;
            }
            if (isSmallScreen()) {
                document.body.classList.remove('tour-open');
            }
        };
        mediaAddListener(smallScreenQuery, syncBodyLockWithViewport);

        const safeGet = (key: string) => {
            try {
                return window.localStorage.getItem(key);
            } catch {
                return null;
            }
        };
        const safeSet = (key: string, value: string) => {
            try {
                window.localStorage.setItem(key, value);
            } catch {}
        };
        const safeRemove = (key: string) => {
            try {
                window.localStorage.removeItem(key);
            } catch {}
        };

        if (suffix) {
            const legacyFinalizado = safeGet(FINAL_KEY_BASE);
            if (legacyFinalizado !== null && safeGet(finalizadoKey) === null) {
                safeRemove(FINAL_KEY_BASE);
            }
            const legacyStep = safeGet(STEP_KEY_BASE);
            if (legacyStep !== null && safeGet(stepKey) === null) {
                safeRemove(STEP_KEY_BASE);
            }
        }

        if (safeGet(finalizadoKey)) {
            shepherdTourRef.current = null;
            return;
        }

        if (shepherdTourRef.current) {
            try {
                (shepherdTourRef.current as ShepherdTour).cancel();
            } catch {}
            shepherdTourRef.current = null;
        }

        const getSavedStepIndex = () => {
            const raw = safeGet(stepKey);
            const parsed = raw ? Number(raw) : NaN;
            return Number.isNaN(parsed) ? 0 : parsed;
        };
        const saveStepIndex = (value: number) => safeSet(stepKey, String(value));
        const clearStepIndex = () => safeRemove(stepKey);

        // Helper para aguardar elemento
        function waitForElement(selector: string, timeout = 7000) {
            return new Promise((resolve, reject) => {
                const start = Date.now();
                const check = () => {
                    const el = document.querySelector(selector);
                    if (el && (el as HTMLElement).offsetParent !== null) {
                        resolve(true);
                    } else if (Date.now() - start > timeout) {
                        reject('Elemento não encontrado: ' + selector);
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            });
        }

        let sidebarForcedOpen = false;
        const isSidebarVisible = () => {
            const sidebar = document.getElementById('sidebar');
            return sidebar?.classList.contains('is-open');
        };
        const ensureSidebarOpenForTour = async () => {
            if (!isSmallScreen()) return;
            if (isSidebarVisible()) return;
            const toggleBtn = document.getElementById('sidebarToggle') as HTMLButtonElement | null;
            if (toggleBtn) {
                sidebarForcedOpen = true;
                toggleBtn.click();
                try {
                    await waitForElement('#sidebar.is-open', 1500);
                } catch {
                    sidebarForcedOpen = false;
                }
            }
        };
        const releaseSidebarIfForced = () => {
            if (!sidebarForcedOpen || !isSmallScreen()) return;
            const closeBtn = document.getElementById('sidebarClose') as HTMLButtonElement | null;
            if (closeBtn) {
                closeBtn.click();
            } else {
                document.getElementById('sidebar')?.classList.remove('is-open');
            }
            sidebarForcedOpen = false;
        };

        const handleNavbarStepShow = (selector: string) => () => ensureSidebarOpenForTour().then(() => waitForElement(selector));
        const handleNavbarStepHide = () => releaseSidebarIfForced();

        const tour: ShepherdTour = new Shepherd.Tour({
            defaultStepOptions: {
                classes: 'shepherd-theme-arrows tour-glass rainbow-card',
                scrollTo: true,
                scrollToHandler: scrollToTarget,
                cancelIcon: { enabled: true },
                canClickTarget: false,
                modalOverlayOpeningPadding: 8,
                popperOptions: {
                    modifiers: popperModifiers,
                },
            } as ExtendedStepOptions,
            useModalOverlay: true,
        });
        shepherdTourRef.current = tour;
        const handleStepShow = () => {
            requestAnimationFrame(() => toggleBodyScrollLock(true));
        };
        tour.on('show', handleStepShow);

        const steps: ExtendedStepOptions[] = [
            // Navbar Home
            {
                id: 'navbar-home',
                attachTo: { element: '.btn-tour-inicio', on: 'bottom' as const },
                title: 'Bem-vindo ao sistema!',
                text: 'Este é o menu principal. Por aqui você acessa todas as Informações  do sistema. Vamos conhecer juntos cada funcionalidade!',
                buttons: [],
                when: {
                    show: () => {
                        if (window.location.pathname !== '/gerenciamento') {
                            window.location.href = '/gerenciamento';
                            return new Promise((resolve) => setTimeout(resolve, 800));
                        }
                        return handleNavbarStepShow('.btn-tour-inicio')();
                    },
                    hide: handleNavbarStepHide,
                },
            },
            // Botão diminuir texto
            {
                id: 'a11y-dec',
                attachTo: { element: '.elemento-a11y-dec', on: 'bottom' as const },
                title: 'Diminuir tamanho do texto',
                text: 'Se as letras estiverem grandes demais, clique aqui para diminuir e deixar a leitura mais confortável para você.',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-a11y-dec'),
                },
            },
            // Botão aumentar texto
            {
                id: 'a11y-inc',
                attachTo: { element: '.elemento-a11y-inc', on: 'bottom' as const },
                title: 'Aumentar tamanho do texto',
                text: 'Prefere letras maiores? Clique aqui para aumentar o tamanho dos textos e facilitar a leitura.',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-a11y-inc'),
                },
            },
            // Botão modo escuro/claro
            {
                id: 'a11y-contrast',
                attachTo: { element: '.elemento-a11y-contrast', on: 'bottom' as const },
                title: 'Modo escuro e claro',
                text: 'Aqui você pode alternar entre modo claro e escuro. Escolha o que for mais confortável para seus olhos!',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-a11y-contrast'),
                },
            },

            // Card "Como usar"
            {
                id: 'home-comousar',
                attachTo: { element: '.elemento-home-2', on: 'top' as const },
                title: 'Como usar o sistema',
                text: 'Aqui você encontra instruções rápidas para registrar vendas, cadastrar produtos e gerenciar clientes. Tudo de forma simples!',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-home-2'),
                },
            },
            // Card "Resumo de hoje"
            {
                id: 'home-resumo',
                attachTo: { element: '.elemento-home-resumo', on: 'top' as const },
                title: 'Resumo do dia',
                text: 'Aqui você acompanha o resumo das vendas e do estoque do dia. Ótimo para ter uma visão rápida do seu negócio!',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-home-resumo'),
                },
            },
            // Card vendas do resumo
            {
                id: 'home-vendas',
                attachTo: { element: '.elemento-home-vendas', on: 'top' as const },
                title: 'Vendas do dia',
                text: 'Veja quantas vendas foram feitas hoje e o valor total. Assim você acompanha o movimento da sua loja!',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-home-vendas'),
                },
            },
            // Card estoque do resumo
            {
                id: 'home-estoque',
                attachTo: { element: '.elemento-home-estoque', on: 'top' as const },
                title: 'Alerta de estoque baixo',
                text: 'Fique atento aos produtos que estão com estoque baixo. Assim você evita faltar mercadoria para seus clientes!',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-home-estoque'),
                },
            },
            // Listas: últimas vendas
            {
                id: 'home-ultimasvendas',
                attachTo: { element: '.elemento-home-ultimasvendas', on: 'top' as const },
                title: 'Últimas vendas realizadas',
                text: 'Aqui você pode conferir as vendas mais recentes feitas na sua loja.',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-home-ultimasvendas'),
                },
            },
            // Listas: fiado em aberto
            {
                id: 'home-fiado',
                attachTo: { element: '.elemento-home-fiado', on: 'top' as const },
                title: 'Fiado em aberto',
                text: 'Veja quais clientes estão com fiado em aberto e o valor total. Controle fácil das dívidas!',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-home-fiado'),
                },
            },
            // Listas: agrupamento de listas
            {
                id: 'home-listas',
                attachTo: { element: '.elemento-home-listas', on: 'top' as const },
                title: 'Painel de listas',
                text: 'Este painel mostra as últimas vendas e os fiados em aberto, tudo em um só lugar!',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-home-listas'),
                },
            },
            // Card mercearia (último passo do Home)
            {
                id: 'home-mercearia',
                attachTo: { element: '.elemento-home-mercearia', on: 'top' as const },
                title: 'Informações da mercearia',
                text: 'Aqui estão os dados da sua mercearia e do responsável. Mantenha sempre atualizado!',
                buttons: [
                    {
                        text: 'Continuar o tour',
                        action: () => {
                            saveStepIndex(steps.findIndex((s) => s.id === 'navbar-vendas'));
                            window.location.href = '/gerenciamento/vendas';
                        },
                    },
                    {
                        text: 'Cancelar',
                        action: () => tour.cancel(),
                    },
                ],
                when: {
                    show: () => waitForElement('.elemento-home-mercearia'),
                },
            },
            // Navbar Vendas (primeiro passo em vendas)
            {
                id: 'navbar-vendas',
                attachTo: { element: '.btn-tour-vendas', on: 'top' as const },
                title: 'Área de Vendas',
                text: 'Aqui você pode registrar e acompanhar todas as vendas realizadas no sistema. Clique para explorar!',
                buttons: [],
                when: {
                    show: handleNavbarStepShow('.btn-tour-vendas'),
                    hide: handleNavbarStepHide,
                },
            },
            // Elementos da página Vendas (ajustados para classes reais)
            {
                id: 'vendas-element1',
                attachTo: { element: '.elemento-vendas-header', on: 'top' as const },
                title: 'Registrar Venda',
                text: 'Use este espaço para registrar novas vendas e acessar o histórico. Tudo prático e rápido!',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-vendas-header'),
                },
            },
            {
                id: 'vendas-element2',
                attachTo: { element: '.elemento-vendas-abas', on: 'top' as const },
                title: 'Botões de Ação',
                text: 'Aqui estão os botões de Nova venda e histórico. Use para acessar essas funcionalidades.',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-vendas-abas'),
                },
            },
            {
                id: 'vendas-element3',
                attachTo: { element: '.elemento-vendas-lista', on: 'top' as const },
                title: 'Filtros e histórico de vendas',
                text: 'Use os filtros para encontrar vendas específicas por cliente, para facilitar muito a busca e análise suas vendas!',
                buttons: [
                    {
                        text: 'Ir para Clientes',
                        action: () => {
                            saveStepIndex(steps.findIndex((s) => s.id === 'navbar-clientes'));
                            window.location.href = '/gerenciamento/clientes';
                        },
                    },
                    {
                        text: 'Cancelar',
                        action: () => tour.cancel(),
                    },
                ],
                when: {
                    show: () => waitForElement('.elemento-vendas-lista'),
                },
            },
            // --- PRODUTOS ---
            {
                id: 'navbar-produtos',
                attachTo: { element: '.btn-tour-produtos', on: 'top' as const },
                title: 'Área de Produtos',
                text: 'Aqui você cadastra, edita e acompanha todos os produtos da sua mercearia. Clique para ver mais!',
                buttons: [],
                when: {
                    show: handleNavbarStepShow('.btn-tour-produtos'),
                    hide: handleNavbarStepHide,
                },
            },
            {
                id: 'produtos-header',
                attachTo: { element: '.elemento-produtos-1', on: 'top' as const },
                title: 'Gestão de Produtos',
                text: 'Este é o cabeçalho da área de produtos. Aqui você encontra ações rápidas para gerenciar seus itens.',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-produtos-1'),
                },
            },
            {
                id: 'produtos-lista',
                attachTo: { element: '.elemento-produtos-2', on: 'top' as const },
                title: 'Lista de Produtos',
                text: 'Aqui estão todos os produtos cadastrados. Você pode editar, excluir ou adicionar novos facilmente.',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-produtos-2'),
                },
            },
            {
                id: 'produtos-novo',
                attachTo: { element: '.elemento-produtos-3', on: 'top' as const },
                title: 'Cadastrar novo produto',
                text: 'Precisa adicionar um novo item? Clique aqui para cadastrar produtos rapidamente!',
                buttons: [
                    {
                        text: 'Ir para Relatório',
                        action: () => {
                            saveStepIndex(steps.findIndex((s) => s.id === 'navbar-relatorio'));
                            window.location.href = '/gerenciamento/relatorio';
                        },
                    },
                    {
                        text: 'Cancelar',
                        action: () => tour.cancel(),
                    },
                ],
                when: {
                    show: () => waitForElement('.elemento-produtos-3'),
                },
            },
            // --- CLIENTES ---
            {
                id: 'navbar-clientes',
                attachTo: { element: '.btn-tour-clientes', on: 'top' as const },
                title: 'Área de Clientes',
                text: 'Aqui você gerencia todos os seus clientes, acompanha fiados e pode cadastrar novos. Clique para conhecer!',
                buttons: [],
                when: {
                    show: handleNavbarStepShow('.btn-tour-clientes'),
                    hide: handleNavbarStepHide,
                },
            },
            {
                id: 'clientes-header',
                attachTo: { element: '.elemento-clientes-1', on: 'top' as const },
                title: 'Gestão de Clientes',
                text: 'Este é o cabeçalho da área de clientes. Aqui você encontra ações rápidas para gerenciar seus clientes.',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-clientes-1'),
                },
            },
            {
                id: 'clientes-header-content',
                attachTo: { element: '.elemento-clientes-2', on: 'top' as const },
                title: 'Ações e histórico de fiado',
                text: 'Aqui você pode atualizar a lista de clientes e acessar o histórico de fiado. Tudo para facilitar seu controle!',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-clientes-2'),
                },
            },
            {
                id: 'clientes-title-section',
                attachTo: { element: '.elemento-clientes-3', on: 'top' as const },
                title: 'Informações dos clientes',
                text: 'Veja os dados principais dos seus clientes e acompanhe o status das contas fiadas.',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-clientes-3'),
                },
            },
            {
                id: 'clientes-actions',
                attachTo: { element: '.elemento-clientes-4', on: 'top' as const },
                title: 'Ações de Clientes',
                text: 'Use estes botões para atualizar a lista ou acessar o histórico de fiado dos clientes.',
                buttons: [
                    {
                        text: 'Ir para Produtos',
                        action: () => {
                            saveStepIndex(steps.findIndex((s) => s.id === 'navbar-produtos'));
                            window.location.href = '/gerenciamento/produtos';
                        },
                    },
                ],
                when: {
                    show: () => waitForElement('.elemento-clientes-4'),
                },
            },
            // --- RELATÓRIO ---
            {
                id: 'navbar-relatorio',
                attachTo: { element: '.btn-tour-relatorio', on: 'top' as const },
                title: 'Área de Relatórios',
                text: 'Aqui você pode gerar relatórios completos de vendas, estoque e muito mais. Clique para acessar!',
                buttons: [],
                when: {
                    show: handleNavbarStepShow('.btn-tour-relatorio'),
                    hide: handleNavbarStepHide,
                },
            },
            {
                id: 'relatorio-header',
                attachTo: { element: '.elemento-relatorio-1', on: 'top' as const },
                title: 'Gestão de Relatórios',
                text: 'Este é o cabeçalho da área de relatórios. Aqui você encontra ações rápidas para gerar e exportar dados.',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-relatorio-1'),
                },
            },
            {
                id: 'relatorio-titulo',
                attachTo: { element: '.elemento-relatorio-2', on: 'top' as const },
                title: 'Informações do Relatório',
                text: 'Veja os filtros e opções para gerar o relatório que está sendo analisado.',
                buttons: [],
                when: {
                    show: () => waitForElement('.elemento-relatorio-2'),
                },
            },
            {
                id: 'relatorio-exportar',
                attachTo: { element: '.elemento-relatorio-3', on: 'top' as const },
                title: 'Exportar para Excel',
                text: 'Precisa analisar os dados? Clique aqui para exportar o relatório em Excel e facilitar seu controle!',
                buttons: [
                    {
                        text: 'Finalizar tour',
                        action: () => tour.complete(),
                    },
                ],
                when: {
                    show: () => waitForElement('.elemento-relatorio-3'),
                },
            },
        ];

        steps.forEach((step) => tour.addStep(step));

        let tourDismissed = false;

        // Função para iniciar ou continuar o tour
        const startOrContinueTour = (forcedIndex?: number) => {
            const storedIndex = getSavedStepIndex();
            const idx = typeof forcedIndex === 'number' ? forcedIndex : storedIndex;
            const step = steps[idx];
            if (step && step.attachTo && (step.attachTo as any).element) {
                waitForElement((step.attachTo as any).element, 7000)
                    .then(() => {
                        tour.show(idx);
                    })
                    .catch(() => {
                        if (idx < steps.length - 1) {
                            saveStepIndex(idx + 1);
                            startOrContinueTour(idx + 1);
                        } else {
                            tour.complete();
                        }
                    });
            } else {
                tour.show(idx);
            }
        };

        // Marca como finalizado ao completar ou cancelar
        const finalizarTour = () => {
            tourDismissed = true;
            safeSet(finalizadoKey, 'true');
            clearStepIndex();
            toggleBodyScrollLock(false);
            releaseSidebarIfForced();
        };
        tour.on('complete', finalizarTour);
        tour.on('cancel', finalizarTour);

        // Salva o índice do passo atual ao avançar
        const advanceStep = (e: MouseEvent) => {
            if (tourDismissed || (typeof (tour as any).isActive === 'function' && !(tour as any).isActive())) {
                return;
            }
            const target = e.target as HTMLElement;
            // Não avançar quando o clique for no ícone de fechar (X) do Shepherd
            if (target.closest('.shepherd-cancel-icon')) {
                return;
            }
            const currentStep = tour.getCurrentStep();
            if (target.closest('.shepherd-button')) {
                if (target.textContent?.trim() === 'Cancelar') return;
            }
            // Último passo de Home
            if (currentStep?.id === 'home-mercearia') {
                const continuarBtn = document.querySelector('.shepherd-button');
                if (continuarBtn) {
                    (continuarBtn as HTMLButtonElement).click();
                }
                return;
            }
            // Último passo de Produtos
            if (currentStep?.id === 'produtos-novo') {
                const btns = Array.from(document.querySelectorAll('.shepherd-button')) as HTMLButtonElement[];
                const irRelatorioBtn = btns.find((b) => b.textContent?.trim() === 'Ir para Relatório');
                if (irRelatorioBtn) {
                    irRelatorioBtn.click();
                }
                return;
            }
            // Último passo de Vendas
            if (currentStep?.id === 'vendas-element3') {
                const btns = Array.from(document.querySelectorAll('.shepherd-button')) as HTMLButtonElement[];
                const irClientesBtn = btns.find((b) => b.textContent?.trim() === 'Ir para Clientes');
                if (irClientesBtn) {
                    irClientesBtn.click();
                }
                return;
            }
            // Último passo de Clientes
            if (currentStep?.id === 'clientes-actions') {
                const btns = Array.from(document.querySelectorAll('.shepherd-button')) as HTMLButtonElement[];
                const irProdutosBtn = btns.find((b) => b.textContent?.trim() === 'Ir para Produtos');
                if (irProdutosBtn) {
                    irProdutosBtn.click();
                }
                return;
            }
            if (currentStep) {
                const currentIndex = tour.steps.indexOf(currentStep);
                saveStepIndex(currentIndex);
                if (currentIndex < tour.steps.length - 1) {
                    tour.next();
                } else {
                    tour.complete();
                }
            }
        };

        document.body.addEventListener('click', advanceStep);

        // Inicia ou continua o tour ao montar
        startOrContinueTour();

        // Ao trocar de rota, tenta continuar o tour do passo salvo
        const onPopState = () => {
            if (!safeGet(finalizadoKey)) {
                setTimeout(() => startOrContinueTour(), 400);
            }
        };
        window.addEventListener('popstate', onPopState);

        return () => {
            document.body.removeEventListener('click', advanceStep);
            window.removeEventListener('popstate', onPopState);
            mediaRemoveListener(smallScreenQuery, syncBodyLockWithViewport);
            if (typeof (tour as any).off === 'function') {
                (tour as any).off('show', handleStepShow);
                (tour as any).off('complete', finalizarTour);
                (tour as any).off('cancel', finalizarTour);
            }
            if (shepherdTourRef.current === tour) {
                shepherdTourRef.current = null;
            }
            toggleBodyScrollLock(false);
            releaseSidebarIfForced();
            tour.cancel();
        };
    }, [userId]);

    return null;
}
