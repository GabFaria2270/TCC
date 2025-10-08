<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vendas', function (Blueprint $table) {
            $table->id();
            // Comércio da venda (facilita filtros/relatórios por comércio)
            $table->foreignId('comercio_id')->constrained('comercio')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('usuario')->onDelete('cascade');
            $table->foreignId('cliente_id')->nullable()->constrained('cliente')->onDelete('set null');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('desconto', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->enum('forma_pagamento', ['dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'conta_fiada']);
            $table->decimal('valor_recebido', 10, 2)->nullable();
            $table->decimal('troco', 10, 2)->nullable();
            $table->enum('status', ['pendente', 'concluida', 'cancelada', 'conta_fiada'])->default('pendente');
            $table->text('observacoes')->nullable();
            $table->timestamps();

            // Índices para performance
            $table->index(['comercio_id', 'created_at']);
            $table->index(['comercio_id', 'status', 'created_at']);
            $table->index(['usuario_id', 'status']);
            $table->index(['cliente_id']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendas');
    }
};
