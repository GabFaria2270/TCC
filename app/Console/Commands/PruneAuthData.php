<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PruneAuthData extends Command
{
    protected $signature = 'auth:prune
        {--session-lifetime= : Override minutos para expirar sessões (default .env/session.lifetime)}
        {--remember-max-age-days=90 : Remove tokens não usados há mais que X dias se não expirados}
        {--dry-run : Apenas mostra quantidades sem deletar}';

    protected $description = 'Remove sessões expiradas, cache vencido e tokens remember (tabela legacy ou nova remember_tokens).';

    public function handle(): int
    {
        $now = Carbon::now();
        $dry = (bool) $this->option('dry-run');

        // 1. SESSÕES (tabela sessions)
        $sessionLifetimeMinutes = $this->option('session-lifetime') !== null
            ? (int) $this->option('session-lifetime')
            : (int) config('session.lifetime');

        $sessionCutoff = $now->clone()->subMinutes($sessionLifetimeMinutes)->getTimestamp();
        $sessionsDeleted = 0;
        if (Schema::hasTable('sessions')) {
            // last_activity é unix timestamp conforme migração
            $query = DB::table('sessions')->where('last_activity', '<', $sessionCutoff);
            $sessionsCount = $query->count();
            if (!$dry && $sessionsCount) {
                $sessionsDeleted = $query->delete();
            } else {
                $sessionsDeleted = $sessionsCount; // report would-be deletions
            }
        }

        // 2. CACHE (tabela cache)
        $cacheDeleted = 0;
        if (Schema::hasTable('cache')) {
            $query = DB::table('cache')->where('expiration', '<', time());
            $cacheCount = $query->count();
            if (!$dry && $cacheCount) {
                $cacheDeleted = $query->delete();
            } else {
                $cacheDeleted = $cacheCount;
            }
        }

        // 3. REMEMBER TOKENS (duas possíveis estruturas)
        $rememberDeleted = 0;
        $maxAgeDays = (int) $this->option('remember-max-age-days');
        $ageCutoff = $now->clone()->subDays($maxAgeDays);

        // Nova tabela remember_tokens
        if (Schema::hasTable('remember_tokens')) {
            // Expira por expires_at, ou tokens muito antigos sem uso (last_used_at < ageCutoff)
            $query = DB::table('remember_tokens')
                ->where(function ($q) use ($now, $ageCutoff) {
                    $q->whereNotNull('expires_at')->where('expires_at', '<', Carbon::now())
                      ->orWhere(function ($qq) use ($ageCutoff) {
                          $qq->whereNotNull('last_used_at')->where('last_used_at', '<', $ageCutoff);
                      });
                });
            $rememberCount = $query->count();
            if (!$dry && $rememberCount) {
                $rememberDeleted = $query->delete();
            } else {
                $rememberDeleted = $rememberCount;
            }
        } elseif (Schema::hasTable('usuario') && Schema::hasColumn('usuario', 'remember_token')) {
            // Estrutura legacy: apenas limpa tokens onde existe coluna remember_token_expires_at vencida ou usuário muito antigo.
            $baseQuery = DB::table('usuario')->whereNotNull('remember_token');
            if (Schema::hasColumn('usuario', 'remember_token_expires_at')) {
                $baseQuery->where('remember_token_expires_at', '<', Carbon::now());
            } else {
                // Sem data de expiração explícita: usar idade do updated_at se existir
                if (Schema::hasColumn('usuario', 'updated_at')) {
                    $baseQuery->where('updated_at', '<', $ageCutoff);
                }
            }
            $rememberCount = $baseQuery->count();
            if (!$dry && $rememberCount) {
                $rememberDeleted = $baseQuery->update([
                    'remember_token' => null,
                    // Opcionalmente também limpar expires
                    'remember_token_expires_at' => null,
                ]);
            } else {
                $rememberDeleted = $rememberCount;
            }
        }

        $this->info('Resumo prune:');
        $this->line('  Sessões expiradas removidas: ' . $sessionsDeleted);
        $this->line('  Entradas de cache vencidas: ' . $cacheDeleted);
        $this->line('  Tokens remember limpos:     ' . $rememberDeleted);
        if ($dry) {
            $this->comment('Dry-run: nenhuma exclusão executada.');
        }

        return Command::SUCCESS;
    }
}
