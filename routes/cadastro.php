<?php

use Illuminate\Support\Facades\Route;
use App\Http\Requests\Auth\UsuarioRequest; // CORRIGE O IMPORT
use App\Models\Usuario;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash; // ADICIONA IMPORT DO HASH

Route::get('/cadastro', function () {
    return view('cadastro');
})->name('cadastro');

Route::post('/cadastro', function (UsuarioRequest $request) {
    try {
        // DEBUG: Log dados recebidos
        Log::info('=== DEBUG CADASTRO INÍCIO ===', [
            'dados_validados' => $request->validated(),
            'ip' => $request->ip(),
        ]);

        // INICIA TRANSAÇÃO PARA SEGURANÇA
        DB::beginTransaction();
        
        // USA O REQUEST VALIDADO (já sanitizado)
        $validatedData = $request->validated();
        
        // LOG DE TENTATIVA DE CADASTRO
        Log::channel('security')->info('Tentativa de cadastro', [
            'email' => $validatedData['EMAIL'],
            'nome' => $validatedData['NOME'],
            'perfil' => $validatedData['PERFIL'],
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now(),
        ]);
        
        // VERIFICA DUPLICATAS EXTRAS (double-check)
        $emailExists = Usuario::where('EMAIL', $validatedData['EMAIL'])->exists();
        $perfilExists = Usuario::where('PERFIL', $validatedData['PERFIL'])->exists();
        
        Log::info('=== DEBUG VERIFICAÇÃO DUPLICATAS ===', [
            'email_exists' => $emailExists,
            'perfil_exists' => $perfilExists,
        ]);
        
        if ($emailExists) {
            Log::info('=== EMAIL JÁ EXISTE ===');
            return back()->with('error', 'Este email já está cadastrado.')
                        ->withInput($request->except('SENHA_HASH'));
        }
        
        if ($perfilExists) {
            Log::info('=== PERFIL JÁ EXISTE ===');
            return back()->with('error', 'Este perfil já está em uso.')
                        ->withInput($request->except('SENHA_HASH'));
        }
        
        Log::info('=== DEBUG ANTES DE CRIAR USUÁRIO ===', [
            'dados_para_criar' => [
                'NOME' => $validatedData['NOME'],
                'EMAIL' => $validatedData['EMAIL'],
                'SENHA_HASH' => 'HASH_SERÁ_GERADO',
                'PERFIL' => $validatedData['PERFIL'],
            ]
        ]);
        
        // CRIA USUÁRIO (senha é hasheada automaticamente no modelo)
        $usuario = Usuario::create([
            'NOME' => $validatedData['NOME'],
            'EMAIL' => $validatedData['EMAIL'],
            'SENHA_HASH' => $validatedData['SENHA_HASH'], // HASH AUTOMÁTICO via setSenhaHashAttribute
            'PERFIL' => $validatedData['PERFIL'],
        ]);

        Log::info('=== DEBUG USUÁRIO CRIADO ===', [
            'user_id' => $usuario->ID,
            'email' => $usuario->EMAIL,
        ]);

        // REGENERA SESSÃO PARA PREVENIR FIXAÇÃO
        $request->session()->regenerate();
        
        // FAZER LOGIN SEGURO
        Auth::login($usuario, false); // false = não lembrar
        
        // CONFIRMA TRANSAÇÃO
        DB::commit();
        
        // LOG DE SUCESSO
        Log::channel('security')->info('Cadastro realizado com sucesso', [
            'user_id' => $usuario->ID,
            'email' => $usuario->EMAIL,
            'nome' => $usuario->NOME,
            'perfil' => $usuario->PERFIL,
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        Log::info('=== DEBUG CADASTRO SUCESSO ===');
        return redirect()->route('home')->with('success', 'Cadastro realizado com sucesso!');
        
    } catch (\Exception $e) {
        // DESFAZ TRANSAÇÃO EM CASO DE ERRO
        DB::rollback();
        
        // LOG DE ERRO DETALHADO
        Log::error('=== ERRO NO CADASTRO ===', [
            'error_message' => $e->getMessage(),
            'error_file' => $e->getFile(),
            'error_line' => $e->getLine(),
            'error_trace' => $e->getTraceAsString(),
            'email' => $request->EMAIL ?? 'N/A',
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);
        
        return back()->with('error', 'Erro interno. Tente novamente. Detalhes: ' . $e->getMessage())
                    ->withInput($request->except('SENHA_HASH'));
    }
})->middleware(['throttle:3,1', 'guest']); // Adiciona middleware guest
