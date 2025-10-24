<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro</title>
    <meta name="description" content="Crie sua conta no MaisConectado — gerenciamento simples para comércios locais.">
    <link rel="canonical" href="{{ url()->current() }}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="MaisConectado">
    <meta property="og:title" content="Cadastro — MaisConectado">
    <meta property="og:description" content="Crie sua conta no MaisConectado — gerenciamento simples para comércios locais.">
    <meta property="og:image" content="https://maisconectado.alwaysdata.net/logo.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Cadastro — MaisConectado">
    <meta name="twitter:description" content="Crie sua conta no MaisConectado — gerenciamento simples para comércios locais.">
    <meta name="twitter:image" content="https://maisconectado.alwaysdata.net/logo.jpg">
    @vite(['resources/css/app.css', 'resources/css/cadastro/cadastro.css', 'resources/js/app.js', 'resources/js/cadastro/cadastro.js'])
</head>

<body class="cadastrof">
    <!--botão de sair-->
    <div class="containerS">
        <div class="Cbutton">
            <a href="{{ route('home') }}" class="botãoS"><i class="bi bi-box-arrow-left"></i> Sair</a>
        </div>
    </div>
    <!--botão de sair-->

    <!-- Lado Esquerdo: Formulário de Cadastro -->
    <div class="row justify-content-center">
        <div class="form-cadastro-page">
            <div class="form-cadastro-container">
                <div class="form-cadastro">
                    <div class="form-cadastro-card">
                        <div class="form-cadastro-header">Cadastro</div>
                        <div class="form-cadastro-body">
                            <div class="form-cadastro-messages">
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

                                {{-- CONTADOR DE RATE LIMITING PARA CADASTRO --}}
                                @if ($errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas'))
                                    <div class="rate-limit-alert" id="rateLimitAlert">
                                        <div class="rate-limit-content">
                                            <i class="bi bi-exclamation-triangle-fill"></i>
                                            <div>
                                                <strong>🚨 Muitas tentativas de cadastro!</strong>
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

                            <form id="cadastroForm" method="POST" action="{{ route('cadastro.attempt') }}">
                                @csrf
                                <div class="form-cadastro-group">
                                    <label for="NOME" class="form-cadastro-label">Nome</label>
                                    <input type="text" class="form-cadastro-input" id="NOME" name="NOME"
                                        value="{{ old('NOME') }}"
                                        {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'disabled' : '' }}>
                                    @error('NOME')
                                        <div class="form-cadastro-error">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="form-cadastro-group">
                                    <label for="EMAIL" class="form-cadastro-label">E-mail</label>
                                    <input type="email" class="form-cadastro-input" id="EMAIL" name="EMAIL"
                                        required value="{{ old('EMAIL') }}"
                                        {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'disabled' : '' }}>
                                    @foreach ($errors->get('EMAIL') as $message)
                                        @if (!str_contains($message, 'Muitas tentativas'))
                                            <div class="form-cadastro-error">{{ $message }}</div>
                                        @endif
                                    @endforeach
                                </div>

                                <!-- Campo de Senha -->
                                <div class="form-cadastro-group" style="position: relative;">
                                    <label for="SENHA_HASH" class="form-cadastro-label">Senha</label>
                                    <input type="password" class="form-cadastro-input" id="SENHA_HASH" name="SENHA_HASH"
                                        required minlength="12" placeholder="Mínimo 12 caracteres"
                                        {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'disabled' : '' }}>
                                    <span id="toggleSenha" class="eye-icon">
                                        <i class="bi bi-eye-slash"></i>
                                    </span>
                                    @error('SENHA_HASH')
                                        @if (!str_contains($message, 'confere'))
                                            <div class="form-cadastro-error">{{ $message }}</div>
                                        @endif
                                    @enderror
                                </div>

                                <!-- Campo de Confirmar Senha -->
                                <div class="form-cadastro-group" style="position: relative;">
                                    <label for="SENHA_HASH_confirmation" class="form-cadastro-label">Confirmar
                                        Senha</label>
                                    <input type="password" class="form-cadastro-input" id="SENHA_HASH_confirmation"
                                        name="SENHA_HASH_confirmation" required minlength="12"
                                        placeholder="Digite a senha novamente"
                                        {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'disabled' : '' }}>
                                    <span id="toggleSenhaConfirm" class="eye-icon">
                                        <i class="bi bi-eye-slash"></i>
                                    </span>
                                    @error('SENHA_HASH')
                                        @if (str_contains($message, 'confere'))
                                            <div class="form-cadastro-error">{{ $message }}</div>
                                        @endif
                                    @enderror
                                </div>

                                <div class="form-cadastro-group">
                                    <label for="PERFIL" class="form-cadastro-label">Perfil</label>
                                    <input type="text" class="form-cadastro-input" id="PERFIL" name="PERFIL"
                                        required value="{{ old('PERFIL') }}"
                                        {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'disabled' : '' }}>
                                    @error('PERFIL')
                                        <div class="form-cadastro-error">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="form-cadastro-group">
                                    <label for="COMERCIO_NOME" class="form-cadastro-label">Nome do Comércio</label>
                                    <input type="text" class="form-cadastro-input" id="COMERCIO_NOME"
                                        name="COMERCIO_NOME" required value="{{ old('COMERCIO_NOME') }}"
                                        {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'disabled' : '' }}>
                                    @error('COMERCIO_NOME')
                                        <div class="form-cadastro-error">{{ $message }}</div>
                                    @enderror
                                </div>

                                <div class="form-cadastro-group">
                                    <label for="COMERCIO_CNPJ" class="form-cadastro-label">CNPJ do Comércio</label>
                                    <input type="text" class="form-cadastro-input" id="COMERCIO_CNPJ"
                                        name="COMERCIO_CNPJ" required value="{{ old('COMERCIO_CNPJ') }}"
                                        {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'disabled' : '' }}>
                                    @error('COMERCIO_CNPJ')
                                        <div class="form-cadastro-error">{{ $message }}</div>
                                    @enderror
                                </div>

                                <button type="submit" class="form-cadastro-button"
                                    {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'disabled' : '' }}>
                                    {{ $errors->has('EMAIL') && str_contains($errors->first('EMAIL'), 'Muitas tentativas') ? 'Aguarde...' : 'Cadastrar' }}
                                </button>
                            </form>
                            <div class="login-link">
                                <span>Já tem uma conta?</span>
                                <a href="{{ route('login') }}" class="form-cadastro-link"><span>Entrar</span> <i
                                        class="bi bi-box-arrow-in-right"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Lado Esquerdo: Formulário de Cadastro -->



            <!-- Lado Direito: Vídeo -->
            <div class="form-cadastro-icon">
                <object class="object" type="image/svg+xml" data="{{ asset('img/imgc.svg') }}"></object>
            </div>

            <div id="loader-cadastro" class="loder-cadastro">
                <span id="loader-icon" class="loader-icon girar-animado"
                    data-img1="{{ asset('img/iconeloader.png') }}">
                    <img id="imgloader" src="{{ asset('img/iconeloader.png') }}" alt="Moeda" class="imgloader">
                </span>
            </div>
        </div>
        <!-- Lado Direito: Vídeo -->


</body>

</html>
