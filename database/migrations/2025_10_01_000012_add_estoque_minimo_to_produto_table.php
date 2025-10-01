<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produto', function (Blueprint $table) {
            if (!Schema::hasColumn('produto', 'estoque_minimo')) {
                $table->integer('estoque_minimo')->default(0)->after('quantidade_estoque');
            }
        });
    }

    public function down(): void
    {
        Schema::table('produto', function (Blueprint $table) {
            if (Schema::hasColumn('produto', 'estoque_minimo')) {
                $table->dropColumn('estoque_minimo');
            }
        });
    }
};
