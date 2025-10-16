<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('maquininhas', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('modelo');
            $table->enum('status', ['ativa', 'inativa'])->default('ativa');
            $table->unsignedBigInteger('comercio_id');
            $table->timestamps();

            $table->foreign('comercio_id')->references('id')->on('comercio')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maquininhas');
    }
};
