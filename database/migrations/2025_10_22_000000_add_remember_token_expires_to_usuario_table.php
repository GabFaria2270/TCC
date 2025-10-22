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
        if (Schema::hasTable('usuario')) {
            Schema::table('usuario', function (Blueprint $table) {
                if (!Schema::hasColumn('usuario', 'remember_token')) {
                    $table->string('remember_token', 100)->nullable()->after('email_verified_at');
                }
                if (!Schema::hasColumn('usuario', 'remember_token_expires_at')) {
                    $table->timestamp('remember_token_expires_at')->nullable()->after('remember_token');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('usuario')) {
            Schema::table('usuario', function (Blueprint $table) {
                if (Schema::hasColumn('usuario', 'remember_token_expires_at')) {
                    $table->dropColumn('remember_token_expires_at');
                }
            });
        }
    }
};
