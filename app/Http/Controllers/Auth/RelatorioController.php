<?php

namespace App\Http\Controllers\Auth;

use App\Exports\VendasExport;
use App\Models\MovimentoEstoque;
use App\Models\Venda;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
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
                'initialVendas' => $this->emptyVendasPayload(),
                'initialMovimentos' => $this->emptyMovimentosPayload(),
            ]);
        }

        $vendas = $this->buildVendasResponse($comercioId, []);
        $movimentos = $this->buildMovimentosResponse($comercioId, []);

        return Inertia::render('gerenciamento/Relatorio', [
            'initialVendas' => $vendas,
            'initialMovimentos' => $movimentos,
        ]);
    }

    public function filter(Request $request): JsonResponse
    {
        $user = $request->user();
        $comercioId = $user?->comercio?->id;

        if (!$comercioId) {
            return response()->json([
                'success' => false,
                'message' => 'Comércio não encontrado para o usuário autenticado.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'tabela' => 'required|in:vendas,estoque',
            'data_inicio' => 'nullable|date',
            'data_fim' => 'nullable|date',
            'status' => 'nullable|in:concluida,pendente,cancelada,conta_fiada',
            'forma_pagamento' => 'nullable|in:dinheiro,pix,debito,credito,conta_fiada,cartao_debito,cartao_credito,fiado',
            'tipo_movimento' => 'nullable|in:entrada,saida,ajuste',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:5|max:100',
        ]);

        $validator->after(function ($validator) use ($request) {
            $inicio = $request->input('data_inicio');
            $fim = $request->input('data_fim');

            if (!$inicio || !$fim) {
                return;
            }

            try {
                $dataInicio = Carbon::parse($inicio)->startOfDay();
                $dataFim = Carbon::parse($fim)->endOfDay();

                if ($dataInicio->gt($dataFim)) {
                    $validator->errors()->add('data_fim', 'A data final deve ser posterior ou igual à data inicial.');
                }
            } catch (\Exception $e) {
                // As regras de data já tratam formatos inválidos.
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Parâmetros de filtro inválidos.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $filters = $validator->validated();
        $tabela = $filters['tabela'] ?? 'vendas';

        if ($tabela === 'estoque') {
            return $this->filterMovimentos($comercioId, $filters);
        }

        return $this->filterVendas($comercioId, $filters);
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

    private function filterVendas(int $comercioId, array $filters): JsonResponse
    {
        $payload = $this->buildVendasResponse($comercioId, $filters);

        return response()->json(array_merge([
            'success' => true,
            'tabela' => 'vendas',
        ], $payload));
    }

    private function filterMovimentos(int $comercioId, array $filters): JsonResponse
    {
        $payload = $this->buildMovimentosResponse($comercioId, $filters);

        return response()->json(array_merge([
            'success' => true,
            'tabela' => 'estoque',
        ], $payload));
    }

    private function buildVendasResponse(int $comercioId, array $filters): array
    {
        $perPage = max(5, min(100, (int) ($filters['per_page'] ?? 25)));
        $page = max(1, (int) ($filters['page'] ?? 1));

        $query = $this->prepareVendasQuery($comercioId, $filters);

        $summaryQuery = clone $query;

        $paginator = $query
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'page', $page);

        $dados = $paginator->getCollection()
            ->map(fn(Venda $venda) => $this->formatVenda($venda))
            ->values()
            ->all();

        return [
            'data' => $dados,
            'meta' => $this->formatPaginatorMeta($paginator),
            'resumo' => $this->resumoVendas($summaryQuery),
        ];
    }

    private function buildMovimentosResponse(int $comercioId, array $filters): array
    {
        $perPage = max(5, min(100, (int) ($filters['per_page'] ?? 25)));
        $page = max(1, (int) ($filters['page'] ?? 1));

        $query = $this->prepareMovimentosQuery($comercioId, $filters);

        $summaryQuery = clone $query;

        $paginator = $query
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'page', $page);

        $dados = $paginator->getCollection()
            ->map(fn(MovimentoEstoque $movimento) => $this->formatMovimento($movimento))
            ->values()
            ->all();

        return [
            'data' => $dados,
            'meta' => $this->formatPaginatorMeta($paginator),
            'resumo' => $this->resumoMovimentos($summaryQuery),
        ];
    }

    private function prepareVendasQuery(int $comercioId, array $filters): Builder
    {
        $query = Venda::with(['cliente', 'usuario', 'itens.produto'])
            ->where('comercio_id', $comercioId);

        if ($inicio = $this->parseStartDate($filters['data_inicio'] ?? null)) {
            $query->where('created_at', '>=', $inicio);
        }

        if ($fim = $this->parseEndDate($filters['data_fim'] ?? null)) {
            $query->where('created_at', '<=', $fim);
        }

        if ($statusList = $this->mapStatusFilter($filters['status'] ?? null)) {
            $query->whereIn('status', $statusList);
        }

        if ($pagamentos = $this->mapPagamentoFilter($filters['forma_pagamento'] ?? null)) {
            $query->whereIn('forma_pagamento', $pagamentos);
        }

        return $query;
    }

    private function prepareMovimentosQuery(int $comercioId, array $filters): Builder
    {
        $query = MovimentoEstoque::with([
            'produto' => fn($q) => $q->withTrashed(),
            'usuario',
        ])
            ->whereHas('produto', function (Builder $builder) use ($comercioId) {
                $builder->withTrashed()->where('comercio_id', $comercioId);
            });

        if ($inicio = $this->parseStartDate($filters['data_inicio'] ?? null)) {
            $query->where('created_at', '>=', $inicio);
        }

        if ($fim = $this->parseEndDate($filters['data_fim'] ?? null)) {
            $query->where('created_at', '<=', $fim);
        }

        if (!empty($filters['tipo_movimento'])) {
            $query->where('tipo', $filters['tipo_movimento']);
        }

        return $query;
    }

    private function emptyVendasPayload(): array
    {
        return [
            'data' => [],
            'meta' => $this->emptyMeta(),
            'resumo' => [
                'quantidade' => 0,
                'total_faturado' => 0,
                'total_descontos' => 0,
            ],
        ];
    }

    private function emptyMovimentosPayload(): array
    {
        return [
            'data' => [],
            'meta' => $this->emptyMeta(),
            'resumo' => [
                'quantidade' => 0,
                'total_movimentado' => 0,
            ],
        ];
    }

    private function emptyMeta(): array
    {
        return [
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => 0,
            'total' => 0,
        ];
    }

    private function formatVenda(Venda $venda): array
    {
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
                    $valorUnitario = (float) $item->preco_unitario;
                    $subtotal = (float) $item->subtotal;

                    return [
                        'produto' => optional($item->produto)->nome ?? '-',
                        'quantidade' => (int) $item->quantidade,
                        'valor_unitario' => $valorUnitario,
                        'valor_unitario_formatado' => 'R$ ' . number_format($valorUnitario, 2, ',', '.'),
                        'subtotal' => $subtotal,
                        'subtotal_formatado' => 'R$ ' . number_format($subtotal, 2, ',', '.'),
                    ];
                })
                ->values()
                ->all(),
        ];
    }

    private function formatMovimento(MovimentoEstoque $movimento): array
    {
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
    }

    private function resumoVendas($query): array
    {
        $totais = (clone $query)
            ->selectRaw('COUNT(*) as quantidade, COALESCE(SUM(total), 0) as total, COALESCE(SUM(desconto), 0) as descontos')
            ->first();

        return [
            'quantidade' => (int) ($totais->quantidade ?? 0),
            'total_faturado' => (float) ($totais->total ?? 0),
            'total_descontos' => (float) ($totais->descontos ?? 0),
        ];
    }

    private function resumoMovimentos($query): array
    {
        $totais = (clone $query)
            ->selectRaw('COUNT(*) as quantidade, COALESCE(SUM(quantidade_movimentada), 0) as total_movimentado')
            ->first();

        return [
            'quantidade' => (int) ($totais->quantidade ?? 0),
            'total_movimentado' => (int) ($totais->total_movimentado ?? 0),
        ];
    }

    private function formatPaginatorMeta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];
    }

    private function mapStatusFilter(?string $status): ?array
    {
        if (!$status) {
            return null;
        }

        return match (strtolower($status)) {
            'pendente' => ['pendente', 'conta_fiada'],
            'conta_fiada' => ['conta_fiada'],
            'concluida' => ['concluida'],
            'cancelada' => ['cancelada'],
            default => null,
        };
    }

    private function mapPagamentoFilter(?string $forma): ?array
    {
        if (!$forma) {
            return null;
        }

        return match (strtolower($forma)) {
            'dinheiro' => ['dinheiro'],
            'pix' => ['pix', 'PIX'],
            'debito', 'cartao_debito' => ['cartao_debito', 'debito'],
            'credito', 'cartao_credito' => ['cartao_credito', 'credito'],
            'conta_fiada', 'fiado' => ['conta_fiada'],
            default => null,
        };
    }

    private function parseStartDate(?string $date): ?Carbon
    {
        if (!$date) {
            return null;
        }

        try {
            return Carbon::parse($date)->startOfDay();
        } catch (\Exception $e) {
            return null;
        }
    }

    private function parseEndDate(?string $date): ?Carbon
    {
        if (!$date) {
            return null;
        }

        try {
            return Carbon::parse($date)->endOfDay();
        } catch (\Exception $e) {
            return null;
        }
    }
}
