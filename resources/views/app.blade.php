<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>Gerenciamento</title>
    @viteReactRefresh
    @vite([
        'resources/css/app.css',
        'resources/js/set.tsx',
    ])
    @inertiaHead
    <style>
        .visually-hidden{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    </style>
    </head>
<body class="bg-body-tertiary">
    <noscript>
        <div style="margin:1rem; padding:0.75rem; border:1px solid #ccc; background:#fff; color:#333;">
            O aplicativo requer JavaScript para funcionar. Verifique se o Vite está rodando e se o navegador permite scripts.
        </div>
    </noscript>
    @inertia
</body>
</html>
