/**
 * Sistema de Login
 * Gerencia funcionalidades do formulário de login - IGUAL AO CADASTRO
 */

class LoginSystem {
    constructor() {
        this.form = null;
        this.loader = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupElements();
            this.bindEvents();
        });
    }

    setupElements() {
        this.form = document.getElementById('loginForm');
        this.loader = document.getElementById('loader-cadastro'); // MESMO ID DO CADASTRO
        
        console.log('🔧 Elementos do LoginSystem:', {
            form: !!this.form,
            loader: !!this.loader,
            formId: this.form?.id,
            loaderId: this.loader?.id
        });
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Adiciona validação em tempo real
        this.addRealTimeValidation();
    }

    handleSubmit(event) {
        // Mostra o loader se disponível
        if (this.loader) {
            this.mostrarLoader();
        }
        console.log('📤 Enviando formulário de login...');
    }

    mostrarLoader() {
        if (this.loader) {
            this.loader.style.display = 'flex';
            this.iniciarAnimacaoLoader();
            console.log('🔄 Loader do login ativado');
        }
    }

    esconderLoader() {
        if (this.loader) {
            this.loader.style.display = 'none';
            this.pararAnimacaoLoader();
        }
    }

    iniciarAnimacaoLoader() {
        const img = document.getElementById('imgloader'); // MESMO ID DO CADASTRO
        if (img) {
            img.style.display = 'block';
        }
    }

    pararAnimacaoLoader() {
        const img = document.getElementById('imgloader'); // MESMO ID DO CADASTRO
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
        
        if (password && password.length < 8) {
            event.target.style.borderColor = '#e74c3c';
        } else {
            event.target.style.borderColor = '';
        }
    }
}

// Inicializa o sistema - IGUAL AO CADASTRO
const loginSystem = new LoginSystem();

// Exporta para uso global se necessário
window.LoginSystem = LoginSystem;

function passwordToggle() {
    const senhaInput = document.getElementById('SENHA_HASH');
    
    // Só adiciona event listeners se os elementos existirem
    document.querySelectorAll('.eye-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    this.classList.remove('bi-eye');
                    this.classList.add('bi-eye-slash');
                } else {
                    input.type = 'password';
                    this.classList.remove('bi-eye-slash');
                    this.classList.add('bi-eye');
                }
            }
        });
    });
}

// Só executa se estiver na página de login
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se está na página de login antes de executar
    if (document.getElementById('loginForm') || document.querySelector('.form-login')) {
        passwordToggle();
    }
});