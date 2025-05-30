<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Models\Usuario;

Route::post('/cadastro', function (Request $request) {
    $request->validate([
        'NOME' => 'required|string|max:100',
        'EMAIL' => 'required|email|unique:usuario,EMAIL',
        'SENHA_HASH' => 'required|string|min:6|confirmed',
        'PERFIL' => 'required|string|max:50'
    ]);

    Usuario::create([
        'NOME' => $request->NOME,
        'EMAIL' => $request->EMAIL,
        'SENHA_HASH' => Hash::make($request->SENHA_HASH),
        'PERFIL' => $request->PERFIL,
        // 'DATA_CRIACAO' será preenchido automaticamente pelo banco
    ]);

    
});