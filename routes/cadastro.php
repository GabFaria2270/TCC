<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;
use Illuminate\Support\Facades\Auth;

Route::post('/cadastro', function (Request $request) {
    $request->validate([
        'NOME' => 'required|string|max:100',
        'EMAIL' => 'required|email|unique:usuario,EMAIL',
        'SENHA_HASH' => 'required|string|min:6|confirmed',
        'PERFIL' => 'required|string|max:50'
    ], [
        'NOME.required' => 'O nome é obrigatório.',
        'EMAIL.required' => 'O e-mail é obrigatório.',
        'EMAIL.email' => 'Digite um e-mail válido.',
        'EMAIL.unique' => 'Este e-mail já está cadastrado.',
        'SENHA_HASH.required' => 'A senha é obrigatória.',
        'SENHA_HASH.min' => 'A senha deve ter pelo menos 6 caracteres.',
        'SENHA_HASH.confirmed' => 'A confirmação da senha não confere.',
        'PERFIL.required' => 'O perfil é obrigatório.',
    ]);

    $usuario = Usuario::create([
        'NOME' => $request->NOME,
        'EMAIL' => $request->EMAIL,
        'SENHA_HASH' => Hash::make($request->SENHA_HASH),
        'PERFIL' => $request->PERFIL,
    ]);

    Auth::login($usuario);

    sleep(3); // Simula delay

    if ($request->ajax()) {
        return response()->json([
            'success' => Auth::check(),
            'message' => Auth::check()
                ? 'Cadastro realizado e login efetuado com sucesso!'
                : 'Cadastro realizado, mas não foi possível autenticar.'
        ]);
    }
});