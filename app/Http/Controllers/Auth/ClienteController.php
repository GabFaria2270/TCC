<?php
// filepath: c:\Users\User\Desktop\TCC\app\Http\Controllers\Auth\ClienteController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ClienteController extends Controller
{
    /**
     * ✅ LISTA TODOS OS CLIENTES
     */
    public function index()
    {
        try {
            $user = Auth::user();
            
            Log::channel('security')->info('Acessando lista de clientes', [
                'user_id' => $user->ID, // ✅ CORRIGIDO: ID maiúsculo
                'email' => $user->EMAIL,
                'timestamp' => now(),
            ]);
            
            // Por enquanto retorna array vazio até conectar com banco
            $clientes = [];
            
            return Inertia::render('gerenciamento/Clientes', [
                'clientes' => $clientes,
            ]);

        } catch (\Exception $e) {
            Log::channel('security')->error('Erro no ClienteController@index', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(), // ✅ CORRIGIDO: usando Auth::id()
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'timestamp' => now(),
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
                'user_id' => $user->ID, // ✅ CORRIGIDO: ID maiúsculo
                'email' => $user->EMAIL,
                'timestamp' => now(),
            ]);

            return Inertia::render('gerenciamento/ClienteForm', [
                'title' => 'Novo Cliente',
            ]);

        } catch (\Exception $e) {
            Log::channel('security')->error('Erro no ClienteController@create', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(), // ✅ CORRIGIDO: usando Auth::id()
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'timestamp' => now(),
            ]);

            return redirect()
                ->route('clientes.index')
                ->with('error', 'Erro ao carregar formulário de cadastro.');
        }
    }

    /**
     * ✅ PROCESSA CADASTRO DE NOVO CLIENTE
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Validação básica seguindo padrão do projeto (similar ao UsuarioRequest)
            $validatedData = $request->validate([
                'nome' => 'required|string|max:100|regex:/^[A-Za-zÀ-ÿ\s]+$/',
                'email' => 'required|email|max:150',
                'telefone' => 'nullable|string|max:20',
                'saldo_inicial' => 'nullable|numeric|min:0|max:999999.99',
            ], [
                'nome.required' => 'O nome do cliente é obrigatório.',
                'nome.regex' => 'O nome deve conter apenas letras e espaços.',
                'nome.max' => 'O nome não pode ter mais que 100 caracteres.',
                'email.required' => 'O e-mail é obrigatório.',
                'email.email' => 'Digite um e-mail válido.',
                'email.max' => 'O e-mail não pode ter mais que 150 caracteres.',
                'telefone.max' => 'O telefone não pode ter mais que 20 caracteres.',
                'saldo_inicial.numeric' => 'O saldo inicial deve ser um número válido.',
                'saldo_inicial.min' => 'O saldo inicial não pode ser negativo.',
                'saldo_inicial.max' => 'O saldo inicial é muito alto.',
            ]);

            // Log da tentativa (seguindo padrão de segurança do projeto)
            Log::channel('security')->info('Tentativa de cadastro de cliente', [
                'nome' => $validatedData['nome'],
                'email' => $validatedData['email'],
                'user_id' => $user->ID, // ✅ CORRIGIDO: ID maiúsculo
                'user_email' => $user->EMAIL,
                'ip' => $request->ip(),
                'user_agent' => substr($request->userAgent(), 0, 200),
                'timestamp' => now(),
            ]);

            // Por enquanto simula sucesso até conectar com banco
            // TODO: Implementar salvamento real no banco de dados usando models
            
            Log::channel('security')->info('Cliente cadastrado com sucesso (simulado)', [
                'nome' => $validatedData['nome'],
                'email' => $validatedData['email'],
                'user_id' => $user->ID, // ✅ CORRIGIDO: ID maiúsculo
                'timestamp' => now(),
            ]);

            // ✅ IMPORTANTE: Como é um modal, retornar JSON ao invés de redirect
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Cliente cadastrado com sucesso! (simulado até implementar banco)',
                    'success' => true
                ]);
            }

            return redirect()
                ->route('clientes.index')
                ->with('success', 'Cliente cadastrado com sucesso! (simulado até implementar banco)');

        } catch (ValidationException $e) {
            // Log de erro de validação (seguindo padrão do projeto)
            Log::channel('security')->warning('Erro de validação no cadastro de cliente', [
                'nome' => $request->nome ?? 'N/A',
                'email' => $request->email ?? 'N/A',
                'user_id' => Auth::id(), // ✅ CORRIGIDO: usando Auth::id()
                'errors' => $e->errors(),
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);

            // ✅ Para requisições AJAX/Inertia, retorna JSON
            if ($request->expectsJson()) {
                return response()->json([
                    'errors' => $e->errors(),
                    'message' => 'Dados inválidos'
                ], 422);
            }

            return back()
                ->withErrors($e->errors())
                ->withInput();

        } catch (\Exception $e) {
            // Log de erro do sistema (seguindo padrão do projeto)
            Log::channel('security')->error('Erro no sistema de cadastro de cliente', [
                'nome' => $request->nome ?? 'N/A',
                'email' => $request->email ?? 'N/A',
                'user_id' => Auth::id(), // ✅ CORRIGIDO: usando Auth::id()
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);
            
            // ✅ Para requisições AJAX/Inertia, retorna JSON
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Erro interno. Tente novamente.',
                    'success' => false
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
                'user_id' => $user->ID, // ✅ CORRIGIDO: ID maiúsculo
                'timestamp' => now(),
            ]);

            return Inertia::render('gerenciamento/ClienteDetalhes', [
                'cliente_id' => $id,
                'message' => 'Funcionalidade em desenvolvimento',
            ]);

        } catch (\Exception $e) {
            Log::channel('security')->error('Erro no ClienteController@show', [
                'error' => $e->getMessage(),
                'cliente_id' => $id,
                'user_id' => Auth::id(), // ✅ CORRIGIDO: usando Auth::id()
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'timestamp' => now(),
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
            'user_id' => Auth::id(), // ✅ CORRIGIDO: usando Auth::id()
            'timestamp' => now(),
        ]);

        return redirect()
            ->route('clientes.index')
            ->with('info', 'Funcionalidade de edição em desenvolvimento.');
    }

    /**
     * ✅ PROCESSA ATUALIZAÇÃO (FUTURO)
     */
    public function update(Request $request, $id)
    {
        Log::channel('security')->info('Tentativa de atualizar cliente (não implementado)', [
            'cliente_id' => $id,
            'user_id' => Auth::id(), // ✅ CORRIGIDO: usando Auth::id()
            'timestamp' => now(),
        ]);

        return redirect()
            ->route('clientes.index')
            ->with('info', 'Funcionalidade de atualização em desenvolvimento.');
    }
}