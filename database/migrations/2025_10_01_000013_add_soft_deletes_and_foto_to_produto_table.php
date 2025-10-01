<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produto', function (Blueprint $table) {
            if (!Schema::hasColumn('produto', 'foto_path')) {
                $table->string('foto_path', 255)->nullable()->after('preco');
            }
            if (!Schema::hasColumn('produto', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        Schema::table('produto', function (Blueprint $table) {
            if (Schema::hasColumn('produto', 'foto_path')) {
                $table->dropColumn('foto_path');
            }
            if (Schema::hasColumn('produto', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
