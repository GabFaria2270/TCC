<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('movimento_estoque', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('produto_id');
            $table->unsignedBigInteger('comercio_id');
            $table->enum('tipo', ['entrada', 'saida', 'ajuste']);
            $table->integer('quantidade');
            $table->integer('saldo_apos');
            $table->string('motivo', 255)->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->timestamps();

            $table->index(['produto_id', 'comercio_id']);
            $table->index(['created_at']);

            $table->foreign('produto_id')->references('id')->on('produto')->cascadeOnDelete();
            $table->foreign('comercio_id')->references('id')->on('comercio')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimento_estoque');
    }
};
