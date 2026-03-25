<script setup>
import { Calendar, Heart, MapPin, Ticket, Users, Zap } from 'lucide-vue-next'

const categories = [
  { id: 1, name: 'Visitas Guiadas', icon: MapPin, color: 'from-[#0F3460] to-[#2E8BC0]' },
  { id: 2, name: 'Eventos Especiais', icon: Zap, color: 'from-[#2E8BC0] to-[#2D6A4F]' },
  { id: 3, name: 'Grupos', icon: Users, color: 'from-[#2D6A4F] to-[#D4AF37]' },
  { id: 4, name: 'Experiências Premium', icon: Heart, color: 'from-[#D4AF37] to-[#0F3460]' },
  { id: 5, name: 'Ingressos Avulsos', icon: Ticket, color: 'from-[#0F3460] to-[#2D6A4F]' },
  { id: 6, name: 'Agendamentos', icon: Calendar, color: 'from-[#2D6A4F] to-[#2E8BC0]' },
]
</script>

<template>
  <section class="py-16 md:py-24 bg-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="heading text-[#0F3460] mb-4">Explore Nossas Categorias</h2>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">
          Escolha a experiência que mais se adequa ao seu estilo e aproveite o melhor do Mirante Edileusa Lóz
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="category in categories" :key="category.id" class="group cursor-pointer">
          <div
            class="rounded-2xl p-8 h-48 flex flex-col items-center justify-center text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            :class="`bg-gradient-to-br ${category.color}`"
          >
            <component :is="category.icon" class="w-12 h-12 mb-4 group-hover:scale-125 transition-transform duration-300" />
            <h3 class="text-center font-semibold text-lg">{{ category.name }}</h3>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

