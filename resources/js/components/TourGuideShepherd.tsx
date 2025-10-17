import React, { useEffect } from 'react';
import Shepherd from 'shepherd.js';
import type { Tour as ShepherdTour, StepOptions } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export default function TourGuideShepherd() {
  useEffect(() => {
    // Só inicia o tour se não estiver finalizado
    if (localStorage.getItem('tourGuiadoFinalizado')) return;

    const tour: ShepherdTour = new Shepherd.Tour({
      defaultStepOptions: {
        classes: 'shepherd-theme-arrows',
        scrollTo: true,
        cancelIcon: { enabled: true },
        canClickTarget: false,
      },
      useModalOverlay: true,
    });

    // Função para avançar ao clicar em qualquer lugar
    const advanceStep = () => {
      if (tour.getCurrentStep()) {
        if (tour.steps.indexOf(tour.getCurrentStep()!) < tour.steps.length - 1) {
          tour.next();
        } else {
          tour.complete();
        }
      }
    };

    document.body.addEventListener('click', advanceStep);

    const steps: StepOptions[] = [
      {
        id: 'inicio',
        attachTo: { element: '.btn-tour-inicio', on: 'bottom' as const },
        title: 'Painel Inicial',
        text: 'Aqui você acessa o início do sistema, onde verá um resumo das funções principais.',
        buttons: [],
      },
      {
        id: 'vendas',
        attachTo: { element: '.btn-tour-vendas', on: 'bottom' as const },
        title: 'Vendas',
        text: 'Clique aqui para registrar novas vendas ou consultar vendas anteriores.',
        buttons: [],
      },
      {
        id: 'clientes',
        attachTo: { element: '.btn-tour-clientes', on: 'bottom' as const },
        title: 'Clientes',
        text: 'Gerencie seus clientes, veja dados e histórico.',
        buttons: [],
      },
      {
        id: 'produtos',
        attachTo: { element: '.btn-tour-produtos', on: 'bottom' as const },
        title: 'Produtos',
        text: 'Veja, edite ou cadastre produtos. Mantenha seu estoque sempre atualizado.',
        buttons: [],
      },
      {
        id: 'acessibilidade',
        attachTo: { element: '#a11y-contrast', on: 'bottom' as const },
        title: 'Acessibilidade',
        text: 'Altere entre fundo claro e escuro para maior conforto visual.',
        buttons: [],
      },
    ];

    steps.forEach((step) => tour.addStep(step));
    tour.start();

    // Marca como finalizado ao completar ou cancelar
    const finalizarTour = () => {
      localStorage.setItem('tourGuiadoFinalizado', 'true');
    };
    tour.on('complete', finalizarTour);
    tour.on('cancel', finalizarTour);

    return () => {
      document.body.removeEventListener('click', advanceStep);
      tour.cancel();
    };
  }, []);

  return null;
}
