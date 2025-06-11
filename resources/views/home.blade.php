<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home - Sistema</title>
    @vite(['resources/css/home/home.css', 'resources/js/geralJS.js','routes/web.php'])
</head>

<body>
    <!-- Seção de Navegação -->
    <section id="nav">
        @include('components.navbar')
    </section>

    <!-- Conteúdo do carousel  -->
    <section class="section-home main-content">
        <div id="mainCarousel" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
                <!-- Primeiro Slide -->
                <div class="carousel-item active">
                    <img src="{{ asset('img/Mitsubishi-Outlander-Sport-2021-Foto-Leo-Sposito-7.jpg') }}"
                        class="d-block w-100" alt="...">
                    <div class="carousel-caption  d-md-block">
                        <h5>Primeiro Slide</h5>
                        <p>Conteúdo de exemplo para o primeiro slide.</p>
                        <div class="cadastrar">
                            <a class="Bcadstrar" href="{{ route('cadastro') }}">Cadastrar</a>
                            <a class="Bcadstrar" href="{{ route('login') }}">Login</a>
                        </div>
                    </div>
                </div>

                <!-- Segundo Slide -->
                <div class="carousel-item">
                    <img src="{{ asset('img/Mitsubishi-Outlander-Sport-2021-Foto-Leo-Sposito-7.jpg') }}"
                        class="d-block w-100" alt="...">
                    <div class="carousel-caption  d-md-block">
                        <h5>Primeiro Slide</h5>
                        <p>Conteúdo de exemplo para o primeiro slide.</p>
                        <div class="cadastrar">
                            <a class="Bcadstrar" href="{{ route('cadastro') }}">Cadastrar</a>
                            <a class="Bcadstrar" href="{{ route('login') }}">Login</a>
                        </div>
                    </div>
                </div>

                <!-- Terceiro Slide -->
                <div class="carousel-item">
                    <img src="{{ asset('img/Mitsubishi-Outlander-Sport-2021-Foto-Leo-Sposito-7.jpg') }}"
                        class="d-block w-100" alt="...">
                    <div class="carousel-caption  d-md-block">
                        <h5>Primeiro Slide</h5>
                        <p>Conteúdo de exemplo para o primeiro slide.</p>
                        <div class="cadastrar">
                            <a class="Bcadstrar" href="{{ route('cadastro') }}">Cadastrar</a>
                            <a class="Bcadstrar" href="{{ route('login') }}">Login</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Controles do Carrossel -->
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

    <!-- Seção dos Cards -->
    <section class="section-card">
        <div class="container-escrita">
            <span class="escrita" id="textoAnimado">Sobre nossa empresa</span>
        </div>
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

    <!-- Seção de Cards com escrita -->
    <section id="vantagens" class="section-home">
        <div class="container-escrita">
            <span class="escrita" id="textoAnimado">Sobre nossa empresa</span>
        </div>
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

    <!-- Seção de Cards com img a direita -->
    <section id="sobre" class="section-sobre">
        <div class="container-escrita">
            <span class="escrita" id="textoAnimado">Sobre nossa empresa</span>
        </div>
        <div class="container-sobre">
            <div class="containescrita">
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et
                    dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip
                    ex ea
                    commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                    fugiat
                    nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                    mollit
                    anim id est laborum.

                </p>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et
                    dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip
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
        </div>
    </section>
    <!-- Seção de Cards com img a direita -->

    <!-- Seção dos valores -->
    <section class="section-cardv" id="valores">
        <div class="container-escrita">
            <span class="escrita" id="textoAnimado">Nossas Conquistas</span>
        </div>
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

    <section id="footer">
        @include('components.footer')
    </section>
</body>

</html>