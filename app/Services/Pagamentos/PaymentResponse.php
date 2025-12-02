<?php

namespace App\Services\Pagamentos;

class PaymentResponse
{
    public function __construct(
        public readonly string $provider,
        public readonly string $reference,
        public readonly string $status,
        public readonly string $method,
        public readonly array $raw,
        public readonly ?string $pixQrCode = null,
        public readonly ?string $pixQrCodeBase64 = null,
    ) {
    }

    public function toArray(): array
    {
        return [
            'provider' => $this->provider,
            'reference' => $this->reference,
            'status' => $this->status,
            'method' => $this->method,
            'raw' => $this->raw,
            'pix_qr_code' => $this->pixQrCode,
            'pix_qr_code_base64' => $this->pixQrCodeBase64,
        ];
    }
}
