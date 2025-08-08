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
        Schema::create('usuario', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('NOME', 100);
            $table->string('EMAIL', 150)->unique();
            $table->string('SENHA_HASH', 255);
            $table->string('PERFIL', 50);
        
        });
        
        Schema::table('usuario', function (Blueprint $table) {
            // ADICIONA TIMESTAMPS SE NÃO EXISTIR
            if (!Schema::hasColumn('usuario', 'created_at')) {
                $table->timestamps();
            }
            
            // ADICIONA SOFT DELETES PARA EXCLUSÃO SEGURA
            if (!Schema::hasColumn('usuario', 'deleted_at')) {
                $table->softDeletes();
            }
            
            // ADICIONA VERIFICAÇÃO DE EMAIL
            if (!Schema::hasColumn('usuario', 'email_verified_at')) {
                $table->timestamp('email_verified_at')->nullable();
            }
            
            // ADICIONA REMEMBER TOKEN
            if (!Schema::hasColumn('usuario', 'remember_token')) {
                $table->rememberToken();
            }
            
            // ADICIONA ÍNDICES PARA PERFORMANCE E SEGURANÇA
            $table->index('EMAIL');
            $table->index('PERFIL');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->dropTimestamps();
            $table->dropSoftDeletes();
            $table->dropColumn('email_verified_at');
            $table->dropRememberToken();
            $table->dropIndex(['EMAIL']);
            $table->dropIndex(['PERFIL']);
            $table->dropIndex(['created_at']);
        });
        
        Schema::dropIfExists('usuario');
    }
};