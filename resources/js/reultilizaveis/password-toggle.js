/**
 * Sistema Unificado de Toggle de Senha - COMPORTAMENTO DINÂMICO
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
        // Busca todos os campos de senha
        const passwordFields = document.querySelectorAll('input[type="password"]');
        
        passwordFields.forEach(field => {
            const eyeIcon = this.findEyeIcon(field);
            if (eyeIcon) {
                this.setupPasswordField(field, eyeIcon);
            }
        });

        console.log('👁️ Sistema de toggle de senha inicializado');
    }

    findEyeIcon(passwordField) {
        // Busca o ícone de olho relacionado ao campo
        const fieldId = passwordField.id;
        let eyeIcon = null;

        // Tenta encontrar por ID específico
        if (fieldId === 'SENHA_HASH') {
            eyeIcon = document.getElementById('toggleSenha');
        } else if (fieldId === 'SENHA_HASH_confirmation') {
            eyeIcon = document.getElementById('toggleSenhaConfirm');
        }

        // Se não encontrou, busca na mesma div pai
        if (!eyeIcon) {
            const parent = passwordField.parentElement;
            eyeIcon = parent.querySelector('.eye-icon');
        }

        return eyeIcon;
    }

    setupPasswordField(field, eyeIcon) {
        // Inicializa o ícone como escondido
        this.hideEyeIcon(eyeIcon);
        
        // Adiciona ícone Bootstrap se não existir
        if (!eyeIcon.querySelector('i')) {
            eyeIcon.innerHTML = '<i class="bi bi-eye-slash"></i>';
        }

        // Event listener para mostrar/esconder ícone baseado no conteúdo
        field.addEventListener('input', () => {
            if (field.value.length > 0) {
                this.showEyeIcon(eyeIcon);
            } else {
                this.hideEyeIcon(eyeIcon);
                // Reset para senha escondida quando campo vazio
                if (field.type === 'text') {
                    field.type = 'password';
                    const icon = eyeIcon.querySelector('i');
                    if (icon) {
                        icon.className = 'bi bi-eye-slash';
                    }
                }
            }
        });

        // Event listener para toggle da senha
        eyeIcon.addEventListener('click', () => {
            if (field.value.length > 0) {
                this.togglePassword(field, eyeIcon);
            }
        });

        // Verifica se já tem conteúdo no carregamento da página
        if (field.value.length > 0) {
            this.showEyeIcon(eyeIcon);
        }
    }

    togglePassword(field, eyeIcon) {
        const icon = eyeIcon.querySelector('i');
        
        if (field.type === 'password') {
            field.type = 'text';
            if (icon) {
                icon.className = 'bi bi-eye';
            }
        } else {
            field.type = 'password';
            if (icon) {
                icon.className = 'bi bi-eye-slash';
            }
        }
    }

    showEyeIcon(eyeIcon) {
        eyeIcon.style.display = 'block';
        eyeIcon.style.opacity = '0.7';
    }

    hideEyeIcon(eyeIcon) {
        eyeIcon.style.display = 'none';
    }
}

export default PasswordToggle;