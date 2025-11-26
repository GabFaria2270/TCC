import LoaderSystem from '../reultilizaveis/loader-system.js';

const getPasswordRequirementStatus = (password) => ({
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&#]/.test(password),
});

const updatePasswordRequirementIndicators = (password, container) => {
    const statuses = getPasswordRequirementStatus(password);

    Object.entries(statuses).forEach(([rule, isValid]) => {
        const element = container.querySelector(`[data-requirement="${rule}"]`);
        if (!element) {
            return;
        }

        element.classList.remove('valid', 'invalid');
        if (password.length > 0) {
            element.classList.add(isValid ? 'valid' : 'invalid');
        }
    });

    return statuses;
};

const setupPasswordRequirements = () => {
    const passwordInput = document.getElementById('password');
    const requirementsContainer = document.getElementById('passwordRequirements');

    if (!passwordInput || !requirementsContainer) {
        return;
    }

    const validate = () => updatePasswordRequirementIndicators(passwordInput.value, requirementsContainer);
    const showRequirements = () => {
        requirementsContainer.classList.add('show');
        validate();
    };
    const hideRequirements = () => {
        requirementsContainer.classList.remove('show');
    };
    const syncInitialState = () => {
        if (document.activeElement === passwordInput || passwordInput.value.length > 0) {
            showRequirements();
        } else {
            hideRequirements();
        }
    };

    passwordInput.addEventListener('focus', () => {
        showRequirements();
    });

    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.length === 0) {
            hideRequirements();
            return;
        }
        showRequirements();
    });

    passwordInput.addEventListener('blur', () => {
        if (passwordInput.value.length === 0) {
            hideRequirements();
        }
    });

    document.addEventListener('focusin', (event) => {
        if (event.target === passwordInput || event.target.tagName !== 'INPUT') {
            return;
        }

        const statuses = validate();
        const allValid = statuses && Object.values(statuses).every(Boolean);
        if (allValid) {
            hideRequirements();
        }
    });

    // Garante que o estado inicial respeite autofocus/preenchimento prévio
    syncInitialState();
};

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
        setupPasswordRequirements();
    }
};

document.addEventListener('DOMContentLoaded', initResetPassword);
