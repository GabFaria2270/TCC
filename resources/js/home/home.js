import '../app.js';

// =========================
// Animação das sections principais
// =========================
const sections = document.querySelectorAll('.section-home');
if (sections.length) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-home-true');
                    entry.target.classList.remove('section-home-false');
                } else {
                    entry.target.classList.remove('section-home-true');
                    entry.target.classList.add('section-home-false');
                }
            });
        },
        { threshold: 0.5 },
    );
    sections.forEach((section) => {
        section.classList.add('section-home-false');
        observer.observe(section);
    });
}

// =========================
// Animação dos cards principais
// =========================
const sectionsCardsPrincipais = document.querySelectorAll('.section-cards-principais');
if (sectionsCardsPrincipais.length) {
    const observerCardsPrincipais = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const cards = entry.target.querySelectorAll('.card-principal');
                if (entry.isIntersecting) {
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate-fade-in');
                            // Garantir que o card mantenha a opacidade após animação
                            card.addEventListener('animationend', () => {
                                card.style.opacity = '1';
                                card.style.transform = 'translateY(0)';
                            }, { once: true });
                        }, index * 150);
                    });
                }
            });
        },
        { threshold: 0.2 }
    );
    sectionsCardsPrincipais.forEach((section) => {
        observerCardsPrincipais.observe(section);
    });
}

// =========================
// Animação da seção de vantagens
// =========================
const sectionsVantagens = document.querySelectorAll('.section-vantagens');
if (sectionsVantagens.length) {
    const observerVantagens = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const vantagemCard = entry.target.querySelector('.vantagem-card');
                const listaItems = entry.target.querySelectorAll('.vantagem-lista li');
                
                if (entry.isIntersecting) {
                    vantagemCard?.classList.add('animate-slide-up');
                    
                    listaItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('animate-slide-right');
                        }, index * 100);
                    });
                }
            });
        },
        { threshold: 0.3 }
    );
    sectionsVantagens.forEach((section) => {
        observerVantagens.observe(section);
    });
}

// =========================
// Animação dos cards de valores
// =========================
const sectionsdocardV = document.querySelectorAll('.section-cardv');
if (sectionsdocardV.length) {
    const observercardV = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const cards = entry.target.querySelectorAll('.valor1');
                if (entry.isIntersecting) {
                    cards.forEach((card) => {
                        if (!card.classList.contains('animate-cards-right')) {
                            card.classList.add('animate-cards-right', 'animating');
                            card.addEventListener('animationend', function handler() {
                                card.classList.remove('animate-cards-right', 'animating');
                                card.removeEventListener('animationend', handler);
                            });
                        }
                    });
                    entry.target.classList.add('section-cardV-true');
                    entry.target.classList.remove('section-cardV-false');
                } else {
                    entry.target.classList.remove('section-cardV-true');
                    entry.target.classList.add('section-cardV-false');
                }
            });
        },
        { threshold: 0.1 },
    );
    sectionsdocardV.forEach((section) => {
        section.classList.add('section-cardV-false');
        observercardV.observe(section);
    });
}

// =========================
// Botão de navegação (scroll)
// =========================
const scrollToBtn = document.getElementById('scrollToBtn');
if (scrollToBtn) {
    let lastScrollY = window.scrollY;
    let debounceTimeout;
    function debounce(func, delay) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(func, delay);
    }
    window.addEventListener('scroll', () => {
        debounce(() => {
            const currentScrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            if (currentScrollY > 50 && currentScrollY + windowHeight < documentHeight - 10) {
                scrollToBtn.style.display = 'flex';
                scrollToBtn.style.opacity = '1';
            } else {
                scrollToBtn.style.opacity = '0';
                setTimeout(() => {
                    scrollToBtn.style.display = 'none';
                }, 300);
            }
            if (currentScrollY > lastScrollY) {
                scrollToBtn.innerHTML = '<i class="bi bi-arrow-down"></i>';
                scrollToBtn.onclick = () => {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                };
            } else {
                scrollToBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
                scrollToBtn.onclick = () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                };
            }
            lastScrollY = currentScrollY;
        }, 200);
    });
}

// =========================
// Animação do sobre
// =========================
const sectionsobre = document.querySelectorAll('.container-sobre');
if (sectionsobre.length) {
    const observersobre = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('focus-in-expand-fwd', 'section-home-true');
                    entry.target.classList.remove('section-home-false');
                } else {
                    entry.target.classList.remove('focus-in-expand-fwd', 'section-home-true');
                    entry.target.classList.add('section-home-false');
                }
            });
        },
        { threshold: 0.5 },
    );
    sectionsobre.forEach((section) => {
        section.classList.add('section-home-false');
        observersobre.observe(section);
    });
}

// =========================
// Scroll suave para a seção "sobre"
// =========================
const sobreLink = document.querySelector('a[href="#sobre"]');
if (sobreLink) {
    sobreLink.addEventListener('click', (event) => {
        event.preventDefault();
        const targetSection = document.querySelector('#sobre');
        if (targetSection) {
            const offset = -100;
            window.scrollTo({
                top: targetSection.offsetTop + offset,
                behavior: 'smooth',
            });
        }
    });
}

// =========================
// Animação do texto animado nas separações
// =========================
const sectionseparacao = document.querySelectorAll('.container-escrita');
if (sectionseparacao.length) {
    const observerseparacao = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const cards = entry.target.querySelectorAll('.escrita');
                if (entry.isIntersecting) {
                    cards.forEach((card) => {
                        if (!card.classList.contains('texto-animado')) {
                            card.classList.add('texto-animado', 'animating');
                            card.addEventListener('animationend', function handler() {
                                card.classList.remove('texto-animado', 'animating');
                                card.removeEventListener('animationend', handler);
                            });
                        }
                    });
                    entry.target.classList.add('section-home-true');
                    entry.target.classList.remove('section-home-false');
                } else {
                    entry.target.classList.remove('section-home-true');
                    entry.target.classList.add('section-home-false');
                }
            });
        },
        { threshold: 0.1 },
    );
    sectionseparacao.forEach((section) => {
        section.classList.add('section-home-false');
        observerseparacao.observe(section);
    });
}

// =========================
// NAVBAR MODERNA - Funcionalidade completa
// =========================
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.modern-navbar');
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!navbar) return;

    // Efeito de scroll na navbar
    let ticking = false;
    
    function updateNavbar() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick, { passive: true });
    updateNavbar();

    // Toggle do menu mobile
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', function() {
            navbarToggle.classList.toggle('active');
            navbarMenu.classList.toggle('active');
            
            // Prevenir scroll do body quando menu estiver aberto
            if (navbarMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    // Fechar menu mobile ao clicar em um link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navbarToggle && navbarMenu) {
                navbarToggle.classList.remove('active');
                navbarMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Fechar menu ao redimensionar para desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992 && navbarToggle && navbarMenu) {
            navbarToggle.classList.remove('active');
            navbarMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Smooth scroll para âncoras
    navLinks.forEach(link => {
        if (link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - 90;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });

    // Destacar link ativo baseado na seção visível
    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href="#${id}"]`);

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
});

// =========================
// Animação da seção sobre com contador
// =========================
const sobreSection = document.querySelector('.container-sobre');
if (sobreSection) {
    const statMinis = document.querySelectorAll('.stat-mini-number');
    let sobreAnimated = false;
    
    const observerSobre = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !sobreAnimated) {
                    sobreAnimated = true;
                    
                    // Animar números das mini estatísticas
                    statMinis.forEach((statNumber) => {
                        const finalCount = parseInt(statNumber.textContent);
                        const duration = 1500;
                        const steps = 50;
                        const increment = finalCount / steps;
                        let currentCount = 0;
                        
                        const timer = setInterval(() => {
                            currentCount += increment;
                            if (currentCount >= finalCount) {
                                statNumber.textContent = finalCount;
                                clearInterval(timer);
                            } else {
                                statNumber.textContent = Math.floor(currentCount);
                            }
                        }, duration / steps);
                    });
                    
                    entry.target.classList.add('focus-in-expand-fwd', 'section-home-true');
                    entry.target.classList.remove('section-home-false');
                } else if (!entry.isIntersecting) {
                    entry.target.classList.remove('focus-in-expand-fwd', 'section-home-true');
                    entry.target.classList.add('section-home-false');
                }
            });
        },
        { threshold: 0.3 }
    );
    
    sobreSection.classList.add('section-home-false');
    observerSobre.observe(sobreSection);
}

// =========================
// Melhorar o botão de navegação com mais inteligência
// =========================
const scrollBtn = document.getElementById('scrollToBtn');
if (scrollBtn) {
    let lastScrollY = window.scrollY;
    let scrollDirection = 'up';
    let isAtTop = true;
    let isAtBottom = false;
    
    function updateScrollButton() {
        const currentScrollY = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        
        // Determinar posição na página
        isAtTop = currentScrollY < 100;
        isAtBottom = currentScrollY + windowHeight >= documentHeight - 100;
        
        // Determinar direção do scroll
        if (Math.abs(currentScrollY - lastScrollY) > 10) {
            scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
            lastScrollY = currentScrollY;
        }
        
        // Mostrar/ocultar botão
        if (currentScrollY > 300) {
            scrollBtn.style.display = 'flex';
            
            // Adicionar classe de pulso quando aparecer pela primeira vez
            if (!scrollBtn.classList.contains('pulse')) {
                scrollBtn.classList.add('pulse');
                setTimeout(() => scrollBtn.classList.remove('pulse'), 4000);
            }
        } else {
            scrollBtn.style.display = 'none';
        }
        
        // Configurar ação e ícone do botão
        if (isAtBottom) {
            scrollBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
            scrollBtn.onclick = () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        } else if (scrollDirection === 'down' && currentScrollY > 800) {
            scrollBtn.innerHTML = '<i class="bi bi-arrow-down"></i>';
            scrollBtn.onclick = () => {
                window.scrollTo({ 
                    top: documentHeight, 
                    behavior: 'smooth' 
                });
            };
        } else {
            scrollBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
            scrollBtn.onclick = () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        }
    }
    
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateScrollButton();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    // Chamada inicial
    updateScrollButton();
}

// =========================
// NOVAS SEÇÕES - Animações e Funcionalidades
// =========================

// Contador para seção de estatísticas
const statsSection = document.querySelector('.section-stats');
if (statsSection) {
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;
    
    const observerStats = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !statsAnimated) {
                    statsAnimated = true;
                    
                    // Animar os cards primeiro
                    const statItems = entry.target.querySelectorAll('.stat-item');
                    statItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('animate');
                        }, index * 100);
                    });
                    
                    // Depois animar os números
                    setTimeout(() => {
                        statNumbers.forEach((statElement) => {
                            const finalCount = parseFloat(statElement.dataset.count);
                            const isDecimal = finalCount % 1 !== 0;
                            const duration = 2000;
                            const steps = 60;
                            const increment = finalCount / steps;
                            let currentCount = 0;
                            
                            const timer = setInterval(() => {
                                currentCount += increment;
                                if (currentCount >= finalCount) {
                                    statElement.textContent = isDecimal ? finalCount.toFixed(1) : finalCount;
                                    clearInterval(timer);
                                } else {
                                    const displayCount = isDecimal ? currentCount.toFixed(1) : Math.floor(currentCount);
                                    statElement.textContent = displayCount;
                                }
                            }, duration / steps);
                        });
                    }, 300);
                }
            });
        },
        { threshold: 0.3 }
    );
    
    observerStats.observe(statsSection);
}

// Animação dos depoimentos
const testimonialsSection = document.querySelector('.section-testimonials');
if (testimonialsSection) {
    const observerTestimonials = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const testimonialCards = entry.target.querySelectorAll('.testimonial-card');
                    testimonialCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate');
                        }, index * 150);
                    });
                }
            });
        },
        { threshold: 0.2 }
    );
    
    observerTestimonials.observe(testimonialsSection);
}

// Animação dos serviços
const servicesSection = document.querySelector('.section-services');
if (servicesSection) {
    const observerServices = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const serviceItems = entry.target.querySelectorAll('.service-item');
                    serviceItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('animate');
                        }, index * 100);
                    });
                }
            });
        },
        { threshold: 0.2 }
    );
    
    observerServices.observe(servicesSection);
}

// Animação da seção CTA
const ctaSection = document.querySelector('.section-cta');
if (ctaSection) {
    const observerCTA = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const ctaContent = entry.target.querySelector('.cta-content');
                    const ctaImage = entry.target.querySelector('.cta-image');
                    
                    if (ctaContent) {
                        ctaContent.style.opacity = '0';
                        ctaContent.style.transform = 'translateX(-50px)';
                        ctaContent.style.transition = 'all 0.8s ease';
                        
                        setTimeout(() => {
                            ctaContent.style.opacity = '1';
                            ctaContent.style.transform = 'translateX(0)';
                        }, 200);
                    }
                    
                    if (ctaImage) {
                        ctaImage.style.opacity = '0';
                        ctaImage.style.transform = 'translateX(50px) scale(0.8)';
                        ctaImage.style.transition = 'all 0.8s ease';
                        
                        setTimeout(() => {
                            ctaImage.style.opacity = '1';
                            ctaImage.style.transform = 'translateX(0) scale(1)';
                        }, 400);
                    }
                }
            });
        },
        { threshold: 0.3 }
    );
    
    observerCTA.observe(ctaSection);
}

// Melhorar efeito hover dos botões CTA
const ctaButtons = document.querySelectorAll('.btn-cta');
ctaButtons.forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.05)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// =========================
// Otimizações de Performance
// =========================

// Lazy loading para imagens
const images = document.querySelectorAll('img[loading="lazy"]');
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Debounce para redimensionamento da janela
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recalcular posições se necessário
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            updateActiveLink();
        }
    }, 250);
});

// Preload de imagens críticas
function preloadCriticalImages() {
    const criticalImages = [
        '{{ asset("img/C1.jpg") }}',
        '{{ asset("img/cadr1.jpg") }}',
        '{{ asset("img/mulher da tela inicial.png") }}',
        '{{ asset("img/testedeimg.jpeg") }}'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// Executar preload quando DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadCriticalImages);
} else {
    preloadCriticalImages();
}
