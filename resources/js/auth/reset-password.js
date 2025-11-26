import LoaderSystem from '../reultilizaveis/loader-system.js';

const toggleVisibility = (toggleId, inputId) => {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);

    if (!toggle || !input) {
        return;
    }

    const switchType = () => {
        const isPassword = input.getAttribute('type') === 'password';
        input.setAttribute('type', isPassword ? 'text' : 'password');
        const icon = toggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('bi-eye');
            icon.classList.toggle('bi-eye-slash');
        }
    };

    toggle.addEventListener('click', switchType);
    toggle.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            switchType();
        }
    });
};

const initResetPassword = () => {
    const formId = 'resetPasswordForm';
    const loaderId = 'loader-cadastro';

    if (document.getElementById(formId)) {
        new LoaderSystem(formId, loaderId);
        toggleVisibility('togglePassword', 'password');
        toggleVisibility('togglePasswordConfirm', 'password_confirmation');
    }
};

document.addEventListener('DOMContentLoaded', initResetPassword);
