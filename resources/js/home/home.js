import '../app.js';

// =========================
// Animação das sections principais
// =========================
const sections = document.querySelectorAll('.section-home');
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

// =========================
// Animação dos cards
// =========================
const sectionsdocard = document.querySelectorAll('.section-card');
const observercard = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            const cards = entry.target.querySelectorAll('.row');
            if (entry.isIntersecting) {
                cards.forEach((card) => {
                    card.classList.add('animate-cards-right');
                });
                entry.target.classList.add('section-card-true');
                entry.target.classList.remove('section-card-false');
            } else {
                cards.forEach((card) => {
                    card.classList.remove('animate-cards-right');
                });
                entry.target.classList.remove('section-card-true');
                entry.target.classList.add('section-card-false');
            }
        });
    },
    { threshold: 0.2 },
);
sectionsdocard.forEach((section) => {
    section.classList.add('section-card-false');
    observercard.observe(section);
});

// =========================
// Animação dos cards de valores
// =========================
const sectionsdocardV = document.querySelectorAll('.section-cardv');
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

// =========================
// Botão de navegação (scroll)
// =========================
const scrollToBtn = document.getElementById('scrollToBtn');
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

// =========================
// Animação do sobre
// =========================
const sectionsobre = document.querySelectorAll('.container-sobre');
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

// =========================
// Scroll suave para a seção "sobre"
// =========================
document.querySelector('a[href="#sobre"]').addEventListener('click', (event) => {
    event.preventDefault();
    const targetSection = document.querySelector('#sobre');
    const offset = -100;
    window.scrollTo({
        top: targetSection.offsetTop + offset,
        behavior: 'smooth',
    });
});

// =========================
// Animação do texto animado nas separações
// =========================
const sectionseparação = document.querySelectorAll('.container-escrita');
const observerseparação = new IntersectionObserver(
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
sectionseparação.forEach((section) => {
    section.classList.add('section-home-false');
    observerseparação.observe(section);
});
