<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use App\Models\Venda;
use App\Models\ContaFiada;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InicioController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $comercio = optional($user?->comercio);

        $inicio = now()->startOfDay();
        $fim = now()->endOfDay();

        $vendasQuery = Venda::query()
            ->when($comercio->id, fn($q, $cid) => $q->where('comercio_id', $cid))
            ->whereBetween('created_at', [$inicio, $fim]);

        if (method_exists(Venda::class, 'scopeConcluidas')) {
            $vendasQuery = $vendasQuery->concluidas();
        }

        $vendasHojeQtd = (clone $vendasQuery)->count();
        $vendasHojeTotal = (clone $vendasQuery)->sum('total') ?: 0;

        $estoqueBaixo = Produto::query()
            ->when($comercio->id, fn($q, $cid) => $q->where('produto.comercio_id', $cid))
            ->whereNotNull('estoque_minimo')
            ->where('estoque_minimo', '>', 0)
            ->leftJoin('estoque', function($join) use ($comercio) {
                $join->on('produto.id', '=', 'estoque.produto_id')
                     ->where('estoque.comercio_id', '=', $comercio->id);
            })
            ->where(function ($q) {
                $q->whereNull('estoque.quantidade')
                  ->orWhereRaw('estoque.quantidade <= produto.estoque_minimo');
            })
            ->count();

        // Últimas vendas (independente de ser hoje): 3 mais recentes do comércio
        $ultimasVendas = Venda::query()
            ->when($comercio->id, fn($q, $cid) => $q->where('comercio_id', $cid))
            ->with('cliente')
            ->orderByDesc('created_at')
            ->limit(3)
            ->get()
            ->map(function (Venda $v) {
                return [
                    'id' => $v->id,
                    'cliente' => optional($v->cliente)->nome ?? 'Cliente avulso',
                    'total' => 'R$ ' . number_format((float) $v->total, 2, ',', '.'),
                    'status' => $v->status,
                    'data' => optional($v->created_at)?->format('d/m H:i'),
                ];
            });

        // Fiado em aberto: clientes com saldo negativo (devem para o comércio)
        $fiadoBaseQuery = ContaFiada::query()
            ->when($comercio->id, fn($q, $cid) => $q->where('comercio_id', $cid))
            ->where('saldo', '>', 0);

        $fiadoClientes = (clone $fiadoBaseQuery)->count();
        $fiadoRegistros = (clone $fiadoBaseQuery)->get(['saldo']);
        $fiadoTotal = $fiadoRegistros->reduce(function ($carry, $row) {
            return $carry + (float) $row->saldo;
        }, 0.0);

        return Inertia::render('gerenciamento/Inicio', [
            'comercio' => $comercio->only(['nome', 'cnpj']),
            'dashboard' => [
                'vendasHoje' => [
                    'quantidade' => $vendasHojeQtd,
                    'total' => number_format($vendasHojeTotal, 2, ',', '.'),
                ],
                'estoqueBaixo' => $estoqueBaixo,
                'ultimasVendas' => $ultimasVendas,
                'fiado' => [
                    'clientes' => $fiadoClientes,
                    'total' => number_format($fiadoTotal, 2, ',', '.'),
                ],
            ],
        ]);
    }
}
