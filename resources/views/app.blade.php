<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" type="image/png" href="{{ asset('img/logo-maisconectado.png') }}">
    <link rel="shortcut icon" href="{{ asset('img/logo-maisconectado.png') }}">
    <title inertia>Gerenciamento de Vendas, Controle de Estoque e Comércio Local | MaisConectado</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/set.tsx'])
    @routes
    @inertiaHead
    <!-- SEO: Schema.org (JSON-LD) + Open Graph / Twitter cards -->
    <meta name="description"
        content="Plataforma de gerenciamento de vendas, controle de estoque, PDV online e gestão de clientes para comércio local. Simples, rápida e segura.">
    <meta name="keywords"
        content="gerenciamento de vendas, controle de estoque, comércio local, gestão de clientes, PDV online, fiado seguro, relatórios de vendas">
    <link rel="canonical" href="{{ url()->current() }}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="MaisConectado">
    <meta property="og:title" content="Gerenciamento de Vendas e Controle de Estoque | MaisConectado">
    <meta property="og:description"
        content="Gerencie vendas, estoque, clientes e fiado em um só lugar com o MaisConectado.">
    <meta property="og:image" content="https://maisconectado.alwaysdata.net/logo.jpg">
    <meta property="og:url" content="https://maisconectado.alwaysdata.net/">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Gerenciamento de Vendas e Estoque | MaisConectado">
    <meta name="twitter:description" content="Controle de estoque, vendas, PDV online e clientes para comércio local.">
    <meta name="twitter:image" content="https://maisconectado.alwaysdata.net/logo.jpg">

    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "MaisConectado",
            "url": "https://maisconectado.alwaysdata.net/",
            "logo": "https://maisconectado.alwaysdata.net/logo.jpg",
            "sameAs": [],
            "description": "Plataforma para gerenciamento de vendas, controle de estoque, gestão de clientes e fiado seguro.",
            "brand": {
                "@type": "Brand",
                "name": "MaisConectado"
            }
        }
        </script>

    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://maisconectado.alwaysdata.net/",
            "name": "MaisConectado",
            "inLanguage": "pt-BR",
            "description": "Gerenciamento de vendas, controle de estoque, PDV online e gestão de clientes para comércio local.",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://maisconectado.alwaysdata.net/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        }
        </script>
    <script>
        // Aplicação antecipada do tema para evitar flicker
        (function() {
            try {
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var saved = localStorage.getItem('appearance');
                var mode = saved || 'system';
                var isDark = mode === 'dark' || (mode === 'system' && prefersDark);
                var html = document.documentElement;
                html.classList.toggle('dark', isDark);
                html.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
                html.style.colorScheme = isDark ? 'dark' : 'light';
            } catch (e) {
                /* noop */
            }
        })();
    </script>
    <script>
        // Aplicação antecipada do tamanho de fonte (acessibilidade) para evitar flicker ao trocar de página
        (function() {
            try {
                var stored = localStorage.getItem('a11y.fontSize');
                if (stored) {
                    var size = parseInt(stored, 10);
                    // Validar numa faixa próxima aos controles do layout (16–22) com alguma folga
                    if (!isNaN(size) && size >= 14 && size <= 26) {
                        document.documentElement.style.fontSize = size + 'px';
                    }
                }
            } catch (e) {
                /* noop */
            }
        })();
    </script>
    <script>
        // Aplicação antecipada do tema para evitar flicker
        (function() {
            try {
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var saved = localStorage.getItem('appearance');
                var mode = saved || 'system';
                var isDark = mode === 'dark' || (mode === 'system' && prefersDark);
                var html = document.documentElement;
                html.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
                html.style.colorScheme = isDark ? 'dark' : 'light';
            } catch (e) {
                /* noop */
            }
        })();
    </script>

<body class="bg-body-tertiary layout-gerenciamento"
    data-seo-topics="gerenciamento-de-vendas controle-de-estoque comercio-local gestao-de-clientes pdv-online">
    <noscript>
        <div style="margin:1rem; padding:0.75rem; border:1px solid #ccc; background:#fff; color:#333;">
            O aplicativo requer JavaScript para funcionar. Verifique se o Vite está rodando e se o navegador permite
            scripts.
        </div>

    </noscript>
    @inertia
</body>

</html>
