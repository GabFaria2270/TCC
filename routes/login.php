<?php
use Illuminate\Support\Facades\Route;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Usuario;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

Route::get('/login', function () {
    return view('login');
})->name('login');

Route::post('/login', function (LoginRequest $request) {
    try {
        // LOG DE TENTATIVA DE LOGIN
        Log::channel('security')->info('Tentativa de login', [
            'email' => $request->EMAIL,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now(),
        ]);

        // AUTENTICA USANDO O MÉTODO DO REQUEST
        $request->authenticate();

        // REGENERA SESSÃO (PREVINE SESSION FIXATION)
        $request->session()->regenerate();

        // BUSCA USUÁRIO LOGADO PARA LOG
        $usuario = Auth::user();

        // LOG DE SUCESSO
        Log::channel('security')->info('Login realizado com sucesso', [
            'user_id' => $usuario->ID,
            'email' => $usuario->EMAIL,
            'ip' => $request->ip(),
            'timestamp' => now(),
        ]);

        // REDIRECIONA PARA HOME (NÃO PARA LOGIN)
        return redirect()->route('home')->with('success', 'Login realizado com sucesso!');

    } catch (\Illuminate\Validation\ValidationException $e) {
        // LOG DE FALHA DE LOGIN
        Log::channel('security')->warning('Falha no login', [
            'email' => $request->EMAIL ?? 'N/A',
            'ip' => $request->ip(),
            'error' => 'Credenciais inválidas',
            'timestamp' => now(),
        ]);

        // RETORNA ERRO DE VALIDAÇÃO
        throw $e;

    } catch (\Exception $e) {
        // LOG DE ERRO GERAL
        Log::channel('security')->error('Erro no login', [
            'email' => $request->EMAIL ?? 'N/A',
            'ip' => $request->ip(),
            'error' => $e->getMessage(),
            'timestamp' => now(),
        ]);

        return back()->with('error', 'Erro interno. Tente novamente.')
                    ->withInput($request->except('SENHA_HASH'));
    }
})->middleware(['throttle:5,1', 'guest']);