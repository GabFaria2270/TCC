<?php

namespace App\Services\Auth;

use App\Models\Categoria;
use App\Models\Estoque;
use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProdutoService
{
    public function listar(): array
    {
        try {
            $usuario = Auth::user();
            $comercio = $usuario?->comercio;

            if (!$comercio) {
                return [
                    'success' => false,
                    'errors' => ['system' => 'Comércio não encontrado para o usuário.'],
                    'reason' => 'comercio_not_found',
                ];
            }

            $produtos = Produto::with(['categoria'])
                ->byComercio($comercio->id)
                ->orderByNome()
                ->get();

            $categorias = Categoria::orderByNome()->get();

            return [
                'success' => true,
                'data' => [
                    'produtos' => $produtos,
                    'categorias' => $categorias,
                ],
            ];
        } catch (\Exception $e) {
            Log::channel('security')->error('Erro ao listar produtos', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return [
                'success' => false,
                'errors' => ['system' => 'Erro ao carregar produtos.'],
                'reason' => 'system_error',
            ];
        }
    }

    public function cadastrar(array $data, Request $request): array
    {
        try {
            DB::beginTransaction();

            $usuario = Auth::user();
            $comercio = $usuario?->comercio;

            if (!$comercio) {
                DB::rollBack();
                return [
                    'success' => false,
                    'errors' => ['system' => 'Comércio não encontrado para o usuário.'],
                    'reason' => 'comercio_not_found',
                ];
            }

            $categoriaId = $data['categoria_id'] ?? null;
            $novaCategoria = $data['nova_categoria_nome'] ?? null;

            if (!$categoriaId && $novaCategoria) {
                $categoria = Categoria::firstOrCreate([
                    'nome' => ucwords(strtolower($novaCategoria)),
                ]);
                $categoriaId = $categoria->id;
            }

            if (!$categoriaId) {
                DB::rollBack();
                return [
                    'success' => false,
                    'errors' => ['categoria_id' => 'Categoria inválida.'],
                    'reason' => 'categoria_invalid',
                ];
            }

            $produto = Produto::create([
                'nome' => $data['nome'],
                'preco' => $data['preco'],
                'quantidade_estoque' => $data['quantidade'],
                'categoria_id' => $categoriaId,
                'comercio_id' => $comercio->id,
            ]);

            Estoque::updateOrCreate(
                [
                    'produto_id' => $produto->id,
                    'comercio_id' => $comercio->id,
                ],
                [
                    'quantidade' => $data['quantidade'],
                ]
            );

            DB::commit();

            $produto->load('categoria');

            Log::channel('security')->info('Produto cadastrado com sucesso', [
                'produto_id' => $produto->id,
                'user_id' => $usuario->id,
                'ip' => $request->ip(),
            ]);

            return [
                'success' => true,
                'produto' => $produto,
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            Log::channel('security')->error('Erro ao cadastrar produto', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
            ]);

            return [
                'success' => false,
                'errors' => ['system' => 'Erro interno ao cadastrar produto.'],
                'reason' => 'system_error',
            ];
        }
    }
}
