<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar senha | MaisConectado</title>
    <meta name="description" content="Redefina o acesso ao MaisConectado com segurança.">
    <link rel="canonical" href="{{ url()->current() }}">
    @vite(['resources/css/app.css', 'resources/css/login/login.css', 'resources/js/app.js', 'resources/js/login/login.js', 'resources/js/auth/forgot-password.js'])
    <style>
        .form-login-messages .alert {
            border-radius: 14px;
            padding: 0.9rem 1.1rem;
            border: 1px solid transparent;
            color: #f8fafc;
            font-size: 0.95rem;
            background: rgba(15, 23, 42, 0.65);
            backdrop-filter: blur(14px);
        }

        .form-login-messages .alert strong {
            display: block;
            margin-bottom: 4px;
            font-size: 1rem;
        }

        .form-login-messages .alert-success {
            border-color: rgba(34, 197, 94, 0.45);
            background: linear-gradient(120deg, rgba(45, 212, 191, 0.2), rgba(34, 197, 94, 0.2));
            box-shadow: 0 12px 32px rgba(16, 185, 129, 0.25);
        }

        .form-login-messages .alert-danger {
            border-color: rgba(248, 113, 113, 0.55);
            background: linear-gradient(120deg, rgba(248, 113, 113, 0.15), rgba(239, 68, 68, 0.18));
            box-shadow: 0 12px 32px rgba(239, 68, 68, 0.28);
        }

        .form-login-support {
            color: #f8fafc;
            opacity: 0.88;
            margin-bottom: 1.2rem;
            font-size: 0.95rem;
        }
    </style>
</head>

<body class="loginf">
    <div class="containerS">
        <div class="Cbutton">
            <a href="{{ route('home') }}" class="botãoS"><i class="bi bi-box-arrow-left"></i> Voltar</a>
        </div>
    </div>

    <div class="row justify-content-center">
        <div class="form-login-page">
            <div class="form-login-container">
                <div class="form-login">
                    <div class="form-login-card">
                        <div class="form-login-header">Recuperar acesso</div>
                        <div class="form-login-body">
                            <div class="form-login-messages">
                                @if ($status)
                                    <div class="alert alert-success">
                                        <strong>Link enviado!</strong>
                                        {{ $status }}
                                        <span style="display:block;margin-top:6px;font-size:0.9rem;opacity:0.9;">
                                            Você pode fechar esta aba depois de usar o link ou voltar ao login quando
                                            quiser.
                                        </span>
                                    </div>
                                @endif
                                @error('email')
                                    <div class="alert alert-danger">
                                        <strong>Ops! Algo deu errado.</strong>
                                        {{ $message }}
                                    </div>
                                @enderror
                            </div>

                            <form method="POST" action="{{ route('password.email') }}" class="form-reset"
                                id="forgotPasswordForm">
                                @csrf
                                <div class="form-login-group">
                                    <label for="email" class="form-login-label">E-mail cadastrado</label>
                                    <input type="email" class="form-login-input" id="email" name="email"
                                        required autocomplete="email" autofocus value="{{ old('email') }}">
                                    @error('email')
                                        <div class="form-login-error">{{ $message }}</div>
                                    @enderror
                                </div>

                                <p class="form-login-support">
                                    Informe o mesmo e-mail utilizado no cadastro. Em poucos instantes você receberá um
                                    link seguro com as instruções para definir uma nova senha.
                                </p>

                                <button type="submit" class="form-login-button">
                                    Enviar link de redefinição
                                </button>
                            </form>

                            <div class="login-link">
                                <span>Lembrou a senha?</span>
                                <a href="{{ route('login') }}" class="form-login-link"><i
                                        class="bi bi-box-arrow-in-right"></i> Voltar para login</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-login-icon">
                <object class="objectL" type="image/svg+xml" data="{{ asset('img/login.svg') }}"></object>
            </div>
        </div>
    </div>

    <div id="loader-cadastro" class="loder-cadastro" aria-hidden="true">
        <span id="loader-icon" class="loader-icon girar-animado" data-img1="{{ asset('img/iconeloader.png') }}">
            <img id="imgloader" src="{{ asset('img/iconeloader.png') }}" alt="Carregando" class="imgloader">
        </span>
    </div>
</body>

</html>
