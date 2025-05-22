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

    <!-- Seção do Carrossel -->
    <section class="section-carrossel">
        <div id="carouselHome" class="carousel slide h-100" data-bs-ride="carousel">
            <div class="carousel-indicators">
                <button type="button" data-bs-target="#carouselHome" data-bs-slide-to="0" class="active"
                    aria-current="true" aria-label="Slide 1"></button>
                <button type="button" data-bs-target="#carouselHome" data-bs-slide-to="1"
                    aria-label="Slide 2"></button>
                <button type="button" data-bs-target="#carouselHome" data-bs-slide-to="2"
                    aria-label="Slide 3"></button>
            </div>
            <div class="carousel-inner h-100">
                <div class="carousel-item active h-100">
                    <img src="{{ asset('img/Mitsubishi-Outlander-Sport-2021-Foto-Leo-Sposito-7.jpg') }}"
                        class="d-block w-100 h-100 banner-img" alt="Mitsubishi Outlander">
                </div>
                <div class="carousel-item h-100">
                    <img src="{{ asset('img/Volkswagen-Novo-Polo.jpg') }}" class="d-block w-100 h-100 banner-img"
                        alt="Volkswagen Polo">
                </div>
                <div class="carousel-item h-100">
                    <img src="{{ asset('img/OIP.png') }}" class="d-block w-100 h-100 banner-img" alt="OIP">
                </div>
            </div>
            <button class="carousel-control-prev custom-carousel-arrow" type="button" data-bs-target="#carouselHome"
                data-bs-slide="prev">
                <span aria-hidden="true">
                    <svg width="32" height="32" fill="#fff" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="12" fill="rgba(124,58,237,0.7)" />
                        <path d="M15.5 19 9.5 12 15.5 5" stroke="#fff" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" fill="none" />
                    </svg>
                </span>
                <span class="visually-hidden">Anterior</span>
            </button>
            <button class="carousel-control-next custom-carousel-arrow" type="button" data-bs-target="#carouselHome"
                data-bs-slide="next">
                <span aria-hidden="true">
                    <svg width="32" height="32" fill="#fff" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="12" fill="rgba(124,58,237,0.7)" />
                        <path d="M8.5 5 14.5 12 8.5 19" stroke="#fff" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" fill="none" />
                    </svg>
                </span>
                <span class="visually-hidden">Próximo</span>
            </button>
        </div>
    </section>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>
