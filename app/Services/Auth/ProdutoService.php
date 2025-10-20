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

            $query = Produto::with(['categoria', 'estoque'])
                ->where('produto.comercio_id', $comercio->id)
                ->with(['estoque' => function($q) use ($comercio) {
                    $q->where('comercio_id', $comercio->id);
                }]);

            // Filtros/Ordenação/Paginação do servidor
            // Lê de query string ou, se ausente, da sessão persistida por POST
            $saved = session('produtos.filters', []);
            $q = trim((string) ($request?->query('q', $saved['q'] ?? '') ?? ''));
            $categoriaId = $request?->query('categoriaId', $saved['categoriaId'] ?? null);
            $sort = $request?->query('sort', $saved['sort'] ?? 'nome');
            $dir = strtolower((string) ($request?->query('dir', $saved['dir'] ?? 'asc')));
            $perPage = (int) ($request?->query('perPage', $saved['perPage'] ?? 10));
            $onlyLow = (bool) ($request?->query('onlyLow', $saved['onlyLow'] ?? false));
            $page = (int) ($request?->query('page', $saved['page'] ?? 1));

            if ($q !== '') {
                $query->where(function ($qb) use ($q) {
                    $qb->where('nome', 'like', "%$q%");
                });
            }

            if (!empty($categoriaId)) {
                $query->where('categoria_id', (int) $categoriaId);
            }

            if ($onlyLow) {
                $query->whereHas('estoque', function($q) {
                    $q->whereColumn('quantidade', '<=', 'produto.estoque_minimo');
                });
            }

            // Ordenação segura
            $allowedSorts = ['nome', 'preco', 'quantidade_estoque', 'updated_at'];
            if (!in_array($sort, $allowedSorts, true)) {
                $sort = 'nome';
            }
            $dir = $dir === 'desc' ? 'desc' : 'asc';
            if ($sort === 'quantidade_estoque') {
                $query->orderBy(
                    Estoque::select('quantidade')
                        ->whereColumn('produto_id', 'produto.id')
                        ->where('comercio_id', $comercio->id),
                    $dir
                );
            } else {
                $query->orderBy($sort, $dir);
            }

            $prodPerPage = max(1, min($perPage, 100));
            $currentPage = max(1, $page);
            $produtos = $query->paginate($prodPerPage, ['*'], 'page', $currentPage)->withQueryString();

            $categorias = Categoria::byComercio($comercio->id)->orderByNome()->get();

            $filtersOut = [
                'success' => true,
                'data' => [
                    'produtos' => $produtos,
                    'categorias' => $categorias,
                    'filters' => [
                        'q' => $q,
                        'categoriaId' => $categoriaId,
                        'sort' => $sort,
                        'dir' => $dir,
                        'perPage' => $prodPerPage,
                        'onlyLow' => $onlyLow,
                        'page' => $produtos->currentPage(),
                    ],
                ],
            ];
            // Atualiza sessão com os filtros efetivos
            session(['produtos.filters' => $filtersOut['data']['filters']]);
            return $filtersOut;
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

            // Unicidade de nome por comércio (ignora soft-deletados)
            $nomeNormalizado = trim((string) $data['nome']);
            $dup = \App\Models\Produto::where('comercio_id', $comercio->id)
                ->where('nome', $nomeNormalizado)
                ->whereNull('deleted_at')
                ->exists();
            if ($dup) {
                DB::rollBack();
                return [
                    'success' => false,
                    'errors' => ['nome' => 'Já existe um produto com este nome no seu comércio.'],
                    'reason' => 'duplicate_name',
                ];
            }

            if (!$categoriaId && $novaCategoria) {
                $categoria = Categoria::firstOrCreate(
                    [
                        'nome' => ucwords(strtolower($novaCategoria)),
                        'comercio_id' => $comercio->id,
                    ],
                    [
                        'nome' => ucwords(strtolower($novaCategoria)),
                        'comercio_id' => $comercio->id,
                    ]
                );
                $categoriaId = $categoria->id;
            }

            if ($categoriaId) {
                $catOk = Categoria::where('id', $categoriaId)->where('comercio_id', $comercio->id)->exists();
                if (!$catOk) {
                    DB::rollBack();
                    return [
                        'success' => false,
                        'errors' => ['categoria_id' => 'Categoria não pertence ao seu comércio.'],
                        'reason' => 'categoria_forbidden',
                    ];
                }
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
                'estoque_minimo' => (int) ($data['estoque_minimo'] ?? 0),
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
                $categoria = Categoria::firstOrCreate(
                    [
                        'nome' => ucwords(strtolower($novaCategoria)),
                        'comercio_id' => $comercio->id,
                    ],
                    [
                        'nome' => ucwords(strtolower($novaCategoria)),
                        'comercio_id' => $comercio->id,
                    ]
                );
                $categoriaId = $categoria->id;
            }
            if ($categoriaId) {
                $catOk = Categoria::where('id', $categoriaId)->where('comercio_id', $comercio->id)->exists();
                if (!$catOk) {
                    DB::rollBack();
                    return [
                        'success' => false,
                        'errors' => ['categoria_id' => 'Categoria não pertence ao seu comércio.'],
                        'reason' => 'categoria_forbidden',
                    ];
                }
            }
            if (!$categoriaId) {
                DB::rollBack();
                return [
                    'success' => false,
                    'errors' => ['categoria_id' => 'Categoria inválida.'],
                    'reason' => 'categoria_invalid',
                ];
            }

            // Unicidade no update
            $nomeNovo = trim((string) $data['nome']);
            $dupUpdate = \App\Models\Produto::where('comercio_id', $comercio->id)
                ->where('nome', $nomeNovo)
                ->whereNull('deleted_at')
                ->where('id', '!=', $produto->id)
                ->exists();
            if ($dupUpdate) {
                DB::rollBack();
                return [
                    'success' => false,
                    'errors' => ['nome' => 'Já existe um produto com este nome no seu comércio.'],
                    'reason' => 'duplicate_name',
                ];
            }

            $produto->update([
                'nome' => $data['nome'],
                'preco' => $data['preco'],
                'categoria_id' => $categoriaId,
                'estoque_minimo' => isset($data['estoque_minimo']) ? (int) $data['estoque_minimo'] : $produto->estoque_minimo,
            ]);

            // A manipulação de estoque agora é feita pelos endpoints específicos
            // de movimentos (entrada/saída/ajuste). Mantemos o update do produto
            // focado apenas nos seus próprios campos.

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
