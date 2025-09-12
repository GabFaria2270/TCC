<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Gerenciamento</title>
    @vite([
        'resources/css/app.css',
        'resources/js/geralJS.js'
    ])
</head>
<body class="bg-body-tertiary">
    <div class="d-flex min-vh-100">
        <!-- Sidebar -->
        <nav id="sidebar" class="sidebar bg-white border-end" aria-label="Navegação principal">
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

                <!-- Barra de acessibilidade: tamanho do texto e alto contraste -->
                <div class="d-flex flex-wrap gap-2 align-items-center mb-3" role="region" aria-label="Acessibilidade">
                    <span class="text-secondary">Acessibilidade:</span>
                    <button class="btn btn-sm btn-outline-secondary" id="a11y-font-dec" type="button" aria-label="Diminuir tamanho do texto">A-</button>
                    <button class="btn btn-sm btn-outline-secondary" id="a11y-font-inc" type="button" aria-label="Aumentar tamanho do texto">A+</button>
                    <button class="btn btn-sm btn-outline-dark" id="a11y-contrast" type="button" aria-pressed="false">Alto contraste</button>
                </div>

                <!-- Boas-vindas e informações da mercearia -->
                <div class="row g-3">
                    <div class="col-12">
                        <div class="card shadow-sm welcome-hero">
                            <div class="card-body d-flex flex-column flex-lg-row align-items-lg-center gap-3">
                                <div class="flex-grow-1">
                                    <h2 class="h3 m-0">Bem-vindo(a), {{ auth()->user()->NOME ?? 'Usuário' }} 👋</h2>
                                    <p class="text-secondary mb-0">Aqui você gerencia sua mercearia de forma simples e acessível.</p>
                                </div>
                                <div>
                                    <a href="#" class="btn btn-primary">Começar agora</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-xxl-7">
                        <div class="card shadow-sm h-100">
                            <div class="card-header bg-white">
                                <strong>Informações da mercearia</strong>
                            </div>
                            <div class="card-body">
                                @php($comercio = auth()->user()->comercio ?? null)
                                <dl class="row mb-0">
                                    <dt class="col-12 col-sm-4">Nome</dt>
                                    <dd class="col-12 col-sm-8">{{ $comercio->nome ?? '—' }}</dd>

                                    <dt class="col-12 col-sm-4">CNPJ</dt>
                                    <dd class="col-12 col-sm-8">{{ $comercio->cnpj ?? '—' }}</dd>

                                    <dt class="col-12 col-sm-4">Responsável</dt>
                                    <dd class="col-12 col-sm-8">{{ auth()->user()->NOME ?? '—' }}</dd>

                                    <dt class="col-12 col-sm-4">Perfil</dt>
                                    <dd class="col-12 col-sm-8">{{ auth()->user()->PERFIL ?? '—' }}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-xxl-5">
                        <div class="card shadow-sm h-100">
                            <div class="card-header bg-white">
                                <strong>Dicas rápidas</strong>
                            </div>
                            <div class="card-body">
                                <ul class="mb-0">
                                    <li>Use A- e A+ para aumentar ou reduzir o texto.</li>
                                    <li>Ative alto contraste para melhorar a leitura.</li>
                                    <li>No celular, toque em “Menu” para abrir a barra lateral.</li>
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
