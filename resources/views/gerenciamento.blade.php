<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Gerenciamento</title>
    @vite([
        'resources/css/app.css',
        'resources/css/gerenciamento/gerenciamento.css',
        'resources/js/geralJS.js',
        'resources/js/gerenciamento/gerenciamento.js',
    ])
</head>
<body class="bg-body-tertiary">
    <div class="d-flex min-vh-100">
        <!-- Sidebar -->
        <nav id="sidebar" class="sidebar bg-white border-end d-none d-lg-block" aria-label="Navegação principal">
            <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
                <div class="brand-title">Mercearia Fácil</div>
                <button id="sidebarClose" class="btn btn-sm btn-outline-secondary d-lg-none" aria-label="Fechar menu">
                    ×
                </button>
            </div>
            <div class="list-group list-group-flush">
                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center">
                    <span class="me-2 large-icon">🏠</span> Início
                </a>
                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center">
                    <span class="me-2 large-icon">🧑</span> Clientes
                </a>
                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center">
                    <span class="me-2 large-icon">🧾</span> Vendas
                </a>
                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center">
                    <span class="me-2 large-icon">📒</span> Conta Fiado
                </a>
                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center">
                    <span class="me-2 large-icon">📦</span> Estoque
                </a>
                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center">
                    <span class="me-2 large-icon">📊</span> Relatórios
                </a>
                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center">
                    <span class="me-2 large-icon">⚙️</span> Configurações
                </a>
                <form method="POST" action="{{ route('logout') }}" class="list-group-item m-0 p-0">
                    @csrf
                    <button type="submit" class="btn w-100 text-start p-3 d-flex align-items-center">
                        <span class="me-2 large-icon">🚪</span> Sair
                    </button>
                </form>
            </div>
        </nav>

        <!-- Conteúdo -->
        <main class="flex-grow-1">
            <!-- Topbar simples -->
            <header class="d-flex align-items-center justify-content-between p-3 border-bottom bg-white">
                <div class="d-flex align-items-center gap-2">
                    <button id="sidebarToggle" class="btn btn-outline-secondary d-lg-none" aria-controls="sidebar" aria-expanded="false" aria-label="Abrir menu">
                        ☰ Menu
                    </button>
                    <h1 class="h4 m-0">Painel de Gerenciamento</h1>
                </div>
                <div class="text-end">
                    <div class="fw-semibold">Olá, {{ auth()->user()->NOME ?? 'Usuário' }}</div>
                    <small class="text-secondary">Perfil: {{ auth()->user()->PERFIL ?? '—' }}</small>
                </div>
            </header>

            <section class="container-fluid p-4">
                @if (session('success'))
                    <div class="alert alert-success" role="alert">{{ session('success') }}</div>
                @endif
                @if (session('error'))
                    <div class="alert alert-danger" role="alert">{{ session('error') }}</div>
                @endif

                <!-- Ações rápidas -> botões grandes e claros -->
                <div class="row g-3 quick-actions">
                    <div class="col-12 col-md-6 col-xl-3">
                        <div class="card shadow-sm h-100">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">Nova Venda</h5>
                                <p class="text-secondary mb-3">Registre uma venda rapidamente.</p>
                                <a href="#" class="btn btn-primary mt-auto">➕ Registrar Venda</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-3">
                        <div class="card shadow-sm h-100">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">Pagamento</h5>
                                <p class="text-secondary mb-3">Registrar pagamento de fiado.</p>
                                <a href="#" class="btn btn-success mt-auto">💵 Registrar Pagamento</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-3">
                        <div class="card shadow-sm h-100">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">Cliente</h5>
                                <p class="text-secondary mb-3">Adicionar novo cliente.</p>
                                <a href="#" class="btn btn-outline-primary mt-auto">🧑➕ Adicionar Cliente</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-3">
                        <div class="card shadow-sm h-100">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">Estoque</h5>
                                <p class="text-secondary mb-3">Atualizar produtos e quantidades.</p>
                                <a href="#" class="btn btn-outline-secondary mt-auto">📦 Gerir Estoque</a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Área principal (exemplo de tabela/resumo) -->
                <div class="row g-3 mt-1">
                    <div class="col-12 col-xxl-8">
                        <div class="card shadow-sm">
                            <div class="card-header bg-white">
                                <strong>Resumo do Dia</strong>
                            </div>
                            <div class="card-body">
                                <ul class="list-unstyled mb-0">
                                    <li class="mb-2">• Vendas hoje: <strong>—</strong></li>
                                    <li class="mb-2">• Pagamentos recebidos: <strong>—</strong></li>
                                    <li class="mb-2">• Fiados lançados: <strong>—</strong></li>
                                </ul>
                                <small class="text-secondary">Os dados serão exibidos aqui quando conectarmos às rotas.</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-xxl-4">
                        <div class="card shadow-sm h-100">
                            <div class="card-header bg-white">
                                <strong>Dicas Rápidas</strong>
                            </div>
                            <div class="card-body">
                                <ul>
                                    <li>Use os botões grandes para ações comuns.</li>
                                    <li>O menu fica à esquerda, sempre visível em telas grandes.</li>
                                    <li>No celular, toque em "Menu" para abrir a barra lateral.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>

    
</body>
</html>
