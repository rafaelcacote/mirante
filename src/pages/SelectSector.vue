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
const sessions = ref([])
const loading = ref(true)
const error = ref('')

const eventDate = computed(() => event.value?.date || 'Data nao informada')
const eventAddress = computed(
  () => event.value?.raw?.endereco || 'Tv. Pres. Castelo Branco, 205, Centro - 69301280 - Boa Vista - RR'
)
const eventLocation = computed(() => event.value?.location || 'Mirante Edileusa Loz')
const doorOpening = computed(() => event.value?.time || '15:00')
const classification = 'Livre'
const eventImage = computed(
  () =>
    event.value?.image ||
    'https://private-us-east-1.manuscdn.com/sessionFile/ct5iih13rREJzVL8BUQxZf/sandbox/YN3cvVrDfKJXUeY7ppiGs4-img-2_1770038910000_na1fn_aGVyby1taXJhbnRlLXN1bnNldA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80'
)

// Horários disponíveis e esgotados
const fallbackSectors = [
  { id: 1, time: '15:00', available: true },
  { id: 2, time: '15:30', available: true },
  { id: 3, time: '16:00', available: true },
  { id: 4, time: '16:30', available: false },
  { id: 5, time: '17:00', available: false },
  { id: 6, time: '18:00', available: false },
  { id: 7, time: '18:30', available: false },
  { id: 8, time: '19:00', available: false },
  { id: 9, time: '19:30', available: false },
  { id: 10, time: '20:00', available: false },
  { id: 11, time: '20:30', available: false },
]

const sectors = computed(() => {
  if (sessions.value.length > 0) {
    return sessions.value.map((item) => ({
      id: item.id,
      time: item.time,
      available: item.isAvailable,
      price: item.price,
      availableCount: item.available,
    }))
  }
  return fallbackSectors
})

async function loadData() {
  const eventId = route.params.id
  if (!eventId) {
    error.value = 'ID do evento nao informado'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const [eventDetail, sessionList] = await Promise.all([
      apidogService.getEventDetail(eventId),
      apidogService.getEventSessions(eventId).catch(() => []),
    ])
    event.value = eventDetail
    sessions.value = sessionList
  } catch (err) {
    error.value = err?.message || 'Falha ao carregar evento'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const selectSector = (sector) => {
  if (sector.available) {
    router.push({
      name: 'purchase-ticket',
      params: { id: route.params.id, sectorId: sector.id },
      query: { time: sector.time, price: String(sector.price || 0) },
    })
  }
}

onMounted(loadData)
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

      <div class="container mx-auto px-4 py-8 md:py-12">
        <!-- Event Header -->
        <div class="mb-8 md:mb-12">
          <div class="rounded-3xl overflow-hidden shadow-lg mb-6">
            <img :src="eventImage" alt="Mirante Edileusa Lóz" class="w-full h-64 md:h-96 object-cover" />
          </div>

          <div class="max-w-3xl mx-auto text-left">
            <p class="text-sm text-gray-500 mb-2 md:text-base">{{ eventDate }}</p>
            <h1 class="text-2xl md:text-4xl font-bold text-[#0F3460] mb-4">
              {{ event?.title || 'Visita ao Mirante' }}
            </h1>

            <div class="space-y-3 text-gray-700 mb-5 md:mb-6">
              <div class="flex items-center gap-3">
                <Calendar class="w-5 h-5 text-[#0F3460]" />
                <span class="text-sm md:text-base">{{ eventDate }}</span>
              </div>
              <div class="flex items-center gap-3">
                <Clock class="w-5 h-5 text-[#0F3460]" />
                <span class="text-sm md:text-base">Abertura das portas: {{ doorOpening }}</span>
              </div>
              <div class="flex items-start gap-3">
                <MapPin class="w-5 h-5 text-[#0F3460] mt-0.5" />
                <div class="text-sm md:text-base">
                  <p class="font-semibold text-[#0F3460]">{{ eventLocation }}</p>
                  <p class="text-gray-600">{{ eventAddress }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Users class="w-5 h-5 text-[#0F3460]" />
                <span class="text-sm md:text-base">Classificação: {{ classification }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sector Selection -->
        <div class="max-w-4xl mx-auto">
          <h2 class="heading text-[#0F3460] mb-4 md:mb-6 text-center">Escolha abaixo um setor</h2>

          <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
            <div v-for="i in 6" :key="i" class="h-24 rounded-2xl bg-gray-200 animate-pulse" />
          </div>

          <div v-else-if="error" class="text-center mb-6">
            <p class="text-red-600 mb-3">Erro ao carregar horarios: {{ error }}</p>
            <Button class="bg-[#0F3460] text-white hover:bg-[#0D2A47]" @click="loadData">Tentar novamente</Button>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
            <button
              v-for="sector in sectors"
              :key="sector.id"
              :disabled="!sector.available"
              :class="[
                'p-4 md:p-6 rounded-2xl border-2 transition-all duration-200 text-left',
                sector.available
                  ? 'border-gray-200 bg-white hover:border-[#0F3460] hover:shadow-sm active:border-[#D4AF37] active:bg-[#D4AF37]/10 cursor-pointer'
                  : 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed',
              ]"
              @click="selectSector(sector)"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg md:text-xl font-bold text-[#0F3460] mb-1">Entrada {{ sector.time }}h</h3>
                  <p v-if="!sector.available" class="text-xs md:text-sm text-red-600 font-semibold">esgotado</p>
                  <p v-else class="text-xs md:text-sm text-[#2D6A4F] font-semibold">disponível</p>
                </div>
                <div v-if="sector.available" class="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center">
                  <svg class="w-4 h-4 text-[#0F3460]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Event Information -->
        <div class="max-w-4xl mx-auto mt-12 md:mt-16">
          <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 class="heading text-[#0F3460] mb-6">Regras de Visitação – Mirante Edileusa Lóz</h2>

            <div class="space-y-6 text-gray-700">
              <div>
                <h3 class="font-bold text-[#0F3460] mb-2">Horário de Funcionamento</h3>
                <p>Funcionamento: de <strong>quarta a domingo</strong>, das <strong>15h00 às 21h00</strong>.</p>
              </div>

              <div>
                <h3 class="font-bold text-[#0F3460] mb-2">Gratuidade</h3>
                <p>A entrada no Mirante é <strong>gratuita</strong>.</p>
              </div>

              <div>
                <h3 class="font-bold text-[#0F3460] mb-2">Acesso e Documentação</h3>
                <p>
                  É <strong>obrigatória a apresentação de documento oficial com foto</strong> e do
                  <strong>ingresso</strong> no momento do acesso ao Mirante.
                </p>
                <p class="mt-2">Cada CPF pode emitir até <strong>4 ingressos por dia</strong>.</p>
                <p class="mt-2"><strong>Não é permitido acessar o Mirante Edileusa Lóz sem reserva.</strong></p>
              </div>

              <div>
                <h3 class="font-bold text-[#0F3460] mb-2">Duração da Visita</h3>
                <p>Cada ingresso permite uma <strong>permanência de até 20 minutos</strong> no Mirante.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
