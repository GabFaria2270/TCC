<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home - Sistema</title>
    @vite(['resources/css/colors.css', 'resources/css/home/animacoes.css', 'resources/css/home/base.css', 'resources/css/home/navbar.css', 
    'resources/css/home/banner.css', 'resources/css/home/cards.css', 'resources/css/home/responsivo.css','resources/js/home.js/home.js'])
</head>

<body>
    <!-- Seção de Navegação -->
    <section  id="nav">
        <nav class="main-navbar">
            <div class="navbar-container">
                <span class="navbar-logo">60+conectado</span>
                <ul class="nav nav-pills">
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="/">Início</a>
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

    <!-- Conteúdo principal -->
    <section class="section-home main-content">
        <!-- Seção do banner -->
        <section class="banner-section">
            <div class="banner-container">
                <div class="banner-content">
                    <div class="banner-text">
                        <h1 class="banner-title baner-titulo-animado">Bem-vindo ao Sistema</h1>
                        <p class="banner-description ">
                            Este é um banner de destaque para apresentar informações importantes ou chamar atenção para
                            alguma ação.
                        </p>
                        <a href="#" class="banner-btn btn btn-primary">Saiba Mais</a>
                    </div>
                    <div class="banner-img-wrapper">
                        <img src="{{ asset('img/imagem_do_vein-removebg-preview.png') }}"
                            class="banner-img animate-baner-inicial" alt="Imagem do banner">
                    </div>
                </div>
            </div>
        </section>
        <!-- Seção do banner -->
    </section>
    <!-- Seção dos Cards -->
     <section class="section-home">
        <div class="card-group">
        <div class="card">
            <img src="..." class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">Card title</h5>
                <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional
                    content. This content is a little bit longer.</p>
                <p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>
            </div>
        </div>
        <div class="card">
            <img src="..." class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">Card title</h5>
                <p class="card-text">This card has supporting text below as a natural lead-in to additional content.</p>
                <p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>
            </div>
        </div>
        <div class="card">
            <img src="..." class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">Card title</h5>
                <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional
                    content. This card has even longer content than the first to show that equal height action.</p>
                <p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>
            </div>
        </div>
    </div>
     </section>
     
    
    <!-- Seção de Cards -->

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>
