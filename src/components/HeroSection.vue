<script setup>
import { ref } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import Button from '@/components/ui/Button.vue'
import InfoDialog from '@/components/InfoDialog.vue'

const router = useRouter()

const heroImageUrl =
  'https://private-us-east-1.manuscdn.com/sessionFile/ct5iih13rREJzVL8BUQxZf/sandbox/YN3cvVrDfKJXUeY7ppiGs4-img-2_1770038910000_na1fn_aGVyby1taXJhbnRlLXN1bnNldA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvY3Q1aWloMTNyUkVKelZMOEJVUXhaZi9zYW5kYm94L1lOM2N2VnJEZktKWFVlWTdwcGlHczQtaW1nLTJfMTc3MDAzODkxMDAwMF9uYTFmbl9hR1Z5YnkxdGFYSmhiblJsTFhOMWJuTmxkQS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=FfdXi1NM8V2RSw2vOGUPRNYRinUox7uu2YIZ8dtGIlg43n0hqtxshqyGSKCAoTWwPu6QmWmtuk8hiZNkN6fytcz~j72m8U0~6tH8agUEOI5IZt8qGa-DUR6PMOGOddOOlGoCPRdoy1u2xur2~sXNdP0-kVoVvZccAvl2xygDDHi8BVwJgqKdLLeWrShDOvGUJkGuBXP0yrChM5t3-x35WrYJl-ESvEqvKozPzwsspu8zep2v4YpMqP0ZJ-8vxyGPSBgdrg33MxflZU3GDk1g4KwB2objZx51Jmhva7tmuxEUef75nedG-4WkJPZB0OvvySK9tF9yhkosqX~B6mdXlQ__'

const showInfoDialog = ref(false)

const goToEvent = () => {
  router.push({ path: '/', hash: '#eventos' })
}
</script>

<template>
  <section class="relative min-h-[500px] md:h-[600px] overflow-hidden">
    <div class="absolute inset-0 bg-cover bg-center" :style="{ backgroundImage: `url('${heroImageUrl}')` }">
      <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
    </div>

    <div class="relative min-h-[500px] md:h-[600px] container mx-auto px-4 flex flex-col justify-center py-8 md:py-0">
      <div class="max-w-2xl">
        <h2 class="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight">
          Viva uma Experiência Inesquecível
        </h2>
        <p class="text-sm md:text-lg lg:text-xl text-gray-100 mb-6 md:mb-8 max-w-xl leading-relaxed">
          Descubra o Mirante Edileusa Lóz, o ponto de observação mais alto de Boa Vista. Compre seus ingressos agora e
          aproveite uma vista panorâmica espetacular.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 md:gap-4">
          <Button
            class="bg-[#D4AF37] text-[#0F3460] hover:bg-white font-semibold text-sm md:text-base px-6 md:px-8 py-3 md:py-6 flex items-center justify-center gap-2 w-full sm:w-auto"
            @click="goToEvent"
          >
            Comprar Ingressos
            <ChevronRight class="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          <Button
            variant="outline"
            class="border-2 border-white text-white hover:bg-white/10 font-semibold text-sm md:text-base px-6 md:px-8 py-3 md:py-6 w-full sm:w-auto"
            @click="showInfoDialog = true"
          >
            Saiba Mais
          </Button>
        </div>
      </div>
    </div>
  </section>

  <InfoDialog v-model:visible="showInfoDialog" />
</template>

