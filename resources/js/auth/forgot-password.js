import LoaderSystem from '../reultilizaveis/loader-system.js';

const initForgotPasswordLoader = () => {
    const formId = 'forgotPasswordForm';
    const loaderId = 'loader-cadastro';

    if (document.getElementById(formId)) {
        new LoaderSystem(formId, loaderId);
    }
};

document.addEventListener('DOMContentLoaded', initForgotPasswordLoader);
