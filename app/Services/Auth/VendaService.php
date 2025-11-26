<?php

namespace App\Services\Auth;

use App\Models\Venda;
use App\Models\ItemVenda;
use App\Models\Cliente;
use App\Models\Produto;
use App\Models\Estoque;
use App\Models\MovimentoEstoque;
use App\Models\ContaFiada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class VendaService
{
    public function listar($request)
    {
        try {
            $user = $request->user();
            $comercio = $user->comercio;

            if (!$comercio) {
                return [
                    'success' => false,
                    'errors' => ['system' => 'Comércio não encontrado para o usuário']
                ];
            }

            // Buscar vendas do comércio (todas as vendas do estabelecimento)
            $vendas = Venda::with(['cliente', 'itens.produto', 'usuario'])
                ->where('comercio_id', $comercio->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($venda) {
                    return [
                        'id' => $venda->id,
                        'total' => $venda->total,
                        'total_formatado' => number_format((float) $venda->total, 2, ',', '.'),
                        'desconto' => $venda->desconto,
                        'forma_pagamento' => $venda->forma_pagamento,
                        'status' => $venda->status,
                        'cliente' => $venda->cliente ? [
                            'nome' => $venda->cliente->nome,
                            'email' => $venda->cliente->email,
                        ] : null,
                        'usuario' => $venda->usuario ? [
                            'id' => $venda->usuario->id,
                            'nome' => $venda->usuario->NOME ?? ($venda->usuario->name ?? 'Usuário'),
                        ] : null,
                        'created_at' => optional($venda->created_at)->toIso8601String(),
                        'created_at_formatado' => optional($venda->created_at)->format('d/m/Y H:i'),
                        'observacoes' => $venda->observacoes,
                    ];
                });

            // Buscar produtos do comércio (CORRIGIDO)
            $produtos = Produto::with(['categoria', 'estoque'])
                ->where('comercio_id', $comercio->id)
                ->get()
                ->map(function ($produto) {
                    return [
                        'id' => $produto->id,
                        'nome' => $produto->nome,
                        'preco' => (float) $produto->preco,
                        'preco_formatado' => 'R$ ' . number_format((float) $produto->preco, 2, ',', '.'),
                        'codigo_barras' => $produto->codigo_barras ?? '',
                        'categoria' => $produto->categoria ? [
                            'nome' => $produto->categoria->nome
                        ] : null,
                        'estoque' => ['quantidade' => (int) ($produto->estoque->quantidade ?? 0)],
                    ];
                });

            // Buscar clientes do comércio com conta fiada
            $clientes = Cliente::with('contaFiada')
                ->where('comercio_id', $comercio->id)
                ->orderBy('nome')
                ->get()
                ->map(function ($cliente) {
                    return [
                        'id' => $cliente->id,
                        'nome' => $cliente->nome,
                        'email' => $cliente->email,
                        'telefone' => $cliente->telefone,
                        'conta_fiada' => $cliente->contaFiada ? [
                            'saldo' => (float) $cliente->contaFiada->saldo,
                            'saldo_formatado' => 'R$ ' . number_format((float) $cliente->contaFiada->saldo, 2, ',', '.'),
                        ] : null,
                    ];
                });

            return [
                'success' => true,
                'data' => [
                    'vendas' => $vendas,
                    'produtos' => $produtos,
                    'clientes' => $clientes,
                ]
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'errors' => ['system' => 'Erro interno do sistema']
            ];
        }
    }

    public function criar(array $dados, $request)
    {
        DB::beginTransaction();

        try {
            $user = $request->user();
            $comercio = $user->comercio;

            if (!$comercio) {
                return [
                    'success' => false,
                    'errors' => ['system' => 'Comércio não encontrado']
                ];
            }

            // Validar se todos os produtos existem e têm estoque
            $erros = $this->validarItens($dados['itens'], $comercio->id); // ✅ CORRIGIDO
            if (!empty($erros)) {
                return [
                    'success' => false,
                    'errors' => $erros
                ];
            }

            // Calcular totais
            $subtotal = 0;
            $itensProcessados = [];

            foreach ($dados['itens'] as $item) {
                $produto = Produto::where('id', $item['produto_id'])
                    ->where('comercio_id', $comercio->id) // ✅ CORRIGIDO
                    ->first();

                if (!$produto) {
                    throw new Exception("Produto ID {$item['produto_id']} não encontrado");
                }

                $subtotalItem = $item['quantidade'] * $item['preco_unitario'];
                $subtotal += $subtotalItem;

                $itensProcessados[] = [
                    'produto' => $produto,
                    'quantidade' => $item['quantidade'],
                    'preco_unitario' => $item['preco_unitario'],
                    'subtotal' => $subtotalItem,
                ];
            }

            $desconto = $dados['desconto'] ?? 0;
            $total = $subtotal - $desconto;

            // Calcular troco para pagamento em dinheiro
            $troco = null;
            if ($dados['forma_pagamento'] === 'dinheiro' && isset($dados['valor_recebido'])) {
                $troco = max(0, $dados['valor_recebido'] - $total);
            }

            // ✅ NOVO: montar observações a partir dos itens (mesmo padrão do fiado)
            $observacoesAuto = $this->montarObservacoesDaVenda($itensProcessados, $total, $desconto);

            // Determinar status da venda
            $status = $dados['forma_pagamento'] === 'conta_fiada' ? 'conta_fiada' : 'concluida';

            // Criar a venda (sempre com comercio_id e usuario_id)
            $venda = Venda::create([
                'comercio_id' => $comercio->id,
                'usuario_id' => $user->id,
                'cliente_id' => $dados['cliente_id'] ?? null,
                'subtotal' => $subtotal,
                'desconto' => $desconto,
                'total' => $total,
                'forma_pagamento' => $dados['forma_pagamento'],
                'valor_recebido' => $dados['valor_recebido'] ?? null,
                'troco' => $troco,
                'status' => $status,
                // ✅ se veio observação do usuário, preserva e adiciona a descrição dos itens ao final
                'observacoes' => isset($dados['observacoes']) && trim((string) $dados['observacoes']) !== ''
                    ? (trim((string) $dados['observacoes']) . ' | ' . $observacoesAuto)
                    : $observacoesAuto,
            ]);

            // Criar itens da venda e atualizar estoque
            foreach ($itensProcessados as $itemData) {
                // Criar item da venda
                ItemVenda::create([
                    'venda_id' => $venda->id,
                    'produto_id' => $itemData['produto']->id,
                    'quantidade' => $itemData['quantidade'],
                    'preco_unitario' => $itemData['preco_unitario'],
                    'subtotal' => $itemData['subtotal'],
                ]);

                // Atualizar estoque
                $this->atualizarEstoque($itemData['produto'], $itemData['quantidade'], $venda, $user);
            }



            // 🚀 COMMIT da transação principal primeiro
            DB::commit();

            // Atualizar conta fiada após commit
            if ($dados['forma_pagamento'] === 'conta_fiada' && isset($dados['cliente_id']) && $dados['cliente_id']) {
                try {
                    DB::beginTransaction();
                    $this->atualizarContaFiada((int) $dados['cliente_id'], $total, $venda->id); // ✅ CORRIGIDO: Passa ID da venda
                    DB::commit();
                } catch (Exception $e) {
                    DB::rollBack();
                    // Não falha a venda, apenas registra o erro
                }
            }

            return [
                'success' => true,
                'data' => [
                    'venda' => $venda->load(['itens.produto', 'cliente'])
                ]
            ];

        } catch (Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'errors' => ['system' => __('validation.pdv_erro_processar')]
            ];
        }
    }

    public function criarCancelada(array $dados, $request)
    {
        DB::beginTransaction();

        try {
            $user = $request->user();
            $comercio = $user->comercio;

            if (!$comercio) {
                return [
                    'success' => false,
                    'errors' => ['system' => 'Comércio não encontrado']
                ];
            }

            $erros = $this->validarItens($dados['itens'], $comercio->id);
            if (!empty($erros)) {
                return [
                    'success' => false,
                    'errors' => $erros
                ];
            }

            $subtotal = 0;
            $itensProcessados = [];

            foreach ($dados['itens'] as $item) {
                $produto = Produto::where('id', $item['produto_id'])
                    ->where('comercio_id', $comercio->id)
                    ->first();

                if (!$produto) {
                    throw new Exception("Produto ID {$item['produto_id']} não encontrado");
                }

                $subtotalItem = $item['quantidade'] * $item['preco_unitario'];
                $subtotal += $subtotalItem;

                $itensProcessados[] = [
                    'produto' => $produto,
                    'quantidade' => $item['quantidade'],
                    'preco_unitario' => $item['preco_unitario'],
                    'subtotal' => $subtotalItem,
                ];
            }

            $desconto = $dados['desconto'] ?? 0;
            $total = $subtotal - $desconto;

            $troco = null;
            if ($dados['forma_pagamento'] === 'dinheiro' && isset($dados['valor_recebido'])) {
                $troco = max(0, $dados['valor_recebido'] - $total);
            }

            $observacoesAuto = $this->montarObservacoesDaVenda($itensProcessados, $total, $desconto);

            $venda = Venda::create([
                'comercio_id' => $comercio->id,
                'usuario_id' => $user->id,
                'cliente_id' => $dados['cliente_id'] ?? null,
                'subtotal' => $subtotal,
                'desconto' => $desconto,
                'total' => $total,
                'forma_pagamento' => $dados['forma_pagamento'],
                'valor_recebido' => $dados['valor_recebido'] ?? null,
                'troco' => $troco,
                'status' => 'cancelada',
                'observacoes' => isset($dados['observacoes']) && trim((string) $dados['observacoes']) !== ''
                    ? (trim((string) $dados['observacoes']) . ' | ' . $observacoesAuto)
                    : $observacoesAuto,
            ]);

            foreach ($itensProcessados as $itemData) {
                ItemVenda::create([
                    'venda_id' => $venda->id,
                    'produto_id' => $itemData['produto']->id,
                    'quantidade' => $itemData['quantidade'],
                    'preco_unitario' => $itemData['preco_unitario'],
                    'subtotal' => $itemData['subtotal'],
                ]);
            }

            DB::commit();

            return [
                'success' => true,
                'data' => [
                    'venda' => $venda,
                ]
            ];
        } catch (Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'errors' => ['system' => __('validation.pdv_erro_cancelar')]
            ];
        }
    }

    private function validarItens(array $itens, int $comercioId): array
    {
        $erros = [];

        foreach ($itens as $index => $item) {
            $produto = Produto::where('id', $item['produto_id'])
                ->where('comercio_id', $comercioId)
                ->first();

            if (!$produto) {
                $erros["itens.{$index}"] = __('validation.pdv_produto_nao_encontrado');
                continue;
            }

            if (!$produto->ativo) {
                $erros["itens.{$index}"] = __('validation.pdv_produto_inativo', ['produto' => $produto->nome]);
                continue;
            }

            $estoque = $produto->estoque;
            $estoqueAtual = (int) ($estoque->quantidade ?? 0);
            if ($estoqueAtual < $item['quantidade']) {
                $erros["itens.{$index}"] = __('validation.pdv_estoque_insuficiente', [
                    'disponivel' => $estoqueAtual
                ]) . " para {$produto->nome}";
            }
        }

        return $erros;
    }

    private function atualizarEstoque(Produto $produto, int $quantidade, Venda $venda, $usuario)
    {
        $estoque = $produto->estoque;
        $quantidadeAnterior = (int) ($estoque->quantidade ?? 0);
        $quantidadeAtual = $quantidadeAnterior - $quantidade;

        if ($quantidadeAtual < 0) {
            throw new Exception(__('validation.pdv_estoque_insuficiente', [
                'disponivel' => $quantidadeAnterior
            ]) . " para {$produto->nome}");
        }

        // Atualiza diretamente na tabela estoque
        $estoque->update(['quantidade' => $quantidadeAtual]);

        // Mantém o registro do movimento (auditoria)
        MovimentoEstoque::create([
            'produto_id' => $produto->id,
            'usuario_id' => $usuario->id,
            'venda_id' => $venda->id,
            'tipo' => 'saida',
            'quantidade_anterior' => $quantidadeAnterior,
            'quantidade_movimentada' => $quantidade,
            'quantidade_atual' => $quantidadeAtual,
            'motivo' => 'Venda #' . $venda->id,
        ]);
    }

    private function atualizarContaFiada(int $clienteId, float $valor, ?int $vendaId = null)
    {
        $cliente = Cliente::with('contaFiada')->find($clienteId);

        if (!$cliente) {
            throw new Exception("Cliente não encontrado para ID: {$clienteId}");
        }

        // ✅ BUSCAR OS PRODUTOS DA VENDA PARA A DESCRIÇÃO
        $produtosDescricao = '';
        if ($vendaId) {
            $venda = Venda::with('itens.produto')->find($vendaId);
            if ($venda && $venda->itens->count() > 0) {
                $produtos = [];
                foreach ($venda->itens as $item) {
                    // Formato mais bonito: "2x Coca-Cola (R$ 5,00 cada)"
                    $precoUnitario = number_format($item->preco_unitario, 2, ',', '.');
                    $produtos[] = $item->quantidade . 'x ' . $item->produto->nome . ' (R$ ' . $precoUnitario . ' cada)';
                }
                $produtosDescricao = implode(' + ', $produtos);
            }
        }

        // ✅ MONTAR DESCRIÇÃO BONITA E INTUITIVA
        $timezone = config('app.timezone', 'America/Sao_Paulo');
        $dataFormatada = now($timezone)->format('d/m/Y \à\s H:i');
        $valorFormatado = 'R$ ' . number_format($valor, 2, ',', '.');

        if ($produtosDescricao) {
            // Formato: "🛒 Compra: 2x Coca-Cola (R$ 3,50 cada) + 1x Pão de Açúcar (R$ 2,00 cada) | Total: R$ 9,00 | 07/10/2025 às 14:30"
            $descricaoVenda = "🛒 Compra: {$produtosDescricao} | Total: {$valorFormatado} | {$dataFormatada}";
        } else {
            $descricaoVenda = "🛒 Venda fiada: {$valorFormatado} | {$dataFormatada}";
        }

        if ($cliente->contaFiada) {
            $contaFiada = $cliente->contaFiada;
            $saldoAnterior = (float) $contaFiada->saldo;
            $novoSaldo = $saldoAnterior + $valor;

            // ✅ CORRIGIDO: Atualiza com descrição bonita dos produtos
            $contaFiada->update([
                'saldo' => $novoSaldo,
                'descricao' => $descricaoVenda
            ]);
        } else {
            // Para primeira compra, adiciona explicação
            $descricaoVenda .= ' | 📝 Primeira compra na conta fiada';

            ContaFiada::create([
                'cliente_id' => $cliente->id,
                'comercio_id' => $cliente->comercio_id,
                'saldo' => $valor,
                'descricao' => $descricaoVenda
            ]);
        }
    }

    public function buscar(int $id, $request)
    {
        try {
            $user = $request->user();
            $venda = Venda::with(['itens.produto', 'cliente', 'usuario'])
                ->where('comercio_id', $user->comercio->id)
                ->where('id', $id)
                ->first();

            if (!$venda) {
                return [
                    'success' => false,
                    'errors' => ['venda' => 'Venda não encontrada']
                ];
            }

            return [
                'success' => true,
                'data' => ['venda' => $venda]
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'errors' => ['system' => 'Erro interno do sistema']
            ];
        }
    }

    public function cancelar(int $id, $request)
    {
        DB::beginTransaction();

        try {
            $user = $request->user();

            $venda = Venda::with(['itens.produto'])
                ->where('id', $id)
                ->where('usuario_id', $user->id)
                ->first();

            if (!$venda) {
                return [
                    'success' => false,
                    'errors' => ['venda' => 'Venda não encontrada']
                ];
            }

            if ($venda->status === 'cancelada') {
                return [
                    'success' => false,
                    'errors' => ['venda' => 'Venda já está cancelada']
                ];
            }

            // Reverter estoque
            foreach ($venda->itens as $item) {
                $this->reverterEstoque($item->produto, $item->quantidade, $venda, $user);
            }

            // Reverter conta fiada se necessário
            if ($venda->forma_pagamento === 'conta_fiada' && $venda->cliente_id) {
                $this->reverterContaFiada($venda->cliente_id, (float) $venda->total);
            }

            // Atualizar status da venda
            $venda->update(['status' => 'cancelada']);

            DB::commit();

            return [
                'success' => true,
                'data' => ['venda' => $venda]
            ];

        } catch (Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'errors' => ['system' => 'Erro ao cancelar venda']
            ];
        }
    }

    private function reverterEstoque(Produto $produto, int $quantidade, Venda $venda, $usuario)
    {
        $estoque = $produto->estoque;
        $quantidadeAnterior = (int) ($estoque->quantidade ?? 0);
        $quantidadeAtual = $quantidadeAnterior + $quantidade;

        // Atualiza diretamente a tabela estoque
        $estoque->update(['quantidade' => $quantidadeAtual]);

        // Registra movimento de entrada por cancelamento
        MovimentoEstoque::create([
            'produto_id' => $produto->id,
            'usuario_id' => $usuario->id,
            'venda_id' => $venda->id,
            'tipo' => 'entrada',
            'quantidade_anterior' => $quantidadeAnterior,
            'quantidade_movimentada' => $quantidade,
            'quantidade_atual' => $quantidadeAtual,
            'motivo' => 'Cancelamento Venda #' . $venda->id,
        ]);
    }

    private function reverterContaFiada(int $clienteId, float $valor)
    {
        // ✅ CORRIGIDO: Usar relacionamento correto (camelCase)
        $cliente = Cliente::with('contaFiada')->find($clienteId);

        if (!$cliente) {
            return;
        }

        if ($cliente->contaFiada) {
            $saldoAtual = (float) $cliente->contaFiada->saldo;
            $novoSaldo = max(0, $saldoAtual - $valor);
            $cliente->contaFiada->update(['saldo' => $novoSaldo]);
        }
    }

    private function montarObservacoesDaVenda(array $itensProcessados, float $total, float $desconto): string
    {
        // Montar observações no padrão "Produto A (Qnt: 2, Subtotal: R$ 10,00) + Produto B (Qnt: 1, Subtotal: R$ 5,00)"
        $observacoes = [];
        foreach ($itensProcessados as $item) {
            $nomeProduto = $item['produto']->nome;
            $quantidade = $item['quantidade'];
            $subtotal = $item['subtotal'];

            $observacoes[] = "{$nomeProduto} (Qnt: {$quantidade}, Subtotal: R$ " . number_format($subtotal, 2, ',', '.') . ")";
        }

        $observacaoFinal = implode(' + ', $observacoes);

        // Adicionar total e desconto, se houver
        $observacaoFinal .= " | Total: R$ " . number_format($total, 2, ',', '.');
        if ($desconto > 0) {
            $observacaoFinal .= " | Desconto: R$ " . number_format($desconto, 2, ',', '.');
        }

        return $observacaoFinal;
    }


}