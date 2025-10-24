<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mais Conectado - Conexão simples para pequenos negócios</title>
    <meta name="description" content="Sistema moderno para gestão de comércio, clientes e vendas. Simples, rápido e seguro.">
    <link rel="canonical" href="{{ url()->current() }}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="MaisConectado">
    <meta property="og:title" content="Mais Conectado - Conexão simples para pequenos negócios">
    <meta property="og:description" content="Sistema moderno para gestão de comércio, clientes e vendas. Simples, rápido e seguro.">
    <meta property="og:image" content="https://maisconectado.alwaysdata.net/logo.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Mais Conectado - Conexão simples para pequenos negócios">
    <meta name="twitter:description" content="Sistema moderno para gestão de comércio, clientes e vendas. Simples, rápido e seguro.">
    <meta name="twitter:image" content="https://maisconectado.alwaysdata.net/logo.jpg">
    <link rel="icon" href="/logo.jpg">
    <script type="application/ld+json" src="/organization.json"></script>
    @vite(['resources/css/app.css', 'resources/css/home/home.css', 'resources/js/app.js', 'resources/js/home/home.js'])
</head>

<body>
    <!-- Seção de Navegação -->
    <section id="nav">
        @include('components.navbar')
    </section>

    <!-- Conteúdo do carousel  -->
    <section class="section-home main-content">
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
    <section class="section-cards-principais" id="principais">
        <div class="container-escrita">
            <span class="escrita">Sobre nossa empresa</span>
        </div>
        <div class="cards-principais-grid">
            <article class="card-principal">
                <div class="card-image">
                    <img src="{{ asset('img/cadr1.jpg') }}" alt="Nossa Missão" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 class="card-title">Nossa Missão</h3>
                    <p class="card-description">
                        Oferecer produtos de qualidade excepcional com atendimento personalizado,
                        construindo relacionamentos duradouros baseados na confiança e satisfação
                        de nossos clientes.
                    </p>
                </div>
                <div class="card-footer">
                    <span class="card-badge">Compromisso</span>
                </div>
            </article>

            <article class="card-principal">
                <div class="card-image">
                    <img src="{{ asset('img/mulher da tela inicial.png') }}" alt="Nossa Visão" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 class="card-title">Nossa Visão</h3>
                    <p class="card-description">
                        Ser reconhecido como o melhor estabelecimento comercial da região,
                        inovando constantemente para atender às necessidades de nossa comunidade
                        com excelência e modernidade.
                    </p>
                </div>
                <div class="card-footer">
                    <span class="card-badge">Inovação</span>
                </div>
            </article>

            <article class="card-principal">
                <div class="card-image">
                    <img src="{{ asset('img/testedeimg.jpeg') }}" alt="Nossos Valores" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 class="card-title">Nossos Valores</h3>
                    <p class="card-description">
                        Integridade, qualidade, respeito e transparência são os pilares que
                        sustentam nossa empresa e orientam todas as nossas decisões e ações
                        no dia a dia.
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
            <span class="escrita">Por que nos escolher?</span>
        </div>
        <div class="vantagem-card">
            <div class="vantagem-image">
                <img src="{{ asset('img/testedeimg.jpeg') }}" alt="Nossos Diferenciais" loading="lazy">
            </div>
            <div class="vantagem-content">
                <h2 class="vantagem-titulo">Experiência e Confiabilidade</h2>
                <p class="vantagem-descricao">
                    Com mais de uma década no mercado, oferecemos produtos selecionados com
                    rigoroso controle de qualidade. Nossa equipe especializada garante que
                    você tenha sempre a melhor experiência de compra, seja presencialmente
                    ou através da nossa plataforma digital moderna e intuitiva.
                </p>
                <div class="vantagem-destaque">
                    <ul class="vantagem-lista">
                        <li><i class="bi bi-check-circle-fill"></i>Produtos sempre frescos e de qualidade</li>
                        <li><i class="bi bi-check-circle-fill"></i>Atendimento personalizado e humanizado</li>
                        <li><i class="bi bi-check-circle-fill"></i>Sistema de crédito seguro e transparente</li>
                        <li><i class="bi bi-check-circle-fill"></i>Preços competitivos e ofertas exclusivas</li>
                    </ul>
                </div>
                <div class="vantagem-footer">
                    <span class="vantagem-tempo">Atualizado recentemente</span>
                </div>
            </div>
        </div>
    </section>
    <!-- Seção de Vantagens -->

    <!-- Seção de Cards com img a direita -->
    <section id="sobre" class="container-sobre section-home">
        <div class="container-escrita">
            <span class="escrita">Sobre Nossa Empresa</span>
            <div class="sobre-escrita-box">
                <p class="sobre-escrita-descricao">
                    Somos referência em tradição, qualidade e atendimento personalizado para toda a comunidade. Conheça
                    nossa história e valores!
                </p>
                <p class="sobre-escrita-detalhe">
                    Fundada há mais de uma década, nossa empresa nasceu do sonho de oferecer produtos frescos,
                    selecionados e de alta qualidade para famílias da região. Ao longo dos anos, construímos uma
                    reputação baseada na confiança, respeito e transparência, sempre buscando inovar e atender às
                    necessidades dos nossos clientes. Nosso compromisso diário é proporcionar uma experiência de compra
                    diferenciada, com atendimento humanizado e soluções modernas, mantendo sempre o foco na satisfação e
                    no bem-estar de quem nos escolhe. Venha fazer parte dessa história de sucesso e tradição!
                </p>
            </div>
        </div>
        <div class="sobre-empresa">
            <div class="sobre-content">
                <div class="sobre-text">
                    <h2 class="sobre-titulo">Sobre Nós</h2>
                    <p class="sobre-descricao">
                        Há mais de uma década servindo a comunidade com produtos frescos e de qualidade.
                        Nossa empresa se dedica a oferecer o melhor atendimento e as melhores opções para
                        sua família, sempre com preços justos e um sistema de crédito confiável.
                    </p>
                    <p class="sobre-subtexto">Conheça nossa história, valores e o compromisso diário em oferecer o
                        melhor para a sua comunidade.</p>
                    <div class="sobre-destaque">
                        <p><i class="bi bi-star-fill me-2"></i>Compromisso com a excelência em cada produto e serviço
                            oferecido.</p>
                    </div>
                    <div class="sobre-stats">
                        <div class="stat-mini">
                            <span class="stat-mini-number">12</span>
                            <span class="stat-mini-label">Anos</span>
                        </div>
                        <div class="stat-mini">
                            <span class="stat-mini-number">5000</span>
                            <span class="stat-mini-label">Clientes</span>
                        </div>
                        <div class="stat-mini">
                            <span class="stat-mini-number">98%</span>
                            <span class="stat-mini-label">Satisfação</span>
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
            <span class="escrita">Nossas Conquistas</span>
        </div>
        <div class="valores-container">
            <div class="valores-grid">
                <div class="valor1">
                    <div class="valor-icon">
                        <i class="bi bi-trophy-fill"></i>
                    </div>
                    <h4 class="valor-titulo">Qualidade Premium</h4>
                    <p class="valor-descricao">Produtos selecionados com o mais alto padrão de qualidade para sua
                        família.</p>
                </div>

                <div class="valor1">
                    <div class="valor-icon">
                        <i class="bi bi-heart-fill"></i>
                    </div>
                    <h4 class="valor-titulo">Atendimento Humanizado</h4>
                    <p class="valor-descricao">Cada cliente é único e merece um atendimento personalizado e acolhedor.
                    </p>
                </div>

                <div class="valor1">
                    <div class="valor-icon">
                        <i class="bi bi-shield-check"></i>
                    </div>
                    <h4 class="valor-titulo">Confiança e Segurança</h4>
                    <p class="valor-descricao">Sistema de crédito seguro e transparente, construído na base da
                        confiança mútua.</p>
                </div>

                <div class="valor1">
                    <div class="valor-icon">
                        <i class="bi bi-clock-history"></i>
                    </div>
                    <h4 class="valor-titulo">Tradição Familiar</h4>
                    <p class="valor-descricao">Décadas de experiência servindo gerações de famílias em nossa
                        comunidade.</p>
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
            <span class="escrita">Nossos Números</span>
        </div>
        <div class="stats-container">
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="bi bi-people-fill"></i>
                </div>
                <div class="stat-number" data-count="5000">0</div>
                <div class="stat-label">Clientes Ativos</div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="bi bi-box-seam"></i>
                </div>
                <div class="stat-number" data-count="50000">0</div>
                <div class="stat-label">Produtos Vendidos</div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="bi bi-shop"></i>
                </div>
                <div class="stat-number" data-count="12">0</div>
                <div class="stat-label">Anos no Mercado</div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="bi bi-star-fill"></i>
                </div>
                <div class="stat-number" data-count="4.8">0</div>
                <div class="stat-label">Avaliação Média</div>
            </div>
        </div>
    </section>

    <!-- Nova Seção: Depoimentos -->
    <section class="section-testimonials" id="depoimentos">
        <div class="container-escrita">
            <span class="escrita">O que nossos clientes dizem</span>
        </div>
        <div class="testimonials-container">
            <div class="testimonial-card">
                <div class="testimonial-content">
                    <p>"Excelente atendimento e produtos sempre frescos. A plataforma digital facilitou muito minhas
                        compras!"</p>
                </div>
                <div class="testimonial-author">
                    <div class="author-avatar">
                        <i class="bi bi-person-circle"></i>
                    </div>
                    <div class="author-info">
                        <h5>Maria Silva</h5>
                        <span>Cliente há 3 anos</span>
                    </div>
                </div>
                <div class="testimonial-rating">
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                </div>
            </div>

            <div class="testimonial-card">
                <div class="testimonial-content">
                    <p>"Preços justos e variedade incrível. O sistema de crédito facilitou muito minha vida financeira."
                    </p>
                </div>
                <div class="testimonial-author">
                    <div class="author-avatar">
                        <i class="bi bi-person-circle"></i>
                    </div>
                    <div class="author-info">
                        <h5>João Santos</h5>
                        <span>Cliente há 5 anos</span>
                    </div>
                </div>
                <div class="testimonial-rating">
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                </div>
            </div>

            <div class="testimonial-card">
                <div class="testimonial-content">
                    <p>"Equipe sempre prestativa e produtos de qualidade. Recomendo para toda a família!"</p>
                </div>
                <div class="testimonial-author">
                    <div class="author-avatar">
                        <i class="bi bi-person-circle"></i>
                    </div>
                    <div class="author-info">
                        <h5>Ana Costa</h5>
                        <span>Cliente há 2 anos</span>
                    </div>
                </div>
                <div class="testimonial-rating">
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                </div>
            </div>
        </div>
    </section>

    <!-- Nova Seção: Serviços/Funcionalidades -->
    <section class="section-services" id="servicos">
        <div class="container-escrita">
            <span class="escrita">Nossos Serviços</span>
        </div>
        <div class="services-grid">
            <div class="service-item">
                <div class="service-icon">
                    <i class="bi bi-credit-card"></i>
                </div>
                <h4>Sistema de Crédito</h4>
                <p>Compre agora e pague depois com nosso sistema de crédito confiável e seguro.</p>
            </div>

            <div class="service-item">
                <div class="service-icon">
                    <i class="bi bi-truck"></i>
                </div>
                <h4>Entrega Rápida</h4>
                <p>Entrega em domicílio rápida e segura para sua comodidade.</p>
            </div>

            <div class="service-item">
                <div class="service-icon">
                    <i class="bi bi-shield-check"></i>
                </div>
                <h4>Produtos de Qualidade</h4>
                <p>Garantimos a qualidade e procedência de todos os nossos produtos.</p>
            </div>

            <div class="service-item">
                <div class="service-icon">
                    <i class="bi bi-clock"></i>
                </div>
                <h4>Horário Estendido</h4>
                <p>Funcionamos em horário estendido para melhor atender você.</p>
            </div>

            <div class="service-item">
                <div class="service-icon">
                    <i class="bi bi-phone"></i>
                </div>
                <h4>Suporte 24h</h4>
                <p>Nossa equipe está sempre pronta para ajudar você.</p>
            </div>

            <div class="service-item">
                <div class="service-icon">
                    <i class="bi bi-percent"></i>
                </div>
                <h4>Ofertas Especiais</h4>
                <p>Promoções exclusivas e descontos especiais para nossos clientes.</p>
            </div>
        </div>
    </section>

    <!-- Nova Seção: Call to Action -->
    <section class="section-cta" id="cta">
        <div class="cta-container">
            <div class="cta-content">
                <h2>Pronto para começar?</h2>
                <p>Junte-se a milhares de clientes satisfeitos e experimente nossos serviços hoje mesmo!</p>
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
