import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import React, { useEffect } from 'react';

const TourGuideShepherd: React.FC = () => {
  // Helper para aguardar elemento
  function waitForElement(selector: string, timeout = 5000) {
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

  // Só executa o tour se não estiver finalizado
  const tourFinalizado = localStorage.getItem('tourGuiadoFinalizado') === 'true';
  if (tourFinalizado) return null;

  const steps = [
    {
      id: 'navbar-home',
      attachTo: { element: '.btn-tour-inicio', on: 'bottom' as any },
      title: 'Bem-vindo ao sistema!',
      text: 'Este é o menu principal. Por aqui você acessa todas as Informações do sistema. Vamos conhecer juntos cada funcionalidade!',
      buttons: [],
      when: {
        show: function() {
          if (window.location.pathname !== '/gerenciamento') {
            window.location.href = '/gerenciamento';
            return new Promise(resolve => setTimeout(resolve, 800));
          }
          return waitForElement('.btn-tour-inicio');
        }
      }
    },
    {
      id: 'a11y-dec',
      attachTo: { element: '.elemento-a11y-dec', on: 'bottom' as any },
      title: 'Diminuir tamanho do texto',
      text: 'Se as letras estiverem grandes demais, clique aqui para diminuir e deixar a leitura mais confortável para você.',
      buttons: [],
      when: {
        show: function() { return waitForElement('.elemento-a11y-dec'); }
      }
    },
    {
      id: 'a11y-inc',
      attachTo: { element: '.elemento-a11y-inc', on: 'bottom' as any },
      title: 'Aumentar tamanho do texto',
      text: 'Prefere letras maiores? Clique aqui para aumentar o tamanho dos textos e facilitar a leitura.',
      buttons: [],
      when: {
        show: function() { return waitForElement('.elemento-a11y-inc'); }
      }
    },
    {
      id: 'a11y-contrast',
      attachTo: { element: '.elemento-a11y-contrast', on: 'bottom' as any },
      title: 'Modo escuro e claro',
      text: 'Aqui você pode alternar entre modo claro e escuro. Escolha o que for mais confortável para seus olhos!',
      buttons: [],
      when: {
        show: function() { return waitForElement('.elemento-a11y-contrast'); }
      }
    },
    {
      id: 'home-comousar',
      attachTo: { element: '.elemento-home-2', on: 'top' as any },
      title: 'Como usar o sistema',
      text: 'Aqui você encontra instruções rápidas para registrar vendas, cadastrar produtos e gerenciar clientes. Tudo de forma simples!',
      buttons: [],
      when: {
        show: function() { return waitForElement('.elemento-home-2'); }
      }
    },
    {
      id: 'home-resumo',
      attachTo: { element: '.elemento-home-resumo', on: 'top' as any },
      title: 'Resumo do dia',
      text: 'Aqui você acompanha o resumo das vendas e do estoque do dia. Ótimo para ter uma visão rápida do seu negócio!',
      buttons: [],
      when: {
        show: function() { return waitForElement('.elemento-home-resumo'); }
      }
    },
    {
      id: 'home-vendas',
      attachTo: { element: '.elemento-home-vendas', on: 'top' as any },
      title: 'Vendas do dia',
      text: 'Veja quantas vendas foram feitas hoje e o valor total. Assim você acompanha o movimento da sua loja!',
      buttons: [],
      when: {
        show: function() { return waitForElement('.elemento-home-vendas'); }
      }
    },
    {
      id: 'home-estoque',
      attachTo: { element: '.elemento-home-estoque', on: 'top' as any },
      title: 'Alerta de estoque baixo',
      text: 'Fique atento aos produtos que estão com estoque baixo. Assim você evita faltar mercadoria para seus clientes!',
      buttons: [],
      when: {
        show: function() { return waitForElement('.elemento-home-estoque'); }
      }
    },
    {
      id: 'home-listas',
      attachTo: { element: '.elemento-home-listas', on: 'top' as any },
      title: 'Painel de listas',
      text: 'Este painel mostra as últimas vendas e os fiados em aberto, tudo em um só lugar!',
      buttons: [],
      when: {
        show: function() { return waitForElement('.elemento-home-listas'); }
      }
    },
    {
      id: 'home-ultimasvendas',
      attachTo: { element: '.elemento-home-ultimasvendas', on: 'top' as any },
      title: 'Últimas vendas realizadas',
      text: 'Aqui você pode conferir as vendas mais recentes feitas na sua loja.',
      buttons: [],
      when: {
        show: function() { return waitForElement('.elemento-home-ultimasvendas'); }
      }
    },
    {
      id: 'home-fiado',
      attachTo: { element: '.elemento-home-fiado', on: 'top' as any },
      title: 'Fiado em aberto',
      text: 'Veja quais clientes estão com fiado em aberto e o valor total. Controle fácil das dívidas!',
      buttons: [],
      when: {
        show: function() { return waitForElement('.elemento-home-fiado'); }
      }
    },
    {
      id: 'home-mercearia',
      attachTo: { element: '.elemento-home-mercearia', on: 'top' as any },
      title: 'Informações da mercearia',
      text: `Aqui estão os dados da sua mercearia e do responsável. Mantenha sempre atualizado!
      <a id="btn-tour-vendas-invisivel" href="/gerenciamento/vendas" style="display:none">Ir para Vendas</a>`,
      buttons: [],
      when: {
        show: function() { return waitForElement('.elemento-home-mercearia'); }
      }
    },
    {
      id: 'vendas-header',
      attachTo: { element: '.elemento-vendas-header', on: 'bottom' },
      title: 'Página de Vendas',
      text: 'Aqui você gerencia todas as vendas realizadas e pode iniciar uma nova venda.',
      buttons: [],
      when: { show: function() { return waitForElement('.elemento-vendas-header'); } }
    },
    {
      id: 'vendas-abas',
      attachTo: { element: '.elemento-vendas-abas', on: 'bottom' },
      title: 'Abas de navegação',
      text: 'Alterne entre o histórico de vendas e o PDV (Nova Venda) por aqui.',
      buttons: [],
      when: { show: function() { return waitForElement('.elemento-vendas-abas'); } }
    },
    {
      id: 'vendas-lista',
      attachTo: { element: '.elemento-vendas-lista', on: 'top' },
      title: 'Histórico de Vendas',
      text: 'Veja todas as vendas já realizadas, filtre por cliente ou status e acesse detalhes.',
      buttons: [],
      when: { show: function() { return waitForElement('.elemento-vendas-lista'); } }
    },
    {
      id: 'vendas-aba-nova',
      attachTo: { element: '.elemento-vendas-aba-nova', on: 'bottom' },
      title: 'Nova Venda',
      text: 'Clique aqui para iniciar uma nova venda no PDV.',
      buttons: [],
      when: { show: function() { return waitForElement('.elemento-vendas-aba-nova'); } }
    },
    {
      id: 'vendas-pdv',
      attachTo: { element: '.elemento-vendas-pdv', on: 'top' },
      title: 'PDV - Ponto de Venda',
      text: 'Aqui você realiza uma nova venda, adicionando produtos ao carrinho e preenchendo os dados do cliente.',
      buttons: [],
      when: { show: function() { return waitForElement('.elemento-vendas-pdv'); } }
    },
    {
      id: 'vendas-produtos',
      attachTo: { element: '.elemento-vendas-produtos', on: 'top' },
      title: 'Busca e seleção de produtos',
      text: 'Pesquise e selecione os produtos que o cliente deseja comprar.',
      buttons: [],
      when: { show: function() { return waitForElement('.elemento-vendas-produtos'); } }
    },
    {
      id: 'vendas-carrinho',
      attachTo: { element: '.elemento-vendas-carrinho', on: 'top' },
      title: 'Carrinho de compras',
      text: 'Veja os produtos selecionados, ajuste quantidades e remova itens se necessário.',
      buttons: [],
      when: { show: function() { return waitForElement('.elemento-vendas-carrinho'); } }
    },
    {
      id: 'vendas-finalizar',
      attachTo: { element: '.elemento-vendas-finalizar', on: 'top' },
      title: 'Finalizar venda',
      text: 'Clique aqui para finalizar a venda e gerar o comprovante.',
      buttons: [],
      when: { show: function() { return waitForElement('.elemento-vendas-finalizar'); } }
    },
    {
      id: 'vendas-comprovante',
      attachTo: { element: '.elemento-vendas-comprovante', on: 'top' },
      title: 'Comprovante de venda',
      text: 'Aqui está o comprovante da venda realizada. Você pode imprimir ou enviar por e-mail.',
      buttons: [],
      when: { show: function() { return waitForElement('.elemento-vendas-comprovante'); } }
    },
    {
      id: 'vendas-retorno',
      attachTo: { element: '.elemento-vendas-retorno', on: 'top' },
      title: 'Retornar ao histórico',
      text: 'Após finalizar uma venda, clique aqui para voltar ao histórico de vendas.',
      buttons: [],
      when: { show: function() { return waitForElement('.elemento-vendas-retorno'); } }
    },
    {
      id: 'vendas-config',
      attachTo: { element: '.elemento-vendas-config', on: 'top' },
      title: 'Configurações de vendas',
      text: 'Ajuste as configurações do PDV e das vendas aqui.',
      buttons: [],
      when: { show: function() { return waitForElement('.elemento-vendas-config'); } }
    },
    {
      id: 'vendas-sair',
      attachTo: { element: '.elemento-vendas-sair', on: 'top' },
      title: 'Sair do PDV',
      text: 'Clique aqui para sair do PDV e retornar ao menu principal.',
      buttons: [],
      when: { show: function() { return waitForElement('.elemento-vendas-sair'); } }
    },
    // ...adicione os outros steps conforme sua necessidade...
  ];

  useEffect(() => {
    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        classes: 'shepherd-theme-arrows tour-glass rainbow-card',
        scrollTo: true,
        cancelIcon: { enabled: true },
        canClickTarget: false,
      },
      useModalOverlay: true,
    });

    steps.forEach((step) => tour.addStep(step as any));

    setTimeout(() => {
      const savedStepIndex = localStorage.getItem('tourGuiadoStepIndex');
      if (savedStepIndex && !isNaN(Number(savedStepIndex))) {
        tour.show(Number(savedStepIndex));
      } else {
        tour.start();
      }
    }, 600);

    // Função para avançar ao clicar em qualquer lugar
    const advanceStep = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const currentStep = tour.getCurrentStep();
      if (target.closest('.shepherd-button')) {
        if (target.textContent?.trim() === 'Cancelar') return;
      }
      if (currentStep) {
        const currentIndex = tour.steps.indexOf(currentStep);
        localStorage.setItem('tourGuiadoStepIndex', String(currentIndex));
        // Se for o último step da Home, faz redirecionamento direto
        if (currentStep.id === 'home-mercearia') {
          // Descobre o índice do primeiro step da Vendas
          const nextStepIndex = tour.steps.findIndex(s => s.id === 'vendas-header');
          localStorage.setItem('tourGuiadoStepIndex', String(nextStepIndex >= 0 ? nextStepIndex : 0));
          window.location.href = '/gerenciamento/vendas';
          return;
        }
        if (currentIndex < tour.steps.length - 1) {
          tour.next();
        } else {
          tour.complete();
        }
      }
    };

    document.body.addEventListener('click', advanceStep);

    // Marca como finalizado ao completar ou cancelar
    const finalizarTour = () => {
      localStorage.setItem('tourGuiadoFinalizado', 'true');
      localStorage.removeItem('tourGuiadoStepIndex');
    };
    tour.on('complete', finalizarTour);
    tour.on('cancel', finalizarTour);

    return () => {
      document.body.removeEventListener('click', advanceStep);
      tour.cancel();
    };
  }, []);

  return null;
};

export default TourGuideShepherd;
