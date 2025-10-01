<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produto', function (Blueprint $table) {
            // índice único considerando soft delete (deleted_at)
            $table->unique(['comercio_id', 'nome', 'deleted_at'], 'produto_comercio_nome_deleted_unique');
        });
    }

    public function down(): void
    {
        Schema::table('produto', function (Blueprint $table) {
            $table->dropUnique('produto_comercio_nome_deleted_unique');
        });
    }
};
