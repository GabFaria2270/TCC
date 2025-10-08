<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Venda;

class FiadoController extends Controller
{
    public function historico(Request $request)
    {
        $user = $request->user();
        $comercioId = $user?->comercio?->id;

        if (!$comercioId) {
            return response()->json(['success' => false, 'message' => 'Comércio não encontrado'], 404);
        }

        $vendas = Venda::with(['cliente:id,nome'])
            ->where('comercio_id', $comercioId)
            ->where('forma_pagamento', 'conta_fiada')
            ->orderByDesc('created_at')
            ->limit(200)
            ->get()
            ->map(function (Venda $v) {
                $statusFiado = $v->status === 'concluida' ? 'pago' : 'pendente';
                return [
                    'id' => $v->id,
                    'cliente' => $v->cliente?->nome ?? 'Cliente avulso',
                    'valor' => (float) $v->total,
                    'data' => optional($v->created_at)?->toISOString(),
                    'status' => $statusFiado,
                ];
            });

        return response()->json([
            'success' => true,
            'vendas_fiadas' => $vendas,
        ]);
    }
}