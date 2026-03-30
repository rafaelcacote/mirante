/**
 * Base da API Laravel (mesmo padrão de apidog.js).
 * Em dev o Vite encaminha /api para o artisan serve.
 */

export function getApiBaseUrl() {
  return String(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
}

/**
 * @param {string} path - Ex.: '/boavista/noticias' ou 'boavista/noticias'
 */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${getApiBaseUrl()}${p}`
}
