/**
 * Sistema de Cadastro
 * Gerencia funcionalidades do formulário de cadastro
 */

class RegisterSystem {
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
        this.form = document.getElementById('cadastroForm');
        this.loader = document.getElementById('loader-cadastro');
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

        console.log('📤 Enviando formulário de cadastro...');
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
        const nomeInput = document.getElementById('NOME');
        const emailInput = document.getElementById('EMAIL');
        const senhaInput = document.getElementById('SENHA_HASH');
        const senhaConfirmInput = document.getElementById('SENHA_HASH_confirmation');
        const perfilInput = document.getElementById('PERFIL');

        if (nomeInput) {
            nomeInput.addEventListener('blur', this.validateNome);
        }

        if (emailInput) {
            emailInput.addEventListener('blur', this.validateEmail);
        }

        if (senhaInput) {
            senhaInput.addEventListener('blur', this.validatePassword);
        }

        if (senhaConfirmInput) {
            senhaConfirmInput.addEventListener('blur', this.validatePasswordConfirmation);
        }

        if (perfilInput) {
            perfilInput.addEventListener('blur', this.validatePerfil);
        }
    }

    validateNome(event) {
        const nome = event.target.value;
        const nomeRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
        
        if (nome && (nome.length < 2 || !nomeRegex.test(nome))) {
            event.target.style.borderColor = '#e74c3c';
        } else {
            event.target.style.borderColor = '';
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

    validatePasswordConfirmation(event) {
        const password = document.getElementById('SENHA_HASH')?.value;
        const passwordConfirm = event.target.value;
        
        if (passwordConfirm && password !== passwordConfirm) {
            event.target.style.borderColor = '#e74c3c';
        } else {
            event.target.style.borderColor = '';
        }
    }

    validatePerfil(event) {
        const perfil = event.target.value;
        const perfilRegex = /^[a-z0-9_-]+$/;
        
        if (perfil && (perfil.length < 3 || !perfilRegex.test(perfil))) {
            event.target.style.borderColor = '#e74c3c';
        } else {
            event.target.style.borderColor = '';
        }
    }
}

// Inicializa o sistema de cadastro
const registerSystem = new RegisterSystem();

// Exporta para uso global se necessário
window.RegisterSystem = RegisterSystem;