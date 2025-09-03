/**
 * Sistema Unificado de Toggle de Senha - MANTENDO COMPORTAMENTO ATUAL
 */

class PasswordToggle {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupToggles();
        });
    }

    setupToggles() {
        // Busca todos os ícones de toggle (mantém seletores atuais)
        document.querySelectorAll('.eye-icon').forEach(icon => {
            icon.addEventListener('click', (e) => this.handleToggle(e));
        });

        console.log('👁️ Sistema de toggle de senha inicializado');
    }

    handleToggle(event) {
        const icon = event.target;
        const targetId = icon.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (!input) return;

        // MANTÉM A LÓGICA ATUAL
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        }
    }
}

// Inicializa automaticamente
new PasswordToggle();