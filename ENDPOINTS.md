# Endpoints configurados — Mirante Vue

Lista dos endpoints expostos pelo **backend (Laravel)** e dos **endpoints externos (API BuySystem)** que ele usa.

---

## 1. Rotas do backend (Laravel) — prefixo `/api`

O frontend chama essas rotas (ex.: `GET /api/events`). O backend usa o **bootstrap token** para obter `access_token` e repassa as chamadas à API externa.

### 1.1 Catálogo (V2)

| Método | Rota | Controller | API externa |
|--------|------|------------|-------------|
| GET | `/api/events` | events | GET `/eventos?pdv_id=...` |
| GET | `/api/events/{eventId}` | eventDetail | GET `/eventos/detalhar?id=...&pdv_id=...` |
| GET | `/api/events/{eventId}/sessions` | eventSessions | GET (primeiro que responder) `/eventos/{pdv}/{id}/setores`, `.../horarios`, `.../sessoes`, `/setores/{pdv}/{id}` |
| GET | `/api/events/{eventId}/tickets` | eventTickets | GET `/ingressos?evento_id=...&pdv_id=...` |
| GET | `/api/catalog/preload` | catalogPreload | GET `/catalogo/preload?pdv_id=...` |

### 1.2 Operadores

| Método | Rota | Controller | API externa |
|--------|------|------------|-------------|
| GET | `/api/operadores` | listarOperadores | GET `/operadores` |
| POST | `/api/operadores/autenticar` | autenticarOperador | POST `/operadores/autenticar` |
| GET | `/api/operadores/me` | sessaoOperador | GET `/operadores/me` (com X-Operator-Session) |
| POST | `/api/operadores/logout` | logoutOperador | POST `/operadores/logout` (com X-Operator-Session) |

### 1.3 Clientes

| Método | Rota | Controller | API externa |
|--------|------|------------|-------------|
| GET | `/api/clientes` | buscarClientes | GET `/clientes?cpf=...&email=...&nome=...` |
| POST | `/api/clientes` | cadastrarCliente | POST `/clientes` |

### 1.4 Checkout e venda (V2)

| Método | Rota | Controller | API externa |
|--------|------|------------|-------------|
| POST | `/api/checkout` | checkout | POST `/checkout` |
| POST | `/api/carrinhos` | carrinhoStub | POST `/carrinhos` (com X-Operator-Session) |

### 1.5 Tickets / Check-in

| Método | Rota | Controller | API externa |
|--------|------|------------|-------------|
| GET | `/api/tickets` | listarTickets | GET `/tickets?pagamento_id=...&cpf=...&email=...` |
| GET | `/api/tickets/reimprimir` | reimprimirTicket | GET `/tickets/reimprimir?codigo=...` |
| POST | `/api/checkin` | checkin | POST `/checkin` |

### 1.6 Token / diagnóstico

| Método | Rota | Controller | Descrição |
|--------|------|------------|-----------|
| POST | `/api/tokens/regenerate` | regenerateToken | Regenera access_token no backend (usa bootstrap token) |
| GET | `/api/tokens/test` | testToken | Testa se o token está ativo e mostra status |
| POST | `/api/tokens/refresh-unit` | refreshUnitToken | Atualiza o UNIT token no backend (body: `{"unit_token": "bs_init_..."}`) |

### 1.7 Legado (compatibilidade)

| Método | Rota | Controller | API externa |
|--------|------|------------|-------------|
| POST | `/api/tickets/reservations` | createTicketReservation | POST (primeiro que responder) `/ingressos`, `/reservas`, `/checkout/reservas` |
| GET | `/api/tickets/my` | myTickets | GET (primeiro que responder) `/ingressos/me`, `/ingressos`, `/reservas/me` |

### 1.8 Compatibilidade genérica

| Método | Rota | Controller | Descrição |
|--------|------|------------|-----------|
| GET | `/api/buysystem/{path}` | compatGet | Repassa GET para a API externa em `/{path}` |
| POST | `/api/buysystem/{path}` | compatPost | Repassa POST para a API externa em `/{path}` |

---

## 2. Endpoints externos (API BuySystem) usados pelo backend

Base URL configurada em `BUYSYSTEM_BASE_URL` (ex.: `https://ek55yrj95p.apidog.io`).

### 2.1 Autenticação (token)

| Método | Endpoint | Uso |
|--------|----------|-----|
| POST | `/auth/token_site` | Troca o **bootstrap token** (`bs_init_...`) por `access_token` e `refresh_token` |
| POST | `/auth/refresh` | Renova `access_token` usando `refresh_token` |

### 2.2 Catálogo

- `GET /eventos`
- `GET /eventos/detalhar`
- `GET /eventos/{pdv_id}/{eventId}/setores` (e variantes horarios, sessoes)
- `GET /setores/{pdv_id}/{eventId}`
- `GET /ingressos`
- `GET /catalogo/preload`

### 2.3 Operadores

- `GET /operadores`
- `POST /operadores/autenticar`
- `GET /operadores/me`
- `POST /operadores/logout`

### 2.4 Clientes

- `GET /clientes`
- `POST /clientes`

### 2.5 Checkout / vendas

- `POST /checkout`
- `POST /carrinhos`

### 2.6 Tickets / check-in

- `GET /tickets`
- `GET /tickets/reimprimir`
- `POST /checkin`

### 2.7 Legado

- `POST /ingressos`, `POST /reservas`, `POST /checkout/reservas`
- `GET /ingressos/me`, `GET /ingressos`, `GET /reservas/me`

---

## 3. Frontend — referência em código

Os endpoints do backend estão definidos em:

- **Backend:** `backend/routes/api.php`
- **Frontend:** `src/api/endpoints.js` (objeto `ENDPOINTS`)

Fluxo de token no frontend (quando `USE_SERVER_SIDE_AUTH = true`):

1. O Vue chama apenas o Laravel: `GET /api/events`, `POST /api/checkout`, etc.
2. O Laravel usa `BUYSYSTEM_UNIT_TOKEN` para obter/renovar `access_token` e chama a API externa.
3. Nenhum token BuySystem é enviado pelo browser; o estado de token fica no backend (e em cache Laravel).

---

## 4. Cache de token no frontend

- **Chaves no `localStorage`:**
  - `buysystem_token_state` — access_token, refresh_token, expiresAt (usado quando o frontend fala direto com a API, sem proxy).
  - `buysystem_unit_token_hash` — hash do UNIT token atual; se o token no `.env` mudar, o estado antigo é limpo na próxima carga da página.
- **Comportamento:** Na inicialização do `apidog.js`, `checkUnitTokenChanged()` roda **sempre**. Se o token no `.env` foi alterado (ex.: novo `VITE_BUYSYSTEM_UNIT_TOKEN`), o hash muda e o `localStorage` de token é limpo, evitando uso de token antigo.

Se quiser garantir que não reste nada antigo após trocar o token, abra o DevTools → Application → Local Storage e apague `buysystem_token_state` e `buysystem_unit_token_hash`, ou faça um hard refresh (Ctrl+Shift+R) após reiniciar o dev server com o novo `.env`.
