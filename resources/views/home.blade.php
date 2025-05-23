<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home - Sistema</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    @vite(['resources/css/home.css', 'resources/js/app.js'])
</head>

<body>
    <!-- Seção de Navegação -->
    <section id="nav">
        <nav class="main-navbar">
            <div class="navbar-container">
                <span class="navbar-logo">MeuSistema</span>
                <ul class="nav nav-pills">
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="#">Início</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Sobre</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Contato</a>
                    </li>
                </ul>
            </div>
        </nav>
    </section>

    <!-- Seção do banner -->
    <section class="banner-section">
        <div class="banner-container">
            <div class="banner-content">
                <div class="banner-text">
                    <h1 class="banner-title">Bem-vindo ao Sistema</h1>
                    <p class="banner-description">
                        Este é um banner de destaque para apresentar informações importantes ou chamar atenção para alguma ação.
                    </p>
                    <a href="#" class="banner-btn btn btn-primary">Saiba Mais</a>
                </div>
                <div class="banner-img-wrapper">
                    <img src="{{ asset('img/teste.png') }}" class="banner-img animate-baner-inicial" alt="Imagem do banner">
                </div>
            </div>
        </div>
    </section>
<!-- Seção do banner -->

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>