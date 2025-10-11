<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title inertia>Gerenciamento</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/set.tsx'])
    @inertiaHead
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
