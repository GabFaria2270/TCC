/**
 * Rate Limiting para Cadastro - Adaptado do sistema de login
 */

class CadastroRateLimitingCounter {
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
            console.log('🚨 Alerta do servidor detectado no cadastro');
            this.isServerBlocked = true;
            this.processServerAlert();
        } else if (!hasPersistedState) {
            this.enableForm();
        }

        console.log('🔄 CadastroRateLimitingCounter inicializado');
    }

    findElements() {
        this.elements = {
            alert: document.getElementById('rateLimitAlert'),
            countdown: document.getElementById('countdown'),
            progressFill: document.getElementById('progressFill'),
            cadastroForm: document.getElementById('cadastroForm'),
            cadastroButton: document.querySelector('.form-cadastro-button'),
            nomeInput: document.getElementById('NOME'),
            emailInput: document.getElementById('EMAIL'),
            senhaInput: document.getElementById('SENHA_HASH'),
            confirmarSenhaInput: document.getElementById('SENHA_HASH_confirmation'),
            perfilInput: document.getElementById('PERFIL'),
            comercioNomeInput: document.getElementById('COMERCIO_NOME'),
            comercioCnpjInput: document.getElementById('COMERCIO_CNPJ')
        };

        console.log('🔍 Elementos do cadastro encontrados:', {
            alert: !!this.elements.alert,
            countdown: !!this.elements.countdown,
            progressFill: !!this.elements.progressFill,
            cadastroForm: !!this.elements.cadastroForm,
            cadastroButton: !!this.elements.cadastroButton
        });
    }

    isAlertVisible() {
        if (!this.elements.alert) return false;
        
        const computedStyle = window.getComputedStyle(this.elements.alert);
        const isVisible = computedStyle.display !== 'none' && 
                         computedStyle.visibility !== 'hidden' &&
                         this.elements.alert.offsetHeight > 0;
        
        console.log('🔍 Alerta do cadastro visível:', isVisible);
        return isVisible;
    }

    checkPersistedState() {
        try {
            const saved = localStorage.getItem('cadastroRateLimitState');
            if (saved) {
                const state = JSON.parse(saved);
                const now = Date.now();
                
                if (state.blockedUntil && now < state.blockedUntil) {
                    const remainingSeconds = Math.ceil((state.blockedUntil - now) / 1000);
                    console.log(`⏰ Estado persistido cadastro: ${remainingSeconds}s restantes`);
                    
                    // ✅ CORRIGIDO: Marca como persistido, não servidor
                    this.isServerBlocked = state.isServerBlocked || false;
                    
                    // ✅ NOVO: Cria ou mostra alerta mesmo se não existir
                    this.createOrShowAlert(remainingSeconds);
                    this.startCountdown(remainingSeconds);
                    return true;
                } else {
                    localStorage.removeItem('cadastroRateLimitState');
                    return false;
                }
            }
            return false;
        } catch (error) {
            console.log('❌ Erro ao verificar estado persistido do cadastro:', error);
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
        const formContainer = document.querySelector('.form-cadastro-body') || 
                             document.querySelector('.form-cadastro-container') ||
                             document.querySelector('#cadastroForm').parentElement;

        if (formContainer) {
            // Cria HTML do alerta
            const alertHTML = `
                <div class="rate-limit-alert" id="rateLimitAlert">
                    <div class="rate-limit-content">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                        <div>
                            <strong>🚨 Cadastro bloqueado!</strong>
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

            console.log('✅ Alerta do cadastro criado dinamicamente');
        } else {
            console.error('❌ Container do formulário de cadastro não encontrado para criar alerta');
        }
    }

    showAlert() {
        if (this.elements.alert) {
            // ✅ CORRIGIDO: Sempre força exibição
            this.elements.alert.style.display = 'block';
            console.log('👁️ Alerta do cadastro exibido');
        }
    }

    hideAlert() {
        if (this.elements.alert) {
            this.elements.alert.style.display = 'none';
            console.log('👁️ Alerta do cadastro escondido');
        }
    }

    processServerAlert() {
        if (!this.elements.alert) return;
        
        const text = this.elements.alert.textContent || this.elements.alert.innerText;
        const match = text.match(/(\d+)\s+segundos/);
        
        if (match) {
            const seconds = parseInt(match[1]);
            console.log(`⏰ Servidor indica ${seconds} segundos de bloqueio no cadastro`);
            
            this.isServerBlocked = true;
            this.startCountdown(seconds);
        }
    }

    startCountdown(seconds) {
        console.log(`🚀 Iniciando countdown do cadastro com ${seconds} segundos`);
        
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
                console.log('✅ Countdown do cadastro finalizado');
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
        console.log('👀 Detecção manual do cadastro iniciada');
    }

    // ✅ Verifica se elementos foram reabilitados manualmente
    checkManualChanges() {
        if (this.isManuallyEnabled) return;

        const elements = [
            this.elements.nomeInput,
            this.elements.emailInput,
            this.elements.senhaInput,
            this.elements.confirmarSenhaInput,
            this.elements.perfilInput,
            this.elements.comercioNomeInput,
            this.elements.comercioCnpjInput,
            this.elements.cadastroButton
        ];

        let hasEnabledElement = false;
        elements.forEach(el => {
            if (el && !el.disabled) {
                hasEnabledElement = true;
            }
        });

        if (hasEnabledElement) {
            this.detectionCount++;
            console.log(`🔍 Elemento do cadastro reabilitado detectado! Detecção ${this.detectionCount}/3`);
            
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
        localStorage.removeItem('cadastroRateLimitState');
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
            localStorage.setItem('cadastroRateLimitState', JSON.stringify(state));
            console.log(`💾 Estado do cadastro salvo: ${seconds}s restantes`);
        } catch (error) {
            console.log('❌ Erro ao salvar estado do cadastro:', error);
        }
    }

    // resources/js/login/rate-limiting.js
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
            this.elements.nomeInput,
            this.elements.emailInput,
            this.elements.senhaInput,
            this.elements.confirmarSenhaInput,
            this.elements.perfilInput,
            this.elements.comercioNomeInput,
            this.elements.comercioCnpjInput,
            this.elements.cadastroButton
        ];

        elements.forEach(el => {
            if (el) {
                el.disabled = true;
                
                // ✅ SEMPRE adiciona listeners para detectar mudanças
                el.addEventListener('focus', this.handleManualFocus);
                el.addEventListener('input', this.handleManualEnable);
                el.addEventListener('click', this.handleManualFocus);
            }
        });

        if (this.elements.cadastroButton) {
            this.elements.cadastroButton.textContent = 'Aguarde...';
        }

        console.log('🔒 Formulário de cadastro desabilitado');
    }

    handleManualEnable() {
        if (!this.isManuallyEnabled) {
            console.log('🔓 Reativação manual do cadastro confirmada');
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
            localStorage.removeItem('cadastroRateLimitState');
            this.hideAlert();
            
            // ✅ TIMEOUT PARA PUNIÇÃO - 10 segundos
            this.manualDetectionTimeout = setTimeout(() => {
                if (this.isManuallyEnabled) {
                    console.log('⚠️ Aplicando punição por burla do sistema de cadastro');
                    this.isManuallyEnabled = false;
                    this.detectionCount = 0;
                    
                    // ✅ CORRIGIDO: Recriar alerta e atualizar referências
                    this.createOrShowAlert(90);
                    
                    // ✅ AGUARDA ELEMENTOS SEREM CRIADOS
                    setTimeout(() => {
                        this.findElements();
                        
                        if (this.elements.alert) {
                            const alertText = this.elements.alert.querySelector('strong');
                            if (alertText) {
                                alertText.textContent = '🚨 Tentativa de burlar o sistema detectada!';
                            }
                            const alertDesc = this.elements.alert.querySelector('p');
                            if (alertDesc) {
                                alertDesc.innerHTML = 'Bloqueio estendido. Aguarde <span id="countdown">90</span> segundos para tentar novamente.';
                                this.elements.countdown = alertDesc.querySelector('#countdown');
                            }
                        }
                        
                        this.startCountdown(90);
                    }, 100);
                }
            }, 10000);
        }
    }

    enableForm() {
        const elements = [
            this.elements.nomeInput,
            this.elements.emailInput,
            this.elements.senhaInput,
            this.elements.confirmarSenhaInput,
            this.elements.perfilInput,
            this.elements.comercioNomeInput,
            this.elements.comercioCnpjInput,
            this.elements.cadastroButton
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

        if (this.elements.cadastroButton) {
            this.elements.cadastroButton.textContent = 'Cadastrar';
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

        console.log('🔓 Formulário de cadastro habilitado');
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
        
        localStorage.removeItem('cadastroRateLimitState');
        this.isManuallyEnabled = true;
        this.detectionCount = 0;
        this.isServerBlocked = false;
        this.enableForm();
        
        console.log('🔄 Reset forçado do rate limiting do cadastro');
    }
}

// Inicializa apenas na página de cadastro
if (document.getElementById('cadastroForm')) {
    const cadastroRateLimiter = new CadastroRateLimitingCounter();
    window.cadastroRateLimiter = cadastroRateLimiter;
    
    // Atalho para reset (Ctrl+Shift+C)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            console.log('🔄 Reset manual do cadastro ativado');
            cadastroRateLimiter.forceReset();
        }
    });
}