<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Redefinição de senha | {{ $appName }}</title>
</head>

<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Inter',Arial,sans-serif;color:#f8fafc;">
    <center style="width:100%;background-color:#0f172a;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
            style="max-width:640px;margin:0 auto;padding:28px 12px;">
            <tr>
                <td style="padding:0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                        style="background-color:#0b1120;border-radius:18px;border:1px solid #383b84;box-shadow:0 18px 60px rgba(15,23,42,0.55);">
                        <tr>
                            <td style="padding:40px 36px 36px 36px;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                                    border="0">
                                    <tr>
                                        <td align="center" style="padding-bottom:24px;">
                                            <table role="presentation" width="80" height="80" cellspacing="0"
                                                cellpadding="0" border="0"
                                                style="border-radius:50%;overflow:hidden;background-color:#191f3d;box-shadow:0 10px 40px rgba(79,70,229,0.35);">
                                                <tr>
                                                    <td align="center" valign="middle">
                                                        @if (!empty($logoUrl))
                                                            <img src="{{ $logoUrl }}" alt="{{ $appName }}"
                                                                width="80" height="80"
                                                                style="display:block;border:0;outline:none;text-decoration:none;width:100%;height:100%;object-fit:cover;">
                                                        @else
                                                            <span
                                                                style="display:block;width:80px;height:80px;line-height:80px;font-size:28px;font-weight:700;color:#e0e7ff;text-transform:uppercase;">{{ mb_substr($appName, 0, 1) }}</span>
                                                        @endif
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align:center;padding-bottom:12px;">
                                            <h1 style="margin:0;font-size:26px;line-height:1.3;color:#f8fafc;">Olá,
                                                {{ $userName }}!</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align:left;padding-bottom:20px;">
                                            <p style="margin:0;font-size:16px;line-height:1.6;color:#f8fafc;">
                                                Recebemos um pedido para redefinir a senha da sua conta <strong
                                                    style="color:#f8fafc;">{{ $appName }}</strong>.
                                                Para continuar com segurança, clique no botão abaixo. Esse link expira
                                                em {{ $expiresInMinutes }} minutos.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding:10px 0 26px 0;">
                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                                <tr>
                                                    <td align="center"
                                                        style="background-color:#6d5efc;border-radius:999px;padding:16px 34px;">
                                                        <a href="{{ $resetUrl }}"
                                                            style="color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">Redefinir
                                                            senha</a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 0 18px 0;">
                                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                                                border="0"
                                                style="background-color:#101632;border:1px solid #3b3f86;border-radius:14px;">
                                                <tr>
                                                    <td
                                                        style="padding:16px 20px;font-size:14px;line-height:1.5;color:#cbd5f5;">
                                                        Se o botão não funcionar, copie e cole o link no navegador:<br>
                                                        <a href="{{ $resetUrl }}" target="_blank"
                                                            style="color:#a5b4ff;text-decoration:none;word-break:break-all;">{{ $resetUrl }}</a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-top:10px;">
                                            <p style="margin:0;font-size:14px;line-height:1.6;color:#cbd5f5;">
                                                Não foi você? Nenhuma ação é necessária, mas recomendamos alterar sua
                                                senha caso note atividade suspeita.
                                                Em caso de dúvidas, responda este e-mail ou fale com nosso suporte:
                                                <a href="mailto:{{ $supportEmail }}"
                                                    style="color:#a5b4ff;text-decoration:none;">{{ $supportEmail }}</a>.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align:center;padding-top:32px;">
                                            <p style="margin:0;font-size:13px;line-height:1.4;color:#94a3b8;">&copy;
                                                {{ date('Y') }} {{ $appName }}. Todos os direitos reservados.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>

</html>
