# BuySystem Proxy (Laravel)

Este backend fica entre o Vue e a API da BuySystem:

Vue (site) -> Laravel API -> BuySystem API

## 1) Configurar ambiente

Copie o `.env` e ajuste os valores:

```bash
cp .env.example .env
```

Variaveis necessarias no `.env`:

```env
BUYSYSTEM_BASE_URL=https://ek55yrj95p.apidog.io
BUYSYSTEM_UNIT_TOKEN=SEU_TOKEN_UNIT_AQUI
BUYSYSTEM_TOKEN_TYPE=site
BUYSYSTEM_PDV_ID=SEU_PDV_ID
BUYSYSTEM_ACCESS_MINUTES=60
BUYSYSTEM_REFRESH_DAYS=30
BUYSYSTEM_TOKEN_DESCRIPTION=WEB ADMIN

API_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
API_DEFAULT_ORIGIN=http://localhost:5173
```

## 2) Rodar backend

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

## 3) Rodar frontend

No projeto Vue, inicie normalmente o Vite. O `vite.config.js` ja esta com proxy:

- `/api/buysystem/*` -> `http://127.0.0.1:8000/api/buysystem/*`

Assim, o frontend continua usando o caminho atual e o Laravel centraliza o token.

## Rotas expostas

### Rotas novas (limpas)
- `GET /api/events`
- `GET /api/events/{eventId}`
- `GET /api/events/{eventId}/sessions`
- `GET /api/events/{eventId}/tickets`
- `POST /api/tickets/reservations`
- `GET /api/tickets/my`
- `POST /api/tokens/regenerate`

### Rotas de compatibilidade
- `GET /api/buysystem/{path}`
- `POST /api/buysystem/{path}`

Essas rotas permitem migrar sem quebrar o frontend atual.
