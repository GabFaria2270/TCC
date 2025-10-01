<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('movimentos_estoque', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produto_id')->constrained('produto')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('usuario')->onDelete('cascade');
            $table->foreignId('venda_id')->nullable()->constrained('vendas')->onDelete('set null');
            $table->enum('tipo', ['entrada', 'saida', 'ajuste']);
            $table->integer('quantidade_anterior');
            $table->integer('quantidade_movimentada');
            $table->integer('quantidade_atual');
            $table->string('motivo')->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();
            
            // Índices para performance
            $table->index(['produto_id', 'tipo']);
            $table->index(['venda_id']);
            $table->index(['created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('movimentos_estoque');
    }
};
