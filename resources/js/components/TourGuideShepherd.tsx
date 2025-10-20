
import React, { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import type { Tour as ShepherdTour, StepOptions } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

const shepherdTourRef = typeof window !== 'undefined' ? (window as any)._shepherdTourRef || { current: null } : { current: null };
if (typeof window !== 'undefined') (window as any)._shepherdTourRef = shepherdTourRef;

export default function TourGuideShepherd() {
  const isMounted = useRef(false);
  useEffect(() => {
    if (isMounted.current) {
      return;
    }
    isMounted.current = true;
    // Só inicia o tour se não estiver finalizado
    if (localStorage.getItem('tourGuiadoFinalizado')) {
      return;
    }

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

    // Se já existe um tour, não cria outro
    if (shepherdTourRef.current) return;

    const tour: ShepherdTour = new Shepherd.Tour({
      defaultStepOptions: {
        classes: 'shepherd-theme-arrows tour-glass rainbow-card',
        scrollTo: true,
        cancelIcon: { enabled: true },
        canClickTarget: false,
      },
      useModalOverlay: true,
    });
    shepherdTourRef.current = tour;

    // Recupera o índice salvo do passo
    const savedStepIndex = localStorage.getItem('tourGuiadoStepIndex');

    const steps: StepOptions[] = [
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
              return new Promise(resolve => setTimeout(resolve, 800));
            }
            return waitForElement('.btn-tour-inicio');
          }
        }
      },
      // Botão diminuir texto
      {
        id: 'a11y-dec',
        attachTo: { element: '.elemento-a11y-dec', on: 'bottom' as const },
        title: 'Diminuir tamanho do texto',
        text: 'Se as letras estiverem grandes demais, clique aqui para diminuir e deixar a leitura mais confortável para você.',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-a11y-dec')
        }
      },
      // Botão aumentar texto
      {
        id: 'a11y-inc',
        attachTo: { element: '.elemento-a11y-inc', on: 'bottom' as const },
        title: 'Aumentar tamanho do texto',
        text: 'Prefere letras maiores? Clique aqui para aumentar o tamanho dos textos e facilitar a leitura.',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-a11y-inc')
        }
      },
      // Botão modo escuro/claro
      {
        id: 'a11y-contrast',
        attachTo: { element: '.elemento-a11y-contrast', on: 'bottom' as const },
        title: 'Modo escuro e claro',
        text: 'Aqui você pode alternar entre modo claro e escuro. Escolha o que for mais confortável para seus olhos!',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-a11y-contrast')
        }
      },
     
      // Card "Como usar"
      {
        id: 'home-comousar',
        attachTo: { element: '.elemento-home-2', on: 'top' as const },
        title: 'Como usar o sistema',
        text: 'Aqui você encontra instruções rápidas para registrar vendas, cadastrar produtos e gerenciar clientes. Tudo de forma simples!',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-home-2')
        }
      },
      // Card "Resumo de hoje"
      {
        id: 'home-resumo',
        attachTo: { element: '.elemento-home-resumo', on: 'top' as const },
        title: 'Resumo do dia',
        text: 'Aqui você acompanha o resumo das vendas e do estoque do dia. Ótimo para ter uma visão rápida do seu negócio!',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-home-resumo')
        }
      },
      // Card vendas do resumo
      {
        id: 'home-vendas',
        attachTo: { element: '.elemento-home-vendas', on: 'top' as const },
        title: 'Vendas do dia',
        text: 'Veja quantas vendas foram feitas hoje e o valor total. Assim você acompanha o movimento da sua loja!',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-home-vendas')
        }
      },
      // Card estoque do resumo
      {
        id: 'home-estoque',
        attachTo: { element: '.elemento-home-estoque', on: 'top' as const },
        title: 'Alerta de estoque baixo',
        text: 'Fique atento aos produtos que estão com estoque baixo. Assim você evita faltar mercadoria para seus clientes!',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-home-estoque')
        }
      },
      // Listas: últimas vendas
      {
        id: 'home-ultimasvendas',
        attachTo: { element: '.elemento-home-ultimasvendas', on: 'top' as const },
        title: 'Últimas vendas realizadas',
        text: 'Aqui você pode conferir as vendas mais recentes feitas na sua loja.',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-home-ultimasvendas')
        }
      },
      // Listas: fiado em aberto
      {
        id: 'home-fiado',
        attachTo: { element: '.elemento-home-fiado', on: 'top' as const },
        title: 'Fiado em aberto',
        text: 'Veja quais clientes estão com fiado em aberto e o valor total. Controle fácil das dívidas!',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-home-fiado')
        }
      },
      // Listas: agrupamento de listas
      {
        id: 'home-listas',
        attachTo: { element: '.elemento-home-listas', on: 'top' as const },
        title: 'Painel de listas',
        text: 'Este painel mostra as últimas vendas e os fiados em aberto, tudo em um só lugar!',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-home-listas')
        }
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
              localStorage.setItem('tourGuiadoStepIndex', String(steps.findIndex(s => s.id === 'navbar-vendas')));
              window.location.href = '/gerenciamento/vendas';
            }
          },
          {
            text: 'Cancelar',
            action: () => tour.cancel(),
          }
        ],
        when: {
          show: () => waitForElement('.elemento-home-mercearia')
        }
      },
      // Navbar Vendas (primeiro passo em vendas)
      {
        id: 'navbar-vendas',
        attachTo: { element: '.btn-tour-vendas', on: 'top' as const },
        title: 'Área de Vendas',
        text: 'Aqui você pode registrar e acompanhar todas as vendas realizadas no sistema. Clique para explorar!',
        buttons: [],
        when: {
          show: () => waitForElement('.btn-tour-vendas')
        }
      },
      // Elementos da página Vendas (ajustados para classes reais)
      {
        id: 'vendas-element1',
        attachTo: { element: '.elemento-vendas-header', on: 'top' as const },
        title: 'Registrar Venda',
        text: 'Use este espaço para registrar novas vendas e acessar o histórico. Tudo prático e rápido!',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-vendas-header')
        }
      },
      {
        id: 'vendas-element2',
        attachTo: { element: '.elemento-vendas-abas', on: 'top' as const },
        title: 'Botões de Ação',
        text: 'Aqui estão os botões de Nova venda e histórico. Use para acessar essas funcionalidades.',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-vendas-abas')
        }
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
              localStorage.setItem('tourGuiadoStepIndex', String(steps.findIndex(s => s.id === 'navbar-clientes')));
              window.location.href = '/gerenciamento/clientes';
            }
          },
          {
            text: 'Cancelar',
            action: () => tour.cancel(),
          }
        ],
        when: {
          show: () => waitForElement('.elemento-vendas-lista')
        }
      },
      // --- PRODUTOS ---
      {
        id: 'navbar-produtos',
        attachTo: { element: '.btn-tour-produtos', on: 'top' as const },
        title: 'Área de Produtos',
        text: 'Aqui você cadastra, edita e acompanha todos os produtos da sua mercearia. Clique para ver mais!',
        buttons: [],
        when: {
          show: () => waitForElement('.btn-tour-produtos')
        }
      },
      {
        id: 'produtos-header',
        attachTo: { element: '.elemento-produtos-1', on: 'top' as const },
        title: 'Gestão de Produtos',
        text: 'Este é o cabeçalho da área de produtos. Aqui você encontra ações rápidas para gerenciar seus itens.',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-produtos-1')
        }
      },
      {
        id: 'produtos-lista',
        attachTo: { element: '.elemento-produtos-2', on: 'top' as const },
        title: 'Lista de Produtos',
        text: 'Aqui estão todos os produtos cadastrados. Você pode editar, excluir ou adicionar novos facilmente.',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-produtos-2')
        }
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
                localStorage.setItem('tourGuiadoStepIndex', String(steps.findIndex(s => s.id === 'navbar-relatorio')));
                window.location.href = '/gerenciamento/relatorio';
              }
            },
            {
              text: 'Cancelar',
              action: () => tour.cancel(),
            }
          ],
        when: {
          show: () => waitForElement('.elemento-produtos-3')
        }
      },
      // --- CLIENTES ---
      {
        id: 'navbar-clientes',
        attachTo: { element: '.btn-tour-clientes', on: 'top' as const },
        title: 'Área de Clientes',
        text: 'Aqui você gerencia todos os seus clientes, acompanha fiados e pode cadastrar novos. Clique para conhecer!',
        buttons: [],
        when: {
          show: () => waitForElement('.btn-tour-clientes')
        }
      },
      {
        id: 'clientes-header',
        attachTo: { element: '.elemento-clientes-1', on: 'top' as const },
        title: 'Gestão de Clientes',
        text: 'Este é o cabeçalho da área de clientes. Aqui você encontra ações rápidas para gerenciar seus clientes.',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-clientes-1')
        }
      },
      {
        id: 'clientes-header-content',
        attachTo: { element: '.elemento-clientes-2', on: 'top' as const },
        title: 'Ações e histórico de fiado',
        text: 'Aqui você pode atualizar a lista de clientes e acessar o histórico de fiado. Tudo para facilitar seu controle!',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-clientes-2')
        }
      },
      {
        id: 'clientes-title-section',
        attachTo: { element: '.elemento-clientes-3', on: 'top' as const },
        title: 'Informações dos clientes',
        text: 'Veja os dados principais dos seus clientes e acompanhe o status das contas fiadas.',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-clientes-3')
        }
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
                localStorage.setItem('tourGuiadoStepIndex', String(steps.findIndex(s => s.id === 'navbar-produtos')));
                window.location.href = '/gerenciamento/produtos';
              }
            }
          ],
        when: {
          show: () => waitForElement('.elemento-clientes-4')
        }
      },
      // --- RELATÓRIO ---
      {
        id: 'navbar-relatorio',
        attachTo: { element: '.btn-tour-relatorio', on: 'top' as const },
        title: 'Área de Relatórios',
        text: 'Aqui você pode gerar relatórios completos de vendas, estoque e muito mais. Clique para acessar!',
        buttons: [],
        when: {
          show: () => waitForElement('.btn-tour-relatorio')
        }
      },
      {
        id: 'relatorio-header',
        attachTo: { element: '.elemento-relatorio-1', on: 'top' as const },
        title: 'Gestão de Relatórios',
        text: 'Este é o cabeçalho da área de relatórios. Aqui você encontra ações rápidas para gerar e exportar dados.',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-relatorio-1')
        }
      },
      {
        id: 'relatorio-titulo',
        attachTo: { element: '.elemento-relatorio-2', on: 'top' as const },
        title: 'Informações do Relatório',
        text: 'Veja os filtros e opções para gerar o relatório que está sendo analisado.',
        buttons: [],
        when: {
          show: () => waitForElement('.elemento-relatorio-2')
        }
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
          }
        ],
        when: {
          show: () => waitForElement('.elemento-relatorio-3')
        }
      },
    ];

    steps.forEach((step) => tour.addStep(step));

    // Função para iniciar ou continuar o tour
    const startOrContinueTour = () => {
      const idx = savedStepIndex && !isNaN(Number(savedStepIndex)) ? Number(savedStepIndex) : 0;
      const step = steps[idx];
      if (step && step.attachTo && (step.attachTo as any).element) {
        waitForElement((step.attachTo as any).element, 7000)
          .then(() => {
            tour.show(idx);
          })
          .catch(() => {
            if (idx < steps.length - 1) {
              localStorage.setItem('tourGuiadoStepIndex', String(idx + 1));
              startOrContinueTour();
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
      localStorage.setItem('tourGuiadoFinalizado', 'true');
      localStorage.removeItem('tourGuiadoStepIndex');
    };
    tour.on('complete', finalizarTour);
    tour.on('cancel', finalizarTour);

    // Salva o índice do passo atual ao avançar
    const advanceStep = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
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
        const irRelatorioBtn = btns.find(b => b.textContent?.trim() === 'Ir para Relatório');
        if (irRelatorioBtn) {
          irRelatorioBtn.click();
        }
        return;
      }
      // Último passo de Vendas
      if (currentStep?.id === 'vendas-element3') {
        const btns = Array.from(document.querySelectorAll('.shepherd-button')) as HTMLButtonElement[];
        const irClientesBtn = btns.find(b => b.textContent?.trim() === 'Ir para Clientes');
        if (irClientesBtn) {
          irClientesBtn.click();
        }
        return;
      }
      // Último passo de Clientes
      if (currentStep?.id === 'clientes-actions') {
        const btns = Array.from(document.querySelectorAll('.shepherd-button')) as HTMLButtonElement[];
        const irProdutosBtn = btns.find(b => b.textContent?.trim() === 'Ir para Produtos');
        if (irProdutosBtn) {
          irProdutosBtn.click();
        }
        return;
      }
      if (currentStep) {
        const currentIndex = tour.steps.indexOf(currentStep);
        localStorage.setItem('tourGuiadoStepIndex', String(currentIndex));
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
      if (!localStorage.getItem('tourGuiadoFinalizado')) {
        setTimeout(() => startOrContinueTour(), 400);
      }
    };
    window.addEventListener('popstate', onPopState);

    return () => {
      document.body.removeEventListener('click', advanceStep);
      window.removeEventListener('popstate', onPopState);
      if (tour) tour.cancel();
    };
  }, []);

  return null;
}
