<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MapPin, Menu, Search, X } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import logoMirante from '@/assets/images/logo-colorido.png'

const router = useRouter()
const mobileMenuOpen = ref(false)
const searchQuery = ref('')

function goEntrar() {
  mobileMenuOpen.value = false
  router.push({ name: 'cliente-entrar' })
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-gradient-to-r from-[#0F3460] to-[#2E8BC0] shadow-lg">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between gap-4">
        <RouterLink
          to="/"
          class="flex items-center gap-3 flex-shrink-0 hover:opacity-90 transition-opacity"
        >
          <div class="bg-white rounded-xl p-2.5 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
            <img :src="logoMirante" alt="Mirante Edileusa Lóz" class="h-10 md:h-12 w-auto object-contain" />
          </div>
         
        </RouterLink>

        <div class="hidden md:flex flex-1 max-w-md mx-4">
          <div class="w-full relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar experiencias"
              class="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <Search class="absolute right-3 top-3.5 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div class="flex items-center gap-3 lg:gap-4 shrink-0">
          <div
            class="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <MapPin class="w-4 h-4" />
            <span class="text-sm font-medium">Boa Vista</span>
          </div>

          <nav class="hidden lg:flex items-center gap-6 text-white">
            <RouterLink to="/o-mirante" class="text-sm font-medium hover:text-[#D4AF37] transition-colors">
              O Mirante
            </RouterLink>
            <a href="https://boavista.rr.gov.br/visita360/index.htm" target="_blank" rel="noopener noreferrer" class="text-sm font-medium hover:text-[#D4AF37] transition-colors">Visão 360º</a>
            <Button
              type="button"
              class="bg-[#D4AF37] text-[#0F3460] hover:bg-white font-semibold"
              @click="goEntrar"
            >
              Entrar
            </Button>
          </nav>
        </div>

        <button
          class="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <X v-if="mobileMenuOpen" class="w-6 h-6" />
          <Menu v-else class="w-6 h-6" />
        </button>
      </div>

      <div class="md:hidden mt-4">
        <div class="w-full relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar experiencias"
            class="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          />
          <Search class="absolute right-3 top-3.5 text-gray-400 w-5 h-5" />
        </div>
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="lg:hidden bg-[#0D2A47] border-t border-white/10">
      <div class="container mx-auto px-4 py-4 space-y-3">
        <RouterLink
          to="/o-mirante"
          class="block text-white text-sm font-medium py-2 hover:text-[#D4AF37] transition-colors"
          @click="mobileMenuOpen = false"
        >
          O Mirante
        </RouterLink>
        <a href="https://boavista.rr.gov.br/visita360/index.htm" target="_blank" rel="noopener noreferrer" class="block text-white text-sm font-medium py-2 hover:text-[#D4AF37] transition-colors" @click="mobileMenuOpen = false">
          Visão 360º
        </a>
        <Button
          type="button"
          class="w-full bg-[#D4AF37] text-[#0F3460] hover:bg-white font-semibold"
          @click="goEntrar"
        >
          Entrar
        </Button>
      </div>
    </div>
  </header>
</template>

