<?php

use App\Http\Controllers\BoavistaNoticiasProxyController;
use App\Http\Controllers\BuySystemProxyController;
use Illuminate\Support\Facades\Route;

Route::middleware('api.cors')->group(function (): void {

    // -------------------------------------------------------------------------
    // Notícias Prefeitura Boa Vista (proxy público)
    // -------------------------------------------------------------------------
    Route::get('/boavista/noticias', BoavistaNoticiasProxyController::class);

    // -------------------------------------------------------------------------
    // 03 - Catálogo (V2)
    // -------------------------------------------------------------------------
    Route::get('/events', [BuySystemProxyController::class, 'events']);
    Route::get('/events/{eventId}', [BuySystemProxyController::class, 'eventDetail']);
    Route::get('/events/{eventId}/sessions', [BuySystemProxyController::class, 'eventSessions']);
    Route::get('/events/{eventId}/tickets', [BuySystemProxyController::class, 'eventTickets']);
    Route::get('/catalog/preload', [BuySystemProxyController::class, 'catalogPreload']);

    // -------------------------------------------------------------------------
    // 02 - Operadores
    // -------------------------------------------------------------------------
    Route::get('/operadores', [BuySystemProxyController::class, 'listarOperadores']);
    Route::post('/operadores/autenticar', [BuySystemProxyController::class, 'autenticarOperador']);
    Route::get('/operadores/me', [BuySystemProxyController::class, 'sessaoOperador']);
    Route::post('/operadores/logout', [BuySystemProxyController::class, 'logoutOperador']);

    // -------------------------------------------------------------------------
    // 04 - Clientes
    // -------------------------------------------------------------------------
    Route::get('/clientes', [BuySystemProxyController::class, 'buscarClientes']);
    Route::post('/clientes', [BuySystemProxyController::class, 'cadastrarCliente']);

    // -------------------------------------------------------------------------
    // 05 - Checkout e Venda (V2)
    // -------------------------------------------------------------------------
    Route::post('/checkout', [BuySystemProxyController::class, 'checkout']);
    Route::post('/carrinhos', [BuySystemProxyController::class, 'carrinhoStub']);

    // -------------------------------------------------------------------------
    // 06 - Tickets / Check-in
    // -------------------------------------------------------------------------
    Route::get('/tickets', [BuySystemProxyController::class, 'listarTickets']);
    Route::get('/tickets/reimprimir', [BuySystemProxyController::class, 'reimprimirTicket']);
    Route::post('/checkin', [BuySystemProxyController::class, 'checkin']);

    // -------------------------------------------------------------------------
    // Token / Diagnóstico
    // -------------------------------------------------------------------------
    Route::post('/tokens/regenerate', [BuySystemProxyController::class, 'regenerateToken']);
    Route::get('/tokens/test', [BuySystemProxyController::class, 'testToken']);
    Route::post('/tokens/refresh-unit', [BuySystemProxyController::class, 'refreshUnitToken']);

    // -------------------------------------------------------------------------
    // Imagens (evita hotlink/bloqueio do CDN)
    // -------------------------------------------------------------------------
    Route::get('/buysystem/image', [BuySystemProxyController::class, 'image']);

    // -------------------------------------------------------------------------
    // Legado — mantém compatibilidade com o frontend antigo
    // -------------------------------------------------------------------------
    Route::post('/tickets/reservations', [BuySystemProxyController::class, 'createTicketReservation']);
    Route::get('/tickets/my', [BuySystemProxyController::class, 'myTickets']);

    // Rotas genéricas de compatibilidade (migração gradual)
    Route::get('/buysystem/{path}', [BuySystemProxyController::class, 'compatGet'])->where('path', '.*');
    Route::post('/buysystem/{path}', [BuySystemProxyController::class, 'compatPost'])->where('path', '.*');
});
