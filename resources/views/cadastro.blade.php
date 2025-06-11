<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    @vite(['resources/css/home/home.css', 'resources/js/geralJS.js','routes/web.php'])
</head>

<body>
    <div class="row justify-content-center">
       
            <div class="form-cadastro-page">
                <!-- Loader -->
                <div id="loader" class="loader d-none">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </div>

                <!-- Lado Esquerdo: Formulário -->
                <div class="form-cadastro-container">
                    <div class="form-cadastro">
                        <div class="form-cadastro-card">
                            <div class="form-cadastro-header">Cadastro</div>
                            <div class="form-cadastro-body">
                                <form id="cadastroForm" method="POST" action="{{ route('cadastro') }}">
                                    @csrf
                                    <div class="form-cadastro-group">
                                        <label for="NOME" class="form-cadastro-label">Nome</label>
                                        <input type="text" class="form-cadastro-input" id="NOME" name="NOME" required
                                            value="{{ old('NOME') }}">
                                        @error('NOME')
                                            <div class="form-cadastro-error">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    <div class="form-cadastro-group">
                                        <label for="EMAIL" class="form-cadastro-label">E-mail</label>
                                        <input type="email" class="form-cadastro-input" id="EMAIL" name="EMAIL" required
                                            value="{{ old('EMAIL') }}">
                                        @error('EMAIL')
                                            <div class="form-cadastro-error">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    <div class="form-cadastro-group">
                                        <label for="SENHA_HASH" class="form-cadastro-label">Senha</label>
                                        <input type="password" class="form-cadastro-input" id="SENHA_HASH" name="SENHA_HASH" required>
                                        @error('SENHA_HASH')
                                            <div class="form-cadastro-error">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    <div class="form-cadastro-group">
                                        <label for="SENHA_HASH_confirmation" class="form-cadastro-label">Confirme a Senha</label>
                                        <input type="password" class="form-cadastro-input" id="SENHA_HASH_confirmation"
                                            name="SENHA_HASH_confirmation" required>
                                    </div>
                                    <div class="form-cadastro-group">
                                        <label for="PERFIL" class="form-cadastro-label">Perfil</label>
                                        <input type="text" class="form-cadastro-input" id="PERFIL" name="PERFIL" required
                                            value="{{ old('PERFIL') }}">
                                        @error('PERFIL')
                                            <div class="form-cadastro-error">{{ $message }}</div>
                                        @enderror
                                    </div>
                                    <button type="submit" class="form-cadastro-button">Cadastrar</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Linha Divisória -->
                <div class="form-cadastro-divider"></div>

                <!-- Lado Direito: Vídeo -->
                <div class="form-cadastro-icon">
                    <video autoplay loop muted>
                        <source src="{{ asset('videos/animation.mp4') }}" type="video/mp4">
                        Seu navegador não suporta vídeos HTML5.
                    </video>
                </div>
            </div>
   
    </div>
</body>

</html>