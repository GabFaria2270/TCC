<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(private string $token)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $expiry = config('auth.passwords.users.expire', 60);
        $emailPayload = base64_encode(Crypt::encryptString(strtolower((string) $notifiable->EMAIL)));
        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'code' => $emailPayload,
        ], false));

        return (new MailMessage)
            ->subject('Redefina sua senha | ' . config('app.name'))
            ->view('mail.auth.reset-password', [
                'appName' => config('app.name'),
                'userName' => $notifiable->NOME,
                'resetUrl' => $resetUrl,
                'supportEmail' => config('mail.from.address'),
                'expiresInMinutes' => $expiry,
                'logoUrl' => $this->resolveLogoUrl(),
            ]);
    }

    private function resolveLogoUrl(): ?string
    {
        $configured = config('mail.brand_logo_url') ?? config('app.brand_logo_url');
        if (!empty($configured)) {
            return $configured;
        }

        $appUrl = config('app.url');
        if (!empty($appUrl) && !Str::contains($appUrl, ['127.0.0.1', 'localhost'])) {
            return rtrim($appUrl, '/') . '/img/logo-maisconectado.png';
        }

        return $this->inlineLogo();
    }

    private function inlineLogo(): ?string
    {
        $path = public_path('img/logo-maisconectado.png');

        if (!is_file($path)) {
            return null;
        }

        $maxBytes = (int) config('mail.inline_logo_max_kb', 25) * 1024;
        $fileSize = filesize($path);

        if ($fileSize === false || $fileSize > $maxBytes) {
            return null; // avoid embedding large base64 blocks that Gmail corts
        }

        $mime = mime_content_type($path) ?: 'image/png';
        $contents = file_get_contents($path);

        if ($contents === false) {
            return null;
        }

        $encoded = base64_encode($contents);

        if ($encoded === false) {
            return null;
        }

        return 'data:' . $mime . ';base64,' . $encoded;
    }
}
