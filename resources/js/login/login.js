/**
 * Sistema de Login - REFATORADO MANTENDO ESTÉTICA ATUAL
 */

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

// Inicializa apenas se estiver na página de login
if (document.getElementById('loginForm') || document.querySelector('.form-login')) {
    const loginSystem = new LoginSystem();
    window.LoginSystem = LoginSystem;
}