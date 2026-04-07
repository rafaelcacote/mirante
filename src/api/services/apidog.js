import ENDPOINTS from '../endpoints.js'

const isDevelopment = import.meta.env.DEV
// Base URL aponta para o proxy Laravel — cobre /api/events, /api/operadores, etc.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isDevelopment ? '/api' : '/api')
const USE_SERVER_SIDE_AUTH = true
const DEFAULT_ASSET_BASE_URL = 'https://app.buysystem.com.br/uploads'

// Token UNIT (curta duracao) fornecido pelo administrador para chamar /auth/token_site
const RAW_UNIT_TOKEN =
  import.meta.env.VITE_BUYSYSTEM_UNIT_TOKEN ||
  import.meta.env.VITE_BUYSYSTEM_MASTER_TOKEN ||
  import.meta.env.VITE_BUYSYSTEM_TOKEN ||
  ''
const UNIT_TOKEN = String(RAW_UNIT_TOKEN).replace(/^Bearer\s+/i, '').trim()
const TOKEN_TYPE = import.meta.env.VITE_BUYSYSTEM_TOKEN_TYPE || 'site'
const DEFAULT_PDV_ID = import.meta.env.VITE_PDV_ID || ''
const ACCESS_MINUTES = Number(import.meta.env.VITE_BUYSYSTEM_ACCESS_MINUTES || 60)
const REFRESH_DAYS = Number(import.meta.env.VITE_BUYSYSTEM_REFRESH_DAYS || 30)
const TOKEN_DESCRIPTION = import.meta.env.VITE_BUYSYSTEM_TOKEN_DESCRIPTION || 'WEB ADMIN'

const STORAGE_KEY = 'buysystem_token_state'
const UNIT_TOKEN_STORAGE_KEY = 'buysystem_unit_token_hash'
const TOKEN_RENEW_WINDOW_MS = 2 * 60 * 1000
const TOKEN_MAINTENANCE_INTERVAL_MS = 60 * 1000

const tokenState = {
  accessToken: '',
  refreshToken: '',
  expiresAt: 0,
  refreshExpiresAt: 0,
}

let tokenPromise = null
let maintenancePromise = null
let maintenanceTimerId = null

function isAuthErrorMessage(message) {
  const msg = String(message || '').toLowerCase()
  return (
    msg.includes('token') ||
    msg.includes('inativo') ||
    msg.includes('inactive') ||
    msg.includes('expirado') ||
    msg.includes('expired') ||
    msg.includes('unauthorized') ||
    msg.includes('não autorizado') ||
    msg.includes('nao autorizado') ||
    msg.includes('401')
  )
}

function loadTokenState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    tokenState.accessToken = parsed.accessToken || ''
    tokenState.refreshToken = parsed.refreshToken || ''
    tokenState.expiresAt = parsed.expiresAt || 0
    tokenState.refreshExpiresAt = parsed.refreshExpiresAt || 0
  } catch {
    // ignora localStorage invalido
  }
}

function saveTokenState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokenState))
}

function clearTokenState() {
  tokenState.accessToken = ''
  tokenState.refreshToken = ''
  tokenState.expiresAt = 0
  tokenState.refreshExpiresAt = 0
  localStorage.removeItem(STORAGE_KEY)
}

// Verifica se o UNIT_TOKEN mudou e limpa o estado se necessário
function checkUnitTokenChanged() {
  try {
    // Cria um hash simples do UNIT_TOKEN atual (primeiros e últimos caracteres)
    let currentTokenHash = ''
    if (UNIT_TOKEN) {
      const token = String(UNIT_TOKEN).trim()
      const len = token.length
      // Usa primeiros 10 e últimos 10 caracteres como hash
      currentTokenHash = len > 20 
        ? token.slice(0, 10) + token.slice(-10)
        : token
    }
    
    const storedTokenHash = localStorage.getItem(UNIT_TOKEN_STORAGE_KEY)
    
    // Se o token mudou, limpa o estado antigo
    if (storedTokenHash && storedTokenHash !== currentTokenHash && currentTokenHash) {
      console.warn('[BuySystem] UNIT_TOKEN mudou, limpando tokens antigos')
      clearTokenState()
    }
    
    // Salva o hash do token atual
    if (currentTokenHash) {
      localStorage.setItem(UNIT_TOKEN_STORAGE_KEY, currentTokenHash)
    } else if (storedTokenHash) {
      // Se não há token mas havia um antes, limpa
      clearTokenState()
      localStorage.removeItem(UNIT_TOKEN_STORAGE_KEY)
    }
  } catch {
    // Ignora erros de localStorage
  }
}

class BuySystemClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }
    const config = { ...options, headers, mode: 'cors', credentials: 'omit' }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)
    config.signal = controller.signal

    try {
      const response = await fetch(url, config)
      clearTimeout(timeoutId)
      if (!response.ok) {
        const text = await response.text()
        let message = text || `HTTP ${response.status}`
        let errorData = null
        try {
          const json = JSON.parse(text)
          message = json.message || json.errorMessage || message
          errorData = json
        } catch {
          // resposta nao-json
        }
        
        // Detecta se é erro de UNIT token expirado
        const isUnitTokenExpired = 
          message?.toLowerCase().includes('unit token') ||
          message?.toLowerCase().includes('buysystem_unit_token') ||
          message?.toLowerCase().includes('token inativo') ||
          errorData?.unit_token_expired === true ||
          (response.status === 401 && message?.toLowerCase().includes('token'))
        
        if (isUnitTokenExpired) {
          throw new Error(
            '🔑 Token UNIT expirado!\n\n' +
            'O token de autenticação expirou (dura apenas 10 minutos).\n\n' +
            'Para renovar, execute no backend Laravel:\n' +
            '  php artisan buysystem:refresh-unit-token\n\n' +
            'Ou manualmente no PowerShell:\n' +
            '  Invoke-WebRequest -Method POST -Uri "https://api.buysystem.com.br/scripts/gerar_token_admin.php"\n\n' +
            'Erro original: ' + message
          )
        }
        
        throw new Error(message)
      }
      const type = response.headers.get('content-type') || ''
      if (type.includes('application/json')) return await response.json()
      return await response.text()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') throw new Error('Timeout: a requisicao demorou mais de 30 segundos')
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        throw new Error('Erro de rede/CORS ao conectar na API BuySystem')
      }
      throw error
    }
  }
}

const http = new BuySystemClient()

function extractAuthData(response) {
  return response?.data || response
}

function applyTokenData(data) {
  tokenState.accessToken = data?.access_token || tokenState.accessToken
  tokenState.refreshToken = data?.refresh_token || tokenState.refreshToken

  const now = Date.now()
  const accessMinutes = Number(data?.expires_in_minutes ?? ACCESS_MINUTES)
  const refreshDays = Number(data?.refresh_expires_in_days ?? REFRESH_DAYS)
  tokenState.expiresAt = now + accessMinutes * 60 * 1000
  tokenState.refreshExpiresAt = now + refreshDays * 24 * 60 * 60 * 1000
  saveTokenState()
}

async function generateInitialToken() {
  if (!UNIT_TOKEN) {
    throw new Error(
      'VITE_BUYSYSTEM_UNIT_TOKEN nao configurado (token unitario de curta duracao fornecido pelo administrador)'
    )
  }

  // Limpa tokens antigos antes de gerar novo
  clearTokenState()

  try {
    const response = await http.request(ENDPOINTS.AUTH.TOKEN_SITE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UNIT_TOKEN}`,
      },
      body: JSON.stringify({
        tipo: TOKEN_TYPE, // "site" ou "admin" conforme documentacao atual
        access_minutes: ACCESS_MINUTES,
        refresh_days: REFRESH_DAYS,
        descricao: TOKEN_DESCRIPTION,
      }),
    })

    applyTokenData(extractAuthData(response))
  } catch (error) {
    // Se o UNIT_TOKEN estiver inválido, limpa tudo e relança erro mais claro
    clearTokenState()
    const errorMsg = error?.message || 'Erro desconhecido'
    
    if (isAuthErrorMessage(errorMsg)) {
      throw new Error(
        `Token UNIT inválido ou expirado. Verifique se o VITE_BUYSYSTEM_UNIT_TOKEN no .env está correto. Erro: ${errorMsg}`
      )
    }
    
    throw error
  }
}

async function refreshAccessToken() {
  if (!tokenState.refreshToken) {
    await generateInitialToken()
    return
  }

  const refreshPayload = JSON.stringify({
    refresh_token: tokenState.refreshToken,
  })

  // A API pode validar o refresh com token de site atual OU token master.
  // Tentamos ambas as estrategias para evitar "Token invalido" em retorno de idle/sleep.
  const authCandidates = [tokenState.accessToken, UNIT_TOKEN].filter(Boolean)
  let lastError = null

  for (const candidate of authCandidates) {
    try {
      const response = await http.request(ENDPOINTS.AUTH.REFRESH, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${candidate}`,
        },
        body: refreshPayload,
      })
      applyTokenData(extractAuthData(response))
      return
    } catch (error) {
      lastError = error
      if (!isAuthErrorMessage(error?.message)) throw error
    }
  }

  // Ultima tentativa sem Authorization (algumas implementacoes aceitam somente refresh_token)
  try {
    const response = await http.request(ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
      body: refreshPayload,
    })
    applyTokenData(extractAuthData(response))
    return
  } catch (error) {
    lastError = error
  }

  throw lastError || new Error('Falha ao renovar token')
}

async function ensureValidAccessToken() {
  const now = Date.now()

  if (tokenState.accessToken && now < tokenState.expiresAt - TOKEN_RENEW_WINDOW_MS) return tokenState.accessToken

  if (!tokenPromise) {
    tokenPromise = (async () => {
      try {
        if (!tokenState.accessToken) {
          await generateInitialToken()
        } else {
          try {
            await refreshAccessToken()
          } catch {
            clearTokenState()
            await generateInitialToken()
          }
        }
      } finally {
        tokenPromise = null
      }
    })()
  }

  await tokenPromise
  return tokenState.accessToken
}

async function runTokenMaintenance() {
  if (maintenancePromise) return maintenancePromise

  maintenancePromise = (async () => {
    const now = Date.now()
    const hasAnyToken = Boolean(tokenState.accessToken || tokenState.refreshToken)
    if (!hasAnyToken) return

    // Refresh token expirado: limpa estado para forcar novo fluxo de geracao.
    if (tokenState.refreshExpiresAt && now >= tokenState.refreshExpiresAt) {
      clearTokenState()
      return
    }

    // Se access token expira em breve, renova.
    if (tokenState.accessToken && now >= tokenState.expiresAt - TOKEN_RENEW_WINDOW_MS) {
      try {
        await refreshAccessToken()
      } catch {
        clearTokenState()
        await generateInitialToken()
      }
    }
  })()

  try {
    await maintenancePromise
  } finally {
    maintenancePromise = null
  }
}

function startTokenMaintenance() {
  if (maintenanceTimerId) return

  // Tick recorrente: garante renovacao mesmo com usuario inativo.
  maintenanceTimerId = window.setInterval(() => {
    runTokenMaintenance().catch(() => {
      // Falhas serao tratadas na proxima chamada autenticada.
    })
  }, TOKEN_MAINTENANCE_INTERVAL_MS)

  // Ao voltar para a aba ou foco da janela, tenta renovar imediatamente.
  const onWake = () => {
    runTokenMaintenance().catch(() => {
      // Ignora erro aqui; chamada de negocio tratara.
    })
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') onWake()
  })
  window.addEventListener('focus', onWake)
}

async function authorizedRequest(endpoint, options = {}) {
  if (USE_SERVER_SIDE_AUTH) {
    return http.request(endpoint, {
      method: options.method || 'GET',
      body: options.body,
      headers: {
        ...(options.headers || {}),
      },
    })
  }

  const run = async () => {
    const accessToken = await ensureValidAccessToken()
    return http.request(endpoint, {
      method: options.method || 'GET',
      body: options.body,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  try {
    return await run()
  } catch (error) {
    const isAuthError = isAuthErrorMessage(error?.message)

    // Se o token salvo estiver invalido, limpa o cache local e tenta 1 vez de novo.
    if (!isAuthError) throw error

    // Limpa o estado do token para forçar regeneração
    clearTokenState()

    // Gera um novo token e tenta novamente
    try {
      const accessToken = await ensureValidAccessToken()
      return http.request(endpoint, {
        method: options.method || 'GET',
        body: options.body,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${accessToken}`,
        },
      })
    } catch {
      // Se ainda falhar após regenerar o token, lança o erro original
      throw error
    }
  }
}

async function authorizedGet(endpoint) {
  return authorizedRequest(endpoint, { method: 'GET' })
}

async function authorizedPost(endpoint, payload) {
  return authorizedRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  })
}

async function requestFirstSuccess(candidates, requester) {
  const errors = []
  for (const endpoint of candidates) {
    try {
      return await requester(endpoint)
    } catch (error) {
      errors.push(error?.message || String(error))
    }
  }
  throw new Error(`Nenhum endpoint respondeu com sucesso: ${errors.join(' | ')}`)
}

function formatDate(value) {
  if (!value) return 'Data nao informada'
  try {
    const d = new Date(value)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch {
    return String(value)
  }
}

function formatTime(value) {
  if (!value) return 'Horario nao informado'
  if (/^\d{2}:\d{2}$/.test(String(value))) return String(value)
  if (/^\d{2}:\d{2}:\d{2}$/.test(String(value))) return String(value).slice(0, 5)
  try {
    return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return String(value)
  }
}

function fallbackImage() {
  return 'https://private-us-east-1.manuscdn.com/sessionFile/ct5iih13rREJzVL8BUQxZf/sandbox/YN3cvVrDfKJXUeY7ppiGs4-img-2_1770038910000_na1fn_aGVyby1taXJhbnRlLXN1bnNldA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80'
}

function resolveEventImage(raw) {
  // A API pode retornar a imagem como:
  // - string direta em `logo`
  // - objeto em `logo` (ex.: { url: '...' })
  // - outros nomes legados (imagem_url/imagem/image)
  const logoRaw = raw?.logo
  const logoUrlCandidate =
    typeof logoRaw === 'string'
      ? logoRaw
      : typeof logoRaw === 'object' && logoRaw
        ? logoRaw.url || logoRaw.path || logoRaw.href
        : ''

  const candidate = String(
    raw?.imagem_url ||
      raw?.imagem ||
      raw?.image ||
      logoUrlCandidate ||
      logoRaw ||
      '',
  )
    .trim()
    .replace(/\\/g, '/')

  if (!candidate || candidate === '[object Object]') return fallbackImage()

  // Quando vier do host de imagens do BuySystem, proxy-a via backend
  // para evitar bloqueios de hotlink/headers no navegador.
  const imgHostMatch = candidate.match(/^https?:\/\/img\.buysystem\.com\.br\/(.+)$/i)
  if (imgHostMatch && imgHostMatch[1]) {
    const path = `/${imgHostMatch[1]}`
    return `/api/buysystem/image?path=${encodeURIComponent(path)}`
  }

  // Ja veio URL completa da API
  if (/^https?:\/\//i.test(candidate)) return candidate
  if (candidate.startsWith('//')) return `https:${candidate}`

  // Alguns payloads retornam "App.buysystem.com.br/uploads/..." sem protocolo.
  if (/^[\w.-]+\.[a-z]{2,}(?:\/|$)/i.test(candidate)) return `https://${candidate}`

  // Quando vier "/uploads/arquivo.jpg", monta direto no host padrao.
  if (/^\/?uploads\//i.test(candidate)) {
    const path = candidate.replace(/^\/+/, '')
    return `https://app.buysystem.com.br/${path}`
  }

  // Quando a API devolve so o nome do arquivo (ex: "685c155291c98.png"),
  // tentamos montar via base configuravel.
  const assetBase = (import.meta.env.VITE_BUYSYSTEM_ASSET_BASE_URL || DEFAULT_ASSET_BASE_URL).trim()
  if (assetBase) {
    const base = assetBase.endsWith('/') ? assetBase.slice(0, -1) : assetBase
    let path = candidate.replace(/^\/+/, '')

    // Evita duplicar "/uploads" quando base ja aponta para esse diretorio.
    if (/\/uploads$/i.test(base)) {
      path = path.replace(/^uploads\//i, '')
    }

    path = path.startsWith('/') ? path : `/${path}`
    return `${base}${path}`
  }

  return fallbackImage()
}

function badgeForEvent(raw) {
  const capacity = Number(raw.capacidade || raw.total_vagas || raw.capacity || 0)
  const available = Number(raw.disponivel || raw.vagas_disponiveis || raw.available || 0)
  const price = Number(raw.preco || raw.valor || raw.price || 0)
  if (price === 0) return 'Gratuito'
  if (capacity > 0 && ((capacity - available) / capacity) * 100 >= 80) return 'Quase Lotado'
  return ''
}

function mapEvent(raw) {
  const cityUf = [raw.cidade, raw.uf].filter(Boolean).join(' - ')
  const location = raw.local || raw.localizacao || raw.location || cityUf || 'Boa Vista, RR'
  const local = String(raw.local ?? '').trim()

  return {
    id: raw.evento_id || raw.id || raw.codigo || raw.slug || Date.now(),
    title: raw.titulo || raw.nome || raw.title || 'Evento sem titulo',
    // Campos principais da API atual: data_inicio e hora_inicio
    date: formatDate(raw.data_inicio || raw.data || raw.data_evento || raw.date),
    time: formatTime(raw.hora_inicio || raw.hora || raw.horario || raw.time),
    location,
    /** Nome do local exatamente como vem em `local` na API (ex.: venue). */
    local,
    capacity: Number(raw.capacidade || raw.total_vagas || raw.capacity || 100),
    available: Number(raw.disponivel || raw.vagas_disponiveis || raw.available || 0),
    price: Number(raw.preco || raw.valor || raw.price || 0),
    image: resolveEventImage(raw),
    badge: badgeForEvent(raw),
    descricao: raw.descricao || raw.description || '',
    pdv_id: raw.pdv_id || DEFAULT_PDV_ID,
    raw,
  }
}

function mapSession(raw) {
  const available = Number(raw.disponivel ?? raw.vagas_disponiveis ?? raw.available ?? raw.quantidade_disponivel ?? 0)
  const capacity = Number(raw.capacidade ?? raw.total_vagas ?? raw.capacity ?? raw.quantidade_total ?? available)
  const startsAt = raw.data_hora || raw.inicio || raw.starts_at || raw.data_inicio || raw.hora_inicio || raw.hora
  return {
    id: raw.setor_id || raw.horario_id || raw.sessao_id || raw.id || raw.codigo,
    name: raw.nome || raw.titulo || raw.setor || raw.horario || `Entrada ${formatTime(startsAt)}`,
    time: formatTime(startsAt),
    date: formatDate(raw.data || raw.data_inicio || startsAt),
    available,
    capacity,
    isAvailable: available > 0 && !raw.esgotado && !raw.inativo,
    price: Number(raw.preco ?? raw.valor ?? raw.price ?? 0),
    raw,
  }
}

function mapAvailableTicket(raw) {
  const lotes = Array.isArray(raw.lotes) ? raw.lotes : []
  const selectedLote =
    lotes.find((lote) => Number(lote?.ativo ?? 1) === 1) ||
    lotes.find((lote) => Number(lote?.quantidade ?? 0) > 0) ||
    lotes[0] ||
    null

  const available = Number(
    raw.disponivel ??
      raw.vagas_disponiveis ??
      raw.available ??
      raw.quantidade_disponivel ??
      raw.qtd_disponivel ??
      raw.estoque ??
      selectedLote?.quantidade ??
      raw.quantidade ??
      0
  )
  const capacity = Number(
    raw.capacidade ??
      raw.total_vagas ??
      raw.capacity ??
      raw.quantidade_total ??
      raw.qtd_total ??
      selectedLote?.quantidade ??
      available
  )
  const timeValue = raw.hora || raw.horario || raw.hora_inicio || raw.starts_at || raw.data_hora
  const lotePrice = selectedLote?.valor
  const loteIsActive = selectedLote ? Number(selectedLote?.ativo ?? 1) === 1 : true
  return {
    id: raw.ingresso_id || raw.ticket_id || raw.setor_id || raw.horario_id || raw.id || selectedLote?.id || raw.codigo,
    name: raw.nome || raw.titulo || raw.tipo || raw.ticket_name || 'Ingresso',
    description: raw.descricao || raw.description || '',
    time: formatTime(timeValue),
    available,
    capacity,
    isAvailable: available > 0 && loteIsActive && !raw.esgotado && !raw.inativo,
    price: Number(raw.preco ?? raw.valor ?? raw.price ?? lotePrice ?? 0),
    raw,
  }
}

function extractEmbeddedTickets(response) {
  if (!response || typeof response !== 'object') return []

  const roots = [response, response.data, response.evento, response.event]
    .filter(Boolean)
    .filter((item) => typeof item === 'object')

  for (const root of roots) {
    const candidates = [
      root.ingressos,
      root.ingresso,
      root.tickets,
      root.ticket,
      root.lotes,
      root.lote,
      root.ticket_types,
      root.tipos_ingresso,
      root.tiposIngresso,
      root.evento?.ingressos,
      root.evento?.tickets,
      root.event?.ingressos,
      root.event?.tickets,
      root.items,
    ]
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate
    }
  }

  return []
}

function looksLikeTicketObject(item) {
  if (!item || typeof item !== 'object') return false
  const keys = Object.keys(item)
  const keySet = new Set(keys)
  const strongSignals = [
    'ingresso_id',
    'ticket_id',
    'lote_id',
    'tipo_ingresso_id',
    'valor',
    'preco',
    'price',
    'disponivel',
    'vagas_disponiveis',
    'quantidade_disponivel',
  ]
  const matches = strongSignals.filter((k) => keySet.has(k)).length
  return matches >= 2
}

function extractTicketsDeep(source, maxDepth = 5) {
  const queue = [{ node: source, depth: 0 }]
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) break
    const { node, depth } = current
    if (!node || depth > maxDepth) continue

    if (Array.isArray(node)) {
      if (node.length > 0 && looksLikeTicketObject(node[0])) return node
      for (const child of node) {
        if (child && typeof child === 'object') queue.push({ node: child, depth: depth + 1 })
      }
      continue
    }

    if (typeof node === 'object') {
      for (const value of Object.values(node)) {
        if (value && typeof value === 'object') queue.push({ node: value, depth: depth + 1 })
      }
    }
  }
  return []
}

function mapTicket(raw) {
  const confirmationCode =
    raw.codigo_confirmacao || raw.codigo || raw.confirmationCode || raw.protocolo || raw.localizador || '-'
  const eventName = raw.evento_nome || raw.evento?.nome || raw.titulo_evento || raw.eventName || 'Ingresso'
  const dateValue = raw.data || raw.data_evento || raw.evento_data || raw.created_at
  const timeValue = raw.hora || raw.hora_evento || raw.evento_hora
  return {
    id: raw.ingresso_id || raw.id || raw.codigo || confirmationCode,
    eventName,
    date: formatDate(dateValue),
    time: formatTime(timeValue),
    location: raw.local || raw.localizacao || raw.evento_local || 'Boa Vista, RR',
    quantity: Number(raw.quantidade || raw.qtd || 1),
    status: raw.status || raw.situacao || 'Confirmado',
    confirmationCode,
    qrCode: raw.qr_code || raw.qrcode || raw.qrCode || '',
    pdfUrl: raw.pdf_url || raw.pdfUrl || '',
    raw,
  }
}

function normalizeListResponse(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.eventos)) return response.eventos
  if (Array.isArray(response?.horarios)) return response.horarios
  if (Array.isArray(response?.setores)) return response.setores
  if (Array.isArray(response?.ingressos)) return response.ingressos
  if (Array.isArray(response?.tickets)) return response.tickets
  if (Array.isArray(response?.items)) return response.items
  if (response?.data && typeof response.data === 'object') {
    const maybeArray = Object.values(response.data).find((v) => Array.isArray(v))
    if (maybeArray) return maybeArray
  }
  return []
}

// Sempre verifica se o UNIT_TOKEN mudou (ex.: novo token no .env) e limpa estado antigo
checkUnitTokenChanged()
if (!USE_SERVER_SIDE_AUTH) {
  loadTokenState()
  startTokenMaintenance()
}

// ============================================================================
// OPERATOR SESSION — gerencia sessão do operador logado
// ============================================================================

const OPERATOR_SESSION_KEY = 'buysystem_operator_session'

function getOperatorSession() {
  return sessionStorage.getItem(OPERATOR_SESSION_KEY) || null
}

function setOperatorSession(session) {
  if (session) {
    sessionStorage.setItem(OPERATOR_SESSION_KEY, session)
  } else {
    sessionStorage.removeItem(OPERATOR_SESSION_KEY)
  }
}

function clearOperatorSession() {
  sessionStorage.removeItem(OPERATOR_SESSION_KEY)
}

// ============================================================================
// CLIENTE (visitante) — sessão após login em /clientes/login
// ============================================================================

const CLIENTE_SESSION_KEY = 'mirante_cliente_session'

function getClienteSession() {
  return sessionStorage.getItem(CLIENTE_SESSION_KEY) || null
}

function setClienteSession(session) {
  if (session) {
    sessionStorage.setItem(CLIENTE_SESSION_KEY, session)
  } else {
    sessionStorage.removeItem(CLIENTE_SESSION_KEY)
  }
}

function clearClienteSession() {
  sessionStorage.removeItem(CLIENTE_SESSION_KEY)
}

function persistClienteAfterLogin(response, login) {
  const root = response?.data ?? response
  const session =
    root?.cliente_session ??
    root?.client_session ??
    root?.session ??
    root?.token ??
    root?.access_token ??
    null
  if (session) setClienteSession(String(session))

  const cliente = root?.cliente ?? root?.user ?? null
  const email =
    (cliente && cliente.email) ||
    (typeof login === 'string' && login.includes('@') ? String(login).trim() : '') ||
    ''
  const cpf = cliente?.cpf ? String(cliente.cpf).replace(/\D/g, '') : ''
  const id = cliente?.id ?? cliente?.cliente_id

  if (email || cpf || (typeof login === 'string' && login.trim())) {
    localStorage.setItem(
      'mirante_last_customer',
      JSON.stringify({
        email: email || (typeof login === 'string' ? login.trim() : ''),
        cpf,
        ...(id != null && id !== '' ? { id } : {}),
      }),
    )
  }
}

/**
 * Faz uma requisição autenticada com o header X-Operator-Session
 */
async function authorizedRequestWithSession(endpoint, options = {}) {
  const session = getOperatorSession()
  const extraHeaders = session ? { 'X-Operator-Session': session } : {}
  return authorizedRequest(endpoint, {
    ...options,
    headers: { ...(options.headers || {}), ...extraHeaders },
  })
}

async function authorizedGetWithSession(endpoint) {
  return authorizedRequestWithSession(endpoint, { method: 'GET' })
}

async function authorizedPostWithSession(endpoint, payload) {
  return authorizedRequestWithSession(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  })
}

export const apidogService = {

  // ==========================================================================
  // 03 - CATÁLOGO (V2)
  // ==========================================================================

  async getEvents() {
    const response = await authorizedGet(ENDPOINTS.EVENTS.LIST)
    return normalizeListResponse(response).map(mapEvent)
  },

  /** @deprecated Use getEvents() — mantido para compatibilidade */
  async getEventsByPDV(pdvId = DEFAULT_PDV_ID) {
    return this.getEvents()
  },

  async getEventDetail(eventoId) {
    if (!eventoId) throw new Error('ID do evento nao informado')
    const response = await authorizedGet(ENDPOINTS.EVENTS.DETAIL(eventoId))
    const raw = response?.data || response
    return mapEvent(raw)
  },

  async getEventSessions(eventoId) {
    if (!eventoId) throw new Error('ID do evento nao informado')
    const response = await authorizedGet(ENDPOINTS.EVENTS.SESSIONS(eventoId))
    return normalizeListResponse(response).map(mapSession)
  },

  async getEventTickets(eventoId) {
    if (!eventoId) throw new Error('ID do evento nao informado')
    const response = await authorizedGet(ENDPOINTS.EVENTS.TICKETS(eventoId))

    const list = normalizeListResponse(response)
    if (list.length > 0) return list.map(mapAvailableTicket)

    const embedded = extractEmbeddedTickets(response)
    if (embedded.length > 0) return embedded.map(mapAvailableTicket)

    return extractTicketsDeep(response).map(mapAvailableTicket)
  },

  async getCatalogPreload() {
    const response = await authorizedGet(ENDPOINTS.EVENTS.PRELOAD)
    return response
  },

  // ==========================================================================
  // 02 - OPERADORES
  // ==========================================================================

  async autenticarOperador(email, senha) {
    const response = await authorizedPost(ENDPOINTS.OPERADORES.AUTENTICAR, { email, senha })
    // Armazena a sessão do operador retornada pela API
    const session = response?.data?.operator_session
      || response?.operator_session
      || response?.session
      || response?.token
      || null
    if (session) setOperatorSession(session)
    return response
  },

  async getSessaoOperador() {
    return authorizedGetWithSession(ENDPOINTS.OPERADORES.ME)
  },

  async logoutOperador() {
    try {
      await authorizedPostWithSession(ENDPOINTS.OPERADORES.LOGOUT, {})
    } finally {
      clearOperatorSession()
    }
  },

  isOperadorLogado() {
    return Boolean(getOperatorSession())
  },

  getOperatorSession,

  // ==========================================================================
  // 04 - CLIENTES
  // ==========================================================================

  async loginCliente(login, senha) {
    const response = await authorizedPost(ENDPOINTS.CLIENTES.LOGIN, { login, senha })
    persistClienteAfterLogin(response, login)
    return response
  },

  logoutCliente() {
    clearClienteSession()
    localStorage.removeItem('mirante_last_customer')
  },

  isClienteLogado() {
    return Boolean(getClienteSession())
  },

  getClienteSession,

  async buscarClientes(filters = {}) {
    const query = new URLSearchParams()
    if (filters?.cpf)   query.set('cpf', String(filters.cpf).replace(/\D/g, ''))
    if (filters?.email) query.set('email', String(filters.email).trim())
    if (filters?.nome)  query.set('nome', String(filters.nome).trim())
    const suffix = query.toString() ? `?${query.toString()}` : ''
    const response = await authorizedGet(ENDPOINTS.CLIENTES.BUSCAR + suffix)
    return normalizeListResponse(response)
  },

  async cadastrarCliente(dados) {
    return authorizedPost(ENDPOINTS.CLIENTES.CADASTRAR, {
      nome:            dados.nome,
      email:           dados.email,
      cpf:             String(dados.cpf).replace(/\D/g, ''),
      cep:             String(dados.cep).replace(/\D/g, ''),
      numero:          dados.numero,
      complemento:     dados.complemento,
      data_nascimento: dados.data_nascimento,
      ...(dados.senha ? { senha: dados.senha } : {}),
      ...(dados.telefone
        ? { telefone: String(dados.telefone).replace(/\D/g, '') }
        : {}),
    })
  },

  // ==========================================================================
  // 05 - CHECKOUT (V2 — Site/App)
  // ==========================================================================

  async checkout({ clienteId, eventoId, itens, pagamento }) {
    const idempotencyKey = `${clienteId}-${eventoId}-${Date.now()}-sit`
    return authorizedPost(ENDPOINTS.CHECKOUT.FINALIZAR, {
      cliente_id:      clienteId,
      evento_id:       eventoId,
      idempotency_key: idempotencyKey,
      itens,
      pagamento,
    })
  },

  /** @deprecated Use checkout() — mantido para compatibilidade */
  async createTicketReservation(payload) {
    return this.checkout({
      clienteId: payload?.clienteId || payload?.cliente_id,
      eventoId:  payload?.eventoId  || payload?.evento_id,
      itens:     payload?.itens     || [{
        setor_id:    payload?.setorId    || payload?.sessionId,
        ingresso_id: payload?.ingressoId,
        lote_id:     payload?.loteId,
        quantidade:  Number(payload?.quantity || 1),
      }],
      pagamento: payload?.pagamento || { metodo: 'online', observacoes: '' },
    })
  },

  // ==========================================================================
  // 06 - TICKETS / CHECK-IN
  // ==========================================================================

  async listarTickets(filters = {}) {
    const query = new URLSearchParams()
    if (filters?.pagamento_id) query.set('pagamento_id', filters.pagamento_id)
    if (filters?.cpf)          query.set('cpf', String(filters.cpf).replace(/\D/g, ''))
    if (filters?.email)        query.set('email', String(filters.email).trim())
    const suffix = query.toString() ? `?${query.toString()}` : ''
    const response = await authorizedGet(ENDPOINTS.TICKETS.LIST + suffix)
    return normalizeListResponse(response).map(mapTicket)
  },

  async reimprimirTicket(codigo) {
    const response = await authorizedGet(`${ENDPOINTS.TICKETS.REIMPRIMIR}?codigo=${encodeURIComponent(codigo)}`)
    return response
  },

  async checkin(codigo) {
    return authorizedPost(ENDPOINTS.TICKETS.CHECKIN, { codigo })
  },

  async fazerCheckin(codigo) {
    return this.checkin(codigo)
  },

  /** @deprecated Use listarTickets() */
  async getMyTickets(filters = {}) {
    return this.listarTickets(filters)
  },

  // ==========================================================================
  // TOKEN / DIAGNÓSTICO
  // ==========================================================================

  async forceRefreshToken() {
    if (USE_SERVER_SIDE_AUTH) return
    await refreshAccessToken()
  },

  clearToken() {
    if (USE_SERVER_SIDE_AUTH) return
    clearTokenState()
    localStorage.removeItem(UNIT_TOKEN_STORAGE_KEY)
  },

  async regenerateToken() {
    if (USE_SERVER_SIDE_AUTH) return
    clearTokenState()
    localStorage.removeItem(UNIT_TOKEN_STORAGE_KEY)
    await generateInitialToken()
  },
}

export default apidogService