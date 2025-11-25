<?php

use App\Http\Controllers\InicioController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\ClienteController;
use App\Http\Controllers\Auth\ProdutoController;
use App\Http\Controllers\Auth\VendasController; // ✅ ADICIONAR IMPORT
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\FiadoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\Auth\CacheTokenService;
use App\Models\Usuario;
use App\Models\RememberToken;
use Carbon\Carbon;


Route::get('/', function (Request $request) {
    $remember = $request->cookie('remember_token');
    if ($remember) {
        try {
            $tokenHash = hash_hmac('sha256', $remember, config('app.key'));
            $rememberRow = RememberToken::where('token_hash', $tokenHash)->first();

            // Verifica se o token existe, não expirou E pertence ao mesmo dispositivo
            if ($rememberRow && (!$rememberRow->expires_at || !Carbon::parse($rememberRow->expires_at)->isPast())) {
                // Verificar se o user_agent e IP correspondem ao dispositivo atual
                $currentUserAgent = substr($request->userAgent() ?? '', 0, 500);
                $currentIp = $request->ip();

                // Validar apenas se for o mesmo dispositivo (user_agent corresponde)
                // IP pode variar em redes móveis, então priorizamos user_agent
                $isSameDevice = $rememberRow->user_agent === $currentUserAgent;

                if ($isSameDevice) {
                    /** @var CacheTokenService $tokenService */
                    $tokenService = app(CacheTokenService::class);
                    $data = $tokenService->validateToken($remember);
                    if ($data && !empty($data['user_id'])) {
                        $user = Usuario::find($data['user_id']);
                        if ($user) {
                            // Atualizar last_used_at do token
                            $rememberRow->update(['last_used_at' => now()]);

                            $request->session()->put('user_id', $user->id);
                            Auth::setUser($user);
                            return redirect()->route('gerenciamento');
                        }
                    }
                } else {
                    // Token existe mas é de outro dispositivo - não fazer login automático
                    logger()->info('Remember token de outro dispositivo detectado', [
                        'stored_user_agent' => substr($rememberRow->user_agent, 0, 50),
                        'current_user_agent' => substr($currentUserAgent, 0, 50),
                    ]);
                }
            }
        } catch (\Exception $e) {
            logger()->warning('Erro ao validar remember_token na rota /: ' . $e->getMessage());
        }
    }
    return view('home');
})->name('home');

Route::get('/login/lock-status', [AuthenticatedSessionController::class, 'lockStatus'])->name('login.lock-status');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/cadastro.php';
require __DIR__ . '/login.php';

// ✅ GERENCIAMENTO VIA INERTIA (ROTAS ORGANIZADAS)
Route::middleware(['require.token'])->group(function () {

    // Dashboard principal (usa controller para preencher dashboard)
    Route::get('/gerenciamento', [InicioController::class, 'index'])->name('gerenciamento');

    // ✅ GRUPO DE ROTAS DE GERENCIAMENTO
    Route::prefix('gerenciamento')->group(function () {

        // ✅ ROTAS DE CLIENTES
        Route::get('clientes', [ClienteController::class, 'index'])
            ->name('clientes.index');

        Route::get('clientes/create', [ClienteController::class, 'create'])
            ->name('clientes.create');

        Route::post('clientes', [ClienteController::class, 'store'])
            ->name('clientes.store');

        Route::get('clientes/{cliente}', [ClienteController::class, 'show'])
            ->name('clientes.show');

        Route::get('clientes/{cliente}/edit', [ClienteController::class, 'edit'])
            ->name('clientes.edit');

        Route::put('clientes/{cliente}', [ClienteController::class, 'update'])
            ->name('clientes.update');

        Route::delete('clientes/{cliente}/conta-fiada', [ClienteController::class, 'pagarContaFiada'])
            ->name('clientes.pagarContaFiada');

        // Produtos
        Route::get('produtos', [ProdutoController::class, 'index'])->name('produtos.index');
        Route::post('produtos/filtros', [ProdutoController::class, 'setFilters'])->name('produtos.filtros');
        Route::post('produtos', [ProdutoController::class, 'store'])->name('produtos.store');
        Route::put('produtos/{produto}', [ProdutoController::class, 'update'])->name('produtos.update');
        Route::delete('produtos/{produto}', [ProdutoController::class, 'destroy'])->name('produtos.destroy');
        Route::post('produtos/{produto}/estoque/entrada', [ProdutoController::class, 'estoqueEntrada'])->name('produtos.estoque.entrada');
        Route::post('produtos/{produto}/estoque/saida', [ProdutoController::class, 'estoqueSaida'])->name('produtos.estoque.saida');
        Route::post('produtos/{produto}/estoque/ajuste', [ProdutoController::class, 'estoqueAjuste'])->name('produtos.estoque.ajuste');
        Route::get('produtos/{produto}/historico', [ProdutoController::class, 'historico'])->name('produtos.historico');

        // ✅ ROTAS DE VENDAS (IGUAL AOS CLIENTES)
        Route::get('vendas', [VendasController::class, 'index'])
            ->name('vendas.index');
        Route::post('vendas', [VendasController::class, 'store'])
            ->name('vendas.store');
        Route::post('vendas/cancelar-aberta', [VendasController::class, 'storeCancelada'])
            ->name('vendas.storeCancelada');
        Route::get('vendas/{venda}', [VendasController::class, 'show'])
            ->name('vendas.show');
        Route::get('vendas/{venda}/edit', [VendasController::class, 'edit'])
            ->name('vendas.edit');
        Route::put('vendas/{venda}', [VendasController::class, 'update'])
            ->name('vendas.update');
        Route::delete('vendas/{venda}', [VendasController::class, 'destroy'])
            ->name('vendas.destroy');
        Route::post('vendas/{venda}/cancelar', [VendasController::class, 'cancelar'])
            ->name('vendas.cancelar');
        Route::get('fiado/historico', [FiadoController::class, 'historico'])
            ->name('fiado.historico');
        // ROTA DE RELATÓRIO
        Route::get('relatorio', [\App\Http\Controllers\Auth\RelatorioController::class, 'index'])->name('relatorio.index');
        Route::post('relatorio/buscar', [\App\Http\Controllers\Auth\RelatorioController::class, 'filter'])->name('relatorio.filter');
        Route::get('relatorio/exportar-excel', [\App\Http\Controllers\Auth\RelatorioController::class, 'exportExcel'])->name('relatorio.exportarExcel');

        // Logout dentro do escopo de gerenciamento (POST por segurança)
        Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
            ->name('gerenciamento.logout');
    });
});





