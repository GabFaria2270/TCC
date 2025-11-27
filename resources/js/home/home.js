import '../app.js';

/* =========================
   SISTEMA OTIMIZADO DE ANIMAÇÕES - HOME PAGE
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
        this.init();
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

    // Observer único para todas as seções (exceto carrossel)
    setupObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const element = entry.target;
                    const isEntering = entry.isIntersecting;

                    const rect = element.getBoundingClientRect();
                    if (rect.top < 100 && element.classList.contains('section-home')) {
                        return;
                    }

                    element.classList.toggle('section-home-true', isEntering);
                    element.classList.toggle('section-home-false', !isEntering);

                    if (isEntering && element.classList.contains('section-stats') && !element.dataset.animated) {
                        element.dataset.animated = 'true';
                        this.animateNumbers(element.querySelectorAll('.stat-number'));
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -10% 0px',
            },
        );

        const sections = document.querySelectorAll(
            '.section-cards-principais, .section-vantagens, .section-cardv, .container-sobre, .section-stats, .section-testimonials, .section-services, .section-cta',
        );
        sections.forEach((section, index) => {
            setTimeout(() => {
                this.observer.observe(section);
            }, index * 10);
        });
    }

    forceVisibility() {
        const criticalSections = ['.section-vantagens', '.section-stats', '.section-testimonials', '.section-services', '.section-cta'];

        criticalSections.forEach((selector) => {
            const section = document.querySelector(selector);
            if (section) {
                section.style.cssText = `
                    opacity: 1 !important;
                    visibility: visible !important;
                    display: block !important;
                    transform: translateY(0) !important;
                `;
            }
        });
    }

    animateNumbers(elements) {
        elements.forEach((element) => {
            if (element.dataset.static === 'true') {
                return;
            }
            const finalCount = parseFloat(element.dataset.count || element.textContent);
            const isDecimal = finalCount % 1 !== 0;
            let currentCount = 0;
            const increment = finalCount / 30;

            const animate = () => {
                if (currentCount < finalCount) {
                    currentCount += increment;
                    const displayCount = isDecimal ? Math.min(currentCount, finalCount).toFixed(1) : Math.floor(Math.min(currentCount, finalCount));
                    element.textContent = displayCount;
                    requestAnimationFrame(animate);
                } else {
                    element.textContent = isDecimal ? finalCount.toFixed(1) : finalCount;
                }
            };
            animate();
        });
    }

    setupScrollHandler() {
        let ticking = false;

        const scrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    updateScroll() {
        const scrollY = window.scrollY;
        const scrollBtn = document.getElementById('scrollToBtn');
        this.toggleNavbarState(scrollY);

        const scrollDiff = Math.abs(scrollY - this.lastScrollY);
        if (scrollDiff > 10) {
            if (scrollY > this.lastScrollY && scrollY > 100) {
                this.scrollDirection = 'down';
            } else if (scrollY < this.lastScrollY) {
                this.scrollDirection = 'up';
            }
            this.lastScrollY = scrollY;
        }

        // Scroll button baseado na direção do scroll
        if (scrollBtn) {
            if (scrollY > 300) {
                scrollBtn.style.display = 'flex';

                if (this.scrollDirection === 'down') {
                    scrollBtn.innerHTML = '<i class="bi bi-arrow-down"></i>';
                    scrollBtn.setAttribute('data-direction', 'down');
                } else {
                    scrollBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
                    scrollBtn.setAttribute('data-direction', 'up');
                }

                scrollBtn.onclick = () => {
                    const direction = scrollBtn.getAttribute('data-direction');
                    const documentHeight = document.documentElement.scrollHeight;

                    if (direction === 'down') {
                        window.scrollTo({ top: documentHeight, behavior: 'smooth' });
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                };
            } else {
                scrollBtn.style.display = 'none';
            }
        }
    }

    updateMeasurements() {
        const rootStyles = getComputedStyle(document.documentElement);
        const navVar = rootStyles.getPropertyValue('--nav-height');
        const parsedNavHeight = parseInt(navVar, 10);
        this.navHeight = Number.isNaN(parsedNavHeight) ? 70 : parsedNavHeight;
        this.heroHeight = this.heroSection ? Math.max(this.heroSection.getBoundingClientRect().height, window.innerHeight) : window.innerHeight;
    }

    toggleNavbarState(scrollY) {
        if (!this.navbar) return;

        if (!this.heroSection) {
            this.navbar.classList.remove('navbar-transparent');
            this.navbar.classList.add('navbar-solid');
            return;
        }

        const threshold = Math.max(this.heroHeight - this.navHeight, this.navHeight);
        if (scrollY >= threshold) {
            this.navbar.classList.remove('navbar-transparent');
            this.navbar.classList.add('navbar-solid');
        } else {
            this.navbar.classList.add('navbar-transparent');
            this.navbar.classList.remove('navbar-solid');
        }
    }

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
    const closeBtn = document.getElementById('navbarClose');
    const overlay = document.getElementById('navbarOverlay');

    if (toggle && menu) {
        const openMenu = () => {
            toggle.classList.add('active');
            menu.classList.add('active');
            menu.setAttribute('aria-hidden', 'false');
            document.body.classList.add('nav-open');
            if (overlay) {
                overlay.classList.add('active');
                overlay.setAttribute('aria-hidden', 'false');
            }
        };

        const closeMenu = () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            menu.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('nav-open');
            if (overlay) {
                overlay.classList.remove('active');
                overlay.setAttribute('aria-hidden', 'true');
            }
        };

        toggle.addEventListener('click', () => {
            if (menu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', closeMenu);
        }

        menu.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        // Fecha com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });

        // Fecha ao clicar fora do menu (overlay)
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                // Só fecha se clicar diretamente no overlay, não em elementos filhos
                if (e.target === overlay && menu.classList.contains('active')) {
                    closeMenu();
                }
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Fallback para viewport height em mobile (iOS/Android): define --vh em px
    const setVh = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);

    new AnimationManager();
    setupSmoothScroll();
    setupNavbar();

    window.forceVisibility = (selector) => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.cssText = `
                opacity: 1 !important;
                visibility: visible !important;
                display: block !important;
                transform: translateY(0) !important;
            `;
        }
    };
});
