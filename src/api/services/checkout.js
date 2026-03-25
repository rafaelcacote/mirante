/**
 * Serviço de API para Checkout
 * 
 * Gerencia o processo de finalização de compra
 */

import apiClient from '../index.js'
import ENDPOINTS from '../endpoints.js'

export const checkoutService = {
  /**
   * Processar checkout
   * @param {Object} checkoutData - Dados do checkout
   * @param {Array} checkoutData.tickets - Lista de ingressos
   * @param {Object} checkoutData.customer - Dados do cliente
   * @param {Object} checkoutData.payment - Dados de pagamento (se aplicável)
   * @returns {Promise<Object>} Resultado do checkout
   */
  async process(checkoutData) {
    try {
      const response = await apiClient.post(ENDPOINTS.CHECKOUT.PROCESS, checkoutData)
      return response
    } catch (error) {
      console.error('Erro ao processar checkout:', error)
      throw error
    }
  },

  /**
   * Confirmar checkout
   * @param {string} checkoutId - ID do checkout
   * @returns {Promise<Object>} Confirmação do checkout
   */
  async confirm(checkoutId) {
    try {
      const response = await apiClient.post(ENDPOINTS.CHECKOUT.CONFIRM, { checkoutId })
      return response
    } catch (error) {
      console.error(`Erro ao confirmar checkout ${checkoutId}:`, error)
      throw error
    }
  },
}

export default checkoutService
