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

                <!-- KPIs do dia -->
                <div class="row g-3">
                    <div class="col-12 col-md-6 col-xxl-3">
                        <div class="card shadow-sm h-100 kpi" aria-label="Total de vendas hoje">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div class="kpi-label">Vendas hoje</div>
                                        <div class="kpi-value">12</div>
                                    </div>
                                    <span class="large-icon" aria-hidden="true">🧾</span>
                                </div>
                                <small class="text-secondary">R$ 784,00 em 12 vendas</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xxl-3">
                        <div class="card shadow-sm h-100 kpi" aria-label="Pagamentos recebidos">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div class="kpi-label">Pagamentos</div>
                                        <div class="kpi-value text-success">+ R$ 320,00</div>
                                    </div>
                                    <span class="large-icon" aria-hidden="true">💵</span>
                                </div>
                                <small class="text-secondary">5 clientes quitaram parcelas</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xxl-3">
                        <div class="card shadow-sm h-100 kpi" aria-label="Novos fiados">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div class="kpi-label">Fiados lançados</div>
                                        <div class="kpi-value text-danger">R$ 150,00</div>
                                    </div>
                                    <span class="large-icon" aria-hidden="true">📒</span>
                                </div>
                                <small class="text-secondary">2 novos lançamentos</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xxl-3">
                        <div class="card shadow-sm h-100 kpi" aria-label="Itens com pouco estoque">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div class="kpi-label">Baixo estoque</div>
                                        <div class="kpi-value">7</div>
                                    </div>
                                    <span class="large-icon" aria-hidden="true">📦</span>
                                </div>
                                <small class="text-secondary">Itens abaixo do mínimo</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ações rápidas -->
                <div class="row g-3 mt-1">
                    <div class="col-12 col-md-6 col-xl-3">
                        <a class="btn btn-primary w-100 py-3" href="#" role="button">➕ Registrar venda</a>
                    </div>
                    <div class="col-12 col-md-6 col-xl-3">
                        <a class="btn btn-success w-100 py-3" href="#" role="button">💵 Receber pagamento</a>
                    </div>
                    <div class="col-12 col-md-6 col-xl-3">
                        <a class="btn btn-outline-primary w-100 py-3" href="#" role="button">🧑➕ Novo cliente</a>
                    </div>
                    <div class="col-12 col-md-6 col-xl-3">
                        <a class="btn btn-outline-secondary w-100 py-3" href="#" role="button">📦 Repor estoque</a>
                    </div>
                </div>

                <!-- Próximos vencimentos e Ajuda rápida -->
                <div class="row g-3 mt-1">
                    <div class="col-12 col-xxl-8">
                        <div class="card shadow-sm h-100">
                            <div class="card-header bg-white d-flex justify-content-between align-items-center">
                                <strong>Próximos vencimentos</strong>
                                <a class="btn btn-sm btn-outline-secondary" href="#" role="button">Ver todos</a>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th>Cliente</th>
                                                <th class="text-nowrap">Vence em</th>
                                                <th class="text-end">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Maria Silva</td>
                                                <td>Hoje</td>
                                                <td class="text-end">R$ 45,00</td>
                                            </tr>
                                            <tr>
                                                <td>João Santos</td>
                                                <td>Amanhã</td>
                                                <td class="text-end">R$ 80,00</td>
                                            </tr>
                                            <tr>
                                                <td>Padaria Bom Pão</td>
                                                <td>Em 3 dias</td>
                                                <td class="text-end">R$ 120,00</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <small class="text-secondary">Exemplo fictício para visualização do layout.</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-xxl-4">
                        <div class="card shadow-sm h-100">
                            <div class="card-header bg-white">
                                <strong>Ajuda rápida</strong>
                            </div>
                            <div class="card-body">
                                <ul class="mb-0">
                                    <li>Use A- e A+ para ajustar o tamanho do texto.</li>
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
