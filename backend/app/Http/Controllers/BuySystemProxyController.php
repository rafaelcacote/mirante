<?php

namespace App\Http\Controllers;

use App\Services\BuySystemClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class BuySystemProxyController extends Controller
{
    public function __construct(private readonly BuySystemClient $client) {}

    // =========================================================================
    // 03 - CATÁLOGO (V2)
    // =========================================================================

    public function events(Request $request): JsonResponse
    {
        $query = array_filter([
            'pdv_id' => $request->query('pdv_id', config('buysystem.pdv_id')),
        ]);

        $suffix = $query !== [] ? '?'.http_build_query($query) : '';
        return $this->handle(fn () => $this->client->get('/eventos'.$suffix));
    }

    public function eventDetail(Request $request, string $eventId): JsonResponse
    {
        $query = array_filter([
            // API BuySystem V2 espera `evento_id` no endpoint /eventos/detalhar
            'evento_id' => $eventId,
            'pdv_id' => $request->query('pdv_id', config('buysystem.pdv_id')),
        ]);

        $suffix = '?'.http_build_query($query);
        return $this->handle(fn () => $this->client->get('/eventos/detalhar'.$suffix));
    }

    public function eventSessions(Request $request, string $eventId): JsonResponse
    {
        // Mantém candidatos V1 como fallback até confirmar estrutura V2 de sessões
        $pdvId = $this->resolvePdvId($request);
        $candidates = [
            "/eventos/{$pdvId}/{$eventId}/setores",
            "/eventos/{$pdvId}/{$eventId}/horarios",
            "/eventos/{$pdvId}/{$eventId}/sessoes",
            "/setores/{$pdvId}/{$eventId}",
        ];

        return $this->handle(fn () => $this->client->firstSuccessfulGet($candidates));
    }

    public function eventTickets(Request $request, string $eventId): JsonResponse
    {
        $query = array_filter([
            'evento_id' => $eventId,
            'pdv_id'    => $request->query('pdv_id', config('buysystem.pdv_id')),
        ]);

        $suffix = '?'.http_build_query($query);
        return $this->handle(fn () => $this->client->get('/ingressos'.$suffix));
    }

    /**
     * Proxy de imagens para evitar bloqueios/hotlink de CDNs.
     * Uso: `/api/buysystem/image?path=/685c155291c98.png`
     */
    public function image(Request $request)
    {
        $path = (string) $request->query('path', '');

        // Normaliza para iniciar com "/"
        $path = '/'.ltrim($path, '/');
        if ($path === '/' || str_contains($path, '..')) {
            return response()->json(['message' => 'Path invalido'], 422);
        }

        $host = 'img.buysystem.com.br';
        $url = 'https://'.$host.$path;

        try {
            $resp = Http::timeout(30)->get($url);
        } catch (\Throwable) {
            return response()->json(['message' => 'Falha ao buscar imagem'], 502);
        }

        $contentType = $resp->header('content-type') ?: 'application/octet-stream';

        return response($resp->body(), $resp->status(), [
            'Content-Type' => $contentType,
            'Cache-Control' => 'public, max-age=300',
        ]);
    }

    public function catalogPreload(Request $request): JsonResponse
    {
        $query = array_filter([
            'pdv_id' => $request->query('pdv_id', config('buysystem.pdv_id')),
        ]);

        $suffix = $query !== [] ? '?'.http_build_query($query) : '';
        return $this->handle(fn () => $this->client->get('/catalogo/preload'.$suffix));
    }

    // =========================================================================
    // 02 - OPERADORES
    // =========================================================================

    public function listarOperadores(): JsonResponse
    {
        return $this->handle(fn () => $this->client->get('/operadores'));
    }

    public function autenticarOperador(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'senha' => 'required|string',
        ]);

        return $this->handle(fn () => $this->client->post('/operadores/autenticar', [
            'email' => $request->input('email'),
            'senha' => $request->input('senha'),
        ]));
    }

    public function sessaoOperador(Request $request): JsonResponse
    {
        $operatorSession = $this->resolveOperatorSession($request);
        return $this->handle(fn () => $this->client->get('/operadores/me', $operatorSession));
    }

    public function logoutOperador(Request $request): JsonResponse
    {
        $operatorSession = $this->resolveOperatorSession($request);
        return $this->handle(fn () => $this->client->post('/operadores/logout', [], $operatorSession));
    }

    // =========================================================================
    // 04 - CLIENTES
    // =========================================================================

    public function buscarClientes(Request $request): JsonResponse
    {
        $query = array_filter([
            'cpf'   => $request->query('cpf'),
            'email' => $request->query('email'),
            'nome'  => $request->query('nome'),
        ]);

        $suffix = $query !== [] ? '?'.http_build_query($query) : '';
        return $this->handle(fn () => $this->client->get('/clientes'.$suffix));
    }

    public function cadastrarCliente(Request $request): JsonResponse
    {
        $request->validate([
            'nome'            => 'required|string',
            'email'           => 'required|email',
            'cpf'             => 'required|string',
            'cep'             => 'required|string',
            'numero'          => 'required|string',
            'complemento'     => 'required|string',
            'data_nascimento' => 'required|string',
        ]);

        return $this->handle(fn () => $this->client->post('/clientes', [
            'nome'            => $request->input('nome'),
            'email'           => $request->input('email'),
            'cpf'             => preg_replace('/\D+/', '', (string) $request->input('cpf')),
            'cep'             => preg_replace('/\D+/', '', (string) $request->input('cep')),
            'numero'          => $request->input('numero'),
            'complemento'     => $request->input('complemento'),
            'data_nascimento' => $request->input('data_nascimento'),
        ]), 201);
    }

    // =========================================================================
    // 05 - CHECKOUT E VENDA (V2)
    // =========================================================================

    /**
     * Finalizar Checkout Site/App (sem Operator-Session — fluxo do site Vue)
     */
    public function checkout(Request $request): JsonResponse
    {
        $request->validate([
            'cliente_id'      => 'required|integer',
            'evento_id'       => 'required|integer',
            'idempotency_key' => 'required|string',
            'itens'           => 'required|array',
            'pagamento'       => 'required|array',
            'pagamento.metodo'     => 'required|string',
            'pagamento.observacoes' => 'required|string',
        ]);

        $idempotencyKey = $request->input('idempotency_key');
        // Garante sufixo -sit para checkout de site/app
        if (! str_ends_with($idempotencyKey, '-sit')) {
            $idempotencyKey .= '-sit';
        }

        return $this->handle(fn () => $this->client->post('/checkout', [
            'cliente_id'      => $request->input('cliente_id'),
            'evento_id'       => $request->input('evento_id'),
            'idempotency_key' => $idempotencyKey,
            'itens'           => $request->input('itens'),
            'pagamento'       => $request->input('pagamento'),
        ]), 201);
    }

    /**
     * Carrinho Stub (requer Operator-Session — uso interno/PDV)
     */
    public function carrinhoStub(Request $request): JsonResponse
    {
        $request->validate([
            'evento_id'   => 'required|integer',
            'ingresso_id' => 'required|integer',
            'lote_id'     => 'required|integer',
            'quantidade'  => 'required|integer|min:1',
        ]);

        $operatorSession = $this->resolveOperatorSession($request);
        return $this->handle(fn () => $this->client->post('/carrinhos', [
            'evento_id'   => $request->input('evento_id'),
            'ingresso_id' => $request->input('ingresso_id'),
            'lote_id'     => $request->input('lote_id'),
            'quantidade'  => $request->input('quantidade'),
        ], $operatorSession), 201);
    }

    // =========================================================================
    // 06 - TICKETS / CHECK-IN
    // =========================================================================

    public function listarTickets(Request $request): JsonResponse
    {
        $query = array_filter([
            'pagamento_id' => $request->query('pagamento_id'),
            'cpf'          => $request->query('cpf'),
            'email'        => $request->query('email'),
        ]);

        $suffix = $query !== [] ? '?'.http_build_query($query) : '';
        return $this->handle(fn () => $this->client->get('/tickets'.$suffix));
    }

    public function reimprimirTicket(Request $request): JsonResponse
    {
        $query = array_filter([
            'codigo' => $request->query('codigo'),
        ]);

        $suffix = $query !== [] ? '?'.http_build_query($query) : '';
        return $this->handle(fn () => $this->client->get('/tickets/reimprimir'.$suffix));
    }

    public function checkin(Request $request): JsonResponse
    {
        $request->validate([
            'codigo' => 'required|string',
        ]);

        return $this->handle(fn () => $this->client->post('/checkin', [
            'codigo' => $request->input('codigo'),
        ]));
    }

    // =========================================================================
    // LEGADO — mantém compatibilidade com frontend antigo
    // =========================================================================

    public function createTicketReservation(Request $request): JsonResponse
    {
        $payload = $request->all();
        $payload['pdv_id'] = $payload['pdv_id'] ?? $payload['pdvId'] ?? config('buysystem.pdv_id');

        $candidates = ['/ingressos', '/reservas', '/checkout/reservas'];
        return $this->handle(fn () => $this->client->firstSuccessfulPost($candidates, $payload), 201);
    }

    public function myTickets(Request $request): JsonResponse
    {
        $query = [];
        if ($request->filled('cpf')) {
            $query['cpf'] = preg_replace('/\D+/', '', (string) $request->query('cpf'));
        }
        if ($request->filled('email')) {
            $query['email'] = trim((string) $request->query('email'));
        }

        $suffix = $query === [] ? '' : ('?'.http_build_query($query));
        $candidates = ['/ingressos/me'.$suffix, '/ingressos'.$suffix, '/reservas/me'.$suffix];

        return $this->handle(fn () => $this->client->firstSuccessfulGet($candidates));
    }

    // =========================================================================
    // TOKEN / DIAGNÓSTICO
    // =========================================================================

    public function regenerateToken(): JsonResponse
    {
        return $this->handle(fn () => [
            'message' => 'Token BuySystem regenerado com sucesso',
            'data' => $this->client->regenerateToken(),
        ]);
    }

    public function testToken(): JsonResponse
    {
        try {
            $config = [
                'base_url' => config('buysystem.base_url'),
                'unit_token_configured' => config('buysystem.unit_token') !== '',
                'unit_token_length' => strlen((string) config('buysystem.unit_token')),
                'pdv_id' => config('buysystem.pdv_id'),
            ];

            $tokenData = $this->client->getTokenStatus();

            return response()->json([
                'success' => true,
                'config' => $config,
                'token_active' => $tokenData['has_token'],
                'token_preview' => $tokenData['token_preview'] ?? null,
                'expires_at' => $tokenData['expires_at'] ?? null,
                'expires_at_human' => isset($tokenData['expires_at_ts']) ? date('Y-m-d H:i:s', $tokenData['expires_at_ts']) : null,
            ]);
        } catch (\Throwable $e) {
            $isUnitTokenExpired = str_contains($e->getMessage(), 'BUYSYSTEM_UNIT_TOKEN expirado')
                || str_contains($e->getMessage(), 'Token inativo')
                || str_contains($e->getMessage(), 'Token UNIT inválido');

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'unit_token_expired' => $isUnitTokenExpired,
                'class' => get_class($e),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null,
            ], $isUnitTokenExpired ? 401 : 500);
        }
    }

    public function refreshUnitToken(Request $request): JsonResponse
    {
        try {
            $newUnitToken = $request->input('unit_token');
            if (empty($newUnitToken)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parâmetro unit_token é obrigatório',
                    'instructions' => [
                        '1. Execute no PowerShell:',
                        '   Invoke-WebRequest -Method POST -Uri "https://api.buysystem.com.br/scripts/gerar_token_admin.php"',
                        '2. Copie o token retornado',
                        '3. Atualize o .env com: BUYSYSTEM_UNIT_TOKEN=seu_novo_token',
                        '4. Ou envie via POST para este endpoint: {"unit_token": "seu_novo_token"}',
                    ],
                ], 422);
            }

            config(['buysystem.unit_token' => trim($newUnitToken)]);
            $tokenData = $this->client->regenerateToken();

            return response()->json([
                'success' => true,
                'message' => 'UNIT token atualizado e access_token gerado com sucesso',
                'token_generated' => isset($tokenData['access_token']),
                'expires_at' => isset($tokenData['expires_at']) ? date('Y-m-d H:i:s', $tokenData['expires_at']) : null,
                'note' => '⚠️ IMPORTANTE: Atualize o BUYSYSTEM_UNIT_TOKEN no arquivo .env para persistir a mudança após reiniciar o servidor',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'class' => get_class($e),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null,
            ], 500);
        }
    }

    // =========================================================================
    // ROTAS DE COMPATIBILIDADE (frontend legado)
    // =========================================================================

    public function compatGet(Request $request, string $path = ''): JsonResponse
    {
        $endpoint = '/'.ltrim($path, '/');
        $query = $request->query();
        if ($query !== []) {
            $endpoint .= '?'.http_build_query($query);
        }

        return $this->handle(fn () => $this->client->get($endpoint));
    }

    public function compatPost(Request $request, string $path = ''): JsonResponse
    {
        $endpoint = '/'.ltrim($path, '/');
        $query = $request->query();
        if ($query !== []) {
            $endpoint .= '?'.http_build_query($query);
        }

        return $this->handle(fn () => $this->client->post($endpoint, $request->all()));
    }

    // =========================================================================
    // HELPERS PRIVADOS
    // =========================================================================

    private function resolvePdvId(Request $request): string
    {
        $pdvId = (string) ($request->query('pdv_id', config('buysystem.pdv_id')));
        if ($pdvId === '') {
            throw new RuntimeException('BUYSYSTEM_PDV_ID não configurado');
        }

        return rawurlencode($pdvId);
    }

    /**
     * Extrai o Operator-Session do header da requisição do Vue.
     * O frontend deve enviar: X-Operator-Session: <valor>
     */
    private function resolveOperatorSession(Request $request): ?string
    {
        $session = $request->header('X-Operator-Session') ?? $request->header('Operator-Session');
        return ($session !== null && $session !== '') ? $session : null;
    }

    /**
     * @param  callable(): array<string, mixed>  $callback
     */
    private function handle(callable $callback, int $successStatus = 200): JsonResponse
    {
        try {
            $data = $callback();
            return response()->json($data, $successStatus);
        } catch (RuntimeException $error) {
            \Log::error('BuySystem Proxy Error (RuntimeException)', [
                'message' => $error->getMessage(),
                'trace' => $error->getTraceAsString(),
            ]);
            return response()->json([
                'message' => $error->getMessage(),
                'debug' => config('app.debug') ? [
                    'file' => $error->getFile(),
                    'line' => $error->getLine(),
                ] : null,
            ], 422);
        } catch (\Throwable $error) {
            \Log::error('BuySystem Proxy Error (Throwable)', [
                'message' => $error->getMessage(),
                'class' => get_class($error),
                'trace' => $error->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Erro interno no proxy BuySystem',
                'error' => config('app.debug') ? $error->getMessage() : null,
                'debug' => config('app.debug') ? [
                    'class' => get_class($error),
                    'file' => $error->getFile(),
                    'line' => $error->getLine(),
                ] : null,
            ], 500);
        }
    }
}
