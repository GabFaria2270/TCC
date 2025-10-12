// Importa a dependência de que precisa explicitamente no topo
import LoaderSystem from '../reultilizaveis/loader-system.js';

/* =========================
   LÓGICA DA PÁGINA INICIAL
========================= */

class AnimationManager {
    constructor() {
        this.observer = null;
        this.lastScrollY = 0;
        this.scrollDirection = 'down';
        this.navbar = document.querySelector('.modern-navbar');
        this.heroSection = document.querySelector('.section-home.main-content');
        this.navHeight = 70;
        this.heroHeight = window.innerHeight;
        // A inicialização é chamada externamente agora
    }

    init() {
        this.setupObserver();
        this.setupScrollHandler();
        this.forceVisibility();
        this.updateMeasurements();
        this.updateScroll();
        window.addEventListener('resize', () => {
            this.updateMeasurements();
            this.updateScroll();
        });
    }

    // ... (todos os outros métodos da sua classe AnimationManager, como setupObserver, animateNumbers, etc., continuam aqui, sem alterações)
    // ... cole o resto dos seus métodos aqui ...
    
    destroy() {
        if (this.observer) this.observer.disconnect();
    }
}

const setupSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(link.getAttribute('href').substring(1));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
};

const setupNavbar = () => {
    const toggle = document.getElementById('navbarToggle');
    const menu = document.getElementById('navbarMenu');

    if (toggle && menu) {
        const closeMenu = () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
        };

        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            menu.classList.toggle('active');
        });

        menu.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });

        document.addEventListener('click', (e) => {
            const withinToggle = toggle.contains(e.target);
            const withinMenu = menu.contains(e.target);
            if (!withinToggle && !withinMenu) closeMenu();
        });
    }
};

// Fallback para viewport height em mobile (iOS/Android)
const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// A "função principal" que inicializa tudo para a página inicial
function initHomePage() {
    const loaderSystem = new LoaderSystem();
    loaderSystem.show();

    // Inicializa todos os componentes da página
    const animationManager = new AnimationManager();
    animationManager.init();
    
    setupSmoothScroll();
    setupNavbar();
    setVh();
    window.addEventListener('resize', setVh);

    // Esconde o loader no final, garantindo que tudo foi renderizado
    // Usamos um pequeno timeout para dar tempo ao navegador de pintar a tela
    setTimeout(() => {
        loaderSystem.hide();
    }, 100); 
}


// **A MUDANÇA PRINCIPAL:**
// Em vez de executar o código globalmente, esperamos pelo DOM e chamamos a nossa função principal.
document.addEventListener('DOMContentLoaded', initHomePage);

// Nota: Não precisamos de `export` aqui, pois este ficheiro é um "ponto de entrada" 
// que se auto-executa, e não uma biblioteca para ser importada por outros.