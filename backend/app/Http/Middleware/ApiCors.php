<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiCors
{
    public function handle(Request $request, Closure $next): Response
    {
        $origin = (string) $request->headers->get('Origin', '');
        $allowedOrigins = array_filter(array_map('trim', explode(',', (string) config('buysystem.allowed_origins'))));
        $originAllowed = in_array($origin, $allowedOrigins, true);
        $allowOriginHeader = $originAllowed ? $origin : (string) config('buysystem.default_origin');

        if ($request->getMethod() === 'OPTIONS') {
            return response('', 204)->withHeaders($this->buildHeaders($allowOriginHeader));
        }

        /** @var Response $response */
        $response = $next($request);
        foreach ($this->buildHeaders($allowOriginHeader) as $header => $value) {
            $response->headers->set($header, $value);
        }

        return $response;
    }

    /**
     * @return array<string, string>
     */
    private function buildHeaders(string $allowOriginHeader): array
    {
        return [
            'Access-Control-Allow-Origin' => $allowOriginHeader,
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Allow-Credentials' => 'false',
            'Vary' => 'Origin',
        ];
    }
}
