<?php
// filepath: c:\Users\User\Desktop\TCC\app\Http\Controllers\Auth\ClienteController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ClienteRequest;
use App\Services\Auth\ClienteService; // ✅ NAMESPACE CORRETO
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ClienteController extends Controller
{
    protected ClienteService $clienteService;

    public function __construct(ClienteService $clienteService)
    {
        $this->clienteService = $clienteService;
    }

    /**
     * ✅ LISTA CLIENTES
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            Log::channel('security')->info('Acessando lista de clientes', [
                'user_id' => $user->ID,
                'email' => $user->EMAIL,
            ]);
            
            $result = $this->clienteService->listarClientes();
            
            if ($result['success']) {
                return Inertia::render('gerenciamento/Clientes', [
                    'clientes' => $result['clientes'],
                ]);
            }

            return Inertia::render('gerenciamento/Clientes', [
                'clientes' => [],
                'error' => $result['errors']['system'] ?? 'Erro ao carregar clientes.',
            ]);

        } catch (\Exception $e) {
            Log::channel('security')->error('Erro no ClienteController@index', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return Inertia::render('gerenciamento/Clientes', [
                'clientes' => [],
                'error' => 'Erro interno do sistema.',
            ]);
        }
    }

    /**
     * ✅ EXIBE FORMULÁRIO DE CADASTRO
     */
    public function create()
    {
        try {
            $user = Auth::user();
            
            Log::channel('security')->info('Acessando formulário de cadastro de cliente', [
                'user_id' => $user->ID,
                'email' => $user->EMAIL,
            ]);

            return Inertia::render('gerenciamento/ClienteForm', [
                'title' => 'Novo Cliente',
            ]);

        } catch (\Exception $e) {
            Log::channel('security')->error('Erro no ClienteController@create', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return redirect()
                ->route('clientes.index')
                ->with('error', 'Erro ao carregar formulário de cadastro.');
        }
    }

    /**
     * ✅ PROCESSA CADASTRO DE NOVO CLIENTE
     */
    public function store(ClienteRequest $request)
    {
        try {
            $user = Auth::user();
            
            Log::channel('security')->info('Tentativa de cadastro de cliente', [
                'nome' => $request->validated()['nome'],
                'email' => $request->validated()['email'],
                'user_id' => $user->ID,
                'ip' => $request->ip(),
            ]);

            $result = $this->clienteService->cadastrar($request->validated(), $request);

            if ($result['success']) {
                Log::channel('security')->info('Cliente cadastrado com sucesso', [
                    'cliente_id' => $result['cliente']->id,
                    'nome' => $result['cliente']->nome,
                    'user_id' => $user->ID,
                ]);

                // ✅ RESPOSTA PARA MODAL (JSON)
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Cliente cadastrado com sucesso!',
                        'cliente' => $result['cliente'],
                    ]);
                }

                return redirect()
                    ->route('clientes.index')
                    ->with('success', 'Cliente cadastrado com sucesso!');
            }

            // ✅ RESPOSTA DE ERRO PARA MODAL
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $result['errors'],
                    'message' => 'Falha no cadastro do cliente.',
                ], 422);
            }

            return back()
                ->withErrors($result['errors'])
                ->withInput();

        } catch (ValidationException $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $e->errors(),
                    'message' => 'Dados de entrada inválidos.',
                ], 422);
            }

            return back()
                ->withErrors($e->errors())
                ->withInput();

        } catch (\Exception $e) {
            Log::channel('security')->error('Erro no cadastro de cliente', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erro interno do sistema.',
                ], 500);
            }
            
            return back()
                ->with('error', 'Erro interno. Tente novamente.')
                ->withInput();
        }
    }

    /**
     * ✅ EXIBE DETALHES DE UM CLIENTE (FUTURO)
     */
    public function show($id)
    {
        try {
            $user = Auth::user();
            
            Log::channel('security')->info('Acessando detalhes do cliente', [
                'cliente_id' => $id,
                'user_id' => $user->ID,
            ]);

            return Inertia::render('gerenciamento/ClienteDetalhes', [
                'cliente_id' => $id,
                'message' => 'Funcionalidade em desenvolvimento',
            ]);

        } catch (\Exception $e) {
            Log::channel('security')->error('Erro no ClienteController@show', [
                'error' => $e->getMessage(),
                'cliente_id' => $id,
                'user_id' => Auth::id(),
            ]);

            return redirect()
                ->route('clientes.index')
                ->with('error', 'Cliente não encontrado.');
        }
    }

    /**
     * ✅ EXIBE FORMULÁRIO DE EDIÇÃO (FUTURO)
     */
    public function edit($id)
    {
        Log::channel('security')->info('Tentativa de acessar edição de cliente (não implementado)', [
            'cliente_id' => $id,
            'user_id' => Auth::id(),
        ]);

        return redirect()
            ->route('clientes.index')
            ->with('info', 'Funcionalidade de edição em desenvolvimento.');
    }

    /**
     * PROCESSA ATUALIZAÇÃO DE CLIENTE
     */
    public function update(ClienteRequest $request, $id)
    {
        try {
            $user = Auth::user();
            Log::channel('security')->info('Tentativa de atualização de cliente', [
                'cliente_id' => $id,
                'user_id' => $user->ID,
                'ip' => $request->ip(),
            ]);

            $result = $this->clienteService->atualizar($id, $request->validated(), $request);

            if ($result['success']) {
                Log::channel('security')->info('Cliente atualizado com sucesso', [
                    'cliente_id' => $result['cliente']->id,
                    'nome' => $result['cliente']->nome,
                    'user_id' => $user->ID,
                ]);
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Cliente atualizado com sucesso!',
                        'cliente' => $result['cliente'],
                    ]);
                }
                return redirect()->route('clientes.index')->with('success', 'Cliente atualizado com sucesso!');
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $result['errors'],
                    'message' => 'Falha na atualização do cliente.',
                ], 422);
            }
            return back()->withErrors($result['errors'])->withInput();
        } catch (ValidationException $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $e->errors(),
                    'message' => 'Dados de entrada inválidos.',
                ], 422);
            }
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::channel('security')->error('Erro na atualização de cliente', [
                'error' => $e->getMessage(),
                'cliente_id' => $id,
                'user_id' => Auth::id(),
            ]);
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erro interno do sistema.',
                ], 500);
            }
            return back()->with('error', 'Erro interno. Tente novamente.')->withInput();
        }
    }

    /**
     * ✅ PAGAR CONTA FIADA
     */
    public function pagarContaFiada($clienteId)
    {
        try {
            $user = Auth::user();
            $result = $this->clienteService->pagarContaFiada($clienteId, $user);
            if ($result['success']) {
                // Retorne um redirect Inertia para a tela de clientes
                return redirect()->route('clientes.index')->with('success', 'Conta fiada paga/deletada com sucesso!');
            }
            return redirect()->route('clientes.index')->with('error', $result['error'] ?? 'Erro ao pagar conta fiada.');
        } catch (\Exception $e) {
            \Log::error('Erro ao pagar conta fiada', ['error' => $e->getMessage()]);
            return redirect()->route('clientes.index')->with('error', 'Erro interno ao pagar conta fiada.');
        }
    }
}