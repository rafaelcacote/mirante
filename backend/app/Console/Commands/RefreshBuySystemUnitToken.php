<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

class RefreshBuySystemUnitToken extends Command
{
    protected $signature = 'buysystem:refresh-unit-token';

    protected $description = 'Renova o BUYSYSTEM_UNIT_TOKEN chamando a API da BuySystem e atualiza o .env';

    public function handle(): int
    {
        $this->info('🔄 Buscando novo UNIT token da BuySystem...');

        try {
            // SSL: usa cacert.pem do WAMP no Windows se disponível
            $certPath = 'C:\\wamp64\\bin\\php\\php8.3.14\\extras\\ssl\\cacert.pem';
            $sslOptions = file_exists($certPath) ? ['verify' => $certPath] : ['verify' => true];

            $response = Http::timeout(30)
                ->withOptions($sslOptions)
                ->post('https://api.buysystem.com.br/scripts/gerar_token_admin.php');

            if (! $response->successful()) {
                $this->error('❌ Erro ao buscar token: HTTP '.$response->status());
                $this->error('Resposta: '.$response->body());

                return self::FAILURE;
            }

            // Remove BOM (\xEF\xBB\xBF) que a API pode enviar antes do JSON
            $body = ltrim(trim($response->body()), "\xEF\xBB\xBF");

            if (empty($body)) {
                $this->error('❌ Resposta vazia retornada pela API');

                return self::FAILURE;
            }

            // A API retorna JSON: {"success":true,"data":{"bootstrap_token":"bs_init_...","expires_in_minutes":10}}
            $decoded = json_decode($body, true);
            if (json_last_error() === JSON_ERROR_NONE && isset($decoded['data']['bootstrap_token'])) {
                $newToken = trim((string) $decoded['data']['bootstrap_token']);
            } else {
                // Fallback: resposta é o token puro (formato antigo)
                $newToken = $body;
            }

            if (empty($newToken) || str_starts_with($newToken, '{')) {
                $this->error('❌ Não foi possível extrair o token da resposta da API');
                $this->error('Resposta: '.$body);

                return self::FAILURE;
            }

            $this->info('✅ Novo UNIT token: '.substr($newToken, 0, 30).'...');

            // Atualiza o .env — usa regex multiline para cobrir valores que se espalharam por mais de 1 linha
            $envPath = base_path('.env');
            if (! File::exists($envPath)) {
                $this->error('❌ Arquivo .env não encontrado em: '.$envPath);

                return self::FAILURE;
            }

            // Remove BOM do .env se houver
            $envContent = ltrim(File::get($envPath), "\xEF\xBB\xBF");

            // Regex que captura a chave + tudo até a próxima linha que começa com letra maiúscula ou fim do arquivo
            if (preg_match('/^BUYSYSTEM_UNIT_TOKEN=/m', $envContent)) {
                // Remove a linha antiga (pode ser multiline por causa de JSON com quebras)
                $envContent = preg_replace('/^BUYSYSTEM_UNIT_TOKEN=.*/m', "BUYSYSTEM_UNIT_TOKEN={$newToken}", $envContent);
            } else {
                $envContent .= "\nBUYSYSTEM_UNIT_TOKEN={$newToken}\n";
            }

            File::put($envPath, $envContent);

            // Limpa o cache de config para o Laravel recarregar o .env
            \Illuminate\Support\Facades\Artisan::call('config:clear');

            $this->info('✅ Token salvo no .env com sucesso!');
            $this->warn('⚠️  O token UNIT expira em 10 minutos. Configure renovação automática.');
            $this->line('');
            $this->line('💡 Para renovar automaticamente a cada 9 minutos no Windows:');
            $this->line('   Agendador de Tarefas → a cada 9 min → php artisan buysystem:refresh-unit-token');

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('❌ Erro ao renovar token: '.$e->getMessage());
            if ($this->option('verbose')) {
                $this->error($e->getTraceAsString());
            }

            return self::FAILURE;
        }
    }
}
