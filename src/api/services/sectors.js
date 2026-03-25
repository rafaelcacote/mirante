/**
 * Serviço de API para Setores/Horários
 * 
 * Gerencia todas as operações relacionadas a setores e horários de visitação
 */

import apiClient from '../index.js'
import ENDPOINTS from '../endpoints.js'

export const sectorsService = {
  /**
   * Listar todos os setores/horários
   * @param {string|number} eventId - ID do evento (opcional)
   * @returns {Promise<Array>} Lista de setores
   */
  async getAll(eventId = null) {
    try {
      const endpoint = eventId 
        ? ENDPOINTS.SECTORS.BY_EVENT(eventId)
        : ENDPOINTS.SECTORS.LIST
      
      const response = await apiClient.get(endpoint)
      return response
    } catch (error) {
      console.error('Erro ao buscar setores:', error)
      throw error
    }
  },

  /**
   * Buscar detalhes de um setor específico
   * @param {string|number} sectorId - ID do setor
   * @returns {Promise<Object>} Detalhes do setor
   */
  async getById(sectorId) {
    try {
      const response = await apiClient.get(ENDPOINTS.SECTORS.DETAIL(sectorId))
      return response
    } catch (error) {
      console.error(`Erro ao buscar setor ${sectorId}:`, error)
      throw error
    }
  },

  /**
   * Verificar disponibilidade de um setor
   * @param {string|number} sectorId - ID do setor
   * @returns {Promise<Object>} Informações de disponibilidade
   */
  async checkAvailability(sectorId) {
    try {
      const response = await apiClient.get(ENDPOINTS.SECTORS.AVAILABILITY(sectorId))
      return response
    } catch (error) {
      console.error(`Erro ao verificar disponibilidade do setor ${sectorId}:`, error)
      throw error
    }
  },
}

export default sectorsService
