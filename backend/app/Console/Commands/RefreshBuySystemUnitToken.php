<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

class RefreshBuySystemUnitToken extends Command
{
    protected $signature = 'buysystem:refresh-unit-token';

    protected $description = 'Valida fluxo BuySystem (gerar-token-init + ativar) e atualiza config de init no .env';

    public function handle(): int
    {
        $this->info('Atualizando configuracao do fluxo BuySystem (init + ativar)...');

        try {
            $certPath = 'C:\\wamp64\\bin\\php\\php8.3.14\\extras\\ssl\\cacert.pem';
            $sslOptions = file_exists($certPath) ? ['verify' => $certPath] : ['verify' => true];

            $tokenType = (string) config('buysystem.token_type', 'site');
            $pdvId = (int) config('buysystem.pdv_id', 0);
            $userId = (int) config('buysystem.init_user_id', 0);
            $minutes = (int) config('buysystem.init_minutes', 120);

            if ($pdvId <= 0 || $userId <= 0 || $minutes <= 0) {
                $this->error('Configuracao invalida. Defina BUYSYSTEM_PDV_ID, BUYSYSTEM_INIT_USER_ID e BUYSYSTEM_INIT_MINUTES no .env');
                return self::FAILURE;
            }

            $initResponse = Http::timeout(30)
                ->withOptions($sslOptions)
                ->acceptJson()
                ->post('https://api.buysystem.com.br/scripts/gerar-token-init', [
                    'bs_tipo' => $tokenType,
                    'pdv_id' => $pdvId,
                    'user_id' => $userId,
                    'minutes' => $minutes,
                ]);

            if (! $initResponse->successful()) {
                $this->error('Falha ao gerar bootstrap_token: HTTP '.$initResponse->status());
                $this->error('Resposta: '.$initResponse->body());
                return self::FAILURE;
            }

            $initJson = json_decode(ltrim($initResponse->body(), "\xEF\xBB\xBF"), true);
            $bootstrapToken = (string) ($initJson['data']['bootstrap_token'] ?? '');
            if ($bootstrapToken === '') {
                $this->error('Resposta sem bootstrap_token no endpoint gerar-token-init');
                return self::FAILURE;
            }

            $baseUrl = rtrim((string) config('buysystem.base_url', 'https://api.buysystem.com.br'), '/');
            $hasV2Prefix = str_ends_with($baseUrl, '/v2');
            $activationCandidates = $hasV2Prefix
                ? [$baseUrl.'/auth/ativar']
                : [$baseUrl.'/auth/ativar', $baseUrl.'/v2/auth/ativar'];

            $activateResponse = null;
            $lastError = null;
            foreach ($activationCandidates as $activationUrl) {
                try {
                    $activateResponse = Http::timeout(30)
                        ->withOptions($sslOptions)
                        ->acceptJson()
                        ->withToken($bootstrapToken)
                        ->post($activationUrl, []);
                    if ($activateResponse->successful()) {
                        $lastError = null;
                        break;
                    }
                } catch (\Throwable $e) {
                    $lastError = $e;
                }
            }

            if (! $activateResponse || ! $activateResponse->successful()) {
                if ($lastError instanceof \Throwable) {
                    $this->error('Erro ao ativar unidade: '.$lastError->getMessage());
                }
                $this->error('Falha ao ativar unidade: HTTP '.$activateResponse->status());
                $this->error('Resposta: '.$activateResponse->body());
                return self::FAILURE;
            }

            $envPath = base_path('.env');
            if (! File::exists($envPath)) {
                $this->error('Arquivo .env nao encontrado em: '.$envPath);
                return self::FAILURE;
            }

            $envContent = ltrim(File::get($envPath), "\xEF\xBB\xBF");
            $envContent = $this->upsertEnv($envContent, 'BUYSYSTEM_BASE_URL', $baseUrl);
            $envContent = $this->upsertEnv($envContent, 'BUYSYSTEM_TOKEN_TYPE', $tokenType);
            $envContent = $this->upsertEnv($envContent, 'BUYSYSTEM_PDV_ID', (string) $pdvId);
            $envContent = $this->upsertEnv($envContent, 'BUYSYSTEM_INIT_USER_ID', (string) $userId);
            $envContent = $this->upsertEnv($envContent, 'BUYSYSTEM_INIT_MINUTES', (string) $minutes);

            File::put($envPath, $envContent);

            \Illuminate\Support\Facades\Artisan::call('config:clear');

            $activateJson = json_decode(ltrim($activateResponse->body(), "\xEF\xBB\xBF"), true);
            $accessToken = (string) ($activateJson['data']['access_token'] ?? '');
            $expiresInHours = (int) ($activateJson['data']['expires_in_hours'] ?? 0);

            $this->info('Fluxo validado com sucesso.');
            $this->line('bootstrap_token: '.substr($bootstrapToken, 0, 25).'...');
            $this->line('access_token: '.($accessToken !== '' ? substr($accessToken, 0, 25).'...' : 'nao retornado'));
            if ($expiresInHours > 0) {
                $this->line('access_token expira em aprox. '.$expiresInHours.' hora(s)');
            }

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Erro ao atualizar fluxo BuySystem: '.$e->getMessage());
            if ($this->option('verbose')) {
                $this->error($e->getTraceAsString());
            }

            return self::FAILURE;
        }
    }

    private function upsertEnv(string $content, string $key, string $value): string
    {
        $line = $key.'='.$value;
        if (preg_match('/^'.preg_quote($key, '/').'=.*/m', $content)) {
            return (string) preg_replace('/^'.preg_quote($key, '/').'=.*/m', $line, $content);
        }

        return rtrim($content).PHP_EOL.$line.PHP_EOL;
    }
}
