// =========================
// CARROSSEL CUSTOMIZADO (SEM BOOTSTRAP JS)
// =========================
class CustomCarousel {
    constructor(element) {
        this.carousel = element;
        this.items = this.carousel.querySelectorAll('.carousel-item');
        this.indicators = this.carousel.querySelectorAll('.carousel-indicators [data-bs-target]');
        this.prevButton = this.carousel.querySelector('.carousel-control-prev');
        this.nextButton = this.carousel.querySelector('.carousel-control-next');
        
        this.currentIndex = 0;
        this.isAnimating = false;
        this.autoSlideInterval = null;
        
        this.init();
    }
    
    init() {
        // Configurar indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
            if (index === 0) indicator.classList.add('active');
        });
        
        // Configurar controles
        this.prevButton?.addEventListener('click', () => this.previousSlide());
        this.nextButton?.addEventListener('click', () => this.nextSlide());
        
        // Auto-slide
        this.startAutoSlide();
        
        // Pausar auto-slide ao passar o mouse
        this.carousel.addEventListener('mouseenter', () => this.stopAutoSlide());
        this.carousel.addEventListener('mouseleave', () => this.startAutoSlide());
        
        // Suporte a touch/swipe
        this.addTouchSupport();
        
        // Pausar durante mudanças de visibilidade
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoSlide();
            } else {
                this.startAutoSlide();
            }
        });
    }
    
    goToSlide(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        
        this.isAnimating = true;
        
        // Remover classes ativas
        this.items[this.currentIndex].classList.remove('active');
        this.indicators[this.currentIndex]?.classList.remove('active');
        
        // Determinar direção
        const direction = index > this.currentIndex ? 'next' : 'prev';
        
        // Aplicar classes de transição
        if (direction === 'next') {
            this.items[index].classList.add('carousel-item-next');
            this.items[this.currentIndex].classList.add('carousel-item-start');
        } else {
            this.items[index].classList.add('carousel-item-prev');
            this.items[this.currentIndex].classList.add('carousel-item-end');
        }
        
        // Forçar reflow
        this.carousel.offsetHeight;
        
        // Aplicar transformações
        if (direction === 'next') {
            this.items[index].classList.remove('carousel-item-next');
            this.items[this.currentIndex].classList.remove('carousel-item-start');
        } else {
            this.items[index].classList.remove('carousel-item-prev');
            this.items[this.currentIndex].classList.remove('carousel-item-end');
        }
        
        // Ativar novo slide
        setTimeout(() => {
            this.items[index].classList.add('active');
            this.indicators[index]?.classList.add('active');
            this.currentIndex = index;
            this.isAnimating = false;
        }, 50);
    }
    
    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.items.length;
        this.goToSlide(nextIndex);
    }
    
    previousSlide() {
        const prevIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.goToSlide(prevIndex);
    }
    
    startAutoSlide() {
        if (this.autoSlideInterval) return;
        
        this.autoSlideInterval = setInterval(() => {
            if (!this.isAnimating && !document.hidden) {
                this.nextSlide();
            }
        }, 5000); // 5 segundos
    }
    
    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
    
    addTouchSupport() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        const handleStart = (e) => {
            isDragging = true;
            startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            this.carousel.style.cursor = 'grabbing';
        };
        
        const handleMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        };
        
        const handleEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            this.carousel.style.cursor = 'grab';
            
            const deltaX = currentX - startX;
            const threshold = 50;
            
            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
            }
        };
        
        // Touch events
        this.carousel.addEventListener('touchstart', handleStart, { passive: true });
        this.carousel.addEventListener('touchmove', handleMove, { passive: false });
        this.carousel.addEventListener('touchend', handleEnd, { passive: true });
        
        // Mouse events
        this.carousel.addEventListener('mousedown', handleStart);
        this.carousel.addEventListener('mousemove', handleMove);
        this.carousel.addEventListener('mouseup', handleEnd);
        this.carousel.addEventListener('mouseleave', handleEnd);
        
        // Prevenir seleção de texto
        this.carousel.addEventListener('selectstart', (e) => e.preventDefault());
    }
}

// Inicializar carrossel quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    const carouselElements = document.querySelectorAll('.carousel[data-bs-ride="carousel"]');
    carouselElements.forEach(element => {
        new CustomCarousel(element);
    });
});

// Expor classe globalmente para uso manual se necessário
window.CustomCarousel = CustomCarousel;
