/**
 * Endpoints da API BuySystem V2 — via proxy Laravel
 * Base URL: /api  (proxiado para http://127.0.0.1:8000)
 */

const ENDPOINTS = {
  // -------------------------------------------------------------------------
  // 03 - Catálogo
  // -------------------------------------------------------------------------
  EVENTS: {
    LIST: '/events',
    DETAIL: (eventId) => `/events/${encodeURIComponent(eventId)}`,
    SESSIONS: (eventId) => `/events/${encodeURIComponent(eventId)}/sessions`,
    TICKETS: (eventId) => `/events/${encodeURIComponent(eventId)}/tickets`,
    PRELOAD: '/catalog/preload',
  },

  // -------------------------------------------------------------------------
  // 02 - Operadores
  // -------------------------------------------------------------------------
  OPERADORES: {
    LIST: '/operadores',
    AUTENTICAR: '/operadores/autenticar',
    ME: '/operadores/me',
    LOGOUT: '/operadores/logout',
  },

  // -------------------------------------------------------------------------
  // 04 - Clientes
  // -------------------------------------------------------------------------
  CLIENTES: {
    BUSCAR: '/clientes',
    CADASTRAR: '/clientes',
  },

  // -------------------------------------------------------------------------
  // 05 - Checkout e Venda
  // -------------------------------------------------------------------------
  CHECKOUT: {
    FINALIZAR: '/checkout',
    CARRINHO: '/carrinhos',
  },

  // -------------------------------------------------------------------------
  // 06 - Tickets / Check-in
  // -------------------------------------------------------------------------
  TICKETS: {
    LIST: '/tickets',
    REIMPRIMIR: '/tickets/reimprimir',
    CHECKIN: '/checkin',
    // Legado (compatibilidade)
    CREATE_CANDIDATES: ['/tickets/reservations'],
    LIST_CANDIDATES: ['/tickets/my'],
  },

  // -------------------------------------------------------------------------
  // Token / Diagnóstico
  // -------------------------------------------------------------------------
  TOKENS: {
    REGENERATE: '/tokens/regenerate',
    TEST: '/tokens/test',
    REFRESH_UNIT: '/tokens/refresh-unit',
  },
}

export default ENDPOINTS
