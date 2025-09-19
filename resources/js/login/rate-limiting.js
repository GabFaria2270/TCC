/**
 * Rate Limiting para Login - CORRIGIDO
 */

class LoginRateLimitingCounter {
    constructor() {
        this.elements = {};
        this.countdownInterval = null;
        this.isManuallyEnabled = false;
        this.manualDetectionTimeout = null;
        this.detectionCount = 0;
        this.isServerBlocked = false;
        this.manualCheckInterval = null;
        
        // ✅ Bind das funções
        this.handleManualFocus = this.handleManualEnable.bind(this);
        this.handleManualInput = this.handleManualEnable.bind(this);
        this.checkManualChanges = this.checkManualChanges.bind(this);
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        this.findElements();
        
        // ✅ CORRIGIDO: Verifica localStorage PRIMEIRO, depois servidor
        const hasPersistedState = this.checkPersistedState();
        
        if (!hasPersistedState && this.elements.alert && this.isAlertVisible()) {
            console.log('🚨 Alerta do servidor detectado no login');
            this.isServerBlocked = true;
            this.processServerAlert();
        } else if (!hasPersistedState) {
            this.enableForm();
        }

        console.log('🔄 LoginRateLimitingCounter inicializado');
    }

    findElements() {
        this.elements = {
            alert: document.getElementById('rateLimitAlert'),
            countdown: document.getElementById('countdown'),
            progressFill: document.getElementById('progressFill'),
            loginForm: document.getElementById('loginForm'),
            loginButton: document.querySelector('.form-login-button') || document.getElementById('loginButton'),
            emailInput: document.getElementById('EMAIL'),
            senhaInput: document.getElementById('SENHA_HASH')
        };

        console.log('🔍 Elementos do login encontrados:', {
            alert: !!this.elements.alert,
            countdown: !!this.elements.countdown,
            progressFill: !!this.elements.progressFill,
            loginForm: !!this.elements.loginForm,
            loginButton: !!this.elements.loginButton,
            emailInput: !!this.elements.emailInput,
            senhaInput: !!this.elements.senhaInput
        });
    }

    isAlertVisible() {
        if (!this.elements.alert) return false;
        
        const computedStyle = window.getComputedStyle(this.elements.alert);
        const isVisible = computedStyle.display !== 'none' && 
                         computedStyle.visibility !== 'hidden' &&
                         this.elements.alert.offsetHeight > 0;
        
        console.log('🔍 Alerta do login visível:', isVisible);
        return isVisible;
    }

    checkPersistedState() {
        try {
            const saved = localStorage.getItem('rateLimitState');
            if (saved) {
                const state = JSON.parse(saved);
                const now = Date.now();
                
                if (state.blockedUntil && now < state.blockedUntil) {
                    const remainingSeconds = Math.ceil((state.blockedUntil - now) / 1000);
                    console.log(`⏰ Estado persistido login: ${remainingSeconds}s restantes`);
                    
                    // ✅ CORRIGIDO: Marca como persistido, não servidor
                    this.isServerBlocked = state.isServerBlocked || false;
                    
                    // ✅ NOVO: Cria ou mostra alerta mesmo se não existir
                    this.createOrShowAlert(remainingSeconds);
                    this.startCountdown(remainingSeconds);
                    return true;
                } else {
                    localStorage.removeItem('rateLimitState');
                    return false;
                }
            }
            return false;
        } catch (error) {
            console.log('❌ Erro ao verificar estado persistido do login:', error);
            return false;
        }
    }

    // ✅ NOVO: Cria ou mostra alerta visual
    createOrShowAlert(remainingSeconds = 60) {
        if (this.elements.alert && this.isAlertVisible()) {
            console.log('👁️ Alerta já existe e está visível');
            this.showAlert();
            return;
        }

        if (!this.elements.alert) {
            console.log('🆕 Criando alerta dinamicamente');
            this.createAlertElement(remainingSeconds);
            // ✅ ATUALIZA REFERÊNCIAS APÓS CRIAR
            setTimeout(() => {
                this.findElements();
            }, 50);
        } else {
            console.log('👁️ Exibindo alerta existente');
            this.showAlert();
        }
    }

    // ✅ NOVO: Cria elemento de alerta dinamicamente
    createAlertElement(remainingSeconds = 60) {
        // Encontra container do formulário - usando as classes do seu HTML
        const formContainer = document.querySelector('.form-login-body') || 
                             document.querySelector('.form-login-container') ||
                             document.querySelector('#loginForm').parentElement;

        if (formContainer) {
            // Cria HTML do alerta
            const alertHTML = `
                <div class="rate-limit-alert" id="rateLimitAlert">
                    <div class="rate-limit-content">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                        <div>
                            <strong>🚨 Muitas tentativas de login!</strong>
                            <p>Aguarde <span id="countdown">${remainingSeconds}</span> segundos para tentar novamente.</p>
                            <div class="progress-bar">
                                <div class="progress-fill" id="progressFill"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Insere no início do container
            formContainer.insertAdjacentHTML('afterbegin', alertHTML);

            // Atualiza referências dos elementos
            this.elements.alert = document.getElementById('rateLimitAlert');
            this.elements.countdown = document.getElementById('countdown');
            this.elements.progressFill = document.getElementById('progressFill');

            console.log('✅ Alerta do login criado dinamicamente');
        } else {
            console.error('❌ Container do formulário de login não encontrado para criar alerta');
        }
    }

    showAlert() {
        if (this.elements.alert) {
            // ✅ CORRIGIDO: Sempre força exibição
            this.elements.alert.style.display = 'block';
            console.log('👁️ Alerta do login exibido');
        }
    }

    hideAlert() {
        if (this.elements.alert) {
            this.elements.alert.style.display = 'none';
            console.log('👁️ Alerta do login escondido');
        }
    }

    processServerAlert() {
        if (!this.elements.alert) return;
        
        const text = this.elements.alert.textContent || this.elements.alert.innerText;
        const match = text.match(/(\d+)\s+segundos/);
        
        if (match) {
            const seconds = parseInt(match[1]);
            console.log(`⏰ Servidor indica ${seconds} segundos de bloqueio no login`);
            
            this.isServerBlocked = true;
            this.startCountdown(seconds);
        }
    }

    startCountdown(seconds) {
        console.log(`🚀 Iniciando countdown do login com ${seconds} segundos`);
        
        // ✅ Reseta flags
        this.isManuallyEnabled = false;
        this.detectionCount = 0;
        
        // ✅ Limpa timeouts anteriores
        if (this.manualDetectionTimeout) {
            clearTimeout(this.manualDetectionTimeout);
            this.manualDetectionTimeout = null;
        }
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        if (this.manualCheckInterval) {
            clearInterval(this.manualCheckInterval);
        }

        this.disableForm();
        this.saveState(seconds);

        const initialSeconds = seconds;

        const tick = () => {
            if (seconds > 0) {
                this.updateDisplay(seconds, initialSeconds);
                this.saveState(seconds);
                seconds--;
            } else {
                console.log('✅ Countdown do login finalizado');
                this.finishCountdown();
            }
        };

        tick();
        this.countdownInterval = setInterval(tick, 1000);
        
        // ✅ Inicia verificação manual constante
        this.startManualDetection();
    }

    // ✅ Método para iniciar detecção manual constante
    startManualDetection() {
        // Verifica a cada 500ms se elementos foram reabilitados manualmente
        this.manualCheckInterval = setInterval(this.checkManualChanges, 500);
        console.log('👀 Detecção manual do login iniciada');
    }

    // ✅ Verifica se elementos foram reabilitados manualmente
    checkManualChanges() {
        if (this.isManuallyEnabled) return;

        const elements = [
            this.elements.emailInput,
            this.elements.senhaInput,
            this.elements.loginButton
        ];

        let hasEnabledElement = false;
        elements.forEach(el => {
            if (el && !el.disabled) {
                hasEnabledElement = true;
            }
        });

        if (hasEnabledElement) {
            this.detectionCount++;
            console.log(`🔍 Elemento do login reabilitado detectado! Detecção ${this.detectionCount}/3`);
            
            // ✅ Força disabled novamente
            elements.forEach(el => {
                if (el) el.disabled = true;
            });

            if (this.detectionCount >= 3) {
                this.handleManualEnable();
            }
        }
    }

    finishCountdown() {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        
        // ✅ Para detecção manual
        if (this.manualCheckInterval) {
            clearInterval(this.manualCheckInterval);
            this.manualCheckInterval = null;
        }
        
        this.isServerBlocked = false;
        localStorage.removeItem('rateLimitState');
        this.enableForm();
    }

    saveState(seconds) {
        try {
            const state = {
                blockedUntil: Date.now() + (seconds * 1000),
                seconds: seconds,
                isServerBlocked: this.isServerBlocked,
                timestamp: Date.now()
            };
            localStorage.setItem('rateLimitState', JSON.stringify(state));
            console.log(`💾 Estado do login salvo: ${seconds}s restantes`);
        } catch (error) {
            console.log('❌ Erro ao salvar estado do login:', error);
        }
    }

    // ✅ CORRIGIDO: updateDisplay com verificação de elementos
    updateDisplay(seconds, initialSeconds = 60) {
        // ✅ VERIFICA SE ELEMENTOS AINDA EXISTEM
        if (!this.elements.countdown || !this.elements.countdown.parentNode) {
            console.log('🔄 Re-encontrando elementos perdidos...');
            this.findElements();
        }
        
        // Atualiza contador
        if (this.elements.countdown) {
            this.elements.countdown.textContent = seconds;
            console.log(`⏰ Contador atualizado: ${seconds}s`);
        } else {
            console.error('❌ Elemento countdown não encontrado para atualização');
            return;
        }

        // Atualiza barra de progresso
        if (this.elements.progressFill) {
            const elapsed = initialSeconds - seconds;
            const progress = (elapsed / initialSeconds) * 100;
            
            this.elements.progressFill.style.width = progress + '%';
            console.log(`📊 Barra de progresso: ${progress.toFixed(1)}%`);
        }
    }

    disableForm() {
        const elements = [
            this.elements.emailInput,
            this.elements.senhaInput,
            this.elements.loginButton
        ];

        elements.forEach(el => {
            if (el) {
                el.disabled = true;
                
                // ✅ SEMPRE adiciona listeners para detectar mudanças
                el.addEventListener('focus', this.handleManualFocus);
                el.addEventListener('input', this.handleManualEnable.bind(this));
                el.addEventListener('click', this.handleManualFocus);
            }
        });

        if (this.elements.loginButton) {
            this.elements.loginButton.textContent = 'Aguarde...';
        }

        console.log('🔒 Formulário de login desabilitado');
    }

    // ✅ CORRIGIDO: handleManualEnable INSTANTÂNEO mesmo com DevTools
    handleManualEnable() {
        if (!this.isManuallyEnabled) {
            console.log('🔓 Reativação manual do login confirmada');
            this.isManuallyEnabled = true;
            
            // Para o countdown atual
            if (this.countdownInterval) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
            }

            // Para detecção manual
            if (this.manualCheckInterval) {
                clearInterval(this.manualCheckInterval);
                this.manualCheckInterval = null;
            }
            
            // Remove estado persistido
            localStorage.removeItem('rateLimitState');
            this.hideAlert();
            
            // ✅ TIMEOUT PARA PUNIÇÃO - 10 segundos
            this.manualDetectionTimeout = setTimeout(() => {
                if (this.isManuallyEnabled) {
                    console.log('⚠️ Aplicando punição por burla do sistema');
                    this.isManuallyEnabled = false;
                    this.detectionCount = 0;
                    
                    // ✅ FORÇA CRIAÇÃO IMEDIATA E SÍNCRONA
                    this.forceCreatePunishmentAlert();
                }
            }, 10000);
        }
    }

    // ✅ NOVO: Método para criar alerta de punição instantaneamente
    forceCreatePunishmentAlert() {
        // Remove alerta anterior se existir
        const existingAlert = document.getElementById('rateLimitAlert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Encontra container
        const formContainer = document.querySelector('.form-login-body') || 
                             document.querySelector('.form-login-container') ||
                             document.querySelector('#loginForm')?.parentElement;

        if (!formContainer) {
            console.error('❌ Container não encontrado para punição');
            return;
        }

        // ✅ CRIA ELEMENTOS DIRETAMENTE NO DOM (sem innerHTML)
        const alertDiv = document.createElement('div');
        alertDiv.className = 'rate-limit-alert';
        alertDiv.id = 'rateLimitAlert';
        alertDiv.style.display = 'block';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'rate-limit-content';

        const icon = document.createElement('i');
        icon.className = 'bi bi-exclamation-triangle-fill';

        const textDiv = document.createElement('div');

        const strong = document.createElement('strong');
        strong.textContent = '🚨 Tentativa de burlar o sistema detectada!';

        const paragraph = document.createElement('p');
        paragraph.innerHTML = 'Bloqueio estendido. Aguarde ';
        
        const countdown = document.createElement('span');
        countdown.id = 'countdown';
        countdown.textContent = '90';
        
        paragraph.appendChild(countdown);
        paragraph.appendChild(document.createTextNode(' segundos para tentar novamente.'));

        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'progress-bar';

        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressFill.id = 'progressFill';
        progressFill.style.width = '0%';

        // ✅ MONTA A ESTRUTURA
        progressBarContainer.appendChild(progressFill);
        textDiv.appendChild(strong);
        textDiv.appendChild(paragraph);
        textDiv.appendChild(progressBarContainer);
        contentDiv.appendChild(icon);
        contentDiv.appendChild(textDiv);
        alertDiv.appendChild(contentDiv);

        // ✅ INSERE NO DOM IMEDIATAMENTE
        formContainer.insertBefore(alertDiv, formContainer.firstChild);

        // ✅ FORÇA RENDER SÍNCRONO
        alertDiv.offsetHeight; // Trigger reflow
        formContainer.offsetHeight; // Trigger reflow

        // ✅ ATUALIZA REFERÊNCIAS IMEDIATAMENTE
        this.elements.alert = alertDiv;
        this.elements.countdown = countdown;
        this.elements.progressFill = progressFill;

        console.log('⚡ Alerta de punição criado INSTANTANEAMENTE', {
            alert: !!this.elements.alert,
            countdown: !!this.elements.countdown,
            progressFill: !!this.elements.progressFill
        });

        // ✅ INICIA COUNTDOWN IMEDIATAMENTE (sem delays)
        this.startCountdown(90);
    }

    enableForm() {
        const elements = [
            this.elements.emailInput,
            this.elements.senhaInput,
            this.elements.loginButton
        ];

        elements.forEach(el => {
            if (el) {
                el.disabled = false;
                
                // Remove listeners
                el.removeEventListener('focus', this.handleManualFocus);
                el.removeEventListener('input', this.handleManualInput);
                el.removeEventListener('click', this.handleManualFocus);
            }
        });

        if (this.elements.loginButton) {
            this.elements.loginButton.textContent = 'Entrar';
        }

        this.hideAlert();

        // Reseta barra de progresso
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = '0%';
        }

        // ✅ Limpa todos os timeouts e intervals
        if (this.manualDetectionTimeout) {
            clearTimeout(this.manualDetectionTimeout);
            this.manualDetectionTimeout = null;
        }

        if (this.manualCheckInterval) {
            clearInterval(this.manualCheckInterval);
            this.manualCheckInterval = null;
        }

        console.log('🔓 Formulário de login habilitado');
    }

    forceReset() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        if (this.manualDetectionTimeout) {
            clearTimeout(this.manualDetectionTimeout);
            this.manualDetectionTimeout = null;
        }

        if (this.manualCheckInterval) {
            clearInterval(this.manualCheckInterval);
            this.manualCheckInterval = null;
        }
        
        localStorage.removeItem('rateLimitState');
        this.isManuallyEnabled = true;
        this.detectionCount = 0;
        this.isServerBlocked = false;
        this.enableForm();
        
        console.log('🔄 Reset forçado do rate limiting do login');
    }
}

// Inicializa apenas na página de login
if (document.getElementById('loginForm') || document.querySelector('.form-login')) {
    const loginRateLimiter = new LoginRateLimitingCounter();
    window.loginRateLimiter = loginRateLimiter;
    
    // Atalho para reset (Ctrl+Shift+L)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            console.log('🔄 Reset manual do login ativado');
            loginRateLimiter.forceReset();
        }
    });
}