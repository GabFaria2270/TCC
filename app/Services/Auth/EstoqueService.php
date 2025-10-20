<?php

namespace App\Services\Auth;

use App\Models\Estoque;
use App\Models\MovimentoEstoque;
use App\Models\Produto;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EstoqueService
{
    private function assertMesmoComercio(Produto $produto): array
    {
        $usuario = Auth::user();
        $comercio = $usuario?->comercio;
        if (!$comercio || $produto->comercio_id !== $comercio->id) {
            return [
                'ok' => false,
                'error' => 'Produto não pertence ao seu comércio.',
                'reason' => 'forbidden'
            ];
        }
        return ['ok' => true, 'comercio' => $comercio, 'usuario' => $usuario];
    }

    private function setSaldo(Produto $produto, int $novoSaldo, ?string $motivo, string $tipo, int $movQuantidade, int $quantidadeAnterior): array
    {
        $check = $this->assertMesmoComercio($produto);
        if (!$check['ok']) return ['success' => false, 'errors' => ['system' => $check['error']], 'reason' => $check['reason']];

        if ($novoSaldo < 0) {
            return ['success' => false, 'errors' => ['quantidade' => 'Saldo não pode ficar negativo.'], 'reason' => 'saldo_negativo'];
        }

        DB::beginTransaction();
        try {
            $comercio = $check['comercio'];
            $usuario = $check['usuario'];

            // Atualiza registro de estoque
            $estoque = Estoque::updateOrCreate(
                [
                    'produto_id' => $produto->id,
                    'comercio_id' => $comercio->id,
                ],
                [
                    'quantidade' => $novoSaldo,
                ]
            );


            // Registra movimento conforme estrutura da tabela movimentos_estoque
            MovimentoEstoque::create([
                'produto_id' => $produto->id,
                'usuario_id' => $usuario?->id,
                // 'venda_id' pode ser nula em movimentos manuais
                'venda_id' => null,
                'tipo' => $tipo,
                'quantidade_anterior' => $quantidadeAnterior,
                'quantidade_movimentada' => $movQuantidade,
                'quantidade_atual' => $novoSaldo,
                'motivo' => $motivo,
                'observacoes' => null,
            ]);

            DB::commit();
            return ['success' => true, 'estoque' => $estoque];
        } catch (\Throwable $e) {
            DB::rollBack();
            return ['success' => false, 'errors' => ['system' => 'Erro ao ajustar estoque.']];
        }
    }

    public function entrada(Produto $produto, int $quantidade, ?string $motivo = null): array
    {
        $check = $this->assertMesmoComercio($produto);
        if (!$check['ok']) return ['success' => false, 'errors' => ['system' => $check['error']], 'reason' => $check['reason']];

        $comercio = $check['comercio'];
        $estoqueAtual = Estoque::where('produto_id', $produto->id)->where('comercio_id', $comercio->id)->value('quantidade') ?? 0;
        $q = max(0, $quantidade);
        $novoSaldo = $estoqueAtual + $q;
        return $this->setSaldo($produto, $novoSaldo, $motivo, 'entrada', $q, $estoqueAtual);
    }

    public function saida(Produto $produto, int $quantidade, ?string $motivo = null): array
    {
        $check = $this->assertMesmoComercio($produto);
        if (!$check['ok']) return ['success' => false, 'errors' => ['system' => $check['error']], 'reason' => $check['reason']];

        $comercio = $check['comercio'];
        $estoqueAtual = Estoque::where('produto_id', $produto->id)->where('comercio_id', $comercio->id)->value('quantidade') ?? 0;
        $q = max(0, $quantidade);
        $novoSaldo = $estoqueAtual - $q;
        if ($novoSaldo < 0) {
            return ['success' => false, 'errors' => ['quantidade' => 'Saldo insuficiente.'], 'reason' => 'saldo_negativo'];
        }
        return $this->setSaldo($produto, $novoSaldo, $motivo, 'saida', -$q, $estoqueAtual);
    }

    public function ajuste(Produto $produto, int $novoSaldo, ?string $motivo = null): array
    {
        $check = $this->assertMesmoComercio($produto);
        if (!$check['ok']) return ['success' => false, 'errors' => ['system' => $check['error']], 'reason' => $check['reason']];
        $comercio = $check['comercio'];
        $estoqueAtual = Estoque::where('produto_id', $produto->id)->where('comercio_id', $comercio->id)->value('quantidade') ?? 0;
        $delta = $novoSaldo - $estoqueAtual;
        return $this->setSaldo($produto, $novoSaldo, $motivo, 'ajuste', $delta, $estoqueAtual);
    }
}
