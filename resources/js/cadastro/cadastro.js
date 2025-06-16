// Função para mostrar o loader e desabilitar o botão de submit
function mostrarLoader(form, loader) {
    loader.style.display = 'flex';
    iniciarAnimacaoLoader();
}

// Função para esconder o loader e habilitar o botão de submit
function esconderLoader(form, loader) {
    loader.style.display = 'none';
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = false;
    pararAnimacaoLoader();
}

// Função para exibir mensagem de sucesso ou erro
function exibirMensagem(data) {
    const mensagens = document.querySelector('.form-cadastro-messages');
    if (mensagens && data && data.message) {
        mensagens.innerHTML = `<div class="alert alert-${data.success ? 'success' : 'danger'}">${data.message}</div>`;
    }
}

// Função principal para lidar com o envio do formulário via AJAX ou normal
function inicializarCadastroAJAX() {
    const form = document.getElementById('cadastroForm');
    const loader = document.getElementById('loader-cadastro');
    if (!form || !loader) return;

    form.addEventListener('submit', function (e) {
        // Mostra o loader, mas NÃO impede o submit normal
        mostrarLoader(form, loader);
        // Não faz fetch, deixa o submit tradicional acontecer
    });
}

function iniciarAnimacaoLoader() {
    const img = document.getElementById('imgloader');
    if (img) {
        // Apenas garante que a imagem está visível, sem alternância
        img.style.display = 'block';
    }
}

function pararAnimacaoLoader() {
    const img = document.getElementById('imgloader');
    if (img) {
        img.style.display = 'none';
    }
}

// Inicializa o AJAX do cadastro quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializarCadastroAJAX);