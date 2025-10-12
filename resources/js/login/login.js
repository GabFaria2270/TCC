/**
 * Sistema de Login - REFATORADO MANTENDO ESTÉTICA ATUAL
 */

import LoaderSystem from '../reultilizaveis/loader-system.js';
import ValidationSystem from '../reultilizaveis/validation-system.js';
import './rate-limiting.js';

class LoginSystem {
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
        // USA O ID ATUAL - loader-cadastro (como está no login.blade.php)
        this.loader = new LoaderSystem('loginForm', 'loader-cadastro');

        // Inicializa validação
        this.validation = new ValidationSystem();

        // Adiciona validações específicas do login
        this.validation.addValidation('EMAIL', 'email');
        this.validation.addValidation('SENHA_HASH', 'password');

        console.log('✅ Sistema de login inicializado');
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

// Inicializa apenas se estiver na página de login
if (document.getElementById('loginForm') || document.querySelector('.form-login')) {
    const loginSystem = new LoginSystem();

    // Adiciona a funcionalidade ao campo de senha
    if (document.getElementById('toggleSenha') && document.getElementById('SENHA_HASH')) {
        togglePasswordVisibility('toggleSenha', 'SENHA_HASH');
    }

    window.LoginSystem = LoginSystem;
}
