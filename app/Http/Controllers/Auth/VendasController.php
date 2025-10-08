<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\VendaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Requests\Auth\VendaRequest;

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
        $resultado = $this->vendaService->listar($request);

        if ($resultado['success']) {
            return Inertia::render('gerenciamento/Vendas', [
                'vendas' => $resultado['data']['vendas'],
                'produtos' => $resultado['data']['produtos'],
                'clientes' => $resultado['data']['clientes'],
                // Adicione as mensagens do validation.php:
                'messages' => [
                    'produto_adicionado' => __('validation.pdv_produto_adicionado'),
                    'produto_removido' => __('validation.pdv_produto_removido'),
                    'quantidade_atualizada' => __('validation.pdv_quantidade_atualizada'),
                    'estoque_insuficiente' => __('validation.pdv_estoque_insuficiente'),
                    'produto_indisponivel' => __('validation.pdv_js_produto_indisponivel'),
                    'erro_adicionar' => __('validation.pdv_js_erro_adicionar'),
                    'erro_remover' => __('validation.pdv_js_erro_remover'),
                    'erro_finalizar' => __('validation.pdv_js_erro_finalizar'),
                    'venda_processada' => __('validation.pdv_venda_processada'),
                    'carrinho_vazio' => __('validation.pdv_carrinho_vazio'),
                    'valor_insuficiente' => __('validation.pdv_valor_insuficiente'),
                    'produto_ja_no_carrinho' => __('validation.pdv_produto_ja_no_carrinho'),
                    'cliente_obrigatorio' => __('validation.pdv_cliente_obrigatorio'),
                ],
            ]);
        }

        return Inertia::render('gerenciamento/Vendas', [
            'vendas' => [],
            'produtos' => [],
            'clientes' => [],
            'error' => $resultado['errors']['system'] ?? 'Erro ao carregar vendas.',
            // Adicionar mensagens também no caso de erro
            'messages' => [
                'produto_adicionado' => __('validation.pdv_produto_adicionado'),
                'produto_removido' => __('validation.pdv_produto_removido'),
                'quantidade_atualizada' => __('validation.pdv_quantidade_atualizada'),
                'estoque_insuficiente' => __('validation.pdv_estoque_insuficiente'),
                'produto_indisponivel' => __('validation.pdv_js_produto_indisponivel'),
                'erro_adicionar' => __('validation.pdv_js_erro_adicionar'),
                'erro_remover' => __('validation.pdv_js_erro_remover'),
                'erro_finalizar' => __('validation.pdv_js_erro_finalizar'),
                'venda_processada' => __('validation.pdv_venda_processada'),
                'carrinho_vazio' => __('validation.pdv_carrinho_vazio'),
                'valor_insuficiente' => __('validation.pdv_valor_insuficiente'),
                'produto_ja_no_carrinho' => __('validation.pdv_produto_ja_no_carrinho'),
                'cliente_obrigatorio' => __('validation.pdv_cliente_obrigatorio'),
            ],
        ]);
    }

    /**
     * Store a newly created venda in storage.
     */
    public function store(VendaRequest $request)
    {
        $validated = $request->validated();

        $resultado = $this->vendaService->criar($validated, $request);

        if ($resultado['success']) {
            return redirect()->back()->with('success', __('validation.pdv_venda_processada'));
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
        $resultado = $this->vendaService->buscar($id, $request);

        if ($resultado['success']) {
            // ✅ Se for AJAX/JSON, retorna JSON (usado pelo modal)
            if ($request->expectsJson()) {
                return response()->json([
                    'venda' => $resultado['data']['venda'],
                ]);
            }

            return Inertia::render('gerenciamento/vendas/Show', [
                'venda' => $resultado['data']['venda']
            ]);
        }

        return redirect()->back()->with('error', __('validation.pdv_venda_nao_encontrada'));
    }

    /**
     * Cancel the specified venda.
     */
    public function destroy(Request $request, int $id)
    {
        $resultado = $this->vendaService->cancelar($id, $request);

        if ($resultado['success']) {
            return redirect()->back()->with('success', __('validation.pdv_venda_cancelada'));
        }

        return back()
            ->with('error', $resultado['errors']['system'] ?? 'Erro ao cancelar venda');
    }
}