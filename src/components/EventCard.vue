<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Calendar, MapPin, Users } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'

const props = defineProps({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  available: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  badge: { type: String, default: '' },
})

const router = useRouter()

const occupancyPercentage = computed(() => ((props.capacity - props.available) / props.capacity) * 100)

const handleBuy = () => {
  router.push(`/evento/${props.id}`)
}
</script>

<template>
  <div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
    <div class="relative h-48 overflow-hidden">
      <img :src="image" :alt="title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div
        v-if="badge"
        class="absolute top-4 right-4 bg-[#D4AF37] text-[#0F3460] px-3 py-1 rounded-full text-sm font-semibold"
      >
        {{ badge }}
      </div>
      <div class="absolute bottom-4 left-4 right-4">
        <h3 class="text-white font-bold text-lg mb-2">{{ title }}</h3>
      </div>
    </div>

    <div class="p-6">
      <div class="space-y-3 mb-6">
        <div class="flex items-center gap-2 text-gray-600">
          <Calendar class="w-4 h-4" />
          <span class="text-sm">{{ date }} às {{ time }}</span>
        </div>
        <div class="flex items-center gap-2 text-gray-600">
          <MapPin class="w-4 h-4" />
          <span class="text-sm">{{ location }}</span>
        </div>
        <div class="flex items-center gap-2 text-gray-600">
          <Users class="w-4 h-4" />
          <span class="text-sm">{{ available }} de {{ capacity }} lugares</span>
        </div>
      </div>

      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs font-semibold text-gray-600">Ocupação</span>
          <span class="text-xs font-semibold text-[#0F3460]">{{ Math.round(occupancyPercentage) }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-gradient-to-r from-[#2D6A4F] to-[#0F3460] h-2 rounded-full transition-all duration-300"
            :style="{ width: `${occupancyPercentage}%` }"
          />
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-gray-600 mb-1">A partir de</p>
          <p class="text-2xl font-bold text-[#0F3460]">R$ {{ price.toFixed(2) }}</p>
        </div>
        <Button class="bg-[#D4AF37] text-[#0F3460] hover:bg-white font-semibold flex items-center gap-2" @click="handleBuy">
          Comprar
          <ArrowRight class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

