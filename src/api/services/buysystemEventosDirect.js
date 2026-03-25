// Cliente direto (front-end) para BuySystem API V2.
// Fluxo:
// 1) POST /v2/auth/ativar (Authorization: Bearer <token init>)
// 2) GET  /v2/eventos (Authorization: Bearer <access_token>)

const DEFAULT_API_BASE_URL = 'https://api.buysystem.com.br'

const STORAGE_KEYS = {
  accessToken: 'buysystem_access_token',
  expiresAtMs: 'buysystem_access_token_expires_at_ms',
}

function nowMs() {
  return Date.now()
}

function parseExpiresAtMs(data) {
  // Exemplos:
  // - expires_at: "2026-03-18 16:21:37"
  // - expires_in_hours: 2
  const expiresAt = data?.expires_at
  const expiresInHours = data?.expires_in_hours

  if (expiresAt) {
    // Converte "YYYY-MM-DD HH:MM:SS" para ISO aceito pelo JS.
    const iso = String(expiresAt).trim().replace(' ', 'T')
    const ms = new Date(iso).getTime()
    if (!Number.isNaN(ms)) return ms
  }

  if (typeof expiresInHours === 'number') {
    return nowMs() + expiresInHours * 60 * 60 * 1000
  }

  if (typeof expiresInHours === 'string' && expiresInHours.trim()) {
    const n = Number(expiresInHours)
    if (!Number.isNaN(n)) return nowMs() + n * 60 * 60 * 1000
  }

  return 0
}

function isTokenValid(expiresAtMs) {
  // Usa margem de 60s para evitar expirar no meio do request.
  const marginMs = 60 * 1000
  return Boolean(expiresAtMs && nowMs() < expiresAtMs - marginMs)
}

function loadStoredToken() {
  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken) || ''
    const expiresAtMsRaw = localStorage.getItem(STORAGE_KEYS.expiresAtMs)
    const expiresAtMs = expiresAtMsRaw ? Number(expiresAtMsRaw) : 0
    return { accessToken, expiresAtMs }
  } catch {
    return { accessToken: '', expiresAtMs: 0 }
  }
}

function saveStoredToken({ accessToken, expiresAtMs }) {
  try {
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken || '')
    localStorage.setItem(STORAGE_KEYS.expiresAtMs, String(expiresAtMs || 0))
  } catch {
    // Se localStorage falhar (ex.: navegador restrito), ainda tentamos sem cache.
  }
}

async function httpJson(url, options = {}) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 30000)

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    const contentType = res.headers.get('content-type') || ''
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text || `HTTP ${res.status}`)
    }

    if (contentType.includes('application/json')) {
      return await res.json()
    }

    // Caso a API devolva algo inesperado.
    const text = await res.text().catch(() => '')
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export default {
  async activateUnit() {
    const apiBaseUrl = String(
      import.meta.env.VITE_BUYSYSTEM_API_BASE_URL || DEFAULT_API_BASE_URL,
    ).replace(/\/+$/, '')

    const initToken = String(import.meta.env.VITE_BUYSYSTEM_UNIT_TOKEN || '').trim()
    if (!initToken) throw new Error('VITE_BUYSYSTEM_UNIT_TOKEN não configurado.')

    // Pelo seu Postman: apenas Authorization + endpoint.
    const url = `${apiBaseUrl}/v2/auth/ativar`

    const responseJson = await httpJson(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${initToken}`,
        // Mantém como application/json; caso não haja body, não faz mal para a maioria das APIs.
        'Content-Type': 'application/json',
      },
      // sem body (ajuste aqui se o seu endpoint exigir payload)
      body: undefined,
    })

    if (!responseJson?.success) {
      throw new Error(responseJson?.message || 'Falha ao ativar unidade (API retornou success=false).')
    }

    const data = responseJson.data || {}
    const accessToken = data.access_token || ''
    const expiresAtMs = parseExpiresAtMs(data)

    if (!accessToken) throw new Error('API ativar retornou access_token vazio.')

    saveStoredToken({ accessToken, expiresAtMs })
    return { accessToken, expiresAtMs }
  },

  async getAccessToken() {
    const { accessToken, expiresAtMs } = loadStoredToken()
    if (isTokenValid(expiresAtMs) && accessToken) return accessToken
    const { accessToken: freshAccessToken } = await this.activateUnit()
    return freshAccessToken
  },

  async getEventos() {
    const apiBaseUrl = String(
      import.meta.env.VITE_BUYSYSTEM_API_BASE_URL || DEFAULT_API_BASE_URL,
    ).replace(/\/+$/, '')

    const accessToken = await this.getAccessToken()
    const url = `${apiBaseUrl}/v2/eventos`

    const responseJson = await httpJson(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!responseJson?.success) {
      throw new Error(responseJson?.message || 'Falha ao carregar eventos (success=false).')
    }

    const rawEvents = responseJson?.data
    const list = Array.isArray(rawEvents) ? rawEvents : []

    const DEFAULT_IMAGE_DAY =
      'https://private-us-east-1.manuscdn.com/sessionFile/ct5iih13rREJzVL8BUQxZf/sandbox/YN3cvVrDfKJXUeY7ppiGs4-img-2_1770038910000_na1fn_aGVyby1taXJhbnRlLXN1bnNldA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80'

    function formatDatePtBR(dateStr) {
      if (!dateStr) return 'Data nao informada'
      const d = new Date(String(dateStr).trim())
      if (Number.isNaN(d.getTime())) return String(dateStr)
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    }

    // Converte do formato da sua /v2/eventos para o formato do EventCard.
    return list.map((e) => {
      const isActive = Number(e?.ativo) === 1
      return {
        id: Number(e?.id ?? Date.now()),
        title: String(e?.nome ?? 'Evento sem titulo'),
        date: formatDatePtBR(e?.data_inicio),
        time: '00:00',
        location: String(e?.local ?? ''),
        capacity: 100,
        available: isActive ? 100 : 0,
        price: 0,
        image: DEFAULT_IMAGE_DAY,
        badge: isActive ? 'Ativo' : 'Inativo',
      }
    })
  },
}

