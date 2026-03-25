/**
 * Configuração base do cliente HTTP para comunicação com a API
 * 
 * Este arquivo centraliza a configuração de todas as requisições HTTP
 * e pode ser usado com axios ou fetch nativo
 */

// URL base da API - pode ser configurada via variável de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000

/**
 * Cliente HTTP usando Fetch API nativo
 * Alternativa: usar axios (npm install axios)
 */
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL
    this.timeout = API_TIMEOUT
  }

  /**
   * Método genérico para fazer requisições HTTP
   * @param {string} endpoint - Endpoint da API (ex: '/events')
   * @param {object} options - Opções do fetch (method, body, headers, etc)
   * @returns {Promise} - Promise com a resposta da API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    // Headers padrão
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Adicionar token de autenticação se existir
    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Configuração da requisição
    const config = {
      ...options,
      headers,
    }

    try {
      // Criar AbortController para timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      config.signal = controller.signal

      const response = await fetch(url, config)
      clearTimeout(timeoutId)

      // Verificar se a resposta é ok
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `HTTP error! status: ${response.status}`)
      }

      // Retornar JSON se houver conteúdo
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }

      return await response.text()
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
  }

  /**
   * GET request
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * PUT request
   */
  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * PATCH request
   */
  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * Obter token de autenticação do localStorage
   */
  getAuthToken() {
    return localStorage.getItem('auth_token')
  }

  /**
   * Salvar token de autenticação
   */
  setAuthToken(token) {
    localStorage.setItem('auth_token', token)
  }

  /**
   * Remover token de autenticação
   */
  removeAuthToken() {
    localStorage.removeItem('auth_token')
  }
}

// Criar instância única do cliente
const apiClient = new ApiClient()

export default apiClient
