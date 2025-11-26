/**
 * Sistema de Cadastro - REFATORADO MANTENDO ESTÉTICA ATUAL
 */

import CNPJFormatter from '../reultilizaveis/cnpj-formatter.js';
import LoaderSystem from '../reultilizaveis/loader-system.js';
import ValidationSystem from '../reultilizaveis/validation-system.js';
import './rate-limiting.js';

class RegisterSystem {
    constructor() {
        this.loader = null;
        this.validation = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupSystems();
        });
    }

    setupSystems() {
        // USA OS IDS ATUAIS - loader-cadastro (como está no CSS)
        this.loader = new LoaderSystem('cadastroForm', 'loader-cadastro');

        // Inicializa validação
        this.validation = new ValidationSystem();

        // Adiciona validações específicas do cadastro
        this.validation.addValidation('NOME', 'nome');
        this.validation.addValidation('EMAIL', 'email');
        this.validation.addValidation('SENHA_HASH', 'password');
        this.validation.addValidation('SENHA_HASH_confirmation', 'passwordConfirmation');
        this.validation.addValidation('PERFIL', 'perfil');
        this.validation.addValidation('COMERCIO_CNPJ', 'cnpj');

        if (typeof CNPJFormatter !== 'undefined') {
            this.cnpjFormatter = new CNPJFormatter();
        }

        // Inicializa o validador de requisitos da senha
        this.setupPasswordRequirements();

        console.log('✅ Sistema de cadastro inicializado');
    }

    setupPasswordRequirements() {
        const passwordInput = document.getElementById('SENHA_HASH');
        const requirementsContainer = document.getElementById('passwordRequirements');

        if (!passwordInput || !requirementsContainer) return;

        // Mostra os requisitos quando o campo recebe foco
        passwordInput.addEventListener('focus', () => {
            if (passwordInput.value.length > 0) {
                requirementsContainer.classList.add('show');
            } else {
                requirementsContainer.classList.remove('show');
            }
            this.validatePasswordRequirements(passwordInput.value);
        });

        // Valida em tempo real conforme o usuário digita
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value.length > 0) {
                requirementsContainer.classList.add('show');
            } else {
                requirementsContainer.classList.remove('show');
            }
            this.validatePasswordRequirements(passwordInput.value);
        });

        // Esconde quando sai do campo sem digitar nada
        passwordInput.addEventListener('blur', () => {
            if (passwordInput.value.length === 0) {
                requirementsContainer.classList.remove('show');
            }
        });

        // Esconde os requisitos apenas quando outro campo de input recebe foco
        document.addEventListener('focusin', (e) => {
            // Se o foco foi para outro elemento que não seja o campo de senha
            if (e.target !== passwordInput && e.target.tagName === 'INPUT') {
                const allValid = this.checkAllRequirements(passwordInput.value);
                if (allValid || passwordInput.value.length === 0) {
                    requirementsContainer.classList.remove('show');
                }
            }
        });

        if (passwordInput.value.length > 0) {
            requirementsContainer.classList.add('show');
        } else {
            requirementsContainer.classList.remove('show');
        }
        this.validatePasswordRequirements(passwordInput.value);
    }

    validatePasswordRequirements(password) {
        const requirements = {
            length: password.length >= 12,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[@$!%*?&#]/.test(password),
        };

        // Atualiza cada requisito visualmente
        Object.keys(requirements).forEach((key) => {
            const element = document.querySelector(`[data-requirement="${key}"]`);
            if (element) {
                element.classList.remove('valid', 'invalid');
                if (password.length > 0) {
                    element.classList.add(requirements[key] ? 'valid' : 'invalid');
                }
            }
        });

        return requirements;
    }

    checkAllRequirements(password) {
        const requirements = this.validatePasswordRequirements(password);
        return Object.values(requirements).every((valid) => valid);
    }
}

// Função para alternar visibilidade da senha
function togglePasswordVisibility(toggleId, inputId) {
    const toggleElement = document.getElementById(toggleId);
    const inputElement = document.getElementById(inputId);

    if (toggleElement && inputElement) {
        toggleElement.addEventListener('click', () => {
            const isPassword = inputElement.type === 'password';
            inputElement.type = isPassword ? 'text' : 'password';

            const icon = toggleElement.querySelector('i');
            if (icon) {
                icon.classList.toggle('bi-eye');
                icon.classList.toggle('bi-eye-slash');
            }
        });
    }
}

// Adiciona a funcionalidade aos campos de senha
if (document.getElementById('toggleSenha') && document.getElementById('SENHA_HASH')) {
    togglePasswordVisibility('toggleSenha', 'SENHA_HASH');
}

if (document.getElementById('toggleSenhaConfirm') && document.getElementById('SENHA_HASH_confirmation')) {
    togglePasswordVisibility('toggleSenhaConfirm', 'SENHA_HASH_confirmation');
}

// Inicializa apenas se estiver na página de cadastro
if (document.getElementById('cadastroForm') || document.querySelector('.form-cadastro')) {
    const registerSystem = new RegisterSystem();
    window.RegisterSystem = RegisterSystem;
}
