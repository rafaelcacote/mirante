<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class BuySystemClient
{
    private const CACHE_KEY = 'buysystem.token_state';
    private const LOCK_KEY = 'buysystem.token.lock';
    private const RENEW_WINDOW_SECONDS = 120;
    private const INIT_ENDPOINT = 'https://api.buysystem.com.br/scripts/gerar-token-init';

    private function baseUrlHasV2Prefix(): bool
    {
        $baseUrl = rtrim((string) config('buysystem.base_url', ''), '/');
        return str_ends_with($baseUrl, '/v2');
    }

    public function get(string $endpoint, ?string $operatorSession = null): array
    {
        return $this->authorizedRequest('GET', $endpoint, [], $operatorSession);
    }

    public function post(string $endpoint, array $payload = [], ?string $operatorSession = null): array
    {
        return $this->authorizedRequest('POST', $endpoint, $payload, $operatorSession);
    }

    /**
     * @param  array<int, string>  $candidates
     */
    public function firstSuccessfulGet(array $candidates, ?string $operatorSession = null): array
    {
        $errors = [];
        foreach ($candidates as $endpoint) {
            try {
                return $this->get($endpoint, $operatorSession);
            } catch (RuntimeException $e) {
                $errors[] = $e->getMessage();
            }
        }

        throw new RuntimeException('Nenhum endpoint respondeu com sucesso: '.implode(' | ', $errors));
    }

    /**
     * @param  array<int, string>  $candidates
     */
    public function firstSuccessfulPost(array $candidates, array $payload = [], ?string $operatorSession = null): array
    {
        $errors = [];
        foreach ($candidates as $endpoint) {
            try {
                return $this->post($endpoint, $payload, $operatorSession);
            } catch (RuntimeException $e) {
                $errors[] = $e->getMessage();
            }
        }

        throw new RuntimeException('Nenhum endpoint respondeu com sucesso: '.implode(' | ', $errors));
    }

    public function regenerateToken(): array
    {
        Cache::forget(self::CACHE_KEY);
        return $this->generateInitialToken();
    }

    /**
     * Retorna status do token atual sem forçar regeneração
     * (útil para diagnóstico — não desperdiça o UNIT token)
     *
     * @return array<string, mixed>
     */
    public function getTokenStatus(): array
    {
        $accessToken = $this->ensureValidAccessToken();
        $state = $this->getTokenState();

        return [
            'has_token' => $accessToken !== '',
            'token_preview' => $accessToken !== '' ? substr($accessToken, 0, 20).'...' : null,
            'expires_at' => isset($state['expires_at']) ? date('Y-m-d H:i:s', (int) $state['expires_at']) : null,
            'expires_at_ts' => $state['expires_at'] ?? null,
        ];
    }

    private function authorizedRequest(string $method, string $endpoint, array $payload = [], ?string $operatorSession = null): array
    {
        try {
            $accessToken = $this->ensureValidAccessToken();
            return $this->request($method, $endpoint, $payload, $accessToken, $operatorSession);
        } catch (RuntimeException $error) {
            if (! $this->isAuthErrorMessage($error->getMessage())) {
                throw $error;
            }

            Cache::forget(self::CACHE_KEY);

            $accessToken = $this->ensureValidAccessToken();
            return $this->request($method, $endpoint, $payload, $accessToken, $operatorSession);
        }
    }

    private function ensureValidAccessToken(): string
    {
        $state = $this->getTokenState();
        $now = time();
        $accessToken = (string) ($state['access_token'] ?? '');
        $expiresAt = (int) ($state['expires_at'] ?? 0);

        if ($accessToken !== '' && $now < ($expiresAt - self::RENEW_WINDOW_SECONDS)) {
            return $accessToken;
        }

        return $this->withTokenLock(function (): string {
            $state = $this->getTokenState();
            $now = time();
            $accessToken = (string) ($state['access_token'] ?? '');
            $expiresAt = (int) ($state['expires_at'] ?? 0);
            $refreshToken = (string) ($state['refresh_token'] ?? '');

            if ($accessToken !== '' && $now < ($expiresAt - self::RENEW_WINDOW_SECONDS)) {
                return $accessToken;
            }

            if ($refreshToken !== '') {
                try {
                    $refreshed = $this->refreshAccessToken($state);
                    return (string) $refreshed['access_token'];
                } catch (RuntimeException) {
                    Cache::forget(self::CACHE_KEY);
                }
            }

            $generated = $this->generateInitialToken();
            return (string) $generated['access_token'];
        });
    }

    /**
     * @param  callable(): string  $callback
     */
    private function withTokenLock(callable $callback): string
    {
        $lock = Cache::lock(self::LOCK_KEY, 10);

        try {
            return $lock->block(5, $callback);
        } finally {
            optional($lock)->release();
        }
    }

    private function generateInitialToken(): array
    {
        $tokenType = trim((string) config('buysystem.token_type', 'site'));
        $pdvId = (int) config('buysystem.pdv_id', 0);
        $userId = (int) config('buysystem.init_user_id', 0);
        $minutes = (int) config('buysystem.init_minutes', 120);

        if ($tokenType === '' || $pdvId <= 0 || $userId <= 0 || $minutes <= 0) {
            throw new RuntimeException('Configuração inválida para token init. Ajuste BUYSYSTEM_TOKEN_TYPE, BUYSYSTEM_PDV_ID, BUYSYSTEM_INIT_USER_ID e BUYSYSTEM_INIT_MINUTES no .env');
        }

        try {
            $bootstrapResponse = Http::timeout(30)
                ->acceptJson()
                ->post(self::INIT_ENDPOINT, [
                    'bs_tipo' => $tokenType,
                    'pdv_id' => $pdvId,
                    'user_id' => $userId,
                    'minutes' => $minutes,
                ]);

            if (! $bootstrapResponse->successful()) {
                throw new RuntimeException('Falha ao gerar bootstrap_token: HTTP '.$bootstrapResponse->status());
            }

            $bootstrapJson = $this->parseResponseJson($bootstrapResponse);
            $bootstrapData = $bootstrapJson['data'] ?? [];
            if (! is_array($bootstrapData)) {
                $bootstrapData = [];
            }

            $bootstrapToken = (string) ($bootstrapData['bootstrap_token'] ?? '');
            if ($bootstrapToken === '') {
                throw new RuntimeException('Resposta sem bootstrap_token ao chamar /scripts/gerar-token-init');
            }

            $hasV2Prefix = $this->baseUrlHasV2Prefix();
            $activationCandidates = $hasV2Prefix
                ? ['/auth/ativar']
                : ['/auth/ativar', '/v2/auth/ativar'];

            $lastError = null;
            foreach ($activationCandidates as $activationEndpoint) {
                try {
                    $response = $this->rawRequest('POST', $activationEndpoint, [], $bootstrapToken);
                    $lastError = null;
                    break;
                } catch (RuntimeException $e) {
                    $lastError = $e;
                }
            }

            if (! isset($response)) {
                throw $lastError ?? new RuntimeException('Falha ao ativar unidade (auth/ativar)');
            }

            $data = $this->extractAuthData($this->parseResponseJson($response));
            $data['bootstrap_token'] = $bootstrapToken;
            $data['bootstrap_expires_in_minutes'] = (int) ($bootstrapData['expires_in_minutes'] ?? $minutes);

            // Fallback legado em ambiente antigo: gera access/refresh com token UNIT.
            if (empty($data['refresh_token'])) {
                $legacyUnitToken = trim((string) config('buysystem.unit_token'));
                if ($legacyUnitToken !== '') {
                    $legacyResponse = $this->rawRequest('POST', '/auth/token_site', [
                    'tipo' => (string) config('buysystem.token_type', 'site'),
                    'access_minutes' => (int) config('buysystem.access_minutes', 60),
                    'refresh_days' => (int) config('buysystem.refresh_days', 30),
                    'descricao' => (string) config('buysystem.token_description', 'WEB ADMIN'),
                    ], $legacyUnitToken);
                    $legacyData = $this->extractAuthData($this->parseResponseJson($legacyResponse));
                    $data['refresh_token'] = (string) ($legacyData['refresh_token'] ?? '');
                }
            }

            return $this->storeTokenData($data);
        } catch (RuntimeException $e) {
            if ($this->isAuthErrorMessage($e->getMessage())) {
                throw new RuntimeException(
                    'Não foi possível renovar o token da BuySystem pelo fluxo init/ativar. '.
                    'Verifique credenciais e payload de /scripts/gerar-token-init. Erro original: '.$e->getMessage()
                );
            }
            throw $e;
        }
    }

    /**
     * @param  array<string, mixed>  $state
     */
    private function refreshAccessToken(array $state): array
    {
        $refreshToken = (string) ($state['refresh_token'] ?? '');
        if ($refreshToken === '') {
            return $this->generateInitialToken();
        }

        $authCandidates = array_values(array_filter([
            (string) ($state['access_token'] ?? ''),
            trim((string) config('buysystem.unit_token')),
        ]));

        $lastError = null;
        $hasV2Prefix = $this->baseUrlHasV2Prefix();
        $refreshEndpoints = $hasV2Prefix
            ? ['/auth/refresh']
            : ['/v2/auth/refresh', '/auth/refresh'];
        foreach ($authCandidates as $candidate) {
            foreach ($refreshEndpoints as $refreshEndpoint) {
                try {
                    $response = $this->rawRequest('POST', $refreshEndpoint, [
                        'refresh_token' => $refreshToken,
                    ], $candidate);

                    $data = $this->extractAuthData($this->parseResponseJson($response));
                    if (empty($data['refresh_token'])) {
                        // Algumas respostas de refresh podem não retornar refresh_token.
                        // Mantemos o refresh token anterior para manter o ciclo consistente.
                        $data['refresh_token'] = $refreshToken;
                    }
                    return $this->storeTokenData($data);
                } catch (RuntimeException $error) {
                    $lastError = $error;
                    if (! $this->isAuthErrorMessage($error->getMessage())) {
                        throw $error;
                    }
                }
            }
        }

        try {
            foreach ($refreshEndpoints as $refreshEndpoint) {
                $response = $this->rawRequest('POST', $refreshEndpoint, [
                    'refresh_token' => $refreshToken,
                ]);
                $data = $this->extractAuthData($this->parseResponseJson($response));
                if (empty($data['refresh_token'])) {
                    $data['refresh_token'] = $refreshToken;
                }
                return $this->storeTokenData($data);
            }

            throw new RuntimeException('Nenhum endpoint de refresh respondeu com sucesso');
        } catch (RuntimeException $error) {
            if ($this->isAuthErrorMessage($error->getMessage())) {
                Cache::forget(self::CACHE_KEY);
                return $this->generateInitialToken();
            }

            throw $lastError ?? $error;
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function request(string $method, string $endpoint, array $payload = [], ?string $bearer = null, ?string $operatorSession = null): array
    {
        $response = $this->rawRequest($method, $endpoint, $payload, $bearer, $operatorSession);
        return $this->parseResponseJson($response);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function rawRequest(string $method, string $endpoint, array $payload = [], ?string $bearer = null, ?string $operatorSession = null): Response
    {
        $baseUrl = rtrim((string) config('buysystem.base_url'), '/');
        // A BuySystem usa `?evento_id=...` / `?pdv_id=...` em alguns endpoints.
        // Para evitar qualquer perda/interpretação do query string dentro da URL,
        // separe a query do endpoint e passe como parâmetros do GET.
        $path = $endpoint;
        if (str_contains($endpoint, '?')) {
            [$path, $queryString] = explode('?', $endpoint, 2);
            $parsedQuery = [];
            parse_str($queryString, $parsedQuery);
            if (is_array($parsedQuery) && $parsedQuery !== []) {
                $payload = array_merge($payload, $parsedQuery);
            }
        }

        $url = $baseUrl.'/'.ltrim($path, '/');

        // Configuração SSL: tenta usar cacert.pem do WAMP no Windows, caso php.ini não esteja configurado
        $certPath = 'C:\\wamp64\\bin\\php\\php8.3.14\\extras\\ssl\\cacert.pem';
        $sslOptions = file_exists($certPath)
            ? ['verify' => $certPath]
            : ['verify' => true]; // Em produção usa o certificado do sistema

        $request = Http::timeout(30)->acceptJson()->withOptions($sslOptions);

        if ($bearer !== null && $bearer !== '') {
            $request = $request->withToken($bearer);
        }

        if ($operatorSession !== null && $operatorSession !== '') {
            $request = $request->withHeader('Operator-Session', $operatorSession);
        }

        $response = match (strtoupper($method)) {
            'POST' => $request->post($url, $payload),
            default => $request->get($url, $payload),
        };

        if ($response->successful()) {
            return $response;
        }

        // A API BuySystem retorna BOM (\xEF\xBB\xBF) antes do JSON
        // Precisamos remover o BOM antes de parsear o JSON para extrair a mensagem de erro
        $rawBody = ltrim($response->body(), "\xEF\xBB\xBF");
        $jsonBody = json_decode($rawBody, true);

        $errorMessage = (string) ($jsonBody['message']
            ?? $jsonBody['errorMessage']
            ?? $rawBody
            ?? ('HTTP '.$response->status()));

        throw new RuntimeException(trim($errorMessage) !== '' ? $errorMessage : ('HTTP '.$response->status()));
    }

    /**
     * Extrai JSON da resposta removendo BOM que a API BuySystem pode enviar
     *
     * @return array<string, mixed>
     */
    private function parseResponseJson(Response $response): array
    {
        $rawBody = ltrim($response->body(), "\xEF\xBB\xBF");
        $decoded = json_decode($rawBody, true);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * @return array<string, mixed>
     */
    private function extractAuthData(array $response): array
    {
        // Caso 1: resposta de /auth/token_site → {success, data: {access_token, refresh_token, ...}}
        // Caso 2: resposta de /auth/refresh    → {success, data: {access_token, refresh_token, ...}}
        $data = $response['data'] ?? $response;
        if (! is_array($data)) {
            throw new RuntimeException('Resposta inválida ao gerar token: campo "data" não é array');
        }

        // Garante que o campo access_token existe
        if (empty($data['access_token'])) {
            throw new RuntimeException(
                'Resposta de autenticação sem access_token. Campos recebidos: '.implode(', ', array_keys($data))
            );
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function storeTokenData(array $data): array
    {
        $accessToken = (string) ($data['access_token'] ?? '');
        $refreshToken = (string) ($data['refresh_token'] ?? '');
        if ($accessToken === '') {
            throw new RuntimeException('Resposta de autenticação sem access_token');
        }

        // Expiração pode vir em formatos diferentes:
        // - V1/legado: expires_in_minutes
        // - V2: expires_in_hours e/ou expires_at ("YYYY-MM-DD HH:MM:SS")
        $accessMinutes = null;
        if (array_key_exists('expires_in_minutes', $data)) {
            $accessMinutes = (int) $data['expires_in_minutes'];
        }

        $accessHours = null;
        if (array_key_exists('expires_in_hours', $data)) {
            $accessHours = (int) $data['expires_in_hours'];
        }

        $expiresAt = 0;
        if (array_key_exists('expires_at', $data) && ! empty($data['expires_at'])) {
            // Alguns retornos são "2026-03-18 16:21:37" (sem T)
            $raw = (string) $data['expires_at'];
            $iso = str_replace(' ', 'T', $raw);
            $ts = strtotime($iso);
            if ($ts !== false) {
                $expiresAt = time() + max(0, ((int) $ts) - time());
            }
        }

        if ($accessMinutes !== null) {
            $expiresAt = time() + ($accessMinutes * 60);
        } elseif ($accessHours !== null) {
            $expiresAt = time() + ($accessHours * 60 * 60);
        } elseif ($expiresAt === 0) {
            // fallback
            $accessMinutes = (int) config('buysystem.access_minutes', 60);
            $expiresAt = time() + ($accessMinutes * 60);
        }

        $refreshDays = (int) ($data['refresh_expires_in_days'] ?? config('buysystem.refresh_days', 30));

        $state = [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_at' => $expiresAt,
            'refresh_expires_at' => time() + ($refreshDays * 24 * 60 * 60),
            'bootstrap_token' => (string) ($data['bootstrap_token'] ?? ''),
            'bootstrap_expires_in_minutes' => (int) ($data['bootstrap_expires_in_minutes'] ?? 0),
        ];

        Cache::forever(self::CACHE_KEY, $state);

        return $state;
    }

    /**
     * @return array<string, mixed>
     */
    private function getTokenState(): array
    {
        $state = Cache::get(self::CACHE_KEY, []);
        return is_array($state) ? $state : [];
    }

    private function isAuthErrorMessage(string $message): bool
    {
        $msg = mb_strtolower($message);
        return str_contains($msg, 'token')
            || str_contains($msg, 'inativo')
            || str_contains($msg, 'inactive')
            || str_contains($msg, 'expirado')
            || str_contains($msg, 'expired')
            || str_contains($msg, 'unauthorized')
            || str_contains($msg, 'não autorizado')
            || str_contains($msg, 'nao autorizado')
            || str_contains($msg, '401');
    }
}
