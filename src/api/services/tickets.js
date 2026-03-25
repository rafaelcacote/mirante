/**
 * Serviço de API para Ingressos
 * 
 * Gerencia todas as operações relacionadas a ingressos e reservas
 */

import apiClient from '../index.js'
import ENDPOINTS from '../endpoints.js'

export const ticketsService = {
  /**
   * Listar ingressos do usuário atual
   * @returns {Promise<Array>} Lista de ingressos
   */
  async getAll() {
    try {
      const response = await apiClient.get(ENDPOINTS.TICKETS.LIST)
      return response
    } catch (error) {
      console.error('Erro ao buscar ingressos:', error)
      throw error
    }
  },

  /**
   * Criar uma nova reserva/ingresso
   * @param {Object} ticketData - Dados do ingresso
   * @param {number} ticketData.sectorId - ID do setor/horário
   * @param {number} ticketData.quantity - Quantidade de ingressos
   * @param {Object} ticketData.customer - Dados do cliente
   * @returns {Promise<Object>} Ingresso criado
   */
  async create(ticketData) {
    try {
      const response = await apiClient.post(ENDPOINTS.TICKETS.CREATE, ticketData)
      return response
    } catch (error) {
      console.error('Erro ao criar ingresso:', error)
      throw error
    }
  },

  /**
   * Buscar detalhes de um ingresso específico
   * @param {string|number} ticketId - ID do ingresso
   * @returns {Promise<Object>} Detalhes do ingresso
   */
  async getById(ticketId) {
    try {
      const response = await apiClient.get(ENDPOINTS.TICKETS.DETAIL(ticketId))
      return response
    } catch (error) {
      console.error(`Erro ao buscar ingresso ${ticketId}:`, error)
      throw error
    }
  },

  /**
   * Obter QR Code de um ingresso
   * @param {string|number} ticketId - ID do ingresso
   * @returns {Promise<string>} URL ou base64 do QR Code
   */
  async getQRCode(ticketId) {
    try {
      const response = await apiClient.get(ENDPOINTS.TICKETS.QR_CODE(ticketId))
      return response
    } catch (error) {
      console.error(`Erro ao buscar QR Code do ingresso ${ticketId}:`, error)
      throw error
    }
  },

  /**
   * Cancelar um ingresso
   * @param {string|number} ticketId - ID do ingresso
   * @returns {Promise<Object>} Confirmação do cancelamento
   */
  async cancel(ticketId) {
    try {
      const response = await apiClient.post(ENDPOINTS.TICKETS.CANCEL(ticketId))
      return response
    } catch (error) {
      console.error(`Erro ao cancelar ingresso ${ticketId}:`, error)
      throw error
    }
  },

  /**
   * Download do PDF do ingresso
   * @param {string|number} ticketId - ID do ingresso
   * @returns {Promise<Blob>} Arquivo PDF
   */
  async downloadPDF(ticketId) {
    try {
      const response = await apiClient.get(ENDPOINTS.TICKETS.DOWNLOAD(ticketId), {
        headers: {
          'Accept': 'application/pdf',
        },
      })
      return response
    } catch (error) {
      console.error(`Erro ao baixar PDF do ingresso ${ticketId}:`, error)
      throw error
    }
  },
}

export default ticketsService
