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
        Schema::create('produto', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 150);
            $table->decimal('preco', 10, 2);
            $table->integer('quantidade_estoque')->default(0);
            $table->unsignedBigInteger('categoria_id');
            $table->timestamps();
            $table->unsignedBigInteger('mercearia_id');
            
            $table->foreign('mercearia_id')->references('id')->on('mercearia')->onDelete('cascade');

            $table->foreign('categoria_id')->references('id')->on('categoria')->onDelete('cascade');
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
