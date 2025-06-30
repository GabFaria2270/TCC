<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

Route::get('/login', function () {
    return view('login');
})->name('login');

Route::post('/login', function (Request $request) {
    try {
        // DEBUG: Log dados recebidos
        Log::info('=== DEBUG LOGIN INÍCIO ===', [
            'email' => $request->EMAIL,
            'ip' => $request->ip(),
        ]);

        // INICIA TRANSAÇÃO PARA SEGURANÇA
        DB::beginTransaction();
        
        // VALIDAÇÃO COM MENSAGENS PERSONALIZADAS
        $validatedData = $request->validate([
            'EMAIL' => 'required|email',
            'SENHA_HASH' => 'required|string|min:12',
            'remember' => 'boolean',
        ], [
            'EMAIL.required' => 'O e-mail é obrigatório.',
            'EMAIL.email' => 'Digite um e-mail válido.',
            'SENHA_HASH.required' => 'A senha é obrigatória.',
            'SENHA_HASH.min' => 'A senha deve ter pelo menos 12 caracteres.',
        ]);

        // SANITIZAÇÃO DOS DADOS
        $validatedData['EMAIL'] = strtolower(trim($validatedData['EMAIL']));
        
        // LOG DE TENTATIVA DE LOGIN
        Log::channel('security')->info('Tentativa de login', [
            'email' => $validatedData['EMAIL'],
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now(),
        ]);
        
        // BUSCA USUÁRIO
        $usuario = Usuario::where('EMAIL', $validatedData['EMAIL'])->first();
        
        Log::info('=== DEBUG VERIFICAÇÃO USUÁRIO ===', [
            'usuario_encontrado' => $usuario ? 'SIM' : 'NÃO',
            'email_buscado' => $validatedData['EMAIL'],
        ]);
        
        // VERIFICA SE USUÁRIO EXISTE
        if (!$usuario) {
            Log::channel('security')->warning('Login falhou - Usuário não encontrado', [
                'email' => $validatedData['EMAIL'],
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);
            
            return back()->with('error', 'E-mail não cadastrado.')
                        ->withInput($request->except('SENHA_HASH'));
        }
        
        // VERIFICA SENHA
        $senhaCorreta = Hash::check($validatedData['SENHA_HASH'], $usuario->SENHA_HASH);
        
        Log::info('=== DEBUG VERIFICAÇÃO SENHA ===', [
            'senha_correta' => $senhaCorreta ? 'SIM' : 'NÃO',
            'usuario_id' => $usuario->ID,
        ]);
        
        if (!$senhaCorreta) {
            Log::channel('security')->warning('Login falhou - Senha incorreta', [
                'email' => $validatedData['EMAIL'],
                'usuario_id' => $usuario->ID,
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);
            
            return back()->with('error', 'Senha incorreta.')
                        ->withInput($request->except('SENHA_HASH'));
        }
        
        Log::info('=== DEBUG ANTES DE FAZER LOGIN ===', [
            'usuario_id' => $usuario->ID,
            'email' => $usuario->EMAIL,
            'remember' => $validatedData['remember'] ?? false,
        ]);
        
        // REGENERA SESSÃO PARA PREVENIR FIXAÇÃO
        $request->session()->regenerate();
        
        // FAZER LOGIN SEGURO COM OPÇÃO LEMBRAR-ME
        Auth::login($usuario, $validatedData['remember'] ?? false);
        
        // CONFIRMA TRANSAÇÃO
        DB::commit();
        
        // LOG DE SUCESSO
        Log::channel('security')->info('Login realizado com sucesso', [
            'user_id' => $usuario->ID,
            'email' => $usuario->EMAIL,
            'nome' => $usuario->NOME,
            'ip' => $request->ip(),
            'remember' => $validatedData['remember'] ?? false,
            'timestamp' => now(),
        ]);

        Log::info('=== DEBUG LOGIN SUCESSO ===');
        return redirect()->route('home')->with('success', 'Login realizado com sucesso!');
        
    } catch (\Exception $e) {
        // DESFAZ TRANSAÇÃO EM CASO DE ERRO
        DB::rollback();
        
        // LOG DE ERRO DETALHADO
        Log::error('=== ERRO NO LOGIN ===', [
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
})->middleware(['throttle:5,1', 'guest']); // 5 tentativas por minuto + guest