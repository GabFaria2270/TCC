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

    public function index()
    {
        $resultado = $this->produtoService->listar();

        if ($resultado['success']) {
            return Inertia::render('gerenciamento/Produtos', [
                'produtos' => $resultado['data']['produtos'],
                'categorias' => $resultado['data']['categorias'],
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
}
