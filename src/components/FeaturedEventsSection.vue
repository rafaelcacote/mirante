<script setup>
import { ref, onMounted } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

import EventCard from '@/components/EventCard.vue'
import apidogService from '@/api/services/apidog.js'

const events = ref([])
const loading = ref(true)
const error = ref(null)

// URLs de imagem padrão (simplificadas para evitar problemas de parsing)
const DEFAULT_IMAGE_DAY = 'https://private-us-east-1.manuscdn.com/sessionFile/ct5iih13rREJzVL8BUQxZf/sandbox/YN3cvVrDfKJXUeY7ppiGs4-img-2_1770038910000_na1fn_aGVyby1taXJhbnRlLXN1bnNldA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80'
const DEFAULT_IMAGE_NIGHT = 'https://private-us-east-1.manuscdn.com/sessionFile/ct5iih13rREJzVL8BUQxZf/sandbox/YN3cvVrDfKJXUeY7ppiGs4-img-1_1770038877000_na1fn_aGVyby1taXJhbnRlLW5pZ2h0.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80'

// Eventos padrão caso a API falhe
const defaultEvents = [
  {
    id: 1,
    title: 'Visita Diurna - Mirante Edileusa Lóz',
    date: '02 de Fevereiro',
    time: '15:00',
    location: 'Boa Vista, RR',
    capacity: 100,
    available: 45,
    price: 0,
    image: DEFAULT_IMAGE_DAY,
    badge: 'Gratuito',
  },
  {
    id: 2,
    title: 'Experiência Premium - Pôr do Sol',
    date: '03 de Fevereiro',
    time: '17:30',
    location: 'Boa Vista, RR',
    capacity: 50,
    available: 12,
    price: 89.9,
    image: DEFAULT_IMAGE_DAY,
    badge: 'Quase Lotado',
  },
  {
    id: 3,
    title: 'Visita Noturna - Mirante Iluminado',
    date: '04 de Fevereiro',
    time: '19:00',
    location: 'Boa Vista, RR',
    capacity: 80,
    available: 35,
    price: 49.9,
    image: DEFAULT_IMAGE_NIGHT,
  },
  {
    id: 4,
    title: 'Agendamento em Grupo',
    date: '05 de Fevereiro',
    time: '16:00',
    location: 'Boa Vista, RR',
    capacity: 200,
    available: 150,
    price: 29.9,
    image: DEFAULT_IMAGE_DAY,
  },
]

// Carregar eventos da API
const loadEvents = async () => {
  loading.value = true
  error.value = null
  
  try {
    const apiEvents = await apidogService.getEventsByPDV()
    
    // Se a API retornar eventos, usar eles
    if (apiEvents && apiEvents.length > 0) {
      events.value = apiEvents
    } else {
      // Caso contrário, usar eventos padrão
      console.warn('API retornou nenhum evento, usando eventos padrão')
      events.value = defaultEvents
    }
  } catch (err) {
    console.error('Erro ao carregar eventos da API:', err)
    error.value = err.message
    // Em caso de erro, usar eventos padrão
    events.value = defaultEvents
  } finally {
    loading.value = false
  }
}

// Carregar eventos quando o componente for montado
onMounted(() => {
  loadEvents()
})

const goToPrevious = () => {
  const arr = [...events.value]
  const last = arr.pop()
  if (last) arr.unshift(last)
  events.value = arr
}

const goToNext = () => {
  const arr = [...events.value]
  const first = arr.shift()
  if (first) arr.push(first)
  events.value = arr
}
</script>

<template>
  <section id="eventos" class="py-16 md:py-24 bg-gradient-to-b from-[#F5F5F5] to-white">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between mb-12">
        <div>
          <h2 class="heading text-[#0F3460] mb-2">Eventos em Destaque</h2>
          <p class="text-gray-600">Confira as melhores experiências disponíveis agora</p>
        </div>
        <div class="hidden md:flex gap-2">
          <button
            class="p-3 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-[#D4AF37] transition-all duration-300"
            @click="goToPrevious"
          >
            <ChevronLeft class="w-5 h-5 text-[#0F3460]" />
          </button>
          <button
            class="p-3 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-[#D4AF37] transition-all duration-300"
            @click="goToNext"
          >
            <ChevronRight class="w-5 h-5 text-[#0F3460]" />
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="i in 4" :key="i" class="bg-gray-200 animate-pulse rounded-2xl h-96"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-8">
        <p class="text-red-600 mb-4">Erro ao carregar eventos: {{ error }}</p>
        <p class="text-gray-600 text-sm">Exibindo eventos padrão</p>
      </div>

      <!-- Events grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EventCard v-for="event in events" :key="event.id" v-bind="event" />
      </div>
    </div>
  </section>
</template>

