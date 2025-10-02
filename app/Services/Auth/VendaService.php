<?php

namespace App\Services\Auth;

use App\Models\Venda;
use App\Models\ItemVenda;
use App\Models\Cliente;
use App\Models\Produto;
use App\Models\Estoque;
use App\Models\MovimentoEstoque;
use App\Models\ContaFiada; // ✅ ADICIONADO
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception; // ✅ ADICIONADO

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
            
            // Buscar vendas do usuário
            $vendas = Venda::with(['cliente', 'itens.produto', 'usuario'])
                ->where('usuario_id', $user->id) // ✅ VERIFICAR SE É 'id' ou 'ID'
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($venda) {
                    return [
                        'id' => $venda->id,
                        'total' => $venda->total,
                        'total_formatado' => number_format($venda->total, 2, ',', '.'),
                        'desconto' => $venda->desconto,
                        'forma_pagamento' => $venda->forma_pagamento,
                        'status' => $venda->status,
                        'cliente' => $venda->cliente ? [
                            'nome' => $venda->cliente->nome,
                            'email' => $venda->cliente->email,
                        ] : null,
                        'created_at' => $venda->created_at->format('d/m/Y H:i'),
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
                        'preco' => (float) $produto->preco, // ✅ GARANTIR FLOAT
                        'preco_formatado' => 'R$ ' . number_format((float) $produto->preco, 2, ',', '.'), // ✅ GARANTIR FORMATAÇÃO
                        'codigo_barras' => $produto->codigo_barras ?? '',
                        'categoria' => $produto->categoria ? [
                            'nome' => $produto->categoria->nome
                        ] : null,
                        'estoque' => $produto->estoque ? [
                            'quantidade' => (int) $produto->estoque->quantidade // ✅ GARANTIR INT
                        ] : ['quantidade' => 0],
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
                            'saldo_formatado' => 'R$ ' . number_format($cliente->contaFiada->saldo, 2, ',', '.'),
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

        } catch (Exception $e) { // ✅ CORRIGIDO
            Log::error('Erro ao listar vendas: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString()); // ✅ ADICIONADO PARA DEBUG
            return [
                'success' => false,
                'errors' => ['system' => 'Erro interno do sistema: ' . $e->getMessage()] // ✅ MOSTRA O ERRO ESPECÍFICO
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

            // Determinar status da venda
            $status = $dados['forma_pagamento'] === 'conta_fiada' ? 'conta_fiada' : 'concluida';

            // Criar a venda
            $venda = Venda::create([
                'usuario_id' => $user->id,
                'cliente_id' => $dados['cliente_id'] ?? null,
                'subtotal' => $subtotal,
                'desconto' => $desconto,
                'total' => $total,
                'forma_pagamento' => $dados['forma_pagamento'],
                'valor_recebido' => $dados['valor_recebido'] ?? null,
                'troco' => $troco,
                'status' => $status,
                'observacoes' => $dados['observacoes'] ?? null,
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

            // 🏦 ATUALIZAR CONTA FIADA APÓS COMMIT (para garantir que não haja conflitos de transação)
            if ($dados['forma_pagamento'] === 'conta_fiada' && isset($dados['cliente_id']) && $dados['cliente_id']) {
                Log::info("🔄 Atualizando conta fiada PÓS-COMMIT", [
                    'venda_id' => $venda->id,
                    'cliente_id' => $dados['cliente_id'],
                    'total' => $total
                ]);
                
                try {
                    DB::beginTransaction();
                    $this->atualizarContaFiada((int) $dados['cliente_id'], $total);
                    DB::commit();
                    
                    Log::info("✅ Conta fiada atualizada pós-commit com sucesso");
                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error("❌ ERRO ao atualizar conta fiada pós-commit", [
                        'erro' => $e->getMessage(),
                        'venda_id' => $venda->id,
                        'cliente_id' => $dados['cliente_id']
                    ]);
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
            Log::error('Erro ao criar venda: ' . $e->getMessage());
            return [
                'success' => false,
                'errors' => ['system' => 'Erro ao processar venda: ' . $e->getMessage()]
            ];
        }
    }

    private function validarItens(array $itens, int $comercioId): array
    {
        $erros = [];

        foreach ($itens as $index => $item) {
            $produto = Produto::with('estoque')
                ->where('id', $item['produto_id'])
                ->where('comercio_id', $comercioId) // ✅ CORRIGIDO
                ->first();

            if (!$produto) {
                $erros["itens.{$index}"] = "Produto não encontrado";
                continue;
            }

            if (!$produto->ativo) {
                $erros["itens.{$index}"] = "Produto inativo: {$produto->nome}";
                continue;
            }

            $estoqueAtual = $produto->estoque ? $produto->estoque->quantidade : 0;
            if ($estoqueAtual < $item['quantidade']) {
                $erros["itens.{$index}"] = "Estoque insuficiente para {$produto->nome}. Disponível: {$estoqueAtual}";
            }
        }

        return $erros;
    }

    private function atualizarEstoque(Produto $produto, int $quantidade, Venda $venda, $usuario)
    {
        $estoque = $produto->estoque;
        
        if (!$estoque) {
            throw new Exception("Produto {$produto->nome} não possui controle de estoque");
        }

        $quantidadeAnterior = $estoque->quantidade;
        $quantidadeAtual = $quantidadeAnterior - $quantidade;

        // Atualizar estoque
        $estoque->update(['quantidade' => $quantidadeAtual]);

        // Registrar movimento de estoque
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

    private function atualizarContaFiada(int $clienteId, float $valor)
    {
        Log::info("=== INICIANDO ATUALIZAÇÃO CONTA FIADA ===", [
            'cliente_id' => $clienteId,
            'valor_venda' => $valor
        ]);

        // Buscar cliente com conta fiada
        $cliente = Cliente::with('contaFiada')->find($clienteId);
        
        if (!$cliente) {
            Log::error("❌ Cliente não encontrado", ['cliente_id' => $clienteId]);
            throw new Exception("Cliente não encontrado para ID: {$clienteId}");
        }

        Log::info("✅ Cliente encontrado", [
            'cliente_id' => $cliente->id,
            'cliente_nome' => $cliente->nome,
            'comercio_id' => $cliente->comercio_id,
            'tem_conta_fiada' => $cliente->contaFiada ? 'SIM' : 'NÃO'
        ]);

        try {
            if ($cliente->contaFiada) {
                // CENÁRIO 1: Conta fiada JÁ EXISTE - apenas adicionar valor
                $contaFiada = $cliente->contaFiada;
                $saldoAnterior = (float) $contaFiada->saldo;
                $novoSaldo = $saldoAnterior + $valor;
                
                Log::info("💰 Atualizando conta fiada existente", [
                    'conta_fiada_id' => $contaFiada->id,
                    'saldo_anterior' => $saldoAnterior,
                    'valor_adicionar' => $valor,
                    'novo_saldo' => $novoSaldo
                ]);
                
                $contaFiada->update(['saldo' => $novoSaldo]);
                
                Log::info("✅ Conta fiada atualizada com sucesso", [
                    'conta_fiada_id' => $contaFiada->id,
                    'saldo_final' => $novoSaldo
                ]);
                
            } else {
                // CENÁRIO 2: Cliente NÃO TEM conta fiada - criar nova
                Log::info("🆕 Criando nova conta fiada", [
                    'cliente_id' => $cliente->id,
                    'comercio_id' => $cliente->comercio_id,
                    'saldo_inicial' => $valor
                ]);
                
                $novaContaFiada = ContaFiada::create([
                    'cliente_id' => $cliente->id,
                    'comercio_id' => $cliente->comercio_id,
                    'saldo' => $valor,
                    'descricao' => 'Conta criada automaticamente na primeira venda fiada'
                ]);
                
                Log::info("✅ Nova conta fiada criada com sucesso", [
                    'nova_conta_id' => $novaContaFiada->id,
                    'saldo_inicial' => $novaContaFiada->saldo
                ]);
            }
            
            Log::info("=== CONTA FIADA ATUALIZADA COM SUCESSO ===");
            
        } catch (\Exception $e) {
            Log::error("❌ ERRO ao atualizar conta fiada", [
                'cliente_id' => $clienteId,
                'valor' => $valor,
                'erro' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function buscar(int $id, $request)
    {
        try {
            $user = $request->user();
            
            $venda = Venda::with(['cliente', 'itens.produto', 'usuario'])
                ->where('id', $id)
                ->where('usuario_id', $user->id)
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
            Log::error('Erro ao buscar venda: ' . $e->getMessage());
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
                $this->reverterContaFiada($venda->cliente_id, $venda->total);
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
            Log::error('Erro ao cancelar venda: ' . $e->getMessage());
            return [
                'success' => false,
                'errors' => ['system' => 'Erro ao cancelar venda']
            ];
        }
    }

    private function reverterEstoque(Produto $produto, int $quantidade, Venda $venda, $usuario)
    {
        $estoque = $produto->estoque;
        
        if (!$estoque) {
            return; // Se não tem estoque, não precisa reverter
        }

        $quantidadeAnterior = $estoque->quantidade;
        $quantidadeAtual = $quantidadeAnterior + $quantidade;

        // Atualizar estoque
        $estoque->update(['quantidade' => $quantidadeAtual]);

        // Registrar movimento de estoque
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
            Log::error("Cliente não encontrado para reverter conta fiada", ['cliente_id' => $clienteId]);
            return;
        }

        // ✅ CORRIGIDO: Usar relacionamento correto e adicionar logs
        if ($cliente->contaFiada) {
            $saldoAtual = (float) $cliente->contaFiada->saldo;
            $novoSaldo = max(0, $saldoAtual - $valor);
            $cliente->contaFiada->update(['saldo' => $novoSaldo]);
            
            Log::info("Conta fiada revertida", [
                'cliente_id' => $clienteId,
                'saldo_anterior' => $saldoAtual,
                'valor_revertido' => $valor,
                'novo_saldo' => $novoSaldo
            ]);
        } else {
            Log::warning("Tentativa de reverter conta fiada inexistente", ['cliente_id' => $clienteId]);
        }
    }

    /**
     * 🧪 MÉTODO DE TESTE PARA DEBUG DE CONTA FIADA
     */
    public function testarContaFiada(int $clienteId, float $valor)
    {
        Log::info("🧪 TESTE: Iniciando teste de conta fiada", [
            'cliente_id' => $clienteId,
            'valor' => $valor
        ]);

        $cliente = Cliente::with('contaFiada')->find($clienteId);
        
        if (!$cliente) {
            Log::error("🧪 TESTE: Cliente não encontrado", ['cliente_id' => $clienteId]);
            return false;
        }

        Log::info("🧪 TESTE: Cliente encontrado", [
            'cliente_id' => $cliente->id,
            'nome' => $cliente->nome,
            'comercio_id' => $cliente->comercio_id,
            'tem_conta_fiada' => $cliente->contaFiada ? 'SIM' : 'NÃO',
            'saldo_atual' => $cliente->contaFiada ? $cliente->contaFiada->saldo : 'N/A'
        ]);

        try {
            if ($cliente->contaFiada) {
                $saldoAnterior = $cliente->contaFiada->saldo;
                $cliente->contaFiada->update(['saldo' => $saldoAnterior + $valor]);
                Log::info("🧪 TESTE: Conta fiada atualizada", [
                    'saldo_anterior' => $saldoAnterior,
                    'valor_adicionado' => $valor,
                    'saldo_novo' => $saldoAnterior + $valor
                ]);
            } else {
                $novaConta = ContaFiada::create([
                    'cliente_id' => $cliente->id,
                    'comercio_id' => $cliente->comercio_id,
                    'saldo' => $valor,
                    'descricao' => 'Teste de criação de conta fiada'
                ]);
                Log::info("🧪 TESTE: Nova conta fiada criada", [
                    'conta_id' => $novaConta->id,
                    'saldo_inicial' => $novaConta->saldo
                ]);
            }
            return true;
        } catch (\Exception $e) {
            Log::error("🧪 TESTE: Erro", [
                'erro' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }
}