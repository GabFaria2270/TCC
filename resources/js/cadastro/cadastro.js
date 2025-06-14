// Função para mostrar o loader e desabilitar o botão de submit
function mostrarLoader(form, loader) {
    loader.style.display = 'flex';
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
}

// Função para esconder o loader e habilitar o botão de submit
function esconderLoader(form, loader) {
    loader.style.display = 'none';
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = false;
}

// Função para exibir mensagem de sucesso ou erro
function exibirMensagem(data) {
    const mensagens = document.querySelector('.form-cadastro-messages');
    if (mensagens && data && data.message) {
        mensagens.innerHTML = `<div class="alert alert-${data.success ? 'success' : 'danger'}">${data.message}</div>`;
    }
}

// Função principal para lidar com o envio do formulário via AJAX
function inicializarCadastroAJAX() {
    const form = document.getElementById('cadastroForm');
    const loader = document.getElementById('loader-cadastro');
    if (!form || !loader) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        mostrarLoader(form, loader);

        const formData = new FormData(form);

        fetch(form.action, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': form.querySelector('input[name="_token"]').value
            },
            body: formData
        })
        .then(async response => {
            loader.style.display = 'none';
            let data;
            try {
                data = await response.json();
            } catch {
                return;
            }
            const mensagens = document.querySelector('.form-cadastro-messages');
            if (mensagens) {
                // Exibe múltiplos erros se existirem
                if (data.errors) {
                    let mensagensHtml = '';
                    Object.values(data.errors).forEach(arr => {
                        arr.forEach(msg => {
                            mensagensHtml += `<div class="form-cadastro-error">${msg}</div>`;
                        });
                    });
                    mensagens.innerHTML = mensagensHtml;
                } else if (data.message) {
                    mensagens.innerHTML = `<div class="alert alert-${data.success ? 'success' : 'danger'}">${data.message}</div>`;
                }
            }
        })
        .catch(() => {
            loader.style.display = 'none';
        });
    });
}

// Inicializa o AJAX do cadastro quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializarCadastroAJAX);