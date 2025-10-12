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
            perfil: this.validatePerfil.bind(this),
            cnpj: this.validateCnpj.bind(this)
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

    // ✅ NOVO: Método de validação de CNPJ
    validateCnpj(event) {
        const cnpj = event.target.value.replace(/\D/g, ''); // Remove formatação
        
        if (cnpj && (cnpj.length !== 14 || !this.isValidCnpj(cnpj))) {
            event.target.style.borderColor = '#e74c3c';
        } else {
            event.target.style.borderColor = '';
        }
    }

    // ✅ NOVO: Método auxiliar para validar CNPJ
    isValidCnpj(cnpj) {
        // Verifica se são todos iguais
        if (/^(\d)\1{13}$/.test(cnpj)) {
            return false;
        }
        
        // Algoritmo de validação do CNPJ
        let sum = 0;
        let weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        
        // Primeiro dígito verificador
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cnpj[i]) * weights[i];
        }
        
        let remainder = sum % 11;
        let digit1 = remainder < 2 ? 0 : 11 - remainder;
        
        if (parseInt(cnpj[12]) !== digit1) {
            return false;
        }
        
        // Segundo dígito verificador
        sum = 0;
        weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        
        for (let i = 0; i < 13; i++) {
            sum += parseInt(cnpj[i]) * weights[i];
        }
        
        remainder = sum % 11;
        let digit2 = remainder < 2 ? 0 : 11 - remainder;
        
        return parseInt(cnpj[13]) === digit2;
    }
}

export default ValidationSystem;