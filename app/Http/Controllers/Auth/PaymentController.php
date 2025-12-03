<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\PaymentRequest;
use App\Models\Venda;
use App\Services\Auth\VendaService;
use App\Services\Pagamentos\MercadoPagoCheckoutService;
use App\Services\Pagamentos\PaymentProcessor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class PaymentController extends Controller
{
    public function __construct(
        private VendaService $vendaService,
        private PaymentProcessor $paymentProcessor,
        private MercadoPagoCheckoutService $checkoutService,
    ) {
    }

    public function store(PaymentRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $formaPagamento = $payload['forma_pagamento'];
        $usaGateway = in_array($formaPagamento, ['pix', 'cartao_credito', 'cartao_debito'], true);
        $paymentData = null;

        if ($usaGateway) {
            try {
                $vendaTemporaria = $this->criarSnapshotVenda($payload, $request);
                $gatewayPayload = $payload;
                $gatewayPayload['external_reference'] = (string) Str::uuid();
                $gatewayPayload['metadata'] = array_merge($gatewayPayload['metadata'] ?? [], [
                    'comercio_id' => $vendaTemporaria->comercio_id,
                    'usuario_id' => $vendaTemporaria->usuario_id,
                ]);

                $paymentData = $this->checkoutService->criarPagamento($vendaTemporaria, $gatewayPayload);
            } catch (Throwable $throwable) {
                Log::error('Erro ao processar pagamento no gateway antes de registrar venda', [
                    'exception' => $throwable,
                ]);

                return response()->json([
                    'message' => __('validation.pdv_js_erro_finalizar'),
                ], 502);
            }
        }

        try {
            $resultadoVenda = $this->vendaService->criar($payload, $request, $usaGateway ? 'pendente' : null);
        } catch (Throwable $throwable) {
            Log::error('Erro inesperado ao criar venda via API', ['exception' => $throwable]);

            return response()->json([
                'message' => __('validation.pdv_js_erro_finalizar'),
            ], 500);
        }

        if (!($resultadoVenda['success'] ?? false)) {
            return response()->json([
                'message' => __('validation.pdv_js_erro_finalizar'),
                'errors' => $resultadoVenda['errors'] ?? [],
            ], 422);
        }

        $venda = $resultadoVenda['data']['venda'];
        if ($usaGateway && $paymentData) {
            try {
                $paymentData = $this->paymentProcessor->registrarPagamentoLocal($venda, $paymentData->toArray());
            } catch (Throwable $throwable) {
                Log::error('Erro ao sincronizar dados do pagamento com a venda', ['exception' => $throwable]);
                $this->vendaService->cancelar($venda->id, $request);

                return response()->json([
                    'message' => __('validation.pdv_js_erro_finalizar'),
                ], 502);
            }
        }

        return response()->json([
            'message' => __('validation.pdv_venda_processada'),
            'venda' => $venda->fresh(['itens.produto', 'cliente']),
            'payment' => $paymentData?->toArray(),
        ], 201);
    }

    public function status(Request $request, Venda $venda): JsonResponse
    {
        $user = $request->user();
        $comercio = $user?->comercio;

        if (!$comercio || $venda->comercio_id !== $comercio->id) {
            abort(403);
        }

        $pagamento = $venda->pagamentoExterno;

        if (!$pagamento || !$pagamento->external_reference) {
            return response()->json([
                'message' => __('validation.pdv_pagamento_nao_encontrado'),
            ], 404);
        }

        try {
            $paymentResponse = $this->paymentProcessor->atualizarStatus($venda);
        } catch (Throwable $throwable) {
            Log::error('Erro ao atualizar status do pagamento', [
                'exception' => $throwable,
                'venda_id' => $venda->id,
            ]);

            return response()->json([
                'message' => __('validation.pdv_js_erro_finalizar'),
            ], 502);
        }

        return response()->json([
            'venda' => $venda->fresh(['itens.produto', 'cliente']),
            'payment' => $paymentResponse?->toArray(),
        ]);
    }

    private function criarSnapshotVenda(array $payload, Request $request): Venda
    {
        $subtotal = collect($payload['itens'] ?? [])->reduce(function ($carry, $item) {
            $quantidade = (int) ($item['quantidade'] ?? 0);
            $preco = (float) ($item['preco_unitario'] ?? 0);

            return $carry + ($quantidade * $preco);
        }, 0);

        $desconto = (float) ($payload['desconto'] ?? 0);
        $total = max(0, $subtotal - $desconto);

        return new Venda([
            'comercio_id' => $request->user()?->comercio?->id,
            'usuario_id' => $request->user()?->id,
            'cliente_id' => $payload['cliente_id'] ?? null,
            'subtotal' => $subtotal,
            'desconto' => $desconto,
            'total' => $total,
            'forma_pagamento' => $payload['forma_pagamento'],
        ]);
    }
}
