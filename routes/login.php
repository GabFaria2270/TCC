<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;
use Illuminate\Support\Facades\Auth;

Route::get('/login', function () {
    return view('login');
})->name('login');

Route::post('/login', function (Request $request) {
    $request->validate([
        'EMAIL' => 'required|email',
        'SENHA_HASH' => 'required|string|confirmed',
    ], [
        'EMAIL.required' => 'O e-mail é obrigatório.',
        'EMAIL.email' => 'Digite um e-mail válido.',
        'SENHA_HASH.required' => 'A senha é obrigatória.',
        'SENHA_HASH.confirmed' => 'A confirmação da senha não confere.',
    ]);

    $usuario = Usuario::where('EMAIL', $request->EMAIL)->first();

    if ($usuario && Hash::check($request->SENHA_HASH, $usuario->SENHA_HASH)) {
        Auth::login($usuario);
        return redirect()->route('login')->with('success', 'Login efetuado com sucesso!');
    } else {
        return back()->with('error', 'E-mail ou senha inválidos.')->withInput();
    }
});