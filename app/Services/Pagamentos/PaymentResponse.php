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

    public static function fromArray(array $data): self
    {
        return new self(
            provider: (string) ($data['provider'] ?? 'mercadopago'),
            reference: (string) ($data['reference'] ?? ''),
            status: (string) ($data['status'] ?? 'pending'),
            method: (string) ($data['method'] ?? ''),
            raw: (array) ($data['raw'] ?? []),
            pixQrCode: $data['pix_qr_code'] ?? null,
            pixQrCodeBase64: $data['pix_qr_code_base64'] ?? null,
        );
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
