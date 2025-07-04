/**
 * Sistema de Login com Rate Limiting
 * Gerencia funcionalidades do formulário de login e contador de bloqueio
 */

class LoginSystem {
    constructor() {
        this.form = null;
        this.loader = null;
        this.rateLimitingCounter = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupElements();
            this.bindEvents();
            this.initRateLimiting();
        });
    }

    setupElements() {
        this.form = document.getElementById('loginForm');
        this.loader = document.getElementById('loader-cadastro');
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        this.addRealTimeValidation();
    }

    handleSubmit(event) {
        if (this.loader) {
            this.mostrarLoader();
        }
        console.log('📤 Enviando formulário de login...');
    }

    mostrarLoader() {
        if (this.loader) {
            this.loader.style.display = 'flex';
            this.iniciarAnimacaoLoader();
        }
    }

    esconderLoader() {
        if (this.loader) {
            this.loader.style.display = 'none';
            this.pararAnimacaoLoader();
        }
    }

    iniciarAnimacaoLoader() {
        const img = document.getElementById('imgloader');
        if (img) {
            img.style.display = 'block';
        }
    }

    pararAnimacaoLoader() {
        const img = document.getElementById('imgloader');
        if (img) {
            img.style.display = 'none';
        }
    }

    addRealTimeValidation() {
        const emailInput = document.getElementById('EMAIL');
        const senhaInput = document.getElementById('SENHA_HASH');

        if (emailInput) {
            emailInput.addEventListener('blur', this.validateEmail);
        }

        if (senhaInput) {
            senhaInput.addEventListener('blur', this.validatePassword);
        }
    }

    validateEmail(event) {
        const email = event.target.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            event.target.style.borderColor = '#e74c3c';
        } else {
            event.target.style.borderColor = '';
        }
    }

    validatePassword(event) {
        const password = event.target.value;
        
        if (password && password.length < 6) {
            event.target.style.borderColor = '#e74c3c';
        } else {
            event.target.style.borderColor = '';
        }
    }

    initRateLimiting() {
        this.rateLimitingCounter = new RateLimitingCounter();
    }
}

/**
 * Rate Limiting Counter for Login Form
 */
class RateLimitingCounter {
    constructor() {
        this.countdownDuration = 60;
        this.countdownInterval = null;
        this.elements = {};
        this.init();
    }

    init() {
        this.setupElements();
    }

    setupElements() {
        this.elements = {
            alert: document.getElementById('rateLimitAlert'),
            countdown: document.getElementById('countdown'),
            progressFill: document.getElementById('progressFill'),
            loginForm: document.getElementById('loginForm'),
            loginButton: document.getElementById('loginButton'),
            emailInput: document.getElementById('EMAIL'),
            senhaInput: document.getElementById('SENHA_HASH'),
            rememberCheckbox: document.querySelector('input[name="remember"]')
        };

        if (this.elements.alert) {
            // EXTRAI O TEMPO DA MENSAGEM DE ERRO
            this.extractTimeFromMessage();
            this.startCountdown();
        }
    }

    /**
     * Extrai o tempo da mensagem de erro do servidor
     */
    extractTimeFromMessage() {
        const errorMessage = this.elements.alert.textContent;
        const match = errorMessage.match(/(\d+)\s+segundos/);
        
        if (match) {
            this.countdownDuration = parseInt(match[1]);
            console.log(`⏱️ Tempo extraído do servidor: ${this.countdownDuration} segundos`);
        } else {
            this.countdownDuration = 60; // fallback
        }
    }

    startCountdown() {
        let seconds = this.countdownDuration;
        
        this.updateDisplay(seconds);
        
        this.countdownInterval = setInterval(() => {
            seconds--;
            this.updateDisplay(seconds);
            
            if (seconds <= 0) {
                this.clearCountdown();
                this.enableForm();
                this.showSuccessMessage();
            }
        }, 1000);

        console.log('🚨 Rate limiting ativo - Countdown iniciado');
    }

    updateDisplay(seconds) {
        if (this.elements.countdown) {
            this.elements.countdown.textContent = seconds;
        }
        
        if (this.elements.progressFill) {
            const progress = ((this.countdownDuration - seconds) / this.countdownDuration) * 100;
            this.elements.progressFill.style.width = `${progress}%`;
        }

        if (seconds <= 10 && this.elements.countdown) {
            this.elements.countdown.style.color = '#e74c3c';
            this.elements.countdown.style.fontWeight = 'bold';
        }
    }

    clearCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    enableForm() {
        if (this.elements.alert) {
            this.elements.alert.style.animation = 'fadeOutAlert 0.5s ease-out forwards';
            setTimeout(() => {
                this.elements.alert.style.display = 'none';
            }, 500);
        }
        
        this.setFormElementsState(false);
        
        if (this.elements.loginButton) {
            this.elements.loginButton.textContent = 'Entrar';
        }

        console.log('✅ Rate limiting removido - Formulário habilitado');
    }

    setFormElementsState(disabled) {
        const elements = [
            this.elements.emailInput,
            this.elements.senhaInput,
            this.elements.loginButton,
            this.elements.rememberCheckbox
        ];

        elements.forEach(element => {
            if (element) {
                element.disabled = disabled;
            }
        });
    }

    showSuccessMessage() {
        const messagesDiv = document.querySelector('.form-login-messages');
        if (messagesDiv) {
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.innerHTML = '✅ Você pode tentar fazer login novamente!';
            successMessage.style.animation = 'fadeInAlert 0.5s ease-out';
            
            messagesDiv.innerHTML = '';
            messagesDiv.appendChild(successMessage);
            
            setTimeout(() => {
                successMessage.style.animation = 'fadeOutAlert 0.5s ease-out forwards';
                setTimeout(() => {
                    if (successMessage.parentNode) {
                        successMessage.parentNode.removeChild(successMessage);
                    }
                }, 500);
            }, 4000);
        }
    }
}

// Inicializa o sistema
const loginSystem = new LoginSystem();
window.LoginSystem = LoginSystem;
window.RateLimitingCounter = RateLimitingCounter;