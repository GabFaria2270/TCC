<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('conta_fiada', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cliente_id');
            $table->unsignedBigInteger('comercio_id');
            $table->decimal('saldo', 10, 2)->default(0);
            $table->text('descricao')->nullable(); // ✅ ADICIONADO AQUI
            $table->enum('status', ['ativa', 'quitada'])->default('ativa');
            $table->timestamps();

            // Foreign keys
            $table->foreign('cliente_id')->references('id')->on('cliente')->onDelete('cascade');
            $table->foreign('comercio_id')->references('id')->on('comercio')->onDelete('cascade');
            
            // ✅ ÍNDICES PARA PERFORMANCE
            $table->index('cliente_id');
            $table->index('comercio_id');
            
            // ✅ CONSTRAINT: Um cliente só pode ter uma conta fiada por comércio
            $table->unique(['cliente_id', 'comercio_id']);
        });

        // Inicializa status conforme saldo (não tem linhas ainda, mas mantém por segurança)
        DB::statement("UPDATE conta_fiada SET status = CASE WHEN saldo > 0 THEN 'ativa' ELSE 'quitada' END");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conta_fiada');
    }
};
