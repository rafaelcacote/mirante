<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { ChevronLeft, Eye, MapPin, Calendar, Building2, Ruler } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import miranteHero from '@/assets/images/mirante16.png'
import miranteHistory from '@/assets/images/mirante17.jpg'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <DefaultLayout root-class="min-h-screen flex flex-col bg-white">
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center">
        <img :src="miranteHero" alt="Mirante Edileusa Lóz" class="w-full h-full object-cover" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-r from-[#0F3460]/90 via-[#0F3460]/60 to-[#2E8BC0]/40" />
      <div class="relative container mx-auto px-4 py-16 md:py-24">
        <button
          class="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
          @click="goBack"
        >
          <ChevronLeft class="w-5 h-5" />
          <span>Voltar</span>
        </button>
        <div class="max-w-3xl">
          <p class="text-sm tracking-[0.25em] text-white/80 uppercase mb-3">Sobre o Mirante</p>
          <h1 class="display text-white mb-4 leading-tight">Mirante Edileusa Lóz</h1>
          <p class="text-xl md:text-2xl text-gray-100 font-semibold">
            VENHA VIVER A MELHOR EXPERIÊNCIA
          </p>
        </div>
      </div>
    </section>

    <!-- Highlights -->
    <section class="bg-white">
      <div class="container mx-auto px-4 -mt-10 md:-mt-14 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <p class="text-sm text-gray-500 mb-2">Altura total</p>
            <p class="text-2xl font-bold text-[#0F3460]">120 metros</p>
            <p class="text-sm text-gray-600 mt-2">Ponto mais alto de Boa Vista</p>
          </div>
          <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <p class="text-sm text-gray-500 mb-2">Observatório</p>
            <p class="text-2xl font-bold text-[#0F3460]">93 metros</p>
            <p class="text-sm text-gray-600 mt-2">Piso de vidro e vista panorâmica</p>
          </div>
          <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <p class="text-sm text-gray-500 mb-2">Estrutura</p>
            <p class="text-2xl font-bold text-[#0F3460]">2 elevadores</p>
            <p class="text-sm text-gray-600 mt-2">1 social e 1 panorâmico</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Main -->
    <main class="flex-1 py-12 md:py-16">
      <div class="container mx-auto px-4">
        <!-- Story + Image -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16">
          <div>
            <h2 class="heading text-[#0F3460] mb-4">História e Homenagem</h2>
            <div class="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>
                Inaugurado em <strong class="text-[#0F3460]">20 de dezembro de 2020</strong>, o
                <strong class="text-[#0F3460]">Mirante Edileusa Lóz</strong>, localizado no complexo
                <strong class="text-[#0F3460]">Parque do Rio Branco</strong>, maior obra turística de Roraima, integra o
                novo cartão postal de Boa Vista. A obra foi executada e entregue à população na gestão da ex-prefeita
                Teresa Surita.
              </p>
              <p>
                O mirante do Parque do Rio Branco recebeu o nome de <strong class="text-[#0F3460]">Edileusa Lóz</strong>,
                uma homenagem à ex-servidora da Prefeitura e ex-candidata à vice-prefeita da capital de Roraima.
              </p>
            </div>
          </div>
          <div class="relative">
            <div class="absolute -inset-4 bg-gradient-to-br from-[#0F3460]/20 to-[#2E8BC0]/20 rounded-3xl blur-2xl" />
            <div class="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                :src="miranteHistory"
                alt="Mirante Edileusa Lóz - Vista panorâmica"
                class="w-full h-[320px] md:h-[420px] object-cover"
              />
            </div>
          </div>
        </div>

        <!-- Features -->
        <div class="max-w-6xl mx-auto mb-16">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex gap-6 p-6 rounded-2xl bg-gradient-to-br from-[#F5F5F5] to-white shadow-sm">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-[#0F3460] to-[#2E8BC0]">
                  <Ruler class="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-[#0F3460] mb-2">120 Metros de Altura</h3>
                <p class="text-gray-600">
                  O ponto de observação mais alto de Boa Vista e da região Norte, com 250m² na parte superior.
                </p>
              </div>
            </div>

            <div class="flex gap-6 p-6 rounded-2xl bg-gradient-to-br from-[#F5F5F5] to-white shadow-sm">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-[#0F3460] to-[#2E8BC0]">
                  <Eye class="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-[#0F3460] mb-2">93 Metros de Altura</h3>
                <p class="text-gray-600">
                  O observatório possui piso de vidro e vista panorâmica da nossa querida Boa Vista e do Rio Branco.
                </p>
              </div>
            </div>

            <div class="flex gap-6 p-6 rounded-2xl bg-gradient-to-br from-[#F5F5F5] to-white shadow-sm">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-[#0F3460] to-[#2E8BC0]">
                  <Building2 class="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-[#0F3460] mb-2">2 Elevadores</h3>
                <p class="text-gray-600">
                  1 social e 1 panorâmico onde você pode durante a subida contemplar as belezas naturais.
                </p>
              </div>
            </div>

            <div class="flex gap-6 p-6 rounded-2xl bg-gradient-to-br from-[#F5F5F5] to-white shadow-sm">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-[#0F3460] to-[#2E8BC0]">
                  <MapPin class="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-[#0F3460] mb-2">Parque do Rio Branco</h3>
                <p class="text-gray-600">
                  Complexo turístico com experiência incrível e apaixonante, localizado em Boa Vista.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Experience -->
        <div class="max-w-5xl mx-auto">
          <div class="bg-gradient-to-br from-[#0F3460] to-[#2E8BC0] rounded-2xl p-8 md:p-12 text-white shadow-2xl">
            <div class="max-w-3xl mx-auto text-center">
              <h2 class="heading text-white mb-6">Uma Experiência Única</h2>
              <p class="text-lg md:text-xl leading-relaxed text-gray-100">
                O complexo turístico Parque do Rio Branco dispõe de uma experiência incrível e apaixonante, e uma delas
                é a possibilidade de contemplar do alto, a arquitetura da cidade, outros atrativos turísticos, e a
                natureza, tudo isso será possível ao conhecer o Mirante Edileusa Lóz.
              </p>
              <div class="mt-8">
                <p class="text-xl font-semibold text-[#D4AF37]">
                  Certamente somos um dos melhores locais a serem visitados em Boa Vista e você vai adorar passar um
                  tempo conosco.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </DefaultLayout>
</template>

<style scoped>
.display {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
}

@media (min-width: 768px) {
  .display {
    font-size: 3.5rem;
  }
}

.heading {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
}

@media (min-width: 768px) {
  .heading {
    font-size: 2.5rem;
  }
}
</style>
