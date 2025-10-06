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
        Schema::create('categoria', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->timestamps();
            // Consolidado: cada categoria pertence a um comércio
            $table->unsignedBigInteger('comercio_id')->nullable()->after('nome');
            $table->index('comercio_id', 'categoria_comercio_idx');
            $table->foreign('comercio_id')->references('id')->on('comercio')->cascadeOnDelete();
            $table->unique(['comercio_id', 'nome'], 'categoria_comercio_nome_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categoria');
    }
};
