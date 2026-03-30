<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

/**
 * Proxy para a API pública de notícias da Prefeitura de Boa Vista.
 * Evita depender de CORS no cliente e mantém um único ponto de saída.
 */
class BoavistaNoticiasProxyController extends Controller
{
    public function __invoke(Request $request): JsonResponse|Response
    {
        $url = rtrim((string) config('boavista.noticias_url'), '/');
        if ($url === '') {
            return response()->json(
                ['message' => 'URL de notícias não configurada no servidor.'],
                Response::HTTP_SERVICE_UNAVAILABLE,
            );
        }

        $upstream = Http::timeout(20)
            ->acceptJson()
            ->get($url, $request->query());

        if (! $upstream->successful()) {
            return response()->json(
                ['message' => 'Não foi possível obter as notícias no momento.'],
                $upstream->status() >= 400 ? $upstream->status() : Response::HTTP_BAD_GATEWAY,
            );
        }

        return response($upstream->body(), Response::HTTP_OK, [
            'Content-Type' => 'application/json; charset=UTF-8',
        ]);
    }
}
