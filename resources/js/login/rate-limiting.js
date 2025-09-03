/**
 * Rate Limiting - CORRIGIDO ALERTA VISUAL AO RECARREGAR
 */

class RateLimitingCounter {
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
            console.log('🚨 Alerta do servidor detectado');
            this.isServerBlocked = true;
            this.processServerAlert();
        } else if (!hasPersistedState) {
            this.enableForm();
        }

        console.log('🔄 RateLimitingCounter inicializado');
    }

    findElements() {
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

        console.log('🔍 Elementos encontrados:', {
            alert: !!this.elements.alert,
            countdown: !!this.elements.countdown,
            progressFill: !!this.elements.progressFill,
            loginForm: !!this.elements.loginForm
        });
    }

    isAlertVisible() {
        if (!this.elements.alert) return false;
        
        const computedStyle = window.getComputedStyle(this.elements.alert);
        const isVisible = computedStyle.display !== 'none' && 
                         computedStyle.visibility !== 'hidden' &&
                         this.elements.alert.offsetHeight > 0;
        
        console.log('🔍 Alerta visível:', isVisible);
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
                    console.log(`⏰ Estado persistido: ${remainingSeconds}s restantes`);
                    
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
            console.log('❌ Erro ao verificar estado persistido:', error);
            return false;
        }
    }

    // ✅ NOVO: Cria ou mostra alerta visual
    createOrShowAlert(remainingSeconds = 60) {
        if (!this.elements.alert) {
            // ✅ NOVO: Cria alerta dinamicamente se não existir
            this.createAlertElement(remainingSeconds);
        } else {
            // ✅ Mostra alerta existente
            this.showAlert();
        }
    }

    // ✅ NOVO: Cria elemento de alerta dinamicamente
    createAlertElement(remainingSeconds = 60) {
        // Encontra container do formulário
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
                            <strong>🚨 Sessão bloqueada!</strong>
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

            console.log('✅ Alerta criado dinamicamente');
        } else {
            console.error('❌ Container do formulário não encontrado para criar alerta');
        }
    }

    showAlert() {
        if (this.elements.alert) {
            // ✅ CORRIGIDO: Sempre força exibição
            this.elements.alert.style.display = 'block';
            console.log('👁️ Alerta exibido');
        }
    }

    hideAlert() {
        if (this.elements.alert) {
            this.elements.alert.style.display = 'none';
            console.log('👁️ Alerta escondido');
        }
    }

    processServerAlert() {
        if (!this.elements.alert) return;
        
        const text = this.elements.alert.textContent || this.elements.alert.innerText;
        const match = text.match(/(\d+)\s+segundos/);
        
        if (match) {
            const seconds = parseInt(match[1]);
            console.log(`⏰ Servidor indica ${seconds} segundos de bloqueio`);
            
            this.isServerBlocked = true;
            this.startCountdown(seconds);
        }
    }

    startCountdown(seconds) {
        console.log(`🚀 Iniciando countdown com ${seconds} segundos`);
        
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
                console.log('✅ Countdown finalizado');
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
        console.log('👀 Detecção manual iniciada');
    }

    // ✅ Verifica se elementos foram reabilitados manualmente
    checkManualChanges() {
        if (this.isManuallyEnabled) return;

        const elements = [
            this.elements.emailInput,
            this.elements.senhaInput,
            this.elements.loginButton,
            this.elements.rememberCheckbox
        ];

        let hasEnabledElement = false;
        elements.forEach(el => {
            if (el && !el.disabled) {
                hasEnabledElement = true;
            }
        });

        if (hasEnabledElement) {
            this.detectionCount++;
            console.log(`🔍 Elemento reabilitado detectado! Detecção ${this.detectionCount}/3`);
            
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
            console.log(`💾 Estado salvo: ${seconds}s restantes`);
        } catch (error) {
            console.log('❌ Erro ao salvar estado:', error);
        }
    }

    updateDisplay(seconds, initialSeconds = 60) {
        // Atualiza contador
        if (this.elements.countdown) {
            this.elements.countdown.textContent = seconds;
            console.log(`⏰ Contador atualizado: ${seconds}s`);
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
            this.elements.loginButton,
            this.elements.rememberCheckbox
        ];

        elements.forEach(el => {
            if (el) {
                el.disabled = true;
                
                // ✅ SEMPRE adiciona listeners para detectar mudanças
                el.addEventListener('focus', this.handleManualFocus);
                el.addEventListener('input', this.handleManualInput);
                el.addEventListener('click', this.handleManualFocus);
            }
        });

        if (this.elements.loginButton) {
            this.elements.loginButton.textContent = 'Aguarde...';
        }

        console.log('🔒 Formulário desabilitado');
    }

    handleManualEnable() {
        if (!this.isManuallyEnabled) {
            console.log('🔓 Reativação manual confirmada');
            this.isManuallyEnabled = true;
            
            // Para o countdown
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
                    
                    // Punição: 90 segundos
                    this.createOrShowAlert(90);
                    this.startCountdown(90);
                    
                    // Atualiza texto do alerta
                    if (this.elements.alert) {
                        const alertText = this.elements.alert.querySelector('strong');
                        if (alertText) {
                            alertText.textContent = '🚨 Tentativa de burlar o sistema detectada!';
                        }
                        const alertDesc = this.elements.alert.querySelector('p');
                        if (alertDesc) {
                            alertDesc.innerHTML = 'Bloqueio estendido. Aguarde <span id="countdown">90</span> segundos para tentar novamente.';
                        }
                    }
                }
            }, 10000);
        }
    }

    enableForm() {
        const elements = [
            this.elements.emailInput,
            this.elements.senhaInput,
            this.elements.loginButton,
            this.elements.rememberCheckbox
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

        console.log('🔓 Formulário habilitado');
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
        
        console.log('🔄 Reset forçado do rate limiting');
    }
}

// Inicializa apenas na página de login
if (document.getElementById('loginForm')) {
    const rateLimiter = new RateLimitingCounter();
    window.rateLimiter = rateLimiter;
    
    // Atalho para reset (Ctrl+Shift+R)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            console.log('🔄 Reset manual ativado');
            rateLimiter.forceReset();
        }
    });
}