<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pagamentos_externos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venda_id')->constrained('vendas')->cascadeOnDelete();
            $table->string('provider')->default('mercadopago');
            $table->string('external_reference')->nullable()->index();
            $table->string('status')->nullable();
            $table->string('method')->nullable();
            $table->decimal('amount', 15, 2)->nullable();
            $table->string('currency', 3)->default('BRL');
            $table->json('payload')->nullable();
            $table->json('metadata')->nullable();
            $table->text('pix_qr_code')->nullable();
            $table->longText('pix_qr_code_base64')->nullable();
            $table->timestamps();
        });

        DB::table('vendas')
            ->whereNotNull('payment_reference')
            ->orderBy('id')
            ->chunkById(100, function ($rows) {
                $payloads = [];
                $timestamp = now();

                foreach ($rows as $row) {
                    $payloads[] = [
                        'venda_id' => $row->id,
                        'provider' => 'mercadopago',
                        'external_reference' => $row->payment_reference,
                        'status' => $row->payment_status,
                        'method' => $row->payment_method_detail,
                        'amount' => $row->total,
                        'payload' => $row->payment_payload,
                        'pix_qr_code' => $row->pix_qr_code,
                        'pix_qr_code_base64' => $row->pix_qr_code_base64,
                        'created_at' => $row->created_at ?? $timestamp,
                        'updated_at' => $timestamp,
                    ];
                }

                if (!empty($payloads)) {
                    DB::table('pagamentos_externos')->insert($payloads);
                }
            });

        $columnsToDrop = [
            'payment_reference',
            'payment_method_detail',
            'payment_payload',
            'pix_qr_code',
            'pix_qr_code_base64',
        ];

        foreach ($columnsToDrop as $column) {
            if (Schema::hasColumn('vendas', $column)) {
                Schema::table('vendas', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            }
        }
    }

    public function down(): void
    {
        Schema::table('vendas', function (Blueprint $table) {
            $table->string('payment_reference')->nullable()->after('status');
        });

        Schema::table('vendas', function (Blueprint $table) {
            $table->string('payment_method_detail')->nullable()->after('payment_status');
        });

        Schema::table('vendas', function (Blueprint $table) {
            $table->json('payment_payload')->nullable()->after('payment_method_detail');
        });

        Schema::table('vendas', function (Blueprint $table) {
            $table->text('pix_qr_code')->nullable()->after('payment_payload');
        });

        Schema::table('vendas', function (Blueprint $table) {
            $table->longText('pix_qr_code_base64')->nullable()->after('pix_qr_code');
        });

        DB::table('pagamentos_externos')
            ->orderBy('id')
            ->chunkById(100, function ($rows) {
                foreach ($rows as $row) {
                    DB::table('vendas')
                        ->where('id', $row->venda_id)
                        ->update([
                            'payment_reference' => $row->external_reference,
                            'payment_status' => $row->status,
                            'payment_method_detail' => $row->method,
                            'payment_payload' => $row->payload,
                            'pix_qr_code' => $row->pix_qr_code,
                            'pix_qr_code_base64' => $row->pix_qr_code_base64,
                        ]);
                }
            });

        Schema::dropIfExists('pagamentos_externos');
    }
};
