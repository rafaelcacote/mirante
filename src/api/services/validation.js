/**
 * Serviço de API para Validações
 * 
 * Gerencia validações de CPF, email, disponibilidade, etc.
 */

import apiClient from '../index.js'
import ENDPOINTS from '../endpoints.js'

export const validationService = {
  /**
   * Validar CPF
   * @param {string} cpf - CPF a ser validado (com ou sem formatação)
   * @returns {Promise<Object>} Resultado da validação
   */
  async validateCPF(cpf) {
    try {
      const response = await apiClient.post(ENDPOINTS.VALIDATE.CPF, { cpf })
      return response
    } catch (error) {
      console.error('Erro ao validar CPF:', error)
      throw error
    }
  },

  /**
   * Validar email
   * @param {string} email - Email a ser validado
   * @returns {Promise<Object>} Resultado da validação
   */
  async validateEmail(email) {
    try {
      const response = await apiClient.post(ENDPOINTS.VALIDATE.EMAIL, { email })
      return response
    } catch (error) {
      console.error('Erro ao validar email:', error)
      throw error
    }
  },

  /**
   * Verificar disponibilidade geral
   * @param {Object} availabilityData - Dados para verificação
   * @param {number} availabilityData.sectorId - ID do setor
   * @param {number} availabilityData.quantity - Quantidade desejada
   * @param {string} availabilityData.date - Data
   * @returns {Promise<Object>} Resultado da verificação
   */
  async checkAvailability(availabilityData) {
    try {
      const response = await apiClient.post(ENDPOINTS.VALIDATE.AVAILABILITY, availabilityData)
      return response
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error)
      throw error
    }
  },
}

export default validationService
