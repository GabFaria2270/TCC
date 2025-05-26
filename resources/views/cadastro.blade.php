<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body>
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card mt-5">
                <div class="card-header">Cadastro</div>
                <div class="card-body">
                    <form method="POST" action="{{ route('cadastro') }}">
                        @csrf
                        <div class="mb-3">
                            <label for="NOME" class="form-label">Nome</label>
                            <input type="text" class="form-control" id="NOME" name="NOME" required
                                value="{{ old('NOME') }}">
                            @error('NOME')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>
                        <div class="mb-3">
                            <label for="EMAIL" class="form-label">E-mail</label>
                            <input type="email" class="form-control" id="EMAIL" name="EMAIL" required
                                value="{{ old('EMAIL') }}">
                            @error('EMAIL')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>
                        <div class="mb-3">
                            <label for="SENHA_HASH" class="form-label">Senha</label>
                            <input type="password" class="form-control" id="SENHA_HASH" name="SENHA_HASH" required>
                            @error('SENHA_HASH')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>
                        <div class="mb-3">
                            <label for="SENHA_HASH_confirmation" class="form-label">Confirme a Senha</label>
                            <input type="password" class="form-control" id="SENHA_HASH_confirmation"
                                name="SENHA_HASH_confirmation" required>
                        </div>
                        <div class="mb-3">
                            <label for="PERFIL" class="form-label">Perfil</label>
                            <input type="text" class="form-control" id="PERFIL" name="PERFIL" required
                                value="{{ old('PERFIL') }}">
                            @error('PERFIL')
                                <div class="text-danger small">{{ $message }}</div>
                            @enderror
                        </div>
                        <button type="submit" class="btn btn-primary">Cadastrar</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
