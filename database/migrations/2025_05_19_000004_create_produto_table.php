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
        Schema::create('produto', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 150);
            $table->decimal('preco', 10, 2);
            // campos consolidados
            $table->string('foto_path', 255)->nullable();
            $table->integer('estoque_minimo')->default(0);
            $table->unsignedBigInteger('categoria_id');
            $table->timestamps();
            $table->unsignedBigInteger('comercio_id');

            // soft deletes para suportar unicidade considerando itens removidos logicamente
            $table->softDeletes();

            $table->foreign('comercio_id')->references('id')->on('comercio')->onDelete('cascade');

            $table->foreign('categoria_id')->references('id')->on('categoria')->onDelete('cascade');

            // índice único por comércio + nome, considerando deleted_at
            $table->unique(['comercio_id', 'nome', 'deleted_at'], 'produto_comercio_nome_deleted_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produto');
    }
};
