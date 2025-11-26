<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <title>Redefinição de senha | {{ $appName }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #0f172a;
            font-family: 'Inter', Arial, sans-serif;
            color: #f8fafc;
        }

        .wrapper {
            width: 100%;
            padding: 32px 12px;
            background: radial-gradient(circle at top, #1e1b4b, #0f172a 60%);
        }

        .card {
            max-width: 620px;
            margin: 0 auto;
            background: #0b1120;
            border-radius: 18px;
            padding: 40px;
            box-shadow: 0 25px 80px rgba(15, 23, 42, 0.65);
            border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin-bottom: 24px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(79, 70, 229, 0.4);
            background: rgba(99, 102, 241, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .logo-fallback {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 700;
            color: #e0e7ff;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        h1 {
            margin: 0 0 12px;
            font-size: 28px;
            color: #f8fafc;
        }

        p {
            line-height: 1.6;
            margin: 0 0 18px;
            color: #f8fafc;
        }

        .button {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(120deg, #6366f1, #a855f7, #ec4899);
            color: #fff !important;
            border-radius: 999px;
            text-decoration: none;
            font-weight: 600;
            letter-spacing: 0.3px;
            box-shadow: 0 10px 25px rgba(99, 102, 241, 0.35);
            margin: 24px 0;
        }

        .info-box {
            background: rgba(248, 250, 252, 0.05);
            border: 1px solid rgba(99, 102, 241, 0.25);
            border-radius: 14px;
            padding: 18px 22px;
            font-size: 14px;
            color: #cbd5f5;
        }

        .footer {
            text-align: center;
            margin-top: 32px;
            font-size: 13px;
            color: #94a3b8;
        }

        a {
            color: #e0e7ff;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <div class="card">
            <div class="logo">
                @if (!empty($logoUrl))
                    <img src="{{ $logoUrl }}" alt="{{ $appName }}" width="80" height="80">
                @else
                    <div class="logo-fallback">{{ mb_substr($appName, 0, 1) }}</div>
                @endif
            </div>
            <h1>Olá, {{ $userName }}!</h1>
            <p>
                Recebemos um pedido para redefinir a senha da sua conta <strong>{{ $appName }}</strong>.
                Para continuar com segurança, clique no botão abaixo. Esse link expira em {{ $expiresInMinutes }}
                minutos.
            </p>

            <p style="text-align: center;">
                <a href="{{ $resetUrl }}" class="button">Redefinir senha</a>
            </p>

            <div class="info-box">
                Se o botão não funcionar, copie e cole o link no navegador:<br>
                <a href="{{ $resetUrl }}" target="_blank">{{ $resetUrl }}</a>
            </div>

            <p style="margin-top: 28px; font-size: 14px;">
                Não foi você? Nenhuma ação é necessária, mas recomendamos alterar sua senha caso note atividade
                suspeita. Em caso de dúvidas, responda este e-mail ou fale com nosso suporte:
                <a href="mailto:{{ $supportEmail }}">{{ $supportEmail }}</a>.
            </p>

            <div class="footer">
                &copy; {{ date('Y') }} {{ $appName }}. Todos os direitos reservados.
            </div>
        </div>
    </div>
</body>

</html>
