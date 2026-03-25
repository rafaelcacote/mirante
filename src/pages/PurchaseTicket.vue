<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Calendar, ChevronLeft, Clock, Info, Lock, Mail, MapPin, Phone, Ticket, User } from 'lucide-vue-next'

import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Button from '@/components/ui/Button.vue'
import apidogService from '@/api/services/apidog.js'

const router = useRouter()
const route = useRoute()

const event = ref(null)
const selectedTime = ref(route.query.time || '15:00')
const eventDate = computed(() => event.value?.date || 'Data nao informada')
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

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  cpf: '',
  acceptTerms: false,
})

const price = computed(() => {
  if (hasPreselectedItems.value) {
    return selectedItemsFromQuery.value.reduce((sum, item) => {
      const itemPrice = Number(item?.price || 0)
      const itemQuantity = Number(item?.quantity || 0)
      return sum + itemPrice * itemQuantity
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

const totalQuantityLabel = computed(() =>
  `${quantity.value} ingresso${quantity.value > 1 ? 's' : ''}`
)
const summaryEventTitle = computed(() => event.value?.title || 'Visitação Mirante')
const summaryTimeLabel = computed(() => {
  const times = [...new Set(detailedSelectedItems.value.map((item) => String(item.time || '').trim()).filter(Boolean))]
  if (times.length === 0) return selectedTime.value ? `${selectedTime.value}h` : 'Horário não informado'
  if (times.length === 1) return `${times[0]}h`
  return `${times.length} horários selecionados`
})
const isSubmitting = ref(false)
const submitError = ref('')

const goBack = () => {
  router.back()
}

const loadEvent = async () => {
  const eventId = route.params.id
  if (!eventId) return
  try {
    event.value = await apidogService.getEventDetail(eventId)
  } catch {
    // Mantem fallback visual da pagina
  }
}

const decrement = () => {
  if (hasPreselectedItems.value) return
  quantity.value = Math.max(0, quantity.value - 1)
}

const increment = () => {
  if (hasPreselectedItems.value) return
  if (quantity.value < maxTicketsPerPerson) {
    quantity.value = quantity.value + 1
  }
}

const formRef = ref(null)

// Função para aplicar máscara de telefone
const formatPhone = (value) => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  // Aplica a máscara (XX) XXXXX-XXXX
  if (numbers.length <= 2) {
    return numbers
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }
}

// Função para aplicar máscara de CPF
const formatCPF = (value) => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  // Aplica a máscara XXX.XXX.XXX-XX
  if (numbers.length <= 3) {
    return numbers
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
  } else {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }
}

// Handler para telefone
const handlePhoneInput = (e) => {
  const formatted = formatPhone(e.target.value)
  formData.phone = formatted
}

// Handler para CPF
const handleCPFInput = (e) => {
  const formatted = formatCPF(e.target.value)
  formData.cpf = formatted
}

// Handler para colar no CPF (remove letras)
const handleCPFPaste = (e) => {
  e.preventDefault()
  const pastedText = (e.clipboardData || window.clipboardData).getData('text')
  const numbersOnly = pastedText.replace(/\D/g, '')
  const formatted = formatCPF(numbersOnly)
  formData.cpf = formatted
}

// Handler para colar no telefone (remove letras)
const handlePhonePaste = (e) => {
  e.preventDefault()
  const pastedText = (e.clipboardData || window.clipboardData).getData('text')
  const numbersOnly = pastedText.replace(/\D/g, '')
  const formatted = formatPhone(numbersOnly)
  formData.phone = formatted
}

// Bloquear caracteres não numéricos no CPF
const handleCPFKeyPress = (e) => {
  // Permite apenas números (0-9) e teclas de controle (backspace, delete, tab, arrow keys, etc)
  const key = e.key
  const isNumber = /[0-9]/.test(key)
  const isControlKey = 
    key === 'Backspace' || 
    key === 'Delete' || 
    key === 'Tab' || 
    key === 'ArrowLeft' || 
    key === 'ArrowRight' || 
    key === 'ArrowUp' || 
    key === 'ArrowDown' ||
    key === 'Home' ||
    key === 'End' ||
    (e.ctrlKey && (key === 'a' || key === 'c' || key === 'v' || key === 'x'))
  
  if (!isNumber && !isControlKey) {
    e.preventDefault()
  }
}

// Bloquear caracteres não numéricos no telefone
const handlePhoneKeyPress = (e) => {
  // Permite apenas números (0-9) e teclas de controle (backspace, delete, tab, arrow keys, etc)
  const key = e.key
  const isNumber = /[0-9]/.test(key)
  const isControlKey = 
    key === 'Backspace' || 
    key === 'Delete' || 
    key === 'Tab' || 
    key === 'ArrowLeft' || 
    key === 'ArrowRight' || 
    key === 'ArrowUp' || 
    key === 'ArrowDown' ||
    key === 'Home' ||
    key === 'End' ||
    (e.ctrlKey && (key === 'a' || key === 'c' || key === 'v' || key === 'x'))
  
  if (!isNumber && !isControlKey) {
    e.preventDefault()
  }
}

// Focar no primeiro campo quando o formulário aparecer
const firstInputRef = ref(null)

// Foca no primeiro campo quando quantity > 0
watch(
  quantity,
  async (newValue) => {
  if (newValue > 0) {
    await nextTick()
    setTimeout(() => {
      firstInputRef.value?.focus()
    }, 300)
  }
  },
  { immediate: true },
)

const submitForm = () => {
  if (quantity.value === 0) {
    alert('Selecione pelo menos 1 ingresso para continuar.')
    return
  }
  formRef.value?.requestSubmit()
  // Foca no primeiro campo do formulário
  setTimeout(() => {
    firstInputRef.value?.focus()
  }, 100)
}

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

async function ensureCustomer() {
  const cpf = String(formData.cpf || '').replace(/\D/g, '')
  const email = String(formData.email || '').trim()
  const nome = `${formData.firstName || ''} ${formData.lastName || ''}`.trim()

  if (!cpf || !email || !nome) {
    throw new Error('Preencha nome, email e CPF para continuar.')
  }

  const found = await apidogService.buscarClientes({ cpf, email })
  if (Array.isArray(found) && found.length > 0) {
    const existingId = pickCustomerId(found[0])
    if (existingId) {
      localStorage.setItem('mirante_last_customer', JSON.stringify({ email: formData.email, cpf: formData.cpf }))
      localStorage.setItem(
        STORAGE_CUSTOMER_KEY,
        JSON.stringify({ clienteId: existingId, email: formData.email, cpf: formData.cpf, nome })
      )
      return existingId
    }
  }

  const created = await apidogService.cadastrarCliente({
    nome,
    email,
    cpf,
    cep: '',
    numero: '',
    complemento: '',
    data_nascimento: '',
  })
  const createdId = pickCustomerId(created)
  if (!createdId) throw new Error('Cadastro criado, mas sem cliente_id no retorno.')

  localStorage.setItem('mirante_last_customer', JSON.stringify({ email: formData.email, cpf: formData.cpf }))
  localStorage.setItem(
    STORAGE_CUSTOMER_KEY,
    JSON.stringify({ clienteId: createdId, email: formData.email, cpf: formData.cpf, nome })
  )
  return createdId
}

function buildCheckoutItems() {
  if (hasPreselectedItems.value) {
    return selectedItemsFromQuery.value.map((item) => ({
      setor_id: item?.setor_id || item?.id || route.params.sectorId,
      ingresso_id: item?.ingresso_id || item?.id || null,
      lote_id: item?.lote_id || null,
      quantidade: Number(item?.quantity || 1),
    }))
  }
  return [
    {
      setor_id: route.params.sectorId,
      quantidade: Number(quantity.value || 1),
    },
  ]
}

const handleSubmit = async (e) => {
  e.preventDefault()
  submitError.value = ''
  if (!formData.acceptTerms) {
    alert('Você precisa aceitar o termo de aceitação para continuar.')
    return
  }
  if (quantity.value === 0) {
    alert('Selecione pelo menos 1 ingresso para continuar.')
    return
  }

  isSubmitting.value = true
  try {
    const clienteId = await ensureCustomer()
    const response = await apidogService.checkout({
      clienteId,
      eventoId: route.params.id,
      itens: buildCheckoutItems(),
      pagamento: { metodo: 'online', observacoes: '' },
    })

    router.push({
      name: 'compra-confirmada',
      query: {
        codigo: response?.codigo || response?.code || response?.id || response?.data?.id || '',
        evento: event.value?.title || 'Visita ao Mirante Edileusa Lóz',
        data: event.value?.date || '',
        horario: selectedTime.value || route.query.time || '',
        quantidade: String(quantity.value),
        email: formData.email,
      },
    })
  } catch (err) {
    submitError.value = err?.message || 'Nao foi possivel concluir a reserva agora.'
  } finally {
    isSubmitting.value = false
  }
}

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
      <!-- Back Button -->
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
          <div class="lg:col-span-2">
            <!-- Event Image -->
            <div class="w-full h-64 md:h-80 overflow-hidden rounded-lg mb-4">
              <img :src="eventImage" alt="Evento" class="w-full h-full object-cover" />
            </div>

            <!-- Event Information -->
            <div class="bg-white px-4 py-6 border-b border-gray-200 rounded-lg mb-4">
              <h1 class="text-2xl md:text-3xl font-bold text-[#0F3460] mb-4">{{ event?.title }}</h1>

              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <Calendar class="w-5 h-5 text-[#0F3460] mt-0.5 flex-shrink-0" />
                  <div>
                    <p class="text-sm md:text-base text-gray-700">{{ eventDate }} • {{ selectedTime }}h</p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <MapPin class="w-5 h-5 text-[#0F3460] mt-0.5 flex-shrink-0" />
                  <div>
                    <p class="text-sm md:text-base text-gray-700">
                      Evento presencial em <span class="text-[#0F3460] font-semibold">{{ eventLocation }}</span>,
                      <span class="text-[#0F3460] font-semibold">{{ eventAddress }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ticket Selection Section -->
            <div class="bg-white px-4 py-6 rounded-lg mb-4">

          <!-- Ticket Card -->
          <div class="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-lg font-bold text-[#0F3460] mb-1">{{ hasPreselectedItems ? 'Ingressos Selecionados' : 'Ingresso Gratuito' }}</h3>
                <p class="text-sm text-gray-600 mb-2">{{ event?.title }}</p>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-lg font-bold text-[#0F3460]">R$ {{ price.toFixed(2) }}</span>
                  <span v-if="!hasPreselectedItems" class="text-sm text-gray-500">(+ R$ {{ Number(tax).toFixed(2) }} taxa)</span>
                </div>
                <p class="text-xs text-gray-500">Vendas até {{ eventDate }}</p>
              </div>
            </div>

            <!-- Quantity Selector -->
            <div v-if="!hasPreselectedItems" class="flex items-center gap-3 mt-4">
              <button
                :disabled="quantity === 0"
                class="w-10 h-10 rounded-lg border-2 border-gray-300 bg-white text-gray-600 font-bold text-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100 transition-colors"
                @click="decrement"
              >
                −
              </button>
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
              >
                +
              </button>
              <span class="text-sm text-gray-600 ml-2">Máximo {{ maxTicketsPerPerson }} por pessoa</span>
            </div>
            <p v-else class="text-sm text-gray-600 mt-3">
              Quantidade total selecionada: <strong>{{ quantity }}</strong>
            </p>
          </div>

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

          <!-- Tax Information -->
          <!-- <div class="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Info class="w-4 h-4" />
            <a href="#" class="text-[#0F3460] hover:underline">Entenda nossa taxa</a>
          </div> -->

          <!-- Coupon Section (opcional) -->
          <!-- <div class="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
            <div class="flex items-center gap-2 text-gray-600">
              <Ticket class="w-5 h-5" />
              <span class="text-sm">Inserir cupom de desconto</span>
            </div>
          </div> -->
        </div>

            <!-- Personal Information Form (only show if quantity > 0) -->
            <div v-if="quantity > 0" class="bg-white px-4 py-6 border-t border-gray-200 rounded-lg">
          <h2 class="text-lg font-bold text-[#0F3460] mb-6">Informações Pessoais</h2>

          <form ref="formRef" @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <User class="w-4 h-4 inline mr-2" />
                  Primeiro Nome
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
                <label class="block text-sm font-semibold text-gray-700 mb-2">Último Nome</label>
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
                  <Mail class="w-4 h-4 inline mr-2" />
                  Email
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
                  <Phone class="w-4 h-4 inline mr-2" />
                  Telefone
                </label>
                <input
                  :value="formData.phone"
                  @input="handlePhoneInput"
                  @keypress="handlePhoneKeyPress"
                  @paste="handlePhonePaste"
                  type="tel"
                  required
                  maxlength="15"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                  placeholder="(95) 98765-4321"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">CPF</label>
              <input
                :value="formData.cpf"
                @input="handleCPFInput"
                @keypress="handleCPFKeyPress"
                @paste="handleCPFPaste"
                type="text"
                required
                maxlength="14"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                placeholder="000.000.000-00"
              />
            </div>

            <!-- Terms Acceptance -->
            <div class="pt-4">
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

            <!-- Warning Message -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-sm text-yellow-800">
                Em caso de ausência no horário reservado, o usuário ficará bloqueado por 30 dias para novas reservas
              </p>
            </div>
            <p v-if="submitError" class="text-sm text-red-600">{{ submitError }}</p>
          </form>
            </div>
          </div>

          <!-- Desktop Summary Sidebar -->
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
                :disabled="quantity === 0 || isSubmitting"
                class="w-full bg-[#D4AF37] text-[#0F3460] hover:bg-white font-bold text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                @click="submitForm"
              >
                {{ isSubmitting ? 'Processando...' : quantity === 0 ? 'Selecione um Ingresso' : `Continuar (${quantity})` }}
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

    <!-- Fixed Bottom Button (Mobile) -->
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
        :disabled="quantity === 0 || isSubmitting"
        class="w-full bg-[#2D6A4F] text-white hover:bg-[#1e4a37] font-bold text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="submitForm"
      >
        {{ isSubmitting ? 'Processando...' : quantity === 0 ? 'Selecione um Ingresso' : `Continuar (${quantity})` }}
      </Button>
    </div>

    <Footer />
  </div>
</template>
