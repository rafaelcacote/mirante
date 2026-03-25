/**
 * Serviço de Operadores — BuySystem API V2
 *
 * Re-exporta as funções de operadores do apidogService
 * para facilitar imports diretos nos componentes Vue.
 *
 * Uso:
 *   import { autenticarOperador, isOperadorLogado } from '@/api/services/operadores.js'
 */

import { apidogService } from './apidog.js'

export const autenticarOperador = (email, senha) =>
  apidogService.autenticarOperador(email, senha)

export const getSessaoOperador = () =>
  apidogService.getSessaoOperador()

export const logoutOperador = () =>
  apidogService.logoutOperador()

export const isOperadorLogado = () =>
  apidogService.isOperadorLogado()

export const getOperatorSession = () =>
  apidogService.getOperatorSession()

export default {
  autenticarOperador,
  getSessaoOperador,
  logoutOperador,
  isOperadorLogado,
  getOperatorSession,
}
