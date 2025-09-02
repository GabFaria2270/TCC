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

        console.log('🔧 Elementos encontrados:', {
            alert: !!this.elements.alert,
            loginButton: !!this.elements.loginButton,
            emailInput: !!this.elements.emailInput
        });

        // ========================================
        // SISTEMA DE BLOQUEIO PERSISTENTE - SEMPRE EXECUTA
        // ========================================
        this.checkServerLock();
        
        // Monitora mudanças no email
        if (this.elements.emailInput) {
            this.elements.emailInput.addEventListener('change', () => {
                console.log('📧 Email mudou, verificando bloqueio...');
                this.checkServerLock();
            });
        }

        // ========================================
        // SISTEMA ORIGINAL - SÓ SE ALERTA EXISTIR NO HTML
        // ========================================
        if (this.elements.alert && this.elements.alert.style.display !== 'none') {
            console.log('⚠️ Alerta do servidor detectado, extraindo tempo...');
            this.extractTimeFromMessage();
            this.startCountdown();
        }
    }

    /**
     * Extrai o tempo da mensagem de erro do servidor
     */
    extractTimeFromMessage() {
        if (!this.elements.alert) return;
        
        const errorMessage = this.elements.alert.textContent || this.elements.alert.innerText;
        const match = errorMessage.match(/(\d+)\s+segundos/);
        
        if (match) {
            this.countdownDuration = parseInt(match[1]);
            console.log(`⏱️ Tempo extraído do servidor: ${this.countdownDuration} segundos`);
        } else {
            this.countdownDuration = 60; // fallback
            console.log('⏱️ Usando tempo padrão: 60 segundos');
        }
    }

    /**
     * Gera chave para localStorage baseada no email/IP
     */
    storageKeyFor(emailOrIp) {
        return 'login_lock_' + (emailOrIp || 'anon');
    }

    /**
     * Inicia countdown persistente
     */
    startPersistentCountdown(expireAtMs) {
        const email = (this.elements.emailInput?.value || '').trim().toLowerCase();
        const key = this.storageKeyFor(email || 'ip');
        localStorage.setItem(key, String(expireAtMs));
        console.log('💾 Salvando bloqueio no localStorage:', key, new Date(expireAtMs));
        this.updatePersistentUIAndTick(key);
    }

    /**
     * Atualiza UI e executa tick do contador persistente
     */
    updatePersistentUIAndTick(key) {
        clearInterval(this.countdownInterval);
        
        const tick = () => {
            const now = Date.now();
            const expire = Number(localStorage.getItem(key) || 0);
            const remaining = Math.max(0, Math.ceil((expire - now) / 1000));

            console.log('⏰ Tick:', { now: new Date(now), expire: new Date(expire), remaining });

            if (remaining > 0) {
                // Desabilita formulário
                this.setFormElementsState(true);
                
                // Atualiza contador se existir
                if (this.elements.countdown) {
                    this.elements.countdown.textContent = remaining;
                }
                
                // Atualiza barra de progresso se existir
                if (this.elements.progressFill) {
                    const progress = ((60 - remaining) / 60) * 100;
                    this.elements.progressFill.style.width = `${progress}%`;
                }

                // Mostra alerta se não existir
                if (!this.elements.alert || this.elements.alert.style.display === 'none') {
                    this.showRateLimitAlert(remaining);
                }
                
                // Cor especial para últimos segundos
                if (remaining <= 10 && this.elements.countdown) {
                    this.elements.countdown.style.color = '#e74c3c';
                    this.elements.countdown.style.fontWeight = 'bold';
                }
            } else {
                // Habilita formulário
                this.setFormElementsState(false);
                localStorage.removeItem(key);
                clearInterval(this.countdownInterval);
                
                // Remove alerta se existir
                if (this.elements.alert) {
                    this.elements.alert.style.animation = 'fadeOutAlert 0.5s ease-out forwards';
                    setTimeout(() => {
                        this.elements.alert.style.display = 'none';
                    }, 500);
                }

                console.log('✅ Bloqueio persistente removido');
            }
        };

        tick();
        this.countdownInterval = setInterval(tick, 1000);
    }

    /**
     * Verifica bloqueio no servidor
     */
    async checkServerLock() {
        try {
            console.log('🔍 Verificando bloqueio no servidor...');
            
            const email = (this.elements.emailInput?.value || '').trim();
            const url = '/login/lock-status' + (email ? `?email=${encodeURIComponent(email)}` : '');
            
            console.log('📡 Fazendo requisição para:', url);
            
            const res = await fetch(url, { 
                credentials: 'same-origin',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });
            
            if (!res.ok) {
                console.log('❌ Resposta não OK:', res.status);
                return;
            }
            
            const data = await res.json();
            console.log('📊 Resposta do servidor:', data);
            
            if (data.locked && data.seconds > 0) {
                const expireAt = Date.now() + data.seconds * 1000;
                this.startPersistentCountdown(expireAt);
                console.log('🚨 Bloqueio detectado no servidor:', data.seconds, 'segundos');
                return;
            }

            // Se servidor não bloqueou, checa localStorage (persistência entre reloads)
            const key = this.storageKeyFor(email || 'ip');
            const stored = Number(localStorage.getItem(key) || 0);
            
            console.log('📦 Verificando localStorage:', { key, stored, now: Date.now() });
            
            if (stored && stored > Date.now()) {
                this.updatePersistentUIAndTick(key);
                console.log('🚨 Bloqueio restaurado do localStorage');
            } else {
                // Remove bloqueio antigo
                this.setFormElementsState(false);
                localStorage.removeItem(key);
                console.log('✅ Nenhum bloqueio ativo');
            }
        } catch (e) {
            console.error('❌ Erro ao verificar bloqueio:', e);
        }
    }

    /**
     * Mostra alerta de rate limiting dinamicamente
     */
    showRateLimitAlert(seconds) {
        console.log('🚨 Mostrando alerta de rate limiting:', seconds, 'segundos');
        
        // Se já existe, apenas atualiza
        if (this.elements.alert && this.elements.alert.style.display !== 'none') {
            if (this.elements.countdown) {
                this.elements.countdown.textContent = seconds;
            }
            return;
        }

        // Cria ou mostra o alerta
        let alert = this.elements.alert;
        if (!alert) {
            alert = document.createElement('div');
            alert.id = 'rateLimitAlert';
            alert.className = 'alert alert-warning rate-limit-alert';
            
            // Encontra onde inserir o alerta (antes do formulário)
            const form = this.elements.loginForm;
            if (form && form.parentNode) {
                form.parentNode.insertBefore(alert, form);
                this.elements.alert = alert;
            } else {
                // Se não encontrar o form, insere no body
                document.body.appendChild(alert);
                this.elements.alert = alert;
            }
        }

        alert.innerHTML = `
            <div class="rate-limit-content">
                <div class="rate-limit-icon">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>
                <div class="rate-limit-text">
                    <strong>🚨 Muitas tentativas de login!</strong><br>
                    Aguarde <span id="countdown">${seconds}</span> segundos para tentar novamente.
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
            </div>
        `;
        alert.style.display = 'block';
        alert.style.animation = 'fadeInAlert 0.5s ease-out';

        // Atualiza referências dos elementos
        this.elements.countdown = document.getElementById('countdown');
        this.elements.progressFill = document.getElementById('progressFill');
        
        console.log('✅ Alerta criado e elementos atualizados');
    }

    /**
     * Inicia o contador regressivo (método original)
     */
    startCountdown() {
        let seconds = this.countdownDuration;
        
        console.log('🕒 Iniciando countdown original:', seconds, 'segundos');
        
        // Atualiza imediatamente
        this.updateDisplay(seconds);
        
        // TAMBÉM salva no localStorage para persistência
        const email = (this.elements.emailInput?.value || '').trim().toLowerCase();
        const key = this.storageKeyFor(email || 'ip');
        const expireAt = Date.now() + seconds * 1000;
        localStorage.setItem(key, String(expireAt));
        console.log('💾 Salvando no localStorage (countdown original):', key, new Date(expireAt));
        
        // Inicia o intervalo
        this.countdownInterval = setInterval(() => {
            seconds--;
            this.updateDisplay(seconds);
            
            // Quando chegar a zero, libera o formulário
            if (seconds <= 0) {
                this.clearCountdown();
                this.enableForm();
                this.showSuccessMessage();
                
                // Remove do localStorage
                localStorage.removeItem(key);
                console.log('✅ Countdown original finalizado');
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

        // Atualiza texto do botão
        if (this.elements.loginButton) {
            this.elements.loginButton.textContent = disabled ? 'Aguarde...' : 'Entrar';
        }
        
        console.log('🔧 Estado do formulário atualizado:', disabled ? 'DESABILITADO' : 'HABILITADO');
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

@keyframes fadeInAlert {
    0% {
        opacity: 0;
        transform: translateY(-20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.rate-limit-alert {
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 0.375rem;
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    color: #856404;
}

.rate-limit-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
}

.rate-limit-icon {
    font-size: 1.5rem;
    color: #f39c12;
}

.progress-container {
    width: 100%;
}

.progress-bar {
    width: 100%;
    height: 6px;
    background-color: #f8f9fa;
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background-color: #f39c12;
    width: 0%;
    transition: width 1s ease;
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
    console.log('🚀 Inicializando Rate Limiting Counter...');
    addAdditionalCSS();
    
    // Cria uma instância global para permitir controle externo se necessário
    window.rateLimitingCounter = new RateLimitingCounter();
});

// Exporta a classe para uso em outros módulos (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RateLimitingCounter;
}