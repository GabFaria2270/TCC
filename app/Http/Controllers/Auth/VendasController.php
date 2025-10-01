<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\VendaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendasController extends Controller
{
    public function __construct(private VendaService $vendaService)
    {
    }

    /**
     * Display a listing of vendas.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', \App\Models\Venda::class);
        $resultado = $this->vendaService->listar($request);

        if ($resultado['success']) {
            return Inertia::render('gerenciamento/Vendas', [
                'vendas' => $resultado['data']['vendas'],
                'produtos' => $resultado['data']['produtos'],
                'clientes' => $resultado['data']['clientes'],
            ]);
        }

        return Inertia::render('gerenciamento/Vendas', [
            'vendas' => [],
            'produtos' => [],
            'clientes' => [],
            'error' => $resultado['errors']['system'] ?? 'Erro ao carregar vendas.',
        ]);
    }

    /**
     * Store a newly created venda in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', \App\Models\Venda::class);

        $validated = $request->validate([
            'itens' => 'required|array|min:1',
            'itens.*.produto_id' => 'required|integer|exists:produto,id',
            'itens.*.quantidade' => 'required|integer|min:1',
            'itens.*.preco_unitario' => 'required|numeric|min:0',
            'forma_pagamento' => 'required|string|in:dinheiro,pix,cartao_debito,cartao_credito,conta_fiada',
            'cliente_id' => 'nullable|integer|exists:cliente,id',
            'desconto' => 'nullable|numeric|min:0',
            'observacoes' => 'nullable|string|max:1000',
            'valor_recebido' => 'nullable|numeric|min:0',
        ]);

        $resultado = $this->vendaService->criar($validated, $request);

        if ($resultado['success']) {
            return redirect()
                ->route('vendas.index')
                ->with('success', 'Venda realizada com sucesso!');
        }

        return back()
            ->withErrors($resultado['errors'] ?? [])
            ->withInput();
    }

    /**
     * Display the specified venda.
     */
    public function show(Request $request, int $id)
    {
        $this->authorize('view', \App\Models\Venda::class);
        
        $resultado = $this->vendaService->buscar($id, $request);

        if ($resultado['success']) {
            return Inertia::render('gerenciamento/vendas/Show', [
                'venda' => $resultado['data']['venda']
            ]);
        }

        return redirect()
            ->route('vendas.index')
            ->with('error', $resultado['errors']['venda'] ?? 'Venda não encontrada');
    }

    /**
     * Cancel the specified venda.
     */
    public function destroy(Request $request, int $id)
    {
        $this->authorize('delete', \App\Models\Venda::class);
        
        $resultado = $this->vendaService->cancelar($id, $request);

        if ($resultado['success']) {
            return redirect()
                ->route('vendas.index')
                ->with('success', 'Venda cancelada com sucesso!');
        }

        return back()
            ->with('error', $resultado['errors']['system'] ?? 'Erro ao cancelar venda');
    }
}