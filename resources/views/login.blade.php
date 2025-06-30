<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    @vite(['resources/css/app.css', 'resources/css/home/home.css', 'resources/js/geralJS.js'])
</head>

<body class="loginf">
    <!--botão de sair-->
  <div class="containerS">
        <div class="Cbutton">
            <a href="{{ route('home') }}" class="botãoS">Sair</a>
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
                                @if(session('success'))
                                <div class="alert alert-success">
                                    {{ session('success') }}
                                </div>
                                @endif
                                @if(session('error'))
                                <div class="alert alert-danger">
                                    {{ session('error') }}
                                </div>
                                @endif
                            </div>
                            <form id="loginForm" method="POST" action="{{ route('login') }}">
                                @csrf
                                <div class="form-login-group">
                                    <label for="EMAIL" class="form-login-label">E-mail</label>
                                    <input type="email" class="form-login-input" id="EMAIL" name="EMAIL" required
                                        autocomplete="email" value="{{ old('EMAIL') }}">
                                    @error('EMAIL')
                                    <div class="form-login-error">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="form-login-group">
                                    <label for="SENHA_HASH" class="form-login-label">Senha</label>
                                    <input type="password" class="form-login-input" id="SENHA_HASH" name="SENHA_HASH"
                                        required autocomplete="current-password" minlength="6"
                                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$"
                                        title="Senha deve conter pelo menos 6 caracteres com maiúscula, minúscula, número e símbolo">
                                    @error('SENHA_HASH')
                                    <div class="form-login-error">{{ $message }}</div>
                                    @enderror
                                </div>

                                <!-- CHECKBOX LEMBRAR-ME (OPCIONAL) -->
                                <div class="form-login-group">
                                    <label class="form-check-label">
                                        <input type="checkbox" name="remember" value="1"
                                            {{ old('remember') ? 'checked' : '' }}>
                                        Lembrar-me
                                    </label>
                                </div>

                                <button type="submit" class="form-login-button">Entrar</button>
                            </form>

                            <div class="login-link">
                                <span>Não tem uma conta?</span>
                                <a href="{{ route('cadastro') }}" class="form-login-link">Cadastrar</a>
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
        <!-- Lado Direito: Ícone/Imagem -->

</body>

</html>