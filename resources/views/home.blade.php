<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciamento de Vendas, Controle de Estoque e Comércio Local | MaisConectado</title>
    <meta name="description" content="Gerencie vendas, controle de estoque, clientes, fiado e PDV online em um único sistema para comércio local.">
    <meta name="keywords" content="gerenciamento de vendas, controle de estoque, comércio local, gestão de clientes, PDV online, sistema fiado, relatórios de vendas">
    <link rel="canonical" href="{{ url()->current() }}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="MaisConectado">
    <meta property="og:title" content="Gerenciamento de Vendas e Estoque | MaisConectado">
    <meta property="og:description" content="Controle de estoque, vendas, clientes e fiado em um só lugar.">
    <meta property="og:image" content="https://maisconectado.alwaysdata.net/logo.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Gerenciamento de Vendas e Controle de Estoque">
    <meta name="twitter:description" content="PDV online, fiado seguro, gestão de clientes e relatórios de vendas.">
    <meta name="twitter:image" content="https://maisconectado.alwaysdata.net/logo.jpg">
    <link rel="icon" type="image/png" href="{{ asset('img/logo-maisconectado.png') }}">
    <link rel="shortcut icon" href="{{ asset('img/logo-maisconectado.png') }}">
    @include('components.seo.software_app_jsonld', [
        'appName' => 'MaisConectado',
        'appDescription' => 'Sistema web para gerenciamento de vendas, controle de estoque, PDV online e gestão de clientes.',
        'appUrl' => 'https://maisconectado.alwaysdata.net/',
        'price' => '0',
        'currency' => 'BRL'
    ])
    @vite(['resources/css/app.css', 'resources/css/home/home.css', 'resources/js/app.js', 'resources/js/home/home.js'])
</head>

<body>
    <!-- Seção de Navegação -->
    <section id="nav">
        @include('components.navbar')
    </section>

    <!-- Conteúdo do carousel  -->
    <section class="section-home main-content" id="inicio">
        <div id="mainCarousel" class="carousel slide carousel-fade home-carousel" data-bs-ride="carousel"
            data-bs-touch="true" data-bs-pause="hover" data-bs-interval="5000" aria-roledescription="carousel"
            aria-label="Destaques">
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
                    <div class="home-carousel__item">
                        <picture class="home-carousel__media">
                            <img src="{{ asset('img/C1.jpg') }}"
                                class="home-carousel__image home-carousel__image--gestao"
                                alt="Banner principal do sistema" fetchpriority="high">
                        </picture>
                        <span class="home-carousel__overlay" aria-hidden="true"></span>
                        <div class="home-carousel__content">
                            <div class="home-carousel__glass">
                                <div class="home-carousel__text">
                                    <h5>Gestão simples e poderosa</h5>
                                    <p>Organize produtos, clientes e vendas em um só lugar, com rapidez e segurança.</p>
                                </div>
                                <div class="botoes-carrossel">
                                    <a class="btn-cadastro-carrossel" href="{{ route('cadastro') }}">Cadastrar</a>
                                    <a class="btn-login-carrossel" href="{{ route('login') }}">Login</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="carousel-item">
                    <div class="home-carousel__item">
                        <picture class="home-carousel__media">
                            <img src="{{ asset('img/mulher-comprando-em-mercearia.jpg') }}"
                                class="home-carousel__image home-carousel__image--fiado"
                                alt="Cliente comprando em mercearia" loading="lazy">
                        </picture>
                        <span class="home-carousel__overlay" aria-hidden="true"></span>
                        <div class="home-carousel__content">
                            <div class="home-carousel__glass">
                                <div class="home-carousel__text">
                                    <h5>Fiado seguro e transparente</h5>
                                    <p>Controle de crédito sem dor de cabeça: limites, parcelas e histórico sempre à
                                        vista.</p>
                                </div>
                                <div class="botoes-carrossel">
                                    <a class="btn-cadastro-carrossel" href="{{ route('cadastro') }}">Cadastrar</a>
                                    <a class="btn-login-carrossel" href="{{ route('login') }}">Login</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="carousel-item">
                    <div class="home-carousel__item">
                        <picture class="home-carousel__media">
                            <img src="{{ asset('img/carrossel_IMG3.jpg') }}"
                                class="home-carousel__image home-carousel__image--comecar" alt="Ilustração do carrossel"
                                loading="lazy">
                        </picture>
                        <span class="home-carousel__overlay" aria-hidden="true"></span>
                        <div class="home-carousel__content">
                            <div class="home-carousel__glass">
                                <div class="home-carousel__text">
                                    <h5>Comece hoje, sem complicação</h5>
                                    <p>Cadastre-se em minutos e experimente uma rotina mais leve no seu comércio.</p>
                                </div>
                                <div class="botoes-carrossel">
                                    <a class="btn-cadastro-carrossel" href="{{ route('cadastro') }}">Cadastrar</a>
                                    <a class="btn-login-carrossel" href="{{ route('login') }}">Login</a>
                                </div>
                            </div>
                        </div>
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


    <!-- Seção dos Cards Principais -->
    <section class="section-cards-principais" id="principais" data-seo-topics="gestao-simplificada missao-visao-valores inclusao-digital mei comercio-local">
        <div class="container-escrita">
            <span class="escrita">Gestão Simplificada para o Comércio Local</span>
        </div>
        <div class="cards-principais-grid">
            <article class="card-principal">
                <div class="card-image">
                    <img src="{{ asset('img/01.jpg') }}" alt="Nossa Missão" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 class="card-title">Nossa Missão: Inclusão Digital</h3>
                    <p class="card-description">
                        Oferecer uma ferramenta acessível que promove a autonomia de microempreendedores,
                        facilitando a transição do caderno de anotações para o controle digital e seguro.
                    </p>
                </div>
                <div class="card-footer">
                    <span class="card-badge">Missão</span>
                </div>
            </article>

            <article class="card-principal">
                <div class="card-image">
                    <img src="{{ asset('img/02.jpg') }}" alt="Nossa Visão" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 class="card-title">Nossa Visão: Fortalecer o MEI</h3>
                    <p class="card-description">
                        Ser a ponte para a inclusão digital da terceira idade, valorizando a experiência
                        do empreendedor sênior e fortalecendo os pequenos comércios da comunidade.
                    </p>
                </div>
                <div class="card-footer">
                    <span class="card-badge">Visão</span>
                </div>
            </article>

            <article class="card-principal">
                <div class="card-image">
                    <img src="{{ asset('img/03.jpg') }}" alt="Nossos Valores" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 class="card-title">Nossos Valores: Acessibilidade</h3>
                    <p class="card-description">
                        Acreditamos em uma tecnologia com interface intuitiva, linguagem acessível
                        e recursos visuais adaptados, combatendo o etarismo e facilitando o uso diário.
                    </p>
                </div>
                <div class="card-footer">
                    <span class="card-badge">Valores</span>
                </div>
            </article>
        </div>
    </section>
    <!-- Seção dos Cards Principais -->

    <!-- Seção de Vantagens -->
    <section id="vantagens" class="section-vantagens section-home">
        <div class="container-escrita">
            <span class="escrita">Por que escolher o Mais Conectado?</span>
        </div>
        <div class="vantagem-card">
            <div class="vantagem-image">
                <img src="{{ asset('img/04.jpg') }}" alt="Nossos Diferenciais" loading="lazy">
            </div>
            <div class="vantagem-content">
                <h2 class="vantagem-titulo">Acessibilidade e Eficiência</h2>
                <p class="vantagem-descricao">
                    Com o objetivo de reduzir a exclusão digital, oferecemos uma plataforma de gestão financeira com
                    interface simplificada. Nossa ferramenta garante uma experiência de uso intuitiva e acolhedora para
                    o seu comércio, mesmo para quem está dando os primeiros passos no digital.
                </p>
                <div class="vantagem-destaque">
                    <ul class="vantagem-lista">
                        <li><i class="bi bi-check-circle-fill"></i>Controle digital de contas a prazo (fiado).</li>
                        <li><i class="bi bi-check-circle-fill"></i>Gestão de vendas e estoque simplificada.</li>
                        <li><i class="bi bi-check-circle-fill"></i>Interface intuitiva e adaptada para a terceira idade.</li>
                        <li><i class="bi bi-check-circle-fill"></i>Tutoriais e ajuda interativa para facilitar o aprendizado.</li>
                    </ul>
                </div>
                <div class="vantagem-footer">
                    <span class="vantagem-tempo">Foco no MEI Sênior</span>
                </div>
            </div>
        </div>
    </section>
    <!-- Seção de Vantagens -->

    <!-- Seção de Cards com img a direita -->
    <section id="sobre" class="container-sobre section-home">
        <div class="container-escrita">
            <span class="escrita">Sobre o Projeto Mais Conectado</span>
            <div class="sobre-escrita-box">
                <p class="sobre-escrita-descricao">
                    Somos um projeto focado na inclusão digital de microempreendedores individuais da terceira idade.
                    Nossa plataforma nasceu para oferecer um sistema de administração financeira acessível, que facilita
                    o dia a dia de pequenos comércios.
                </p>
                <p class="sobre-escrita-detalhe">
                    Propomos substituir os cadernos por um controle digital de vendas, contas a prazo e estoque, tudo com
                    uma interface intuitiva e de fácil entendimento. Nossa plataforma é dedicada a oferecer a melhor
                    ferramenta de gestão para o seu negócio, com foco total na usabilidade para o público sênior.
                </p>
            </div>
        </div>
        <div class="sobre-empresa">
            <div class="sobre-content">
                <div class="sobre-text">
                    <h2 class="sobre-titulo">Sobre o Projeto</h2>
                    <p class="sobre-descricao">
                        Somos uma solução criada para microempreendedores sêniores que desejam modernizar o controle de
                        vendas, contas e estoque sem abrir mão da simplicidade.
                    </p>
                    <p class="sobre-subtexto">Nosso Propósito</p>
                    <div class="sobre-destaque">
                        <p>Facilitar o acesso à tecnologia para pessoas que ainda encontram barreiras em seu uso, com uma
                            ferramenta totalmente voltada à rotina do comércio local.</p>
                        <p>Compromisso com a acessibilidade em cada recurso do sistema.</p>
                    </div>
                    <div class="sobre-stats">
                        <div class="stat-mini">
                            <span class="stat-mini-number">Foco no Sênior</span>
                            <span class="stat-mini-label">Adaptado para a terceira idade.</span>
                        </div>
                        <div class="stat-mini">
                            <span class="stat-mini-number">Gestão Completa</span>
                            <span class="stat-mini-label">Vendas, estoque e contas.</span>
                        </div>
                        <div class="stat-mini">
                            <span class="stat-mini-number">Uso Intuitivo</span>
                            <span class="stat-mini-label">Interface visual e acessível.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Seção de Cards com img a direita -->

    <!-- Seção dos valores -->
    <section id="valores" class="section-cardv section-home">
        <div class="container-escrita-valores">
            <span class="escrita">Nossos Pilares</span>
        </div>
        <div class="valores-container">
            <div class="valores-grid">
                <div class="valor1">
                    <div class="valor-icon">
                        <i class="bi bi-easel"></i>
                    </div>
                    <h4 class="valor-titulo">Design Inclusivo</h4>
                    <p class="valor-descricao">Plataforma com linguagem acessível e recursos visuais adaptados às
                        limitações e preferências do público idoso.</p>
                </div>

                <div class="valor1">
                    <div class="valor-icon">
                        <i class="bi bi-person-check"></i>
                    </div>
                    <h4 class="valor-titulo">Foco na Autonomia</h4>
                    <p class="valor-descricao">Empreendedores organizam suas finanças sem depender de conhecimento
                        avançado em tecnologia.</p>
                </div>

                <div class="valor1">
                    <div class="valor-icon">
                        <i class="bi bi-shield-lock"></i>
                    </div>
                    <h4 class="valor-titulo">Confiança e Segurança</h4>
                    <p class="valor-descricao">Sistema desenvolvido priorizando a segurança dos dados, com rotas
                        protegidas e validação por token.</p>
                </div>

                <div class="valor1">
                    <div class="valor-icon">
                        <i class="bi bi-journal-text"></i>
                    </div>
                    <h4 class="valor-titulo">Modernizando a Tradição</h4>
                    <p class="valor-descricao">A ferramenta ideal para substituir cadernos e notas adesivas, levando o
                        controle de contas a prazo para o digital.</p>
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

    <!-- Nova Seção: Estatísticas/Números -->
    <section class="section-stats" id="estatisticas">
        <div class="container-escrita">
            <span class="escrita">O Coração do Projeto</span>
        </div>
        <div class="stats-container">
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="bi bi-people-fill"></i>
                </div>
                <div class="stat-number" data-static="true">Inclusão</div>
                <div class="stat-label">Foco na terceira idade.</div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="bi bi-diagram-3"></i>
                </div>
                <div class="stat-number" data-static="true">Gestão</div>
                <div class="stat-label">Vendas, fiado e estoque.</div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="bi bi-universal-access"></i>
                </div>
                <div class="stat-number" data-static="true">Acesso</div>
                <div class="stat-label">Interface intuitiva e fácil.</div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="bi bi-stars"></i>
                </div>
                <div class="stat-number" data-static="true">Autonomia</div>
                <div class="stat-label">Para o empreendedor sênior.</div>
            </div>
        </div>
    </section>

    <!-- Nova Seção: Depoimentos -->

    <!-- Nova Seção: Serviços/Funcionalidades -->
    <section class="section-services" id="servicos">
        <div class="container-escrita">
            <span class="escrita">Nossas Funcionalidades</span>
        </div>
        <div class="services-grid">
            <div class="service-item">
                <div class="service-icon">
                    <i class="bi bi-journal-check"></i>
                </div>
                <h4>Controle de Contas a Prazo</h4>
                <p>Gerencie as contas "fiadas" dos clientes de forma digital, substituindo o caderno de anotações.</p>
            </div>

            <div class="service-item">
                <div class="service-icon">
                    <i class="bi bi-bar-chart-line"></i>
                </div>
                <h4>Gestão de Vendas</h4>
                <p>Registre as vendas diárias de maneira simples e tenha um controle financeiro muito mais eficaz.</p>
            </div>

            <div class="service-item">
                <div class="service-icon">
                    <i class="bi bi-box-seam"></i>
                </div>
                <h4>Controle de Estoque</h4>
                <p>Acompanhe o movimento do estoque e receba alertas quando um produto estiver acabando.</p>
            </div>

            <div class="service-item">
                <div class="service-icon">
                    <i class="bi bi-universal-access"></i>
                </div>
                <h4>Design Acessível</h4>
                <p>Ícones, cores e instruções claras pensadas para o entendimento do usuário sênior.</p>
            </div>

            <div class="service-item">
                <div class="service-icon">
                    <i class="bi bi-question-circle"></i>
                </div>
                <h4>Ajuda Interativa</h4>
                <p>Tutoriais explicativos e suporte visual guiam o usuário em cada etapa do sistema.</p>
            </div>

            <div class="service-item">
                <div class="service-icon">
                    <i class="bi bi-phone"></i>
                </div>
                <h4>Acesso Multidispositivo</h4>
                <p>Plataforma web responsiva que se adapta a celulares, tablets e computadores.</p>
            </div>
        </div>
    </section>

    <!-- Nova Seção: Call to Action -->
    <section class="section-cta" id="cta">
        <div class="cta-container">
            <div class="cta-content">
                <h2>Pronto para começar?</h2>
                <p>Experimente uma nova forma, mais simples e conectada, de gerir o seu comércio hoje mesmo!</p>
                <div class="cta-buttons">
                    <a href="{{ route('cadastro') }}" class="btn-cta primary">
                        <i class="bi bi-person-plus me-2"></i>
                        Criar Conta
                    </a>
                    <a href="{{ route('login') }}" class="btn-cta secondary">
                        <i class="bi bi-box-arrow-in-right me-2"></i>
                        Fazer Login
                    </a>
                </div>
            </div>
            <div class="cta-image">
                <i class="bi bi-cart-check-fill"></i>
            </div>
        </div>
    </section>

    <section id="footer">
        @include('components.footer')
    </section>
</body>

</html>
