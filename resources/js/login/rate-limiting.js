/**
 * Rate Limiting Counter for Login Form
 * Handles the countdown timer and form state when user exceeds login attempts
 */

class RateLimitingCounter {
    constructor() {
        this.countdownDuration = 60; // segundos
        this.countdownInterval = null;
        this.elements = {
            alert: null,
            countdown: null,
            progressFill: null,
            loginForm: null,
            loginButton: null,
            emailInput: null,
            senhaInput: null,
            rememberCheckbox: null
        };
        
        this.init();
    }

    /**
     * Inicializa o sistema de rate limiting
     */
    init() {
        // Aguarda o DOM estar completamente carregado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }

    /**
     * Configura os elementos do DOM
     */
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

        // Verifica se o alerta de rate limiting está presente
        if (this.elements.alert) {
            this.startCountdown();
        }
    }

    /**
     * Inicia o contador regressivo
     */
    startCountdown() {
        let seconds = this.countdownDuration;
        
        // Atualiza imediatamente
        this.updateDisplay(seconds);
        
        // Inicia o intervalo
        this.countdownInterval = setInterval(() => {
            seconds--;
            this.updateDisplay(seconds);
            
            // Quando chegar a zero, libera o formulário
            if (seconds <= 0) {
                this.clearCountdown();
                this.enableForm();
                this.showSuccessMessage();
            }
        }, 1000);

        console.log('🚨 Rate limiting ativo - Countdown iniciado');
    }

    /**
     * Atualiza a exibição do contador e barra de progresso
     * @param {number} seconds - Segundos restantes
     */
    updateDisplay(seconds) {
        // Atualiza o texto do contador
        if (this.elements.countdown) {
            this.elements.countdown.textContent = seconds;
        }
        
        // Atualiza a barra de progresso
        if (this.elements.progressFill) {
            const progress = ((this.countdownDuration - seconds) / this.countdownDuration) * 100;
            this.elements.progressFill.style.width = `${progress}%`;
        }

        // Adiciona classe especial quando restam poucos segundos
        if (seconds <= 10 && this.elements.countdown) {
            this.elements.countdown.style.color = '#e74c3c';
            this.elements.countdown.style.fontWeight = 'bold';
        }
    }

    /**
     * Limpa o intervalo do contador
     */
    clearCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    /**
     * Habilita o formulário após o fim do bloqueio
     */
    enableForm() {
        // Remove o alerta com animação
        if (this.elements.alert) {
            this.elements.alert.style.animation = 'fadeOutAlert 0.5s ease-out forwards';
            setTimeout(() => {
                this.elements.alert.style.display = 'none';
            }, 500);
        }
        
        // Habilita todos os campos
        this.setFormElementsState(false); // false = habilitado
        
        // Atualiza o texto do botão
        if (this.elements.loginButton) {
            this.elements.loginButton.textContent = 'Entrar';
        }

        console.log('✅ Rate limiting removido - Formulário habilitado');
    }

    /**
     * Desabilita/habilita elementos do formulário
     * @param {boolean} disabled - Se true, desabilita; se false, habilita
     */
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

    /**
     * Mostra mensagem de sucesso quando o bloqueio é removido
     */
    showSuccessMessage() {
        const messagesDiv = document.querySelector('.form-login-messages');
        if (messagesDiv) {
            // Cria a mensagem de liberação
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.innerHTML = '✅ Você pode tentar fazer login novamente!';
            successMessage.style.animation = 'fadeInAlert 0.5s ease-out';
            
            // Limpa mensagens anteriores e adiciona a nova
            messagesDiv.innerHTML = '';
            messagesDiv.appendChild(successMessage);
            
            // Remove a mensagem após 4 segundos
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

    /**
     * Método público para reiniciar o contador (se necessário)
     */
    restart() {
        this.clearCountdown();
        this.setFormElementsState(true); // true = desabilitado
        
        if (this.elements.loginButton) {
            this.elements.loginButton.textContent = 'Aguarde...';
        }
        
        this.startCountdown();
    }

    /**
     * Método público para cancelar o contador (se necessário)
     */
    cancel() {
        this.clearCountdown();
        this.enableForm();
    }
}

// CSS adicional para animações (inserido via JavaScript)
const additionalCSS = `
@keyframes fadeOutAlert {
    0% {
        opacity: 1;
        transform: translateY(0);
    }
    100% {
        opacity: 0;
        transform: translateY(-20px);
    }
}
`;

// Adiciona o CSS adicional ao documento
function addAdditionalCSS() {
    const style = document.createElement('style');
    style.textContent = additionalCSS;
    document.head.appendChild(style);
}

// Inicializa o sistema quando o script é carregado
document.addEventListener('DOMContentLoaded', () => {
    addAdditionalCSS();
    
    // Cria uma instância global para permitir controle externo se necessário
    window.rateLimitingCounter = new RateLimitingCounter();
});

// Exporta a classe para uso em outros módulos (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RateLimitingCounter;
}