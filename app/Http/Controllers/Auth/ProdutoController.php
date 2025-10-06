<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ProdutoRequest;
use App\Http\Requests\Auth\ProdutoUpdateRequest;
use App\Services\Auth\ProdutoService;
use App\Services\Auth\EstoqueService;
use App\Models\MovimentoEstoque;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProdutoController extends Controller
{
    public function __construct(private ProdutoService $produtoService, private EstoqueService $estoqueService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', \App\Models\Produto::class);
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

    /**
     * Recebe filtros via POST, armazena-os na sessão e redireciona sem query string
     */
    public function setFilters(Request $request)
    {
        $this->authorize('viewAny', \App\Models\Produto::class);
        $filters = $request->only(['q','categoriaId','sort','dir','perPage','onlyLow','page']);
        session(['produtos.filters' => $filters]);
        return redirect()->route('produtos.index');
    }

    public function store(ProdutoRequest $request)
    {
        $this->authorize('create', \App\Models\Produto::class);
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

    public function update(ProdutoUpdateRequest $request, \App\Models\Produto $produto)
    {
        $this->authorize('update', $produto);
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
        $this->authorize('delete', $produto);
        $resultado = $this->produtoService->remover($produto, $request);

        if ($resultado['success']) {
            return redirect()
                ->route('produtos.index')
                ->with('success', 'Produto removido com sucesso!');
        }

        return back()->with('error', $resultado['errors']['system'] ?? 'Não foi possível remover o produto.');
    }

    public function estoqueEntrada(Request $request, \App\Models\Produto $produto)
    {
        $this->authorize('update', $produto);
        $validated = $request->validate([
            'quantidade' => ['required', 'integer', 'min:1'],
            'motivo' => ['nullable', 'string', 'max:255']
        ]);
        $resultado = $this->estoqueService->entrada($produto, (int) $validated['quantidade'], $validated['motivo'] ?? null);
        if ($resultado['success']) {
            return redirect()->route('produtos.index')->with('success', 'Entrada de estoque registrada.');
        }
        return back()->withErrors($resultado['errors'] ?? ['system' => 'Erro ao registrar entrada.']);
    }

    public function estoqueSaida(Request $request, \App\Models\Produto $produto)
    {
        $this->authorize('update', $produto);
        $validated = $request->validate([
            'quantidade' => ['required', 'integer', 'min:1'],
            'motivo' => ['nullable', 'string', 'max:255']
        ]);
        $resultado = $this->estoqueService->saida($produto, (int) $validated['quantidade'], $validated['motivo'] ?? null);
        if ($resultado['success']) {
            return redirect()->route('produtos.index')->with('success', 'Saída de estoque registrada.');
        }
        return back()->withErrors($resultado['errors'] ?? ['system' => 'Erro ao registrar saída.']);
    }

    public function estoqueAjuste(Request $request, \App\Models\Produto $produto)
    {
        $this->authorize('update', $produto);
        $validated = $request->validate([
            'novoSaldo' => ['required', 'integer', 'min:0'],
            'motivo' => ['nullable', 'string', 'max:255']
        ]);
        $resultado = $this->estoqueService->ajuste($produto, (int) $validated['novoSaldo'], $validated['motivo'] ?? null);
        if ($resultado['success']) {
            return redirect()->route('produtos.index')->with('success', 'Ajuste de estoque registrado.');
        }
        return back()->withErrors($resultado['errors'] ?? ['system' => 'Erro ao ajustar estoque.']);
    }

    public function historico(Request $request, \App\Models\Produto $produto)
    {
        $this->authorize('view', $produto);
        // Busca movimentos do produto (tabela movimentos_estoque)
        $paginator = MovimentoEstoque::where('produto_id', $produto->id)
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        // Transforma para o shape esperado pelo front-end (quantidade, saldo_apos)
        $mapped = $paginator->through(function ($m) {
            return [
                'id' => $m->id,
                'tipo' => $m->tipo,
                'quantidade' => (int) $m->quantidade_movimentada,
                'saldo_apos' => (int) $m->quantidade_atual,
                'motivo' => $m->motivo,
                'created_at' => $m->created_at?->toISOString(),
            ];
        });

        return Inertia::render('gerenciamento/ProdutoHistorico', [
            'produto' => [
                'id' => $produto->id,
                'nome' => $produto->nome,
            ],
            'movimentos' => $mapped,
        ]);
    }
}
