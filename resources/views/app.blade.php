<!DOCTYPE html>
<html lang="pt-br" class="hide-scrollbar">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}">
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
    <link rel="icon" type="image/png" sizes="96x96" href="{{ asset('favicon-96x96.png') }}">
    <link rel="shortcut icon" href="{{ asset('favicon.ico') }}">
    <link rel="manifest" href="{{ asset('site.webmanifest') }}">
    <meta name="theme-color" content="#0f172a">
    <title inertia>Mais Conectado</title>
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
    <meta property="og:image" content="{{ asset('img/logo-maisconectado.png') }}">
    <meta property="og:url" content="https://maisconectado.alwaysdata.net/">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Gerenciamento de Vendas e Estoque | MaisConectado">
    <meta name="twitter:description" content="Controle de estoque, vendas, PDV online e clientes para comércio local.">
    <meta name="twitter:image" content="{{ asset('img/logo-maisconectado.png') }}">

    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "MaisConectado",
            "url": "https://maisconectado.alwaysdata.net/",
            "logo": "{{ asset('img/logo-maisconectado.png') }}",
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

<body class="bg-body-tertiary layout-gerenciamento hide-scrollbar"
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
