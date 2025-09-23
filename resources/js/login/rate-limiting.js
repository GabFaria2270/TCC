/**
 * Rate Limiting para Login - OTIMIZADO
 */

class LoginRateLimitingCounter {
    constructor() {
        this.elements = {};
        this.countdownInterval = null;
        this.manualCheckInterval = null;
        this.manualDetectionTimeout = null;
        this.remainingSeconds = 0;
        this.isBlocked = false;
        this.lastPunish = 0; // <-- NOVO: controla intervalo entre punições

        this.handleManualEnable = this.handleManualEnable.bind(this);
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
        const persisted = this.checkPersistedState();
        if (!persisted && this.elements.alert && this.isAlertVisible()) {
            this.processServerAlert();
        } else if (!persisted) {
            this.enableForm();
        }
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
    }

    isAlertVisible() {
        const el = this.elements.alert;
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetHeight > 0;
    }

    checkPersistedState() {
        try {
            const saved = localStorage.getItem('rateLimitState');
            if (saved) {
                const state = JSON.parse(saved);
                const now = Date.now();
                if (state.blockedUntil && now < state.blockedUntil) {
                    this.remainingSeconds = Math.ceil((state.blockedUntil - now) / 1000);
                    this.createOrShowAlert(this.remainingSeconds);
                    this.startCountdown(this.remainingSeconds);
                    return true;
                } else {
                    localStorage.removeItem('rateLimitState');
                }
            }
        } catch {}
        return false;
    }

    createOrShowAlert(remainingSeconds = 60) {
        if (this.elements.alert && this.isAlertVisible()) {
            this.showAlert();
            return;
        }
        if (!this.elements.alert) {
            this.createAlertElement(remainingSeconds);
            setTimeout(() => this.findElements(), 50);
        } else {
            this.showAlert();
        }
    }

    createAlertElement(remainingSeconds = 60) {
        const formContainer = document.querySelector('.form-login-body') ||
            document.querySelector('.form-login-container') ||
            document.querySelector('#loginForm')?.parentElement;
        if (!formContainer) return;
        formContainer.insertAdjacentHTML('afterbegin', `
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
        `);
        this.elements.alert = document.getElementById('rateLimitAlert');
        this.elements.countdown = document.getElementById('countdown');
        this.elements.progressFill = document.getElementById('progressFill');
    }

    showAlert() {
        if (this.elements.alert) this.elements.alert.style.display = 'block';
    }

    hideAlert() {
        if (this.elements.alert) this.elements.alert.style.display = 'none';
    }

    processServerAlert() {
        if (!this.elements.alert) return;
        const text = this.elements.alert.textContent || this.elements.alert.innerText;
        const match = text.match(/(\d+)\s+segundos/);
        if (match) {
            this.remainingSeconds = parseInt(match[1]);
            this.startCountdown(this.remainingSeconds);
        }
    }

    startCountdown(seconds) {
        this.remainingSeconds = seconds;
        this.disableForm();
        this.saveState(this.remainingSeconds);
        this.updateDisplay(this.remainingSeconds, seconds);

        if (this.countdownInterval) clearInterval(this.countdownInterval);
        if (this.manualCheckInterval) clearInterval(this.manualCheckInterval);

        this.countdownInterval = setInterval(() => {
            if (this.remainingSeconds > 1) {
                this.remainingSeconds--;
                this.updateDisplay(this.remainingSeconds, seconds);
                this.saveState(this.remainingSeconds);
            } else {
                this.finishCountdown();
            }
        }, 1000);

        this.manualCheckInterval = setInterval(this.checkManualChanges, 500);
    }

    updateDisplay(seconds, initialSeconds = 60) {
        if (!this.elements.countdown) this.findElements();
        if (this.elements.countdown) this.elements.countdown.textContent = seconds;
        if (this.elements.progressFill) {
            const progress = ((initialSeconds - seconds) / initialSeconds) * 100;
            this.elements.progressFill.style.width = progress + '%';
        }
    }

    disableForm() {
        const els = [
            this.elements.emailInput,
            this.elements.senhaInput,
            this.elements.loginButton
        ];
        els.forEach(el => {
            if (el) {
                el.disabled = true;
                el.addEventListener('focus', this.handleManualEnable);
                el.addEventListener('input', this.handleManualEnable);
                el.addEventListener('click', this.handleManualEnable);
            }
        });
        if (this.elements.loginButton) this.elements.loginButton.textContent = 'Aguarde...';
        this.createOrShowAlert(this.remainingSeconds);
    }

    enableForm() {
        const els = [
            this.elements.emailInput,
            this.elements.senhaInput,
            this.elements.loginButton
        ];
        els.forEach(el => {
            if (el) {
                el.disabled = false;
                el.removeEventListener('focus', this.handleManualEnable);
                el.removeEventListener('input', this.handleManualEnable);
                el.removeEventListener('click', this.handleManualEnable);
            }
        });
        if (this.elements.loginButton) this.elements.loginButton.textContent = 'Entrar';
        this.hideAlert();
        if (this.elements.progressFill) this.elements.progressFill.style.width = '0%';
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        if (this.manualCheckInterval) clearInterval(this.manualCheckInterval);
    }

    finishCountdown() {
        clearInterval(this.countdownInterval);
        clearInterval(this.manualCheckInterval);
        localStorage.removeItem('rateLimitState');
        this.enableForm();
    }

    saveState(seconds) {
        try {
            localStorage.setItem('rateLimitState', JSON.stringify({
                blockedUntil: Date.now() + (seconds * 1000),
                seconds,
                timestamp: Date.now()
            }));
        } catch {}
    }

    checkManualChanges() {
        const els = [
            this.elements.emailInput,
            this.elements.senhaInput,
            this.elements.loginButton
        ];
        // Se algum campo foi reabilitado manualmente
        if (els.some(el => el && !el.disabled)) {
            this.handleManualEnable();
            // Força todos a ficarem desabilitados novamente
            els.forEach(el => { if (el) el.disabled = true; });
            if (this.elements.loginButton) this.elements.loginButton.textContent = 'Aguarde...';
        }
    }

    handleManualEnable() {
        const now = Date.now();
        // Só pune se já passou 1 segundo da última punição
        if (!this.lastPunish || now - this.lastPunish > 1000) {
            this.remainingSeconds += 10;
            this.saveState(this.remainingSeconds);
            this.updateDisplay(this.remainingSeconds, this.remainingSeconds);
            this.lastPunish = now;
        }
    }

    forceReset() {
        clearInterval(this.countdownInterval);
        clearInterval(this.manualCheckInterval);
        localStorage.removeItem('rateLimitState');
        this.enableForm();
    }
}

// Inicializa apenas na página de login
if (document.getElementById('loginForm') || document.querySelector('.form-login')) {
    const loginRateLimiter = new LoginRateLimitingCounter();
    window.loginRateLimiter = loginRateLimiter;
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            loginRateLimiter.forceReset();
        }
    });
}