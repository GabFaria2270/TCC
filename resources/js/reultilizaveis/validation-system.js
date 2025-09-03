// filepath: c:\Users\User\Desktop\TCC\resources\js\reultilizaveis\validation-system.js
/**
 * Sistema Unificado de Validação - MANTENDO ESTILO ATUAL
 */

class ValidationSystem {
    constructor() {
        this.validators = {
            nome: this.validateNome.bind(this),
            email: this.validateEmail.bind(this),
            password: this.validatePassword.bind(this),
            passwordConfirmation: this.validatePasswordConfirmation.bind(this),
            perfil: this.validatePerfil.bind(this)
        };
    }

    addValidation(fieldId, validatorType) {
        const field = document.getElementById(fieldId);
        if (field && this.validators[validatorType]) {
            field.addEventListener('blur', this.validators[validatorType]);
        }
    }

    // MANTÉM A VALIDAÇÃO ATUAL (só muda cor da borda)
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

// Exporta para uso global
window.ValidationSystem = ValidationSystem;