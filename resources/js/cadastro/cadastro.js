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

        console.log('✅ Sistema de cadastro inicializado');
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
