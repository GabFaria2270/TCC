<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title inertia>Gerenciamento</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/set.tsx'])
        @inertiaHead
        <!-- SEO: Schema.org (JSON-LD) + Open Graph / Twitter cards -->
        <meta name="description" content="Sistema de gerenciamento e conexão para comércios locais. Simples, rápido e seguro.">
        <link rel="canonical" href="{{ url()->current() }}">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="MaisConectado">
        <meta property="og:title" content="MaisConectado — conecte-se">
        <meta property="og:description" content="Sistema de gerenciamento e conexão para comércios locais.">
        <meta property="og:image" content="https://maisconectado.alwaysdata.net/logo.jpg">
        <meta property="og:url" content="https://maisconectado.alwaysdata.net/">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="MaisConectado — conecte-se">
        <meta name="twitter:description" content="Sistema de gerenciamento e conexão para comércios locais.">
    <meta name="twitter:image" content="https://maisconectado.alwaysdata.net/logo.jpg">

        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "MaisConectado",
            "url": "https://maisconectado.alwaysdata.net/",
            "logo": "https://maisconectado.alwaysdata.net/logo.jpg",
            "sameAs": []
        }
        </script>

        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://maisconectado.alwaysdata.net/",
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

<body class="bg-body-tertiary layout-gerenciamento">
    <noscript>
        <div style="margin:1rem; padding:0.75rem; border:1px solid #ccc; background:#fff; color:#333;">
            O aplicativo requer JavaScript para funcionar. Verifique se o Vite está rodando e se o navegador permite
            scripts.
        </div>

    </noscript>
    @inertia
</body>

</html>
