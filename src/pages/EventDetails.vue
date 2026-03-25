<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar, ChevronLeft, Clock, MapPin, Users } from 'lucide-vue-next'

import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Button from '@/components/ui/Button.vue'
import apidogService from '@/api/services/apidog.js'

const route = useRoute()
const router = useRouter()

const event = ref(null)
const tickets = ref([])
const loading = ref(true)
const error = ref(null)
const ticketsError = ref('')
const ticketQuantities = ref({})

const allAvailableAreZero = computed(() => {
  if (tickets.value.length === 0) return false
  return tickets.value.every((t) => Number(t?.available || 0) <= 0)
})

const ticketsForSelect = computed(() => {
  // Se a API não informa disponibilidade (available vem tudo como 0),
  // ainda assim exibimos as opções para não travar a UI.
  if (allAvailableAreZero.value) return tickets.value
  return tickets.value.filter((t) => Number(t?.available || 0) > 0)
})

const isTicketSelectable = (ticket) => {
  if (!ticket?.id) return false
  if (allAvailableAreZero.value) return true
  return Number(ticket.available || 0) > 0
}

const selectedItems = computed(() =>
  ticketsForSelect.value
    .map((ticket) => ({
      ticket,
      quantity: Number(ticketQuantities.value[String(ticket.id)] || 0),
    }))
    .filter(({ ticket, quantity }) => isTicketSelectable(ticket) && quantity > 0)
)

const totalQuantity = computed(() =>
  selectedItems.value.reduce((sum, item) => sum + item.quantity, 0)
)

const total = computed(() =>
  selectedItems.value.reduce((sum, item) => {
    const ticketPrice = Number(item.ticket?.price || 0)
    return sum + ticketPrice * item.quantity
  }, 0)
)

async function loadEvent() {
  loading.value = true
  error.value = null
  ticketsError.value = ''
  try {
    const [eventDetail, eventTickets] = await Promise.all([
      apidogService.getEventDetail(route.params.id),
      apidogService.getEventTickets(route.params.id).catch((err) => {
        ticketsError.value = err?.message || 'Nao foi possivel listar ingressos agora.'
        return []
      }),
    ])
    event.value = eventDetail
    tickets.value = eventTickets
    const nextQuantities = {}
    for (const ticket of eventTickets) {
      nextQuantities[String(ticket.id)] = 0
    }
    ticketQuantities.value = nextQuantities
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadEvent)

const goBack = () => router.back()
const goToCheckout = () => {
  const eventId = event.value?.id
  if (!eventId) return

  if (totalQuantity.value <= 0) {
    alert('Selecione ao menos 1 ingresso para continuar.')
    return
  }

  const checkoutItems = selectedItems.value.map(({ ticket, quantity }) => ({
    id: ticket.id,
    name: ticket.name,
    time: ticket.time || event.value.time,
    price: Number(ticket.price || 0),
    quantity,
    setor_id: ticket?.raw?.setor_id || ticket?.raw?.horario_id || ticket.id,
    ingresso_id: ticket?.raw?.ingresso_id || ticket.id,
    lote_id: ticket?.raw?.lote_id || ticket?.raw?.lote?.id || null,
  }))

  const defaultSectorId = checkoutItems[0]?.setor_id || checkoutItems[0]?.id
  if (!defaultSectorId) return

  router.push({
    name: 'purchase-ticket',
    params: { id: eventId, sectorId: defaultSectorId },
    query: {
      items: JSON.stringify(checkoutItems),
      quantity: String(totalQuantity.value),
      total: String(total.value),
      time: checkoutItems[0]?.time || event.value.time,
    },
  })
}

const quantityFor = (ticket) => Number(ticketQuantities.value[String(ticket.id)] || 0)

const maxQuantityForTicket = (ticket) => {
  const available = Number(ticket?.available || 0)
  if (!Number.isFinite(available) || available <= 0) return 4
  return Math.min(4, available)
}

const decrementTicket = (ticket) => {
  const key = String(ticket.id)
  const current = Number(ticketQuantities.value[key] || 0)
  ticketQuantities.value[key] = Math.max(0, current - 1)
}

const incrementTicket = (ticket) => {
  const key = String(ticket.id)
  const current = Number(ticketQuantities.value[key] || 0)
  const max = maxQuantityForTicket(ticket)
  ticketQuantities.value[key] = Math.min(max, current + 1)
}

watch(tickets, (list) => {
  const next = {}
  for (const ticket of list || []) {
    const key = String(ticket.id)
    const max = maxQuantityForTicket(ticket)
    next[key] = Math.min(Number(ticketQuantities.value[key] || 0), max)
  }
  ticketQuantities.value = next
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <Header />

    <main class="flex-1">
      <div class="bg-gray-50 border-b border-gray-200">
        <div class="container mx-auto px-4 py-4">
          <button class="flex items-center gap-2 text-[#0F3460] hover:text-[#D4AF37] transition-colors" @click="goBack">
            <ChevronLeft class="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      <div class="container mx-auto px-4 py-12">
        <div v-if="loading" class="text-center py-16 text-gray-600">Carregando evento...</div>
        <div v-else-if="error" class="text-center py-16">
          <p class="text-red-600 mb-3">Erro ao carregar evento</p>
          <p class="text-gray-500 mb-6">{{ error }}</p>
          <Button class="bg-[#0F3460] text-white" @click="loadEvent">Tentar novamente</Button>
        </div>
        <div v-else-if="event" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <div class="rounded-2xl overflow-hidden shadow-lg mb-8">
              <img :src="event.image" :alt="event.title" class="w-full h-96 object-cover" />
            </div>

            <div class="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <h1 class="display text-[#0F3460] mb-4">{{ event.title }}</h1>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200">
                <div class="flex items-center gap-3">
                  <div class="p-3 bg-[#D4AF37]/10 rounded-lg">
                    <Calendar class="w-5 h-5 text-[#0F3460]" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-600">Data</p>
                    <p class="font-semibold text-[#0F3460]">{{ event.date }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="p-3 bg-[#D4AF37]/10 rounded-lg">
                    <Clock class="w-5 h-5 text-[#0F3460]" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-600">Horário</p>
                    <p class="font-semibold text-[#0F3460]">{{ event.time }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="p-3 bg-[#D4AF37]/10 rounded-lg">
                    <MapPin class="w-5 h-5 text-[#0F3460]" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-600">Local</p>
                    <p class="font-semibold text-[#0F3460]">{{ event.location }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="p-3 bg-[#D4AF37]/10 rounded-lg">
                    <Users class="w-5 h-5 text-[#0F3460]" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-600">Capacidade</p>
                    <p class="font-semibold text-[#0F3460]">{{ event.capacity }} pessoas</p>
                  </div>
                </div>
              </div>

              <div v-if="event.descricao">
                <h2 class="subheading text-[#0F3460] mb-4">Sobre o Evento</h2>
                <p class="text-gray-600 mb-4">{{ event.descricao }}</p>
              </div>
            </div>
          </div>

          <div class="lg:col-span-1">
            <div class="bg-gradient-to-br from-[#0F3460] to-[#2E8BC0] rounded-2xl p-8 text-white sticky top-24 shadow-xl">
              <h3 class="text-2xl font-bold mb-6">Reservar Ingressos</h3>

              <div class="space-y-6">
                <div class="flex items-center justify-between bg-white/10 rounded-lg px-4 py-3">
                  <span class="text-sm">Vagas disponíveis</span>
                  <span class="font-bold">{{ event.available }} / {{ event.capacity }}</span>
                </div>

                <div>
                  <label class="block text-sm font-semibold mb-3">Ingressos disponíveis</label>
                  <div class="space-y-3 max-h-80 overflow-auto pr-1">
                    <div
                      v-for="ticket in ticketsForSelect"
                      :key="ticket.id"
                      class="rounded-lg border border-white/20 bg-white/10 p-3"
                    >
                      <p class="font-semibold">{{ ticket.name }}</p>
                      <p class="text-xs text-white/80 mb-3">
                        {{ ticket.time || event.time }}h • {{ ticket.available }} disp. • R$ {{ Number(ticket.price || 0).toFixed(2) }}
                      </p>
                      <div class="flex items-center gap-3">
                        <button
                          class="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                          @click="decrementTicket(ticket)"
                        >
                          −
                        </button>
                        <input
                          :value="quantityFor(ticket)"
                          readonly
                          class="w-14 px-2 py-1 rounded-lg bg-white/20 border border-white/30 text-white text-center"
                        />
                        <button
                          class="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                          @click="incrementTicket(ticket)"
                        >
                          +
                        </button>
                        <span class="text-xs text-white/80">máx. {{ maxQuantityForTicket(ticket) }}</span>
                      </div>
                    </div>
                  </div>

                  <p v-if="ticketsError" class="text-sm text-red-200 mt-2">
                    {{ ticketsError }}
                  </p>
                  <p v-else-if="!loading && ticketsForSelect.length === 0" class="text-sm text-white/70 mt-2">
                    Nenhum ingresso disponível para este evento no momento.
                  </p>
                </div>

                <div class="border-t border-white/20 pt-6">
                  <div class="flex justify-between mb-4 text-sm text-white/80">
                    <span>Quantidade</span>
                    <span>{{ totalQuantity }} ingresso{{ totalQuantity > 1 ? 's' : '' }}</span>
                  </div>
                  <div class="flex justify-between text-lg font-bold border-t border-white/20 pt-4">
                    <span>Total</span>
                    <span>R$ {{ Number(total).toFixed(2) }}</span>
                  </div>
                </div>

                <Button
                  class="w-full bg-[#D4AF37] text-[#0F3460] hover:bg-white font-bold text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="totalQuantity <= 0"
                  @click="goToCheckout"
                >
                  Continuar
                </Button>

                <p class="text-xs text-white/70 text-center">Você receberá confirmação por email após a compra</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

