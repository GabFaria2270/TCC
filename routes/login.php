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
        'SENHA_HASH' => 'required|string',
    ], [
        'EMAIL.required' => 'O e-mail é obrigatório.',
        'EMAIL.email' => 'Digite um e-mail válido.',
        'SENHA_HASH.required' => 'A senha é obrigatória.',
    ]);

    $usuario = Usuario::where('EMAIL', $request->EMAIL)->first();

    if ($usuario && Hash::check($request->SENHA_HASH, $usuario->SENHA_HASH)) {
        Auth::login($usuario);
        if ($request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Login efetuado com sucesso!'
            ]);
        }
      return redirect()->route('home');
    } else {
        if ($request->ajax()) {
            return response()->json([
                'success' => false,
                'message' => 'E-mail ou senha inválidos.'
            ], 401);
        }
        return back()->with('error', 'E-mail ou senha inválidos.')->withInput();
    }
});