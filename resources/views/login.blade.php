<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | Mais Conectado</title>
    <meta name="description"
        content="Acesse o sistema MaisConectado para gerenciamento de vendas, controle de estoque, PDV online e gestão de clientes.">
    <meta name="keywords" content="login gerenciamento de vendas, login controle de estoque, login comércio local">
    <link rel="canonical" href="{{ url()->current() }}">
    <link rel="icon" type="image/png" href="{{ asset('img/logo-maisconectado.png') }}">
    <link rel="shortcut icon" href="{{ asset('img/logo-maisconectado.png') }}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="MaisConectado">
    <meta property="og:title" content="Login — MaisConectado">
    <meta property="og:description"
        content="Acesse sua conta MaisConectado — gerencie vendas e clientes com segurança.">
    <meta property="og:image" content="{{ asset('img/logo-maisconectado.png') }}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Login — MaisConectado">
    <meta name="twitter:description"
        content="Acesse sua conta MaisConectado — gerencie vendas e clientes com segurança.">
    <meta name="twitter:image" content="{{ asset('img/logo-maisconectado.png') }}">
    @vite(['resources/css/app.css', 'resources/css/login/login.css', 'resources/js/app.js', 'resources/js/login/login.js'])
</head>

<body class="loginf">
    <!--botão de sair-->
    <div class="containerS">
        <div class="Cbutton">
            <a href="{{ route('home') }}" class="botãoS"><i class="bi bi-box-arrow-left"></i> Sair</a>
        </div>
    </div>
    <!--botão de sair-->

    <!-- Lado Esquerdo: Formulário de Login -->
    <div class="row justify-content-center">
        <div class="form-login-page">
            <div class="form-login-container">
                <div class="form-login">
                    <div class="form-login-card">
                        <div class="form-login-header">Login</div>
                        <div class="form-login-body">
                            <div class="form-login-messages">
                                @if (session('success'))
                                    <div class="alert alert-success">
                                        {{ session('success') }}
                                    </div>
                                @endif
                                @if (session('error'))
                                    <div class="alert alert-danger">
                                        {{ session('error') }}
                                    </div>
                                @endif

                                {{-- CONTADOR DE RATE LIMITING --}}
                                @if ($errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas'))
                                    <div class="rate-limit-alert" id="rateLimitAlert">
                                        <div class="rate-limit-content">
                                            <i class="bi bi-exclamation-triangle-fill"></i>
                                            <div>
                                                <strong>🚨 Muitas tentativas de login!</strong>
                                                <p>Aguarde <span id="countdown">60</span> segundos para tentar
                                                    novamente.</p>
                                                <div class="progress-bar">
                                                    <div class="progress-fill" id="progressFill"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                @endif
                            </div>

                            <form id="loginForm" method="POST" action="{{ route('login.attempt') }}">
                                @csrf
                                <div class="form-login-group">
                                    <label for="EMAIL" class="form-login-label">E-mail</label>
                                    <input type="email" class="form-login-input" id="EMAIL" name="EMAIL"
                                        required autocomplete="email" value="{{ old('EMAIL') }}"
                                        {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'disabled' : '' }}>
                                    @foreach ($errors->get('EMAIL') as $message)
                                        @if (!str_contains($message, 'Muitas tentativas'))
                                            <div class="form-login-error">{{ $message }}</div>
                                        @endif
                                    @endforeach
                                </div>

                                <div class="form-login-group">
                                    <label for="SENHA_HASH" class="form-login-label">Senha</label>
                                    <div class="form-login-input-wrapper">
                                        <input type="password" class="form-login-input" id="SENHA_HASH"
                                            name="SENHA_HASH" required autocomplete="current-password" minlength="12"
                                            {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'disabled' : '' }}>
                                        <span id="toggleSenha" class="eye-icon">
                                            <i class="bi bi-eye-slash"></i>
                                        </span>
                                    </div>
                                    @foreach ($errors->get('SENHA_HASH') as $message)
                                        <div class="form-login-error">{{ $message }}</div>
                                    @endforeach
                                    @if (Route::has('password.request'))
                                        <div class="login-link mt-2">
                                            <a href="{{ route('password.request') }}" class="form-login-link"><i
                                                    class="bi bi-key"></i> Esqueceu sua senha?</a>
                                        </div>
                                    @endif
                                </div>

                                <!-- CHECKBOX LEMBRAR-ME -->
                                <div class="form-login-group">
                                    <label class="switch-remember">
                                        <input type="checkbox" name="remember" value="1"
                                            {{ old('remember') ? 'checked' : '' }}
                                            {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'disabled' : '' }}>
                                        <span class="slider">
                                            <svg class="checkmark" viewBox="0 0 24 24">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </span>
                                        <span class="label-text">Lembrar-me</span>
                                    </label>
                                </div>

                                <button type="submit" class="form-login-button" id="loginButton"
                                    {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'disabled' : '' }}>
                                    {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'Aguarde...' : 'Entrar' }}
                                </button>
                            </form>

                            <div class="social-login-wrapper">
                                <div class="social-login-separator">
                                    <span>ou utilize</span>
                                </div>
                                <a href="{{ route('login.google.redirect') }}" class="google-login-button">
                                    <img src="{{ asset('img/google-icon.svg') }}" alt="Google" class="google-login-icon">
                                    <span>Entrar com Google</span>
                                </a>
                            </div>

                            <div class="login-link">
                                <span>Não tem uma conta?</span>
                                <a href="{{ route('cadastro') }}" class="form-login-link"><i
                                        class="bi bi-box-arrow-in-right"></i> Cadastrar</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Lado Esquerdo: Formulário de Login -->

            <!-- Lado Direito: Ícone/Imagem -->
            <div class="form-login-icon">
                <object class="objectL" type="image/svg+xml" data="{{ asset('img/login.svg') }}"></object>
            </div>

            <div id="loader-cadastro" class="loder-cadastro">
                <span id="loader-icon" class="loader-icon girar-animado"
                    data-img1="{{ asset('img/iconeloader.png') }}">
                    <img id="imgloader" src="{{ asset('img/iconeloader.png') }}" alt="Moeda" class="imgloader">
                </span>
            </div>
        </div>
    </div>


</body>

</html>
