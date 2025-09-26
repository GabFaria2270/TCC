<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * Controller base do Laravel
 * Classe abstrata herdada por todos os controllers
 * 
 * Atualmente vazia (padrão Laravel 11)
 * Pode ser usada para adicionar métodos comuns:
 * - Helpers de resposta
 * - Validações comuns
 * - Logs padronizados
 */
abstract class Controller
{
    use AuthorizesRequests;
    // Métodos comuns podem ser adicionados aqui
    // Exemplo: protected function successResponse(), logAction(), etc.
}
