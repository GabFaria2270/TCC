/**
 * Sistema de Cadastro - REFATORADO MANTENDO ESTÉTICA ATUAL
 */

import './cadastro/rate-limiting.js';


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

// Inicializa apenas se estiver na página de cadastro
if (document.getElementById('cadastroForm') || document.querySelector('.form-cadastro')) {
    const registerSystem = new RegisterSystem();
    window.RegisterSystem = RegisterSystem;
}

