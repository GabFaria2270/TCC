<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Models\Usuario;
use Illuminate\Support\Facades\Auth;

Route::post('/cadastro', function (Request $request) {
    $request->validate([
        'NOME' => 'required|string|max:100',
        'EMAIL' => 'required|email|unique:usuario,EMAIL',
        'SENHA_HASH' => 'required|string|min:6|confirmed',
        'PERFIL' => 'required|string|max:50'
    ]);

    $usuario = Usuario::create([
        'NOME' => $request->NOME,
        'EMAIL' => $request->EMAIL,
        'SENHA_HASH' => Hash::make($request->SENHA_HASH),
        'PERFIL' => $request->PERFIL,
    ]);

    // Autentica o novo usuário automaticamente
    Auth::login($usuario);

    // Verifica se o usuário está autenticado
    if (Auth::check()) {
        // Usuário autenticado com sucesso
        return redirect()->back()->with('success', 'Cadastro realizado e login efetuado com sucesso!');
    } else {
        // Falha na autenticação
        return redirect()->back()->with('error', 'Cadastro realizado, mas não foi possível autenticar.');
    }
});