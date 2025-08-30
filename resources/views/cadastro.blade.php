<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro</title>
    @vite(['resources/css/app.css', 'resources/css/cadastro/cadastro.css', 'resources/js/geralJS.js'])

</head>

<body class="cadastrof">
    <!--botão de sair-->
    <div class="containerS">
        <div class="Cbutton">
            <a href="{{ route('home') }}" class="botãoS">Sair</a>
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
                            </div>
                            <form id="cadastroForm" method="POST" action="{{ route('cadastro') }}">
                                @csrf
                                <div class="form-cadastro-group">
                                    <label for="NOME" class="form-cadastro-label">Nome</label>
                                    <input type="text" class="form-cadastro-input" id="NOME" name="NOME"
                                        value="{{ old('NOME') }}">
                                    @error('NOME')
                                        <div class="form-cadastro-error">{{ $message }}</div>
                                    @enderror
                                </div>
                                <div class="form-cadastro-group">
                                    <label for="EMAIL" class="form-cadastro-label">E-mail</label>
                                    <input type="email" class="form-cadastro-input" id="EMAIL" name="EMAIL"
                                        required value="{{ old('EMAIL') }}">
                                    @error('EMAIL')
                                        <div class="form-cadastro-error">{{ $message }}</div>
                                    @enderror
                                </div>
                                <div class="form-cadastro-group" style="position: relative;">
                                    <label for="SENHA_HASH" class="form-cadastro-label">Senha</label>
                                    <input type="password" class="form-cadastro-input" id="SENHA_HASH" name="SENHA_HASH"
                                        required minlength="12" placeholder="Mínimo 12 caracteres">
                                    <span id="toggleSenha" class="eye-icon" style="display: none;"></span>
                                    @error('SENHA_HASH')
                                        @if (!str_contains($message, 'confere'))
                                            <div class="form-cadastro-error">{{ $message }}</div>
                                        @endif
                                    @enderror
                                </div>
                                <!-- Confirme se existe este campo no formulário -->
                                <div class="form-cadastro-group" style="position: relative;">
                                    <label for="SENHA_HASH_confirmation" class="form-cadastro-label">Confirmar
                                        Senha</label>
                                    <input type="password" class="form-cadastro-input" id="SENHA_HASH_confirmation"
                                        name="SENHA_HASH_confirmation" required minlength="12"
                                        placeholder="Digite a senha novamente">
                                    <span id="toggleSenhaConfirm" class="eye-icon" style="display: none;"></span>
                                    @error('SENHA_HASH')
                                        @if (str_contains($message, 'confere'))
                                            <div class="form-cadastro-error">{{ $message }}</div>
                                        @endif
                                    @enderror
                                </div>
                                <div class="form-cadastro-group">
                                    <label for="PERFIL" class="form-cadastro-label">Perfil</label>
                                    <input type="text" class="form-cadastro-input" id="PERFIL" name="PERFIL"
                                        required value="{{ old('PERFIL') }}">
                                    @error('PERFIL')
                                        <div class="form-cadastro-error">{{ $message }}</div>
                                    @enderror
                                </div>
                                <div class="form-cadastro-group">
                                    <label for="COMERCIO_NOME" class="form-cadastro-label">Nome do Comércio</label>
                                    <input type="text" class="form-cadastro-input" id="COMERCIO_NOME"
                                        name="COMERCIO_NOME" required value="{{ old('COMERCIO_NOME') }}">
                                    @error('COMERCIO_NOME')
                                        <div class="form-cadastro-error">{{ $message }}</div>
                                    @enderror
                                </div>
                                <div class="form-cadastro-group">
                                    <label for="COMERCIO_CNPJ" class="form-cadastro-label">CNPJ do Comércio</label>
                                    <input type="text" class="form-cadastro-input" id="COMERCIO_CNPJ"
                                        name="COMERCIO_CNPJ" required value="{{ old('COMERCIO_CNPJ') }}">
                                    @error('COMERCIO_CNPJ')
                                        <div class="form-cadastro-error">{{ $message }}</div>
                                    @enderror
                                </div>

                                <button type="submit" class="form-cadastro-button">Cadastrar</button>
                            </form>
                            <div class="login-link">
                                <span>Já tem uma conta?</span>
                                <a href="{{ route('login') }}" class="form-cadastro-link">Entrar</a>
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
