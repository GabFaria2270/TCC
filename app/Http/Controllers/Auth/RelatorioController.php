<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RelatorioController
{
    public function index(Request $request): Response
    {
        // Busca vendas com cliente e usuário
        $vendas = \App\Models\Venda::with(['cliente', 'usuario', 'itens.produto'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->map(function ($venda) {
                return [
                    'id' => $venda->id,
                    'data' => optional($venda->created_at)->format('d/m/Y H:i'),
                    'data_iso' => optional($venda->created_at)->toIso8601String(),
                    'cliente' => optional($venda->cliente)->nome ?? '-',
                    'usuario' => optional($venda->usuario)->NOME ?? '-',
                    'total' => (float) $venda->total,
                    'total_formatado' => 'R$ ' . number_format((float) $venda->total, 2, ',', '.'),
                    'desconto' => (float) $venda->desconto,
                    'desconto_formatado' => 'R$ ' . number_format((float) $venda->desconto, 2, ',', '.'),
                    'forma_pagamento' => $venda->forma_pagamento,
                    'status' => $venda->status,
                    'observacoes' => $venda->observacoes,
                    'itens' => $venda->itens->map(function ($item) {
                        return [
                            'produto' => optional($item->produto)->nome ?? '-',
                            'quantidade' => $item->quantidade,
                            'valor_unitario' => number_format($item->preco_unitario, 2, ',', '.'),
                            'subtotal' => number_format($item->subtotal, 2, ',', '.'),
                        ];
                    }),
                ];
            });

        // Busca global de movimentos de estoque
        $movimentos = \App\Models\MovimentoEstoque::with(['produto', 'usuario'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(200)
            ->get()
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'data' => optional($m->created_at)->format('d/m/Y H:i'),
                    'created_at_iso' => optional($m->created_at)->toIso8601String(),
                    'produto' => optional($m->produto)->nome ?? '-',
                    'tipo' => $m->tipo,
                    'quantidade' => (int) $m->quantidade_movimentada,
                    'usuario' => optional($m->usuario)->NOME ?? '-',
                    'motivo' => $m->motivo,
                ];
            });

        return Inertia::render('gerenciamento/Relatorio', [
            'dados' => $vendas,
            'movimentosEstoque' => $movimentos,
        ]);
    }

    public function exportExcel(Request $request)
    {
        $excel = app()->make('excel');

        if (!method_exists($excel, 'download')) {
            abort(500, 'Serviço de exportação indisponível.');
        }

        return $excel->download(
            new \App\Exports\VendasExport(),
            'relatorio_vendas_' . now()->format('Ymd_His') . '.xlsx'
        );
    }
}
