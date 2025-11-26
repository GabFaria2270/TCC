<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Definir nova senha | MaisConectado</title>
    <meta name="description" content="Escolha uma nova senha para continuar usando o MaisConectado.">
    <link rel="canonical" href="{{ url()->current() }}">
    @vite(['resources/css/app.css', 'resources/css/login/login.css', 'resources/css/auth/reset-password.css', 'resources/js/app.js', 'resources/js/login/login.js', 'resources/js/auth/reset-password.js'])
</head>

<body class="loginf">
    <div class="containerS">
        <div class="Cbutton">
            <a href="{{ route('home') }}" class="botãoS"><i class="bi bi-box-arrow-left"></i> Início</a>
        </div>
    </div>

    <div class="row justify-content-center">
        <div class="form-login-page">
            <div class="form-login-container">
                <div class="form-login">
                    <div class="form-login-card">
                        <div class="form-login-header">Definir nova senha</div>
                        <div class="form-login-body">
                            <div class="form-login-messages">
                                @if (session('status'))
                                    <div class="alert alert-success">
                                        <strong>Senha atualizada!</strong>
                                        {{ session('status') }}
                                    </div>
                                @endif
                                @if ($errors->any())
                                    <div class="alert alert-danger">
                                        <strong>Ops! Precisamos de atenção.</strong>
                                        {{ $errors->first('email') ?? ($errors->first('password') ?? __('Verifique os campos e tente novamente.')) }}
                                    </div>
                                @endif
                            </div>

                            @php
                                $resolvedEmail = old('email', $email);
                                $emailLocked = filled($resolvedEmail);
                            @endphp

                            <form method="POST" action="{{ route('password.store') }}" class="form-reset"
                                id="resetPasswordForm">
                                @csrf

                                <input type="hidden" name="token" value="{{ $token }}">

                                <div class="form-login-group">
                                    <label for="email" class="form-login-label">E-mail</label>
                                    <input type="email" class="form-login-input" id="email" name="email"
                                        required autocomplete="email" value="{{ $resolvedEmail }}"
                                        placeholder="Digite o e-mail cadastrado"
                                        @if ($emailLocked) readonly aria-readonly="true" @endif>
                                </div>

                                <div class="form-login-group">
                                    <label for="password" class="form-login-label">Nova senha</label>
                                    <div class="form-login-input-wrapper">
                                        <input type="password" class="form-login-input" id="password" name="password"
                                            required autocomplete="new-password" minlength="12" autofocus>
                                        <span id="togglePassword" class="eye-icon" role="button" tabindex="0">
                                            <i class="bi bi-eye-slash"></i>
                                        </span>
                                    </div>
                                    <div class="password-requirements" id="passwordRequirements">
                                        <div class="requirement-item" data-requirement="length">
                                            <i class="bi bi-circle"></i>
                                            <span>Mínimo de 12 caracteres</span>
                                        </div>
                                        <div class="requirement-item" data-requirement="uppercase">
                                            <i class="bi bi-circle"></i>
                                            <span>Pelo menos uma letra maiúscula</span>
                                        </div>
                                        <div class="requirement-item" data-requirement="lowercase">
                                            <i class="bi bi-circle"></i>
                                            <span>Pelo menos uma letra minúscula</span>
                                        </div>
                                        <div class="requirement-item" data-requirement="number">
                                            <i class="bi bi-circle"></i>
                                            <span>Pelo menos um número</span>
                                        </div>
                                        <div class="requirement-item" data-requirement="special">
                                            <i class="bi bi-circle"></i>
                                            <span>Pelo menos um caractere especial (@$!%*?&#)</span>
                                        </div>
                                    </div>
                                    @error('password')
                                        <div class="form-login-error">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="form-login-group">
                                    <label for="password_confirmation" class="form-login-label">Confirmar nova
                                        senha</label>
                                    <div class="form-login-input-wrapper">
                                        <input type="password" class="form-login-input" id="password_confirmation"
                                            name="password_confirmation" required autocomplete="new-password"
                                            minlength="12">
                                        <span id="togglePasswordConfirm" class="eye-icon" role="button" tabindex="0">
                                            <i class="bi bi-eye-slash"></i>
                                        </span>
                                    </div>
                                    @error('password_confirmation')
                                        <div class="form-login-error">{{ $message }}</div>
                                    @enderror
                                </div>

                                <button type="submit" class="form-login-button">
                                    Salvar nova senha
                                </button>
                            </form>

                            <div class="login-link">
                                <span>Lembrou a senha?</span>
                                <a href="{{ route('login') }}" class="form-login-link"><i
                                        class="bi bi-box-arrow-in-right"></i> Tela de login</a>
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
