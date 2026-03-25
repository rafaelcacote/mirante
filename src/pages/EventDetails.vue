<script setup>
import { computed, onMounted, ref } from 'vue'
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
const quantity = ref(1)

const price = computed(() => {
  const eventPrice = Number(event.value?.price || 0)
  if (eventPrice > 0) return eventPrice
  const firstTicketWithPrice = tickets.value.find((ticket) => Number(ticket?.price || 0) > 0)
  return Number(firstTicketWithPrice?.price || 0)
})
const total = computed(() => price.value * quantity.value)

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
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadEvent)

const goBack = () => router.back()
const goToCheckout = () => {
  if (!event.value?.id) return
  router.push({ name: 'select-sector', params: { id: event.value.id } })
}
const goToTicketPurchase = (ticket) => {
  if (!event.value?.id || !ticket?.id) return
  router.push({
    name: 'purchase-ticket',
    params: { id: event.value.id, sectorId: ticket.id },
    query: { time: ticket.time || event.value.time, price: String(ticket.price || 0) },
  })
}
const decrement = () => (quantity.value = Math.max(1, quantity.value - 1))
const increment = () => (quantity.value += 1)
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

            <div class="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <h2 class="subheading text-[#0F3460] mb-4">Ingressos Disponiveis</h2>
              <p v-if="ticketsError" class="text-sm text-red-600 mb-3">{{ ticketsError }}</p>
              <div v-if="tickets.length === 0" class="text-gray-600 text-sm">
                Nenhum ingresso listado para este evento no momento.
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="ticket in tickets"
                  :key="ticket.id"
                  class="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p class="font-semibold text-[#0F3460]">{{ ticket.name }}</p>
                    <p class="text-sm text-gray-600">
                      {{ ticket.time || event.time }} • {{ ticket.available }} disponiveis
                    </p>
                    <p v-if="ticket.description" class="text-xs text-gray-500 mt-1">{{ ticket.description }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-[#0F3460] mb-2">R$ {{ Number(ticket.price || 0).toFixed(2) }}</p>
                    <Button
                      :disabled="!ticket.isAvailable"
                      class="bg-[#0F3460] text-white disabled:opacity-50"
                      @click="goToTicketPurchase(ticket)"
                    >
                      {{ ticket.isAvailable ? 'Selecionar' : 'Esgotado' }}
                    </Button>
                  </div>
                </div>
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
                  <label class="block text-sm font-semibold mb-3">Quantidade de Ingressos</label>
                  <div class="flex items-center gap-3">
                    <button
                      class="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                      @click="decrement"
                    >
                      −
                    </button>
                    <input
                      v-model.number="quantity"
                      type="number"
                      min="1"
                      class="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white text-center focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    />
                    <button
                      class="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                      @click="increment"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div class="border-t border-white/20 pt-6">
                  <div class="flex justify-between mb-2">
                    <span>Preço unitário</span>
                    <span>R$ {{ Number(price).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between mb-4 text-sm text-white/80">
                    <span>Quantidade</span>
                    <span>{{ quantity }}x</span>
                  </div>
                  <div class="flex justify-between text-lg font-bold border-t border-white/20 pt-4">
                    <span>Total</span>
                    <span>R$ {{ Number(total).toFixed(2) }}</span>
                  </div>
                </div>

                <Button class="w-full bg-[#D4AF37] text-[#0F3460] hover:bg-white font-bold text-base py-3" @click="goToCheckout">
                  Escolher Horario
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

