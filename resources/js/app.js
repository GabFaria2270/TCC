// 1. Manter as importações essenciais
import '../css/app.css';
import 'bootstrap';

// 2. Importar os seus módulos reutilizáveis
import LoaderSystem from './reultilizaveis/loader-system.js';
import PasswordToggle from './reultilizaveis/password-toggle.js';
import CnpjFormatter from './reultilizaveis/cnpj-formatter.js';

// 3. Inicializar tudo de forma centralizada
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa os sistemas que devem correr em TODAS as páginas
    new LoaderSystem();

    // Inicializa funcionalidades apenas se os elementos existirem na página
    if (document.querySelector('.toggle-password')) {
        new PasswordToggle();
    }
    if (document.querySelector('input[name="cnpj"]')) {
        new CnpjFormatter();
    }
});