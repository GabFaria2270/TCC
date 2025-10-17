// 1. Manter as importações essenciais
import 'bootstrap';

// 2. Importar os seus módulos reutilizáveis
import LoaderSystem from './reultilizaveis/loader-system.js';
import PasswordToggle from './reultilizaveis/password-toggle.js';
import CnpjFormatter from './reultilizaveis/cnpj-formatter.js';

// 3. Inicializar tudo de forma centralizada
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa os sistemas que devem correr em TODAS as páginas
    new LoaderSystem();

    // Exibe o tour guiado apenas uma vez por navegador
    if (!localStorage.getItem('tourGuiadoFinalizado')) {
        iniciarTourGuiado();
        localStorage.setItem('tourGuiadoFinalizado', 'true');
    }

    // Inicializa funcionalidades apenas se os elementos existirem na página
    if (document.querySelector('.toggle-password')) {
        new PasswordToggle();
    }
    if (document.querySelector('input[name="cnpj"]')) {
        new CnpjFormatter();
    }
});

// Função para iniciar o tour guiado
function iniciarTourGuiado() {
    // Coloque aqui o código do seu tour guiado
    // Exemplo: window.startTour(); ou integração com biblioteca de tour
    // ...
}