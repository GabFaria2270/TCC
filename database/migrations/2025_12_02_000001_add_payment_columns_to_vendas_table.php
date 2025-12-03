<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('vendas', function (Blueprint $table) {
            $table->string('payment_provider')->nullable()->after('status');
            $table->string('payment_reference')->nullable()->after('payment_provider');
            $table->string('payment_status')->nullable()->after('payment_reference');
            $table->string('payment_method_detail')->nullable()->after('payment_status');
            $table->json('payment_payload')->nullable()->after('payment_method_detail');
            $table->text('pix_qr_code')->nullable()->after('payment_payload');
            $table->longText('pix_qr_code_base64')->nullable()->after('pix_qr_code');
        });
    }

    public function down(): void
    {
        Schema::table('vendas', function (Blueprint $table) {
            $table->dropColumn([
            
                'payment_reference',
                'payment_status',
                'payment_method_detail',
                'payment_payload',
                'pix_qr_code',
                'pix_qr_code_base64',
            ]);
        });
    }
};
