@php
// Valores default podem ser sobrescritos ao incluir o componente.
$appName = $appName ?? 'MaisConectado';
$appDescription = $appDescription ?? 'Sistema web para gerenciamento de vendas, controle de estoque, PDV online e gestão de clientes.';
$appUrl = $appUrl ?? 'https://maisconectado.alwaysdata.net/';
$price = $price ?? '0';
$currency = $currency ?? 'BRL';
@endphp
<script type="application/ld+json">{!! json_encode([
    '@context' => 'https://schema.org',
    '@type' => 'SoftwareApplication',
    'name' => $appName,
    'applicationCategory' => 'BusinessApplication',
    'operatingSystem' => 'Web',
    'description' => $appDescription,
    'url' => $appUrl,
    'offers' => [
        '@type' => 'Offer',
        'price' => $price,
        'priceCurrency' => $currency,
    ],
], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES) !!}</script>
