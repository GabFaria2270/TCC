import '../app.js';

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
    {
        threshold: 0.5,
    },
);

sections.forEach((section) => {
    section.classList.add('section-home-false'); // Começa invisível
    observer.observe(section);
});

const sectionsdocard = document.querySelectorAll('.section-card');

const observercard = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            const cards = entry.target.querySelectorAll('.row');

            if (entry.isIntersecting) {
                console.log('Seção visível:', entry.target); // Log para depuração
                cards.forEach((card) => {
                    card.classList.add('animate-cards-right'); // Animação de entrada
                });
                entry.target.classList.add('section-card-true');
                entry.target.classList.remove('section-card-false');
            } else {
                console.log('Seção não visível:', entry.target); // Log para depuração
                cards.forEach((card) => {
                    card.classList.remove('animate-cards-right'); // Remove a animação
                });
                entry.target.classList.remove('section-card-true');
                entry.target.classList.add('section-card-false');
            }
        });
    },
    {
        threshold: 0.2,
    },
);

sectionsdocard.forEach((section) => {
    section.classList.add('section-card-false'); // Começa invisível
    observercard.observe(section);
});
// função para os cards do valores
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
    {
        threshold: 0.1,
    },
);

sectionsdocardV.forEach((section) => {
    section.classList.add('section-cardV-false'); // Começa invisível
    observercardV.observe(section);
});
// Fim função para os cards do valores

// Função do botão de navegação
const scrollToBtn = document.getElementById('scrollToBtn');
let lastScrollY = window.scrollY;
let debounceTimeout;

// Função debounce para limitar a frequência de execução
function debounce(func, delay) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(func, delay);
}

// Detecta o scroll
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
            // Scroll para baixo
            scrollToBtn.innerHTML = '<i class="bi bi-arrow-down"></i>';
            scrollToBtn.onclick = () => {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth',
                });
            };
        } else {
            // Scroll para cima
            scrollToBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
            scrollToBtn.onclick = () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                });
            };
        }

        lastScrollY = currentScrollY;
    }, 200);
});
// Fim da Função do botão de navegação

//  Função do sobre 
const sectionsobre = document.querySelectorAll('.section-sobre');

const observersobre = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('focus-in-expand-fwd'); // Aplica a animação
                entry.target.classList.add('section-home-true');
                entry.target.classList.remove('section-home-false');
            } else {
                entry.target.classList.remove('focus-in-expand-fwd'); // Remove a animação
                entry.target.classList.remove('section-home-true');
                entry.target.classList.add('section-home-false');
            }
        });
    },
    {
        threshold: 0.5, // Define quando a animação deve ser ativada (50% visível)
    },
);

sectionsobre.forEach((section) => {
    section.classList.add('section-home-false'); // Começa invisível
    observersobre.observe(section);
});
// Fim da Função sobre