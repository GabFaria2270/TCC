<?php

namespace App\Http\Controllers\Auth;

use App\Exports\VendasExport;
use App\Models\MovimentoEstoque;
use App\Models\Venda;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RelatorioController
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $comercio = $user?->comercio;
        $comercioId = $comercio?->id;

        if (!$comercioId) {
            return Inertia::render('gerenciamento/Relatorio', [
                'dados' => [],
                'movimentosEstoque' => [],
            ]);
        }

        $vendas = $this->buildVendasDataset($comercioId);
        $movimentos = $this->buildMovimentosDataset($comercioId);

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

        $user = $request->user();
        $comercioId = $user?->comercio?->id;

        if (!$comercioId) {
            abort(403, 'Comércio não encontrado para o usuário autenticado.');
        }

        return $excel->download(
            new VendasExport($comercioId),
            'relatorio_vendas_' . now()->format('Ymd_His') . '.xlsx'
        );
    }

    private function buildVendasDataset(int $comercioId): array
    {
        return Venda::with(['cliente', 'usuario', 'itens.produto'])
            ->where('comercio_id', $comercioId)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->map(function (Venda $venda) {
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
                    'itens' => $venda->itens
                        ->map(function ($item) {
                            return [
                                'produto' => optional($item->produto)->nome ?? '-',
                                'quantidade' => (int) $item->quantidade,
                                'valor_unitario' => number_format((float) $item->preco_unitario, 2, ',', '.'),
                                'subtotal' => number_format((float) $item->subtotal, 2, ',', '.'),
                            ];
                        })
                        ->values()
                        ->all(),
                ];
            })
            ->values()
            ->all();
    }

    private function buildMovimentosDataset(int $comercioId): array
    {
        return MovimentoEstoque::with([
                'produto' => function ($query) {
                    $query->withTrashed();
                },
                'usuario',
            ])
            ->whereHas('produto', function ($query) use ($comercioId) {
                $query->withTrashed()->where('comercio_id', $comercioId);
            })
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(200)
            ->get()
            ->map(function (MovimentoEstoque $movimento) {
                return [
                    'id' => $movimento->id,
                    'data' => optional($movimento->created_at)->format('d/m/Y H:i'),
                    'created_at_iso' => optional($movimento->created_at)->toIso8601String(),
                    'produto' => optional($movimento->produto)->nome ?? '-',
                    'tipo' => $movimento->tipo,
                    'quantidade' => (int) $movimento->quantidade_movimentada,
                    'quantidade_anterior' => $movimento->quantidade_anterior !== null ? (int) $movimento->quantidade_anterior : null,
                    'quantidade_atual' => $movimento->quantidade_atual !== null ? (int) $movimento->quantidade_atual : null,
                    'usuario' => optional($movimento->usuario)->NOME ?? '-',
                    'motivo' => $movimento->motivo,
                ];
            })
            ->values()
            ->all();
    }
}
