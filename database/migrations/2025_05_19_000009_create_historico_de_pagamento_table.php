<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('historico_de_pagamento', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('conta_fiada_id');
            $table->decimal('valor_pago', 10, 2);
            $table->timestamp('data_pagamento')->useCurrent();
            $table->timestamps();
            $table->unsignedBigInteger('comercio_id');
            $table->foreign('comercio_id')->references('id')->on('comercio')->onDelete('cascade');
            $table->foreign('conta_fiada_id')->references('id')->on('conta_fiada')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historico_de_pagamento');
    }
};
