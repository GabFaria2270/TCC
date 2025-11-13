<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Defina os comandos Artisan do aplicativo.
     */
    protected $commands = [
        \App\Console\Commands\PruneAuthData::class,
    ];

    /**
     * Defina a programação de tarefas do aplicativo.
     */
    protected function schedule(Schedule $schedule)
    {
        // Limpeza automática (mantém rotina existente + prune customizado)
        $schedule->command('cache:prune-stale-tags')->daily();
        $schedule->command('cache:clear')->weekly();
        // Comando customizado para limpar sessões, cache e tokens remember
        $schedule->command('auth:prune')->hourly()->withoutOverlapping();
    }

    /**
     * Registre os comandos para o aplicativo.
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
