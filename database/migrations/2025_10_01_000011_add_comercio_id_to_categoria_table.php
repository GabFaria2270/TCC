<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1) Adiciona coluna comercio_id (inicialmente nullable para facilitar backfill)
        Schema::table('categoria', function (Blueprint $table) {
            if (!Schema::hasColumn('categoria', 'comercio_id')) {
                $table->unsignedBigInteger('comercio_id')->nullable()->after('nome');
                $table->index('comercio_id', 'categoria_comercio_idx');
            }
        });

        // 2) Backfill: para cada categoria, distribui por comércio conforme produtos vinculados
        //    - Se a mesma categoria for usada por mais de um comércio, duplicamos a categoria
        //      (uma por comércio) e reatribuímos os produtos.
        DB::transaction(function () {
            $categorias = DB::table('categoria')->select('id', 'nome', 'comercio_id')->get();

            foreach ($categorias as $cat) {
                // Quais comércios usam esta categoria via produtos?
                $comercios = DB::table('produto')
                    ->where('categoria_id', $cat->id)
                    ->distinct()
                    ->pluck('comercio_id')
                    ->toArray();

                if (empty($comercios)) {
                    // Categoria sem produtos vinculados, deixa comercio_id como null
                    continue;
                }

                // Usa o primeiro comércio para a categoria original
                $firstComercio = array_shift($comercios);
                DB::table('categoria')->where('id', $cat->id)->update([
                    'comercio_id' => $firstComercio,
                    'updated_at' => now(),
                ]);

                // Para os demais comércios, clona a categoria e reatribui os produtos
                foreach ($comercios as $cid) {
                    $newId = DB::table('categoria')->insertGetId([
                        'nome' => $cat->nome,
                        'comercio_id' => $cid,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    DB::table('produto')
                        ->where('categoria_id', $cat->id)
                        ->where('comercio_id', $cid)
                        ->update(['categoria_id' => $newId]);
                }
            }
        });

        // 3) Adiciona FK e índice único (comercio_id, nome) para garantir unicidade por comércio
        Schema::table('categoria', function (Blueprint $table) {
            // FK para comercio
            $table->foreign('comercio_id')
                ->references('id')->on('comercio')
                ->cascadeOnDelete();

            // Unicidade de nome por comércio (permite múltiplos NULLs em comercio_id)
            $table->unique(['comercio_id', 'nome'], 'categoria_comercio_nome_unique');
        });
    }

    public function down(): void
    {
        // Remoção de constraints e coluna (não desfaz a duplicação feita no up)
        Schema::table('categoria', function (Blueprint $table) {
            try {
                $table->dropUnique('categoria_comercio_nome_unique');
            } catch (\Throwable $e) {
                // ignora se não existir
            }
            try {
                $table->dropForeign(['comercio_id']);
            } catch (\Throwable $e) {
                // ignora se não existir
            }
            if (Schema::hasColumn('categoria', 'comercio_id')) {
                $table->dropColumn('comercio_id');
            }
        });
    }
};
