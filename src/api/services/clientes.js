/**
 * Serviço de Clientes — BuySystem API V2
 *
 * Re-exporta as funções de clientes do apidogService
 * para facilitar imports diretos nos componentes Vue.
 *
 * Uso:
 *   import { buscarClientes, cadastrarCliente } from '@/api/services/clientes.js'
 */

import { apidogService } from './apidog.js'

export const buscarClientes = (filters) =>
  apidogService.buscarClientes(filters)

export const cadastrarCliente = (dados) =>
  apidogService.cadastrarCliente(dados)

export default {
  buscarClientes,
  cadastrarCliente,
}
