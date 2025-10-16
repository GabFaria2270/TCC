<?php

namespace App\Http\Controllers\Auth;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class RelatorioController
{
    public function index(Request $request): Response
    {
        // Aqui você pode buscar dados reais para o relatório, se desejar
        return Inertia::render('gerenciamento/Relatorio', [
            // Exemplo de dados fictícios, substitua conforme necessário
            'dados' => [],
        ]);
    }

    public function exportExcel(Request $request)
    {
        // Você pode adicionar filtros do request se desejar
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\VendasExport(),
            'relatorio_vendas_' . now()->format('Ymd_His') . '.xlsx'
        );
    }
}
