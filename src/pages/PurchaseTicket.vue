<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Calendar, ChevronLeft, Lock, Mail, MapPin, Phone, Search, User, CheckCircle, UserPlus } from 'lucide-vue-next'

import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Button from '@/components/ui/Button.vue'
import apidogService from '@/api/services/apidog.js'

const router = useRouter()
const route = useRoute()

const event = ref(null)
const selectedTime = ref(route.query.time || '15:00')
const eventDate = computed(() => event.value?.date || 'Data não informada')
const eventAddress = computed(
  () => event.value?.raw?.endereco || 'Tv. Pres. Castelo Branco, 205, Centro - 69301280 - Boa Vista - RR'
)
const eventLocation = computed(() => event.value?.location || 'Mirante Edileusa Loz')

const maxTicketsPerPerson = 4
const STORAGE_CUSTOMER_KEY = 'mirante_customer_profile'

const selectedItemsFromQuery = computed(() => {
  try {
    const raw = route.query.items
    if (!raw) return []
    const parsed = JSON.parse(String(raw))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
})
const hasPreselectedItems = computed(() => selectedItemsFromQuery.value.length > 0)
const initialQuantity = (() => {
  const raw = Number(route.query.quantity || 0)
  if (!Number.isFinite(raw) || raw < 0) return 0
  return Math.min(maxTicketsPerPerson, Math.floor(raw))
})()
const quantity = ref(initialQuantity)
if (hasPreselectedItems.value) {
  quantity.value = selectedItemsFromQuery.value.reduce((sum, item) => sum + Number(item?.quantity || 0), 0)
}

// ============================================================
// STEP FLOW: 1 = busca por CPF | 2 = cadastro
// ============================================================
const step = ref(1)

// Step 1 — busca
const cpfSearch = ref('')
const isSearching = ref(false)
const searchError = ref('')
const foundCustomer = ref(null) // { id, nome, email, cpf } | null
const customerNotFound = ref(false)
const cpfSearchInputRef = ref(null)

// Step 2 — cadastro
const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  cpf: '',
  acceptTerms: false,
})
const formRef = ref(null)
const firstInputRef = ref(null)

// ============================================================
// VALORES DERIVADOS (price, total, items)
// ============================================================
const price = computed(() => {
  if (hasPreselectedItems.value) {
    return selectedItemsFromQuery.value.reduce((sum, item) => {
      return sum + Number(item?.price || 0) * Number(item?.quantity || 0)
    }, 0)
  }
  return Number(route.query.price || event.value?.price || 0)
})
const tax = 0.0
const total = computed(() => (hasPreselectedItems.value ? price.value : (price.value + tax) * quantity.value))

const detailedSelectedItems = computed(() => {
  if (!hasPreselectedItems.value) {
    return [
      {
        id: route.params.sectorId || 'single',
        name: 'Ingresso Gratuito',
        time: selectedTime.value,
        unitPrice: Number(route.query.price || event.value?.price || 0),
        quantity: Number(quantity.value || 0),
      },
    ].filter((item) => item.quantity > 0)
  }
  return selectedItemsFromQuery.value
    .map((item, index) => ({
      id: item?.id || item?.ingresso_id || item?.setor_id || `item-${index}`,
      name: item?.name || 'Ingresso',
      time: item?.time || selectedTime.value,
      unitPrice: Number(item?.price || 0),
      quantity: Number(item?.quantity || 0),
    }))
    .filter((item) => item.quantity > 0)
})

const totalQuantityLabel = computed(() => `${quantity.value} ingresso${quantity.value > 1 ? 's' : ''}`)
const summaryEventTitle = computed(() => event.value?.title || 'Visitação Mirante')
const summaryTimeLabel = computed(() => {
  const times = [...new Set(detailedSelectedItems.value.map((item) => String(item.time || '').trim()).filter(Boolean))]
  if (times.length === 0) return selectedTime.value ? `${selectedTime.value}h` : 'Horário não informado'
  if (times.length === 1) return `${times[0]}h`
  return `${times.length} horários selecionados`
})

const isSubmitting = ref(false)
const submitError = ref('')

// ============================================================
// NAVEGAÇÃO
// ============================================================
const goBack = () => router.back()

const loadEvent = async () => {
  const eventId = route.params.id
  if (!eventId) return
  try {
    event.value = await apidogService.getEventDetail(eventId)
  } catch {
    // mantém fallback visual
  }
}

const decrement = () => {
  if (hasPreselectedItems.value) return
  quantity.value = Math.max(0, quantity.value - 1)
}
const increment = () => {
  if (hasPreselectedItems.value) return
  if (quantity.value < maxTicketsPerPerson) quantity.value++
}

// ============================================================
// MÁSCARAS
// ============================================================
const formatPhone = (value) => {
  const n = value.replace(/\D/g, '')
  if (n.length <= 2) return n
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`
}
const formatCPF = (value) => {
  const n = value.replace(/\D/g, '')
  if (n.length <= 3) return n
  if (n.length <= 6) return `${n.slice(0, 3)}.${n.slice(3)}`
  if (n.length <= 9) return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6)}`
  return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9, 11)}`
}

const isNumericOrControl = (e) => {
  const key = e.key
  return (
    /[0-9]/.test(key) ||
    ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key) ||
    (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(key))
  )
}

const handlePhoneInput = (e) => { formData.phone = formatPhone(e.target.value) }
const handlePhonePaste = (e) => {
  e.preventDefault()
  formData.phone = formatPhone((e.clipboardData || window.clipboardData).getData('text'))
}
const handlePhoneKeyPress = (e) => { if (!isNumericOrControl(e)) e.preventDefault() }

const handleCPFKeyPress = (e) => { if (!isNumericOrControl(e)) e.preventDefault() }

// CPF do campo de busca (step 1)
const handleCpfSearchInput = (e) => { cpfSearch.value = formatCPF(e.target.value) }
const handleCpfSearchPaste = (e) => {
  e.preventDefault()
  cpfSearch.value = formatCPF((e.clipboardData || window.clipboardData).getData('text'))
}

// ============================================================
// STEP 1 — BUSCA DE CLIENTE POR CPF
// ============================================================
function pickCustomerId(payload) {
  return (
    payload?.cliente_id ||
    payload?.clienteId ||
    payload?.id ||
    payload?.data?.cliente_id ||
    payload?.data?.clienteId ||
    payload?.data?.id ||
    null
  )
}

const handleCpfSearch = async () => {
  const cpf = String(cpfSearch.value).replace(/\D/g, '')
  searchError.value = ''
  foundCustomer.value = null
  customerNotFound.value = false

  if (cpf.length < 11) {
    searchError.value = 'Digite um CPF válido com 11 dígitos.'
    return
  }

  isSearching.value = true
  try {
    const found = await apidogService.buscarClientes({ cpf })
    if (Array.isArray(found) && found.length > 0) {
      const customer = found[0]
      const id = pickCustomerId(customer)
      if (id) {
        foundCustomer.value = {
          id,
          nome: customer.nome || customer.name || 'Cliente',
          email: customer.email || '',
          cpf: cpfSearch.value,
        }
        return
      }
    }
    customerNotFound.value = true
  } catch {
    // Se a busca falhar, trata como não encontrado e oferece cadastro
    customerNotFound.value = true
  } finally {
    isSearching.value = false
  }
}

const goToRegistration = () => {
  formData.cpf = cpfSearch.value
  customerNotFound.value = false
  step.value = 2
  nextTick(() => setTimeout(() => firstInputRef.value?.focus(), 200))
}

const goBackToSearch = () => {
  step.value = 1
  foundCustomer.value = null
  customerNotFound.value = false
  searchError.value = ''
  submitError.value = ''
}

// ============================================================
// CHECKOUT (usado em ambos os caminhos: cliente encontrado ou recém-cadastrado)
// ============================================================
function buildCheckoutItems() {
  if (hasPreselectedItems.value) {
    return selectedItemsFromQuery.value.map((item) => ({
      setor_id: item?.setor_id || item?.id || route.params.sectorId,
      ingresso_id: item?.ingresso_id || item?.id || null,
      lote_id: item?.lote_id || null,
      quantidade: Number(item?.quantity || 1),
    }))
  }
  return [{ setor_id: route.params.sectorId, quantidade: Number(quantity.value || 1) }]
}

const checkoutWithCustomer = async (clienteId, customerEmail) => {
  isSubmitting.value = true
  submitError.value = ''
  try {
    const response = await apidogService.checkout({
      clienteId,
      eventoId: route.params.id,
      itens: buildCheckoutItems(),
      pagamento: { metodo: 'online', observacoes: '' },
    })

    const cpfClean = String(cpfSearch.value || formData.cpf).replace(/\D/g, '')
    const nomeCliente = foundCustomer.value?.nome || `${formData.firstName} ${formData.lastName}`.trim()

    localStorage.setItem('mirante_last_customer', JSON.stringify({ email: customerEmail, cpf: cpfClean }))
    localStorage.setItem(STORAGE_CUSTOMER_KEY, JSON.stringify({ clienteId, email: customerEmail, cpf: cpfClean, nome: nomeCliente }))

    const eventLocalVenue = String(event.value?.local || event.value?.raw?.local || '').trim()

    router.push({
      name: 'compra-confirmada',
      query: {
        codigo:
          response?.codigo ||
          response?.code ||
          response?.id ||
          response?.data?.codigo ||
          response?.data?.code ||
          response?.data?.id ||
          '',
        evento: event.value?.title || 'Visita ao Mirante Edileusa Lóz',
        data: event.value?.date || '',
        horario: selectedTime.value || route.query.time || '',
        local: eventLocalVenue,
        quantidade: String(quantity.value),
        email: customerEmail,
      },
    })
  } catch (err) {
    submitError.value = err?.message || 'Não foi possível concluir a reserva agora.'
  } finally {
    isSubmitting.value = false
  }
}

// Cliente encontrado — vai direto para o checkout
const continueWithFoundCustomer = () => {
  if (!foundCustomer.value?.id) return
  checkoutWithCustomer(foundCustomer.value.id, foundCustomer.value.email)
}

// ============================================================
// STEP 2 — CADASTRO + CHECKOUT
// ============================================================
const handleSubmit = async (e) => {
  e.preventDefault()
  submitError.value = ''

  if (!formData.acceptTerms) {
    alert('Você precisa aceitar o termo de aceitação para continuar.')
    return
  }

  isSubmitting.value = true
  try {
    const cpf = String(formData.cpf || cpfSearch.value || '').replace(/\D/g, '')
    const email = String(formData.email || '').trim()
    const nome = `${formData.firstName || ''} ${formData.lastName || ''}`.trim()

    if (!cpf || !email || !nome) throw new Error('Preencha todos os campos obrigatórios.')

    const phone = String(formData.phone || '').replace(/\D/g, '')
    const created = await apidogService.cadastrarCliente({
      nome,
      email,
      cpf,
      ...(phone ? { telefone: phone } : {}),
    })

    const createdId = pickCustomerId(created)
    if (!createdId) throw new Error('Cadastro realizado! Houve um problema ao identificar sua conta. Tente buscar pelo CPF.')

    await checkoutWithCustomer(createdId, email)
  } catch (err) {
    submitError.value = err?.message || 'Não foi possível concluir o cadastro agora.'
    isSubmitting.value = false
  }
}

// ============================================================
// BOTÃO PRINCIPAL (sidebar + mobile)
// ============================================================
const primaryButtonLabel = computed(() => {
  if (isSubmitting.value) return 'Processando...'
  if (isSearching.value) return 'Buscando...'
  if (quantity.value === 0) return 'Selecione um Ingresso'
  if (step.value === 1) {
    if (foundCustomer.value) return `Continuar (${quantity.value})`
    return 'Buscar CPF'
  }
  return 'Cadastrar e Continuar'
})

const submitForm = () => {
  if (quantity.value === 0) {
    alert('Selecione pelo menos 1 ingresso para continuar.')
    return
  }
  if (step.value === 1) {
    if (foundCustomer.value) continueWithFoundCustomer()
    else handleCpfSearch()
    return
  }
  formRef.value?.requestSubmit()
}

// Foca no campo de busca quando quantity > 0
watch(
  quantity,
  async (newValue) => {
    if (newValue > 0) {
      await nextTick()
      setTimeout(() => cpfSearchInputRef.value?.focus(), 300)
    }
  },
  { immediate: true },
)

const eventImage = computed(
  () =>
    event.value?.image ||
    'https://private-us-east-1.manuscdn.com/sessionFile/ct5iih13rREJzVL8BUQxZf/sandbox/YN3cvVrDfKJXUeY7ppiGs4-img-2_1770038910000_na1fn_aGVyby1taXJhbnRlLXN1bnNldA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80'
)

onMounted(loadEvent)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Header />

    <main class="flex-1">
      <!-- Barra superior com voltar -->
      <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div class="container mx-auto px-4 py-3">
          <button
            class="group inline-flex items-center gap-2 rounded-md border border-[#0F3460]/20 bg-white px-3 py-2 text-sm md:text-base font-medium text-[#0F3460] shadow-sm transition-all duration-200 hover:-translate-x-0.5 hover:border-[#0F3460]/40 hover:bg-[#0F3460]/5 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F3460] focus-visible:ring-offset-2"
            @click="goBack"
          >
            <ChevronLeft class="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span class="text-sm md:text-base">Voltar</span>
          </button>
        </div>
      </div>

      <div class="container mx-auto px-4 py-6 md:py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <!-- Coluna principal -->
          <div class="lg:col-span-2">

            <!-- Imagem do evento -->
            <div class="w-full h-64 md:h-80 overflow-hidden rounded-lg mb-4">
              <img :src="eventImage" alt="Evento" class="w-full h-full object-cover" />
            </div>

            <!-- Informações do evento -->
            <div class="bg-white px-4 py-6 border-b border-gray-200 rounded-lg mb-4">
              <h1 class="text-2xl md:text-3xl font-bold text-[#0F3460] mb-4">{{ event?.title }}</h1>
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <Calendar class="w-5 h-5 text-[#0F3460] mt-0.5 flex-shrink-0" />
                  <p class="text-sm md:text-base text-gray-700">{{ eventDate }} • {{ selectedTime }}h</p>
                </div>
                <div class="flex items-start gap-3">
                  <MapPin class="w-5 h-5 text-[#0F3460] mt-0.5 flex-shrink-0" />
                  <p class="text-sm md:text-base text-gray-700">
                    Evento presencial em
                    <span class="text-[#0F3460] font-semibold">{{ eventLocation }}</span>,
                    <span class="text-[#0F3460] font-semibold">{{ eventAddress }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Seleção de ingressos -->
            <div class="bg-white px-4 py-6 rounded-lg mb-4">
              <!-- Card do ingresso -->
              <div class="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h3 class="text-lg font-bold text-[#0F3460] mb-1">
                      {{ hasPreselectedItems ? 'Ingressos Selecionados' : 'Ingresso Gratuito' }}
                    </h3>
                    <p class="text-sm text-gray-600 mb-2">{{ event?.title }}</p>
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-lg font-bold text-[#0F3460]">R$ {{ price.toFixed(2) }}</span>
                      <span v-if="!hasPreselectedItems" class="text-sm text-gray-500">(+ R$ {{ Number(tax).toFixed(2) }} taxa)</span>
                    </div>
                    <p class="text-xs text-gray-500">Vendas até {{ eventDate }}</p>
                  </div>
                </div>

                <!-- Seletor de quantidade -->
                <div v-if="!hasPreselectedItems" class="flex items-center gap-3 mt-4">
                  <button
                    :disabled="quantity === 0"
                    class="w-10 h-10 rounded-lg border-2 border-gray-300 bg-white text-gray-600 font-bold text-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100 transition-colors"
                    @click="decrement"
                  >−</button>
                  <input
                    v-model.number="quantity"
                    type="number"
                    min="0"
                    :max="maxTicketsPerPerson"
                    readonly
                    class="w-16 h-10 text-center text-lg font-semibold text-[#0F3460] border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#0F3460]"
                  />
                  <button
                    :disabled="quantity >= maxTicketsPerPerson"
                    class="w-10 h-10 rounded-lg border-2 border-[#0F3460] bg-[#0F3460] text-white font-bold text-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:bg-[#0D2A47] transition-colors"
                    @click="increment"
                  >+</button>
                  <span class="text-sm text-gray-600 ml-2">Máximo {{ maxTicketsPerPerson }} por pessoa</span>
                </div>
                <p v-else class="text-sm text-gray-600 mt-3">
                  Quantidade total selecionada: <strong>{{ quantity }}</strong>
                </p>
              </div>

              <!-- Resumo dos itens -->
              <div class="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                <h4 class="text-sm font-semibold text-[#0F3460] mb-3">Itens selecionados</h4>
                <div v-if="detailedSelectedItems.length === 0" class="text-sm text-gray-600">
                  Nenhum item selecionado.
                </div>
                <div v-else class="space-y-2">
                  <div
                    v-for="item in detailedSelectedItems"
                    :key="item.id"
                    class="flex items-start justify-between gap-3 text-sm"
                  >
                    <div>
                      <p class="font-semibold text-[#0F3460]">{{ item.name }}</p>
                      <p class="text-gray-600">{{ item.time }}h • {{ item.quantity }}x R$ {{ item.unitPrice.toFixed(2) }}</p>
                    </div>
                    <p class="font-semibold text-[#0F3460]">R$ {{ (item.unitPrice * item.quantity).toFixed(2) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- =========================================================
                 IDENTIFICAÇÃO DO CLIENTE (apenas quando quantity > 0)
                 ========================================================= -->
            <div v-if="quantity > 0" class="bg-white rounded-lg mb-4 overflow-hidden">

              <!-- Indicador de etapas -->
              <div class="flex border-b border-gray-200">
                <div
                  class="flex-1 flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors"
                  :class="step === 1 ? 'text-[#0F3460] border-b-2 border-[#0F3460] bg-blue-50/50' : 'text-gray-400'"
                >
                  <span
                    class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    :class="step === 1 ? 'bg-[#0F3460] text-white' : (foundCustomer || step === 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500')"
                  >
                    <CheckCircle v-if="foundCustomer || step === 2" class="w-4 h-4" />
                    <span v-else>1</span>
                  </span>
                  Identificação
                </div>
                <div
                  class="flex-1 flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors"
                  :class="step === 2 ? 'text-[#0F3460] border-b-2 border-[#0F3460] bg-blue-50/50' : 'text-gray-400'"
                >
                  <span
                    class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    :class="step === 2 ? 'bg-[#0F3460] text-white' : 'bg-gray-200 text-gray-500'"
                  >2</span>
                  Cadastro
                </div>
              </div>

              <!-- ======================================
                   STEP 1 — Busca por CPF
                   ====================================== -->
              <div v-if="step === 1" class="px-4 py-6">
                <div class="mb-6">
                  <h2 class="text-xl font-bold text-[#0F3460] mb-1">Já é cadastrado?</h2>
                  <p class="text-sm text-gray-500">
                    Caso ainda não tenha um cadastro, você pode fazê-lo rapidamente utilizando o botão abaixo.
                  </p>
                </div>

                <!-- Campo de busca de CPF -->
                <div class="mb-4">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">CPF</label>
                  <div class="flex gap-3">
                    <input
                      ref="cpfSearchInputRef"
                      :value="cpfSearch"
                      @input="handleCpfSearchInput"
                      @keypress="handleCPFKeyPress"
                      @paste="handleCpfSearchPaste"
                      @keydown.enter="handleCpfSearch"
                      type="text"
                      maxlength="14"
                      placeholder="000.000.000-00"
                      :disabled="isSearching"
                      class="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460] font-mono text-[#0F3460] disabled:bg-gray-50"
                    />
                    <button
                      @click="handleCpfSearch"
                      :disabled="isSearching || cpfSearch.replace(/\D/g, '').length < 11"
                      class="px-5 py-3 bg-[#0F3460] text-white rounded-lg font-semibold hover:bg-[#0D2A47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    >
                      <svg v-if="isSearching" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <Search v-else class="w-5 h-5" />
                      {{ isSearching ? 'Buscando...' : 'Buscar' }}
                    </button>
                  </div>
                  <p v-if="searchError" class="mt-2 text-sm text-red-600">{{ searchError }}</p>
                </div>

                <!-- Resultado: cliente ENCONTRADO -->
                <transition name="fade">
                  <div v-if="foundCustomer" class="mt-2 p-5 bg-green-50 border border-green-200 rounded-xl">
                    <div class="flex items-center gap-4 mb-4">
                      <div class="w-12 h-12 rounded-full bg-[#0F3460] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {{ foundCustomer.nome.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="flex items-center gap-2 mb-0.5">
                          <CheckCircle class="w-4 h-4 text-green-600" />
                          <p class="text-sm font-semibold text-green-700">Cadastro encontrado!</p>
                        </div>
                        <p class="font-bold text-[#0F3460] text-lg">{{ foundCustomer.nome }}</p>
                        <p v-if="foundCustomer.email" class="text-sm text-gray-500">{{ foundCustomer.email }}</p>
                      </div>
                    </div>
                    <button
                      @click="continueWithFoundCustomer"
                      :disabled="isSubmitting"
                      class="w-full bg-[#D4AF37] text-[#0F3460] font-bold py-3 rounded-lg hover:bg-[#c9a830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    >
                      {{ isSubmitting ? 'Processando...' : 'Continuar com este cadastro' }}
                    </button>
                    <p v-if="submitError" class="mt-3 text-sm text-red-600">{{ submitError }}</p>
                  </div>
                </transition>

                <!-- Resultado: cliente NÃO encontrado -->
                <transition name="fade">
                  <div v-if="customerNotFound && !foundCustomer" class="mt-2 p-5 bg-amber-50 border border-amber-200 rounded-xl">
                    <div class="flex items-start gap-3 mb-4">
                      <UserPlus class="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p class="font-semibold text-amber-800">Cadastro não encontrado</p>
                        <p class="text-sm text-amber-700 mt-0.5">
                          Não encontramos um cadastro para o CPF informado. Faça seu cadastro rapidamente!
                        </p>
                      </div>
                    </div>
                    <button
                      @click="goToRegistration"
                      class="w-full bg-[#0F3460] text-white font-bold py-3 rounded-lg hover:bg-[#0D2A47] transition-colors text-base"
                    >
                      Cadastrar-se
                    </button>
                  </div>
                </transition>
              </div>

              <!-- ======================================
                   STEP 2 — Formulário de Cadastro
                   ====================================== -->
              <div v-else-if="step === 2" class="px-4 py-6">
                <!-- Cabeçalho do step 2 -->
                <div class="flex items-center gap-3 mb-6">
                  <button
                    @click="goBackToSearch"
                    class="inline-flex items-center gap-1 text-sm text-[#0F3460] hover:text-[#D4AF37] transition-colors"
                  >
                    <ChevronLeft class="w-4 h-4" />
                    Voltar
                  </button>
                  <div class="h-4 w-px bg-gray-300" />
                  <h2 class="text-lg font-bold text-[#0F3460]">Criar Cadastro</h2>
                </div>

                <!-- CPF pré-preenchido (somente leitura) -->
                <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                  <User class="w-5 h-5 text-[#0F3460] flex-shrink-0" />
                  <div>
                    <p class="text-xs text-gray-500">CPF informado</p>
                    <p class="font-mono font-semibold text-[#0F3460]">{{ cpfSearch }}</p>
                  </div>
                </div>

                <form ref="formRef" @submit.prevent="handleSubmit" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <User class="w-4 h-4 inline mr-1" />
                        Primeiro Nome <span class="text-red-500">*</span>
                      </label>
                      <input
                        ref="firstInputRef"
                        v-model="formData.firstName"
                        type="text"
                        required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                        placeholder="João"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Último Nome <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.lastName"
                        type="text"
                        required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                        placeholder="Silva"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail class="w-4 h-4 inline mr-1" />
                        Email <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.email"
                        type="email"
                        required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                        placeholder="joao@example.com"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone class="w-4 h-4 inline mr-1" />
                        Telefone
                      </label>
                      <input
                        :value="formData.phone"
                        @input="handlePhoneInput"
                        @keypress="handlePhoneKeyPress"
                        @paste="handlePhonePaste"
                        type="tel"
                        maxlength="15"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                        placeholder="(95) 98765-4321"
                      />
                    </div>
                  </div>

                  <!-- Termos -->
                  <div class="pt-2">
                    <label class="flex items-start gap-3 cursor-pointer">
                      <input
                        v-model="formData.acceptTerms"
                        type="checkbox"
                        required
                        class="mt-1 w-5 h-5 rounded border-gray-300 text-[#0F3460] focus:ring-2 focus:ring-[#0F3460]"
                      />
                      <span class="text-sm text-gray-700">
                        Li e concordo com o
                        <a href="#" class="text-[#0F3460] hover:underline font-semibold">termo de aceitação de compra do ingresso</a>.
                      </span>
                    </label>
                  </div>

                  <!-- Aviso -->
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p class="text-sm text-yellow-800">
                      Em caso de ausência no horário reservado, o usuário ficará bloqueado por 30 dias para novas reservas.
                    </p>
                  </div>

                  <p v-if="submitError" class="text-sm text-red-600">{{ submitError }}</p>
                </form>
              </div>
            </div>
            <!-- fim identificação -->

          </div>
          <!-- fim coluna principal -->

          <!-- Sidebar (desktop) -->
          <div class="hidden lg:block">
            <div class="bg-gradient-to-br from-[#0F3460] to-[#2E8BC0] rounded-2xl p-6 text-white sticky top-24 shadow-xl">
              <h3 class="text-xl font-bold mb-6">Resumo da Reserva</h3>

              <div class="space-y-4 mb-6 pb-6 border-b border-white/20">
                <div>
                  <p class="text-sm text-white/80 mb-1">Evento</p>
                  <p class="font-semibold text-sm">{{ summaryEventTitle }}</p>
                </div>
                <div>
                  <p class="text-sm text-white/80 mb-1">Data</p>
                  <p class="font-semibold text-sm">{{ eventDate }}</p>
                </div>
                <div>
                  <p class="text-sm text-white/80 mb-1">Horário</p>
                  <p class="font-semibold text-sm">{{ summaryTimeLabel }}</p>
                </div>
              </div>

              <div class="space-y-3 mb-6">
                <div
                  v-for="item in detailedSelectedItems"
                  :key="`sidebar-${item.id}`"
                  class="flex justify-between text-sm"
                >
                  <span>{{ item.name }} ({{ item.quantity }}x)</span>
                  <span>R$ {{ (item.unitPrice * item.quantity).toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-xs text-white/80">
                  <span>Quantidade total</span>
                  <span>{{ totalQuantityLabel }}</span>
                </div>
              </div>

              <div class="border-t border-white/20 pt-4 mb-6">
                <div class="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>R$ {{ total.toFixed(2) }}</span>
                </div>
              </div>

              <Button
                :disabled="quantity === 0 || isSubmitting || isSearching"
                class="w-full bg-[#D4AF37] text-[#0F3460] hover:bg-white font-bold text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                @click="submitForm"
              >
                {{ primaryButtonLabel }}
              </Button>

              <div class="bg-green-50/10 border border-green-200/30 rounded-lg p-3 flex items-start gap-2">
                <Lock class="w-4 h-4 text-green-300 flex-shrink-0 mt-0.5" />
                <p class="text-xs text-white/90">
                  Sua reserva está segura. Você receberá confirmação por email após a compra.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Botão fixo mobile -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 md:hidden">
      <div class="flex items-center justify-between mb-2">
        <div>
          <p class="text-xs text-gray-600">Total</p>
          <p class="text-lg font-bold text-[#0F3460]">R$ {{ total.toFixed(2) }}</p>
        </div>
        <div v-if="quantity > 0" class="text-right">
          <p class="text-xs text-gray-600">{{ totalQuantityLabel }}</p>
        </div>
      </div>
      <Button
        :disabled="quantity === 0 || isSubmitting || isSearching"
        class="w-full bg-[#2D6A4F] text-white hover:bg-[#1e4a37] font-bold text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="submitForm"
      >
        {{ primaryButtonLabel }}
      </Button>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
