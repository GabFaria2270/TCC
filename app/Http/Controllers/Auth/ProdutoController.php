<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ProdutoRequest;
use App\Services\Auth\ProdutoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProdutoController extends Controller
{
    public function __construct(private ProdutoService $produtoService)
    {
    }

    public function index(Request $request)
    {
        $resultado = $this->produtoService->listar($request);

        if ($resultado['success']) {
            return Inertia::render('gerenciamento/Produtos', [
                'produtos' => $resultado['data']['produtos'],
                'categorias' => $resultado['data']['categorias'],
                'filters' => $resultado['data']['filters'] ?? [],
            ]);
        }

        return Inertia::render('gerenciamento/Produtos', [
            'produtos' => [],
            'categorias' => [],
            'error' => $resultado['errors']['system'] ?? 'Erro ao carregar produtos.',
        ]);
    }

    public function store(ProdutoRequest $request)
    {
        $validated = $request->validated();

        $resultado = $this->produtoService->cadastrar($validated, $request);

        if ($resultado['success']) {
            return redirect()
                ->route('produtos.index')
                ->with('success', 'Produto cadastrado com sucesso!');
        }

        return back()
            ->withErrors($resultado['errors'] ?? [])
            ->withInput();
    }

    public function update(ProdutoRequest $request, \App\Models\Produto $produto)
    {
        $validated = $request->validated();

        $resultado = $this->produtoService->atualizar($produto, $validated, $request);

        if ($resultado['success']) {
            return redirect()
                ->route('produtos.index')
                ->with('success', 'Produto atualizado com sucesso!');
        }

        return back()
            ->withErrors($resultado['errors'] ?? [])
            ->withInput();
    }

    public function destroy(Request $request, \App\Models\Produto $produto)
    {
        $resultado = $this->produtoService->remover($produto, $request);

        if ($resultado['success']) {
            return redirect()
                ->route('produtos.index')
                ->with('success', 'Produto removido com sucesso!');
        }

        return back()->with('error', $resultado['errors']['system'] ?? 'Não foi possível remover o produto.');
    }
}
