<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
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

                                <div class="form-login-group" style="position: relative;">
                                    <label for="SENHA_HASH" class="form-login-label">Senha</label>
                                    <input type="password" class="form-login-input" id="SENHA_HASH" name="SENHA_HASH"
                                        required autocomplete="current-password" minlength="12"
                                        {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'disabled' : '' }}>
                                    <span id="toggleSenha" class="eye-icon">
                                        <i class="bi bi-eye-slash"></i>
                                    </span>
                                    @foreach ($errors->get('SENHA_HASH') as $message)
                                        <div class="form-login-error">{{ $message }}</div>
                                    @endforeach
                                </div>

                                <!-- CHECKBOX LEMBRAR-ME -->
                                <div class="form-login-group">
                                    <label class="form-check-label">
                                        <input type="checkbox" name="remember" value="1"
                                            {{ old('remember') ? 'checked' : '' }}
                                            {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'disabled' : '' }}>
                                        Lembrar-me
                                    </label>
                                </div>

                                <button type="submit" class="form-login-button" id="loginButton"
                                    {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'disabled' : '' }}>
                                    {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'Aguarde...' : 'Entrar' }}
                                </button>
                            </form>

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
