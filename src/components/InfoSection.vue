<script setup>
import { Clock, Eye, MapPin, Users } from 'lucide-vue-next'

const features = [
  {
    icon: Eye,
    title: '93 Metros de Altura',
    description: 'O ponto de observação mais alto de Boa Vista com vista panorâmica de 360°',
  },
  {
    icon: Users,
    title: 'Experiência em Grupo',
    description: 'Perfeito para famílias, escolas e grupos turísticos com agendamento especial',
  },
  {
    icon: Clock,
    title: 'Funcionamento',
    description: 'Aberto de quarta a domingo, das 15h às 21h. Ingressos gratuitos para crianças menores de 3 anos',
  },
  {
    icon: MapPin,
    title: 'Localização Privilegiada',
    description: 'Localizado no Parque do Rio Branco, maior obra turística de Roraima',
  },
]
</script>

<template>
  <section class="py-16 md:py-24 bg-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="heading text-[#0F3460] mb-4">Por Que Visitar o Mirante?</h2>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">
          Descubra uma experiência única com vistas espetaculares e conforto garantido
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="flex gap-6 p-6 rounded-xl bg-gradient-to-br from-[#F5F5F5] to-white hover:shadow-lg transition-shadow duration-300"
        >
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-14 w-14 rounded-lg bg-gradient-to-br from-[#0F3460] to-[#2E8BC0]">
              <component :is="feature.icon" class="h-7 w-7 text-white" />
            </div>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-[#0F3460] mb-2">{{ feature.title }}</h3>
            <p class="text-gray-600">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

