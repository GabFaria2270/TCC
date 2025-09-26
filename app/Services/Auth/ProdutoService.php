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
    public function listar(?Request $request = null): array
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

            $query = Produto::with(['categoria'])
                ->byComercio($comercio->id);

            // Filtros/Ordenação/Paginação do servidor
            $q = trim((string) ($request?->query('q', '') ?? ''));
            $categoriaId = $request?->query('categoriaId');
            $sort = $request?->query('sort', 'nome');
            $dir = strtolower((string) ($request?->query('dir', 'asc')));
            $perPage = (int) ($request?->query('perPage', 10));

            if ($q !== '') {
                $query->where(function ($qb) use ($q) {
                    $qb->where('nome', 'like', "%$q%");
                });
            }

            if (!empty($categoriaId)) {
                $query->where('categoria_id', (int) $categoriaId);
            }

            // Ordenação segura
            $allowedSorts = ['nome', 'preco', 'quantidade_estoque', 'updated_at'];
            if (!in_array($sort, $allowedSorts, true)) {
                $sort = 'nome';
            }
            $dir = $dir === 'desc' ? 'desc' : 'asc';
            $query->orderBy($sort, $dir);

            $produtos = $query->paginate(max(1, min($perPage, 100)))->withQueryString();

            $categorias = Categoria::orderByNome()->get();

            return [
                'success' => true,
                'data' => [
                    'produtos' => $produtos,
                    'categorias' => $categorias,
                    'filters' => [
                        'q' => $q,
                        'categoriaId' => $categoriaId,
                        'sort' => $sort,
                        'dir' => $dir,
                        'perPage' => $perPage,
                    ],
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

    public function atualizar(Produto $produto, array $data, Request $request): array
    {
        try {
            DB::beginTransaction();

            $usuario = Auth::user();
            $comercio = $usuario?->comercio;

            if (!$comercio || $produto->comercio_id !== $comercio->id) {
                DB::rollBack();
                return [
                    'success' => false,
                    'errors' => ['system' => 'Produto não pertence ao seu comércio.'],
                    'reason' => 'forbidden',
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

            $produto->update([
                'nome' => $data['nome'],
                'preco' => $data['preco'],
                'categoria_id' => $categoriaId,
            ]);

            // Atualiza quantidade no Estoque e, se existir, na coluna do Produto (mantendo consistência atual)
            if (isset($data['quantidade'])) {
                $quantidade = (int) $data['quantidade'];
                Estoque::updateOrCreate(
                    [
                        'produto_id' => $produto->id,
                        'comercio_id' => $comercio->id,
                    ],
                    [
                        'quantidade' => $quantidade,
                    ]
                );

                // Se a coluna "quantidade_estoque" continuar sendo usada na view, mantém sincronizada
                if ($produto->isFillable('quantidade_estoque')) {
                    $produto->quantidade_estoque = $quantidade;
                    $produto->save();
                }
            }

            DB::commit();

            $produto->load('categoria');

            Log::channel('security')->info('Produto atualizado com sucesso', [
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

            Log::channel('security')->error('Erro ao atualizar produto', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
            ]);

            return [
                'success' => false,
                'errors' => ['system' => 'Erro interno ao atualizar produto.'],
                'reason' => 'system_error',
            ];
        }
    }

    public function remover(Produto $produto, Request $request): array
    {
        try {
            DB::beginTransaction();

            $usuario = Auth::user();
            $comercio = $usuario?->comercio;

            if (!$comercio || $produto->comercio_id !== $comercio->id) {
                DB::rollBack();
                return [
                    'success' => false,
                    'errors' => ['system' => 'Produto não pertence ao seu comércio.'],
                    'reason' => 'forbidden',
                ];
            }

            // Remover o estoque associado
            Estoque::where('produto_id', $produto->id)
                ->where('comercio_id', $comercio->id)
                ->delete();

            $produto->delete();

            DB::commit();

            Log::channel('security')->info('Produto removido', [
                'produto_id' => $produto->id,
                'user_id' => $usuario->id,
                'ip' => $request->ip(),
            ]);

            return [
                'success' => true,
            ];
        } catch (\Exception $e) {
            DB::rollBack();

            Log::channel('security')->error('Erro ao remover produto', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return [
                'success' => false,
                'errors' => ['system' => 'Erro interno ao remover produto.'],
                'reason' => 'system_error',
            ];
        }
    }
}
