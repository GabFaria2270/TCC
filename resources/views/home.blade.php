<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home - Sistema</title>
    @vite(['resources/css/home/home.css', 'resources/js/home/home.js'])
</head>

<body>
    <!-- Seção de Navegação -->
    <section id="nav">
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">60+conectado</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <a class="nav-link active" aria-current="page" href="/">Início</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#sobre">Sobre</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">Contato</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

    </section>

    <!-- Conteúdo do carousel  -->
    <section class="section-home main-content">
        <div id="mainCarousel" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-indicators">
                <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="0" class="active"
                    aria-current="true" aria-label="Slide 1"></button>
                <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="1"
                    aria-label="Slide 2"></button>
                <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="2"
                    aria-label="Slide 3"></button>
            </div>
            <div class="carousel-inner">
                <div class="carousel-item active">
                    <img src="{{ asset('img/Mitsubishi-Outlander-Sport-2021-Foto-Leo-Sposito-7.jpg') }}"
                        class="d-block w-100" alt="...">
                    <div class="carousel-caption d-none d-md-block">
                        <h5>Primeiro Slide</h5>
                        <p>Conteúdo de exemplo para o primeiro slide.</p>
                    </div>
                </div>
                <div class="carousel-item">
                    <img src="{{ asset('img/Mitsubishi-Outlander-Sport-2021-Foto-Leo-Sposito-7.jpg') }}"
                        class="d-block w-100" alt="...">
                    <div class="carousel-caption d-none d-md-block">
                        <h5>Segundo Slide</h5>
                        <p>Conteúdo de exemplo para o segundo slide.</p>
                    </div>
                </div>
                <div class="carousel-item">
                    <img src="{{ asset('img/Mitsubishi-Outlander-Sport-2021-Foto-Leo-Sposito-7.jpg') }}"
                        class="d-block w-100" alt="...">
                    <div class="carousel-caption d-none d-md-block">
                        <h5>Terceiro Slide</h5>
                        <p>Conteúdo de exemplo para o terceiro slide.</p>
                    </div>
                </div>
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#mainCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Anterior</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#mainCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Próximo</span>
            </button>
        </div>
    </section>
    <div class="titulosdassection">
        <h1 class="titulodassection">
            Bem-vindo ao Sistema 60+ Conectado
        </h1>
    </div>
    <!-- Seção dos Cards -->
    <section class="section-card">
        <div class="row g-4">
            <div class="col">
                <div class="card h-100">
                    <img src="{{ asset('img/testedeimg.jpeg') }}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">Card title</h5>
                        <p class="card-text">This is a wider card with supporting text below as a natural lead-in to
                            additional content. This content is a little bit longer.</p>
                    </div>
                    <div class="card-footer">
                        <small class="text-body-secondary">Last updated 3 mins ago</small>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <img src="{{ asset('img/testedeimg.jpeg') }}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">Card title</h5>
                        <p class="card-text">This card has supporting text below as a natural lead-in to additional
                            content.</p>
                    </div>
                    <div class="card-footer">
                        <small class="text-body-secondary">Last updated 3 mins ago</small>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100">
                    <img src="{{ asset('img/testedeimg.jpeg') }}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">Card title</h5>
                        <p class="card-text">This is a wider card with supporting text below as a natural lead-in to
                            additional content. This card has even longer content than the first to show that equal
                            height action.</p>
                    </div>
                    <div class="card-footer">
                        <small class="text-body-secondary">Last updated 3 mins ago</small>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Seção de Cards -->
    <div class="titulosdassection">
        <h1 class="titulodassection">
            Bem-vindo ao Sistema 60+ Conectado
        </h1>
    </div>
    <!-- Seção de Cards com escrita -->
    <section id="vantagens" class="section-home">
        <div class="card mb-3">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="{{ asset('img/testedeimg.jpeg') }}" class="img-fluid rounded-start" alt="...">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">Card title</h5>
                        <p class="card-text">This is a wider card with supporting text below as a natural lead-in to
                            additional content. This content is a little bit longer.</p>
                        <p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Seção de Cards com escrita -->
    <section class="section-separação">
        <div class="container-escrita">
            <span class="escrita" id="textoAnimado">Sobre nossa empresa</span>
        </div>
    </section>

    <!-- Seção de Cards com img a direita -->
    <section id="sobre" class="section-sobre">
        <div class="containerd"></div>
        <div class="containescrita">
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea
                commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                mollit
                anim id est laborum.

            </p>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea
                commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                mollit
                anim id est laborum.
            </p>
        </div>
        <div class="containerimg">
            <img src="{{ asset('img/testedeimg.jpeg') }}" class="img-fluid rounded-start" alt="...">

        </div>
    </section>
    <!-- Seção de Cards com img a direita -->


    <!-- Seção dos valores -->
    <section class="section-cardv">
        <div class="containervalor">
            <div class="valor1">
                <i class="bi bi-cart icon-medium icon-color"></i>
                <div class="cardv">
                    <h2 class="titulov">Vendas</h2>
                    <p class="subtituloV">R$ 1.000,00 hfkhdfhskdhfdshkfhsdkjhfksdhfkhsdkfhkdshf</p>

                </div>
            </div>
            <div class="valor1">
                <i class="bi bi-people icon-medium icon-color"></i>
                <div class="cardv">
                    <h2 class="titulov">Vendas</h2>
                    <p class="subtituloV">R$ 1.000,00 fdfsdhfksdhfkhdskfhksdhfkdshfkshkdfhsdf</p>

                </div>
            </div>
            <div class="valor1">
                <i class="bi bi-graph-up icon-medium icon-color"></i>
                <div class="cardv">
                    <h2 class="titulov">Vendas</h2>
                    <p class="subtituloV">R$ 1.000,00 sdkfkjsdhfjkdskfjsdkfkjdsfhksdsdfsdfsdfdsf</p>

                </div>

            </div>
        </div>
    </section>
    <!-- Seção dos valores -->

    <!-- Seção de Botão de Navegação -->
    <button class="btndenavegação" id="scrollToBtn">
        <i class="bi bi-arrow-up"></i> <!-- Ícone inicial -->
    </button>
    <!-- Seção de Botão de Navegação -->
    @include('components.footer')
</body>

</html>
