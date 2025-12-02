<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\PaymentRequest;
use App\Models\Venda;
use App\Services\Auth\VendaService;
use App\Services\Pagamentos\PaymentProcessor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class PaymentController extends Controller
{
    public function __construct(
        private VendaService $vendaService,
        private PaymentProcessor $paymentProcessor,
    ) {
    }

    public function store(PaymentRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $formaPagamento = $payload['forma_pagamento'];
        $usaGateway = in_array($formaPagamento, ['pix', 'cartao_credito', 'cartao_debito'], true);

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
        $paymentData = null;

        if ($usaGateway) {
            try {
                $paymentData = $this->paymentProcessor->processar($venda, $payload);
            } catch (Throwable $throwable) {
                Log::error('Erro ao processar pagamento', ['exception' => $throwable]);
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

        if (!$venda->payment_reference) {
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
}
