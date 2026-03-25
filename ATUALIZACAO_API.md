# 🔄 Atualização da API BuySystem

## Resumo da alteração

A URL base da API BuySystem foi atualizada de:
- **Antes:** `https://api.buysystem.com.br/v2`
- **Agora:** `https://ek55yrj95p.apidog.io`

---

## 📋 Arquitetura do projeto

O projeto utiliza uma arquitetura em camadas:

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Vue.js)                                                │
│  - Chama /api/events, /api/operadores, /api/clientes, etc.        │
│  - Não fala diretamente com a API BuySystem                      │
└───────────────────────────┬─────────────────────────────────────┘
                             │ Vite proxy → http://127.0.0.1:8000
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend (Laravel)                                                │
│  - BuySystemProxyController recebe as requisições                │
│  - BuySystemClient faz as chamadas à API real                    │
│  - BUYSYSTEM_BASE_URL define o destino das requisições           │
└───────────────────────────┬─────────────────────────────────────┘
                             │ HTTP
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  API BuySystem (Apidog)                                          │
│  https://ek55yrj95p.apidog.io                                    │
│  - /eventos, /auth/token_site, /checkout, /clientes, etc.        │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Alterações realizadas

### 1. `backend/.env`
```env
BUYSYSTEM_BASE_URL=https://ek55yrj95p.apidog.io
```

### 2. `backend/config/buysystem.php`
Valor padrão atualizado para a nova URL.

---

## 🔧 O que verificar

### 1. Path da versão da API

Se a documentação da API no Apidog indicar que os endpoints usam um prefixo de versão (ex: `/v1/`), ajuste o `BUYSYSTEM_BASE_URL`:

```env
# Exemplo se a API exigir /v1 no path:
BUYSYSTEM_BASE_URL=https://ek55yrj95p.apidog.io/v1
```

### 2. Autenticação UNIT Token

O `BUYSYSTEM_UNIT_TOKEN` continua sendo necessário. Ele deve ser gerado conforme a documentação da nova API.

- **Documentação:** [https://ek55yrj95p.apidog.io/](https://ek55yrj95p.apidog.io/) (senha: AjXixvJj)
- Confira na documentação como obter/renovar o UNIT token na nova API.

### 3. Estrutura dos endpoints

O backend já chama os endpoints abaixo. Confira na documentação se coincidem com a API Apidog:

| Recurso     | Método | Endpoint usado          |
|------------|--------|-------------------------|
| Eventos    | GET    | `/eventos`              |
| Detalhe    | GET    | `/eventos/detalhar`     |
| Sessões    | GET    | `/eventos/{pdv}/{id}/setores` ou `/horarios` |
| Ingressos  | GET    | `/ingressos`            |
| Catálogo   | GET    | `/catalogo/preload`     |
| Operadores | GET    | `/operadores`           |
| Login      | POST   | `/operadores/autenticar`|
| Clientes   | GET    | `/clientes`             |
| Clientes   | POST   | `/clientes`             |
| Checkout   | POST   | `/checkout`             |
| Tickets    | GET    | `/tickets`              |
| Check-in   | POST   | `/checkin`               |
| Auth       | POST   | `/auth/token_site`       |
| Auth       | POST   | `/auth/refresh`          |

---

## 🧪 Como testar

1. **Inicie o backend Laravel:**
   ```bash
   cd backend && php artisan serve --host=127.0.0.1 --port=8000
   ```

2. **Inicie o frontend Vue:**
   ```bash
   npm run dev
   ```

3. **Teste o token via API:**
   ```bash
   curl http://127.0.0.1:8000/api/tokens/test
   ```

4. **Teste listagem de eventos no navegador:**
   - Acesse a home do site e verifique se os eventos carregam normalmente.

---

## ⚠️ Observações importantes

1. **Token de geração UNIT**: Os scripts que citam `https://api.buysystem.com.br/scripts/gerar_token_admin.php` referem-se à geração de novo UNIT token. Se na nova API esse processo mudar, será necessário ajustar o `RefreshBuySystemUnitToken` e as mensagens de erro no `BuySystemClient`.

2. **Documentação protegida**: A documentação em `https://ek55yrj95p.apidog.io/` usa a senha que você informou. Use-a para conferir os endpoints e formatos de resposta.

3. **CORS**: Como as chamadas à BuySystem passam pelo backend Laravel, o frontend não precisa lidar com CORS em relação à API externa.
