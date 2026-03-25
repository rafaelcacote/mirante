# 🔌 Passo a Passo: Como a API está Conectada no Site

Este documento explica **TUDO** que acontece para que a API funcione corretamente no seu site Vue.js.

---

## 📋 Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Configuração Inicial](#2-configuração-inicial)
3. [Fluxo de Autenticação](#3-fluxo-de-autenticação)
4. [Fluxo de Requisições](#4-fluxo-de-requisições)
5. [Exemplo Prático: Carregar Eventos](#5-exemplo-prático-carregar-eventos)
6. [Estrutura de Arquivos](#6-estrutura-de-arquivos)
7. [Variáveis de Ambiente](#7-variáveis-de-ambiente)

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENTE VUE                           │
│  (ex: FeaturedEventsSection.vue, EventDetails.vue)         │
└──────────────────────┬──────────────────────────────────────┘
                       │ import
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SERVIÇO DA API (apidog.js)                      │
│  - Gerencia autenticação automática                         │
│  - Faz requisições HTTP                                     │
│  - Mapeia dados da API para formato do componente          │
└──────────────────────┬──────────────────────────────────────┘
                       │ usa
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              CLIENTE HTTP (BuySystemClient)                  │
│  - Configura URL base                                       │
│  - Adiciona headers                                         │
│  - Trata erros e timeouts                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ faz requisição
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              PROXY VITE (vite.config.js)                     │
│  /api/buysystem → https://api.buysystem.com.br/v1          │
│  (resolve problemas de CORS em desenvolvimento)            │
└──────────────────────┬──────────────────────────────────────┘
                       │ requisição HTTP
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              API BUYSYSTEM                                  │
│  https://api.buysystem.com.br/v1                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Configuração Inicial

### 2.1. Arquivo `vite.config.js`

O Vite está configurado com um **proxy** que redireciona requisições locais para a API real:

```javascript
// vite.config.js (linhas 19-26)
proxy: {
  '/api/buysystem': {
    target: 'https://api.buysystem.com.br',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/buysystem/, '/v1'),
  },
}
```

**O que isso faz?**
- Quando você faz uma requisição para `/api/buysystem/eventos/123` em desenvolvimento
- O Vite intercepta e redireciona para `https://api.buysystem.com.br/v1/eventos/123`
- Isso resolve problemas de **CORS** (Cross-Origin Resource Sharing)

### 2.2. URL Base da API

No arquivo `src/api/services/apidog.js` (linhas 3-4):

```javascript
const isDevelopment = import.meta.env.DEV
const API_BASE_URL = isDevelopment 
  ? '/api/buysystem'           // Desenvolvimento: usa proxy
  : 'https://api.buysystem.com.br/v1'  // Produção: URL direta
```

**Como funciona:**
- **Desenvolvimento** (`npm run dev`): usa `/api/buysystem` → passa pelo proxy
- **Produção** (`npm run build`): usa URL direta da API

---

## 3. Fluxo de Autenticação

A autenticação é **automática e transparente**. Veja como funciona:

### 3.1. Token UNIT (Token Inicial)

O token UNIT é configurado via variável de ambiente:

```javascript
// apidog.js (linhas 8-13)
const RAW_UNIT_TOKEN = 
  import.meta.env.VITE_BUYSYSTEM_UNIT_TOKEN ||
  import.meta.env.VITE_BUYSYSTEM_MASTER_TOKEN ||
  import.meta.env.VITE_BUYSYSTEM_TOKEN ||
  ''
```

**O que é o token UNIT?**
- Token de curta duração fornecido pelo administrador
- Usado para gerar tokens de acesso (access_token) e refresh (refresh_token)
- Não deve ser usado diretamente nas requisições

### 3.2. Geração do Token de Acesso

Quando o site precisa fazer uma requisição autenticada:

```javascript
// apidog.js (linhas 135-156)
async function generateInitialToken() {
  // 1. Verifica se existe token UNIT
  if (!UNIT_TOKEN) {
    throw new Error('VITE_BUYSYSTEM_UNIT_TOKEN não configurado')
  }

  // 2. Faz POST para /auth/token_site
  const response = await http.request(ENDPOINTS.AUTH.TOKEN_SITE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UNIT_TOKEN}`,  // Usa token UNIT aqui
    },
    body: JSON.stringify({
      tipo: TOKEN_TYPE,              // "site" ou "admin"
      access_minutes: ACCESS_MINUTES, // Tempo de expiração (padrão: 60 min)
      refresh_days: REFRESH_DAYS,     // Tempo de refresh (padrão: 30 dias)
      descricao: TOKEN_DESCRIPTION,   // Descrição do token
    }),
  })

  // 3. Salva tokens no localStorage
  applyTokenData(extractAuthData(response))
}
```

**Resposta da API:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in_minutes": 60,
  "refresh_expires_in_days": 30
}
```

### 3.3. Armazenamento dos Tokens

Os tokens são salvos no `localStorage`:

```javascript
// apidog.js (linhas 46-62)
const STORAGE_KEY = 'buysystem_token_state'

function saveTokenState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    accessToken: tokenState.accessToken,
    refreshToken: tokenState.refreshToken,
    expiresAt: tokenState.expiresAt,        // Timestamp de expiração
    refreshExpiresAt: tokenState.refreshExpiresAt
  }))
}
```

**Estrutura salva:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": 1704067200000,
  "refreshExpiresAt": 1706659200000
}
```

### 3.4. Renovação Automática do Token

O sistema **renova automaticamente** o token antes de expirar:

```javascript
// apidog.js (linhas 205-231)
async function ensureValidAccessToken() {
  const now = Date.now()
  
  // Se o token ainda é válido (não expira em breve), retorna
  if (tokenState.accessToken && now < tokenState.expiresAt - TOKEN_RENEW_WINDOW_MS) {
    return tokenState.accessToken
  }

  // Se não tem token ou está expirado, renova
  if (!tokenState.accessToken) {
    await generateInitialToken()  // Primeira vez: gera novo token
  } else {
    await refreshAccessToken()     // Renova usando refresh_token
  }
  
  return tokenState.accessToken
}
```

**Janela de renovação:** 2 minutos antes de expirar (`TOKEN_RENEW_WINDOW_MS = 2 * 60 * 1000`)

### 3.5. Refresh Token

Quando o access_token está prestes a expirar, usa o refresh_token:

```javascript
// apidog.js (linhas 158-203)
async function refreshAccessToken() {
  if (!tokenState.refreshToken) {
    await generateInitialToken()
    return
  }

  // Tenta renovar com refresh_token
  const response = await http.request(ENDPOINTS.AUTH.REFRESH, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenState.accessToken}`,  // Token atual
    },
    body: JSON.stringify({
      refresh_token: tokenState.refreshToken,
    }),
  })

  applyTokenData(extractAuthData(response))  // Salva novos tokens
}
```

### 3.6. Manutenção Automática em Background

O sistema roda uma verificação a cada 60 segundos:

```javascript
// apidog.js (linhas 265-286)
function startTokenMaintenance() {
  // Verifica a cada 60 segundos
  maintenanceTimerId = window.setInterval(() => {
    runTokenMaintenance().catch(() => {})
  }, TOKEN_MAINTENANCE_INTERVAL_MS)

  // Quando o usuário volta para a aba, verifica imediatamente
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      runTokenMaintenance()
    }
  })
}
```

**Quando é iniciado?**
- Automaticamente quando o módulo `apidog.js` é carregado (linha 425)

---

## 4. Fluxo de Requisições

### 4.1. Requisição Autenticada

Quando um componente precisa buscar dados:

```javascript
// apidog.js (linhas 288-316)
async function authorizedGet(endpoint) {
  // 1. Garante que tem um token válido
  const accessToken = await ensureValidAccessToken()
  
  // 2. Faz a requisição com o token no header
  return http.request(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
```

### 4.2. Cliente HTTP

O cliente HTTP faz a requisição real:

```javascript
// apidog.js (linhas 72-115)
class BuySystemClient {
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`  // Monta URL completa
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),  // Inclui Authorization aqui
    }
    
    const config = { 
      ...options, 
      headers, 
      mode: 'cors', 
      credentials: 'omit' 
    }

    // Timeout de 30 segundos
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)
    config.signal = controller.signal

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        // Trata erros da API
        const text = await response.text()
        let message = text || `HTTP ${response.status}`
        try {
          const json = JSON.parse(text)
          message = json.message || json.errorMessage || message
        } catch {}
        throw new Error(message)
      }
      
      // Retorna JSON se possível
      const type = response.headers.get('content-type') || ''
      if (type.includes('application/json')) {
        return await response.json()
      }
      return await response.text()
    } catch (error) {
      // Trata erros de rede, timeout, etc.
      if (error.name === 'AbortError') {
        throw new Error('Timeout: a requisição demorou mais de 30 segundos')
      }
      if (error.message?.includes('Failed to fetch')) {
        throw new Error('Erro de rede/CORS ao conectar na API BuySystem')
      }
      throw error
    }
  }
}
```

### 4.3. Tratamento de Erros de Autenticação

Se a requisição falhar com erro de autenticação, tenta novamente:

```javascript
// apidog.js (linhas 299-315)
try {
  return await run()  // Primeira tentativa
} catch (error) {
  const isAuthError = isAuthErrorMessage(error?.message)
  
  if (!isAuthError) throw error  // Se não for erro de auth, propaga
  
  // Se for erro de auth, limpa cache e tenta novamente
  clearTokenState()
  const accessToken = await ensureValidAccessToken()
  return http.request(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
```

---

## 5. Exemplo Prático: Carregar Eventos

Vamos ver o fluxo completo desde o componente até a API:

### 5.1. Componente Vue (`FeaturedEventsSection.vue`)

```vue
<script setup>
import { ref, onMounted } from 'vue'
import apidogService from '@/api/services/apidog.js'

const events = ref([])
const loading = ref(true)

// Quando o componente é montado, carrega eventos
onMounted(() => {
  loadEvents()
})

const loadEvents = async () => {
  loading.value = true
  try {
    // Chama o serviço da API
    const apiEvents = await apidogService.getEventsByPDV()
    events.value = apiEvents
  } catch (err) {
    console.error('Erro ao carregar eventos:', err)
    // Usa eventos padrão em caso de erro
    events.value = defaultEvents
  } finally {
    loading.value = false
  }
}
</script>
```

### 5.2. Serviço da API (`apidog.js`)

```javascript
// apidog.js (linhas 427-432)
export const apidogService = {
  async getEventsByPDV(pdvId = DEFAULT_PDV_ID) {
    if (!pdvId) throw new Error('VITE_PDV_ID não configurado')
    
    // 1. Faz requisição autenticada
    const response = await authorizedGet(ENDPOINTS.EVENTS.LIST(pdvId))
    
    // 2. Normaliza a resposta (pode vir em diferentes formatos)
    const eventsList = normalizeListResponse(response)
    
    // 3. Mapeia cada evento para o formato esperado pelo componente
    return eventsList.map(mapEvent)
  },
}
```

### 5.3. Endpoint (`endpoints.js`)

```javascript
// endpoints.js (linhas 13-15)
const ENDPOINTS = {
  EVENTS: {
    LIST: (pdvId) => `/eventos/${encodeURIComponent(pdvId)}`,
  },
}
```

**Resultado:** `/eventos/123` (onde 123 é o PDV_ID)

### 5.4. Fluxo Completo

```
1. Componente chama: apidogService.getEventsByPDV()
   ↓
2. Serviço chama: authorizedGet('/eventos/123')
   ↓
3. authorizedGet garante token válido: ensureValidAccessToken()
   ↓
4. Se não tem token: generateInitialToken()
   - POST /auth/token_site com token UNIT
   - Recebe access_token e refresh_token
   - Salva no localStorage
   ↓
5. authorizedGet faz: http.request('/eventos/123', { Authorization: 'Bearer ...' })
   ↓
6. BuySystemClient monta URL: '/api/buysystem/eventos/123'
   ↓
7. Vite Proxy intercepta e redireciona para:
   'https://api.buysystem.com.br/v1/eventos/123'
   ↓
8. API retorna JSON com eventos
   ↓
9. normalizeListResponse() extrai array de eventos
   ↓
10. mapEvent() transforma cada evento para formato do componente
   ↓
11. Componente recebe eventos formatados e exibe na tela
```

### 5.5. Mapeamento de Dados

A API pode retornar dados em diferentes formatos. O sistema normaliza:

```javascript
// apidog.js (linhas 412-422)
function normalizeListResponse(response) {
  if (Array.isArray(response)) return response              // [{...}, {...}]
  if (Array.isArray(response?.data)) return response.data   // { data: [...] }
  if (Array.isArray(response?.eventos)) return response.eventos  // { eventos: [...] }
  if (Array.isArray(response?.items)) return response.items      // { items: [...] }
  return []
}
```

Depois, mapeia para o formato esperado:

```javascript
// apidog.js (linhas 390-410)
function mapEvent(raw) {
  return {
    id: raw.evento_id || raw.id || raw.codigo,
    title: raw.titulo || raw.nome || raw.title,
    date: formatDate(raw.data_inicio || raw.data),
    time: formatTime(raw.hora_inicio || raw.hora),
    location: raw.local || raw.localizacao || raw.location,
    capacity: Number(raw.capacidade || raw.total_vagas || 100),
    available: Number(raw.disponivel || raw.vagas_disponiveis || 0),
    price: Number(raw.preco || raw.valor || 0),
    image: resolveEventImage(raw),  // Resolve URL da imagem
    badge: badgeForEvent(raw),      // Calcula badge ("Gratuito", "Quase Lotado")
    descricao: raw.descricao || raw.description || '',
    pdv_id: raw.pdv_id || DEFAULT_PDV_ID,
    raw,  // Mantém dados originais
  }
}
```

---

## 6. Estrutura de Arquivos

```
src/
├── api/
│   ├── index.js              # Cliente HTTP genérico (não usado atualmente)
│   ├── endpoints.js          # Definição de todos os endpoints
│   ├── services/
│   │   ├── apidog.js         # ⭐ Serviço principal (autenticação + eventos)
│   │   ├── events.js         # Re-exporta apidogService
│   │   ├── tickets.js        # API de ingressos
│   │   ├── sectors.js        # API de setores
│   │   ├── checkout.js       # API de checkout
│   │   └── validation.js     # API de validações
│   └── README.md             # Documentação da API
│
├── components/
│   └── FeaturedEventsSection.vue  # Usa apidogService
│
├── pages/
│   ├── Home.vue              # Página inicial
│   └── EventDetails.vue      # Usa apidogService.getEventDetail()
│
└── main.js                   # Inicialização do app Vue
```

---

## 7. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Token UNIT (obrigatório)
# Token de curta duração fornecido pelo administrador
VITE_BUYSYSTEM_UNIT_TOKEN=seu-token-unit-aqui

# PDV ID (obrigatório)
# ID do ponto de venda
VITE_PDV_ID=123

# Tipo de token (opcional, padrão: "site")
VITE_BUYSYSTEM_TOKEN_TYPE=site

# Tempo de expiração do access token em minutos (opcional, padrão: 60)
VITE_BUYSYSTEM_ACCESS_MINUTES=60

# Tempo de expiração do refresh token em dias (opcional, padrão: 30)
VITE_BUYSYSTEM_REFRESH_DAYS=30

# Descrição do token (opcional, padrão: "WEB ADMIN")
VITE_BUYSYSTEM_TOKEN_DESCRIPTION=WEB ADMIN

# URL base para assets/imagens (opcional)
VITE_BUYSYSTEM_ASSET_BASE_URL=https://app.buysystem.com.br/uploads
```

**⚠️ IMPORTANTE:**
- Nunca commite o arquivo `.env` no repositório
- Use `.env.example` como template
- As variáveis devem começar com `VITE_` para serem acessíveis no código

---

## 🔍 Resumo do Fluxo Completo

1. **Inicialização:**
   - Site carrega → `apidog.js` é importado
   - Carrega tokens do `localStorage` (se existirem)
   - Inicia manutenção automática de tokens

2. **Primeira Requisição:**
   - Componente chama `apidogService.getEventsByPDV()`
   - Sistema verifica se tem token válido
   - Se não tem: gera novo token usando token UNIT
   - Se tem mas está expirado: renova usando refresh_token

3. **Requisição HTTP:**
   - Monta URL: `/api/buysystem/eventos/123`
   - Adiciona header: `Authorization: Bearer {access_token}`
   - Vite proxy redireciona para API real
   - API processa e retorna dados

4. **Processamento:**
   - Normaliza resposta (extrai array de eventos)
   - Mapeia cada evento para formato do componente
   - Resolve URLs de imagens
   - Calcula badges e formata datas

5. **Exibição:**
   - Componente recebe eventos formatados
   - Renderiza na tela usando `EventCard`

6. **Manutenção Contínua:**
   - A cada 60 segundos, verifica se precisa renovar token
   - Quando usuário volta para a aba, verifica imediatamente
   - Renova automaticamente 2 minutos antes de expirar

---

## 🎯 Pontos Importantes

✅ **Autenticação é automática** - você não precisa se preocupar com tokens manualmente

✅ **Tokens são renovados automaticamente** - o sistema cuida disso em background

✅ **Proxy resolve CORS** - em desenvolvimento, não precisa configurar CORS na API

✅ **Dados são normalizados** - funciona com diferentes formatos de resposta da API

✅ **Fallback para eventos padrão** - se a API falhar, mostra eventos de exemplo

✅ **Tratamento de erros robusto** - tenta novamente em caso de erro de autenticação

---

## 🐛 Debug

Para debugar problemas:

1. **Ver tokens no localStorage:**
   ```javascript
   console.log(localStorage.getItem('buysystem_token_state'))
   ```

2. **Forçar renovação de token:**
   ```javascript
   import apidogService from '@/api/services/apidog.js'
   await apidogService.forceRefreshToken()
   ```

3. **Ver requisições no DevTools:**
   - Abra DevTools → Network
   - Filtre por "buysystem" ou "api"
   - Veja headers, payload e resposta

4. **Verificar variáveis de ambiente:**
   ```javascript
   console.log(import.meta.env.VITE_BUYSYSTEM_UNIT_TOKEN)
   console.log(import.meta.env.VITE_PDV_ID)
   ```

---

## 📚 Referências

- Documentação BuySystem: https://docs.buysystem.com.br/
- Endpoints usados:
  - `POST /v1/auth/token_site` - Gerar token de acesso
  - `POST /v1/auth/refresh` - Renovar token
  - `GET /v1/eventos/{pdv_id}` - Listar eventos
  - `GET /v1/eventos/{pdv_id}/{evento_id}` - Detalhes do evento
