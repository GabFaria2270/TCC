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
        Schema::create('remember_tokens', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('token_hash', 128)->index();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('usuario')->onDelete('cascade');
        });

        // Remove remember columns from usuario if exist (migration is reversible)
        if (Schema::hasColumn('usuario', 'remember_token')) {
            Schema::table('usuario', function (Blueprint $table) {
                $table->dropColumn('remember_token');
            });
        }
        if (Schema::hasColumn('usuario', 'remember_token_expires_at')) {
            Schema::table('usuario', function (Blueprint $table) {
                $table->dropColumn('remember_token_expires_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate removed columns if necessary
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

        Schema::dropIfExists('remember_tokens');
    }
};
