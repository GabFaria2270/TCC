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
        // ...adicione comandos personalizados aqui...
    ];

    /**
     * Defina a programação de tarefas do aplicativo.
     */
    protected function schedule(Schedule $schedule)
    {
        // Limpeza automática do cache e sessões
        $schedule->command('cache:prune-stale-tags')->daily();
        $schedule->command('cache:clear')->weekly();
        $schedule->command('session:prune')->daily();
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
