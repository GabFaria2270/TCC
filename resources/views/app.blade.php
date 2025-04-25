<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro</title>
    @vite('resources/css/app.css')
</head>

<body class="body">
    <div class="container">
        <h1 class="h1">Cadastro</h1>
        <form action="/register" method="POST">
            <div>
                <label for="name" class="label">Nome</label>
                <input type="text" id="name" name="name" class="input" required>
            </div>
            <div>
                <label for="email" class="label">E-mail</label>
                <input type="email" id="email" name="email" class="input" required>
            </div>
            <div>
                <label for="password" class="label">Senha</label>
                <input type="password" id="password" name="password" class="input" required>
            </div>
            <div>
                <label for="password_confirmation" class="label">Confirme a Senha</label>
                <input type="password" id="password_confirmation" name="password_confirmation" class="input" required>
            </div>
            <div>
                <button type="submit" class="button">Cadastrar</button>
            </div>
        </form>
    </div>
</body>

</html>
