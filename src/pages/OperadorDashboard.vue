<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle, ClipboardList, LogOut, QrCode, Ticket, User, Users } from 'lucide-vue-next'

import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Button from '@/components/ui/Button.vue'
import { apidogService } from '@/api/services/apidog.js'

const router = useRouter()

const operador = ref(null)
const isLoadingOperador = ref(true)
const isLoggingOut = ref(false)
const errorMessage = ref('')

const stats = ref([
  { label: 'Check-ins hoje', value: '—', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  { label: 'Ingressos emitidos', value: '—', icon: Ticket, color: 'text-[#0F3460]', bg: 'bg-[#0F3460]/10' },
  { label: 'Visitantes hoje', value: '—', icon: Users, color: 'text-[#2E8BC0]', bg: 'bg-[#2E8BC0]/10' },
])

const quickLinks = [
  { label: 'Realizar Check-in', description: 'Valide ingressos na entrada', icon: QrCode, to: '/checkin', color: 'bg-[#0F3460]' },
  { label: 'Listar Ingressos', description: 'Consulte ingressos por pagamento', icon: ClipboardList, to: '/meus-ingressos', color: 'bg-[#2E8BC0]' },
]

async function loadOperador() {
  isLoadingOperador.value = true
  try {
    const data = await apidogService.getSessaoOperador()
    operador.value = data
  } catch {
    // Se falhar, provavelmente não está logado
    errorMessage.value = 'Sessão expirada. Faça login novamente.'
    setTimeout(() => router.push('/operador/login'), 2000)
  } finally {
    isLoadingOperador.value = false
  }
}

async function handleLogout() {
  isLoggingOut.value = true
  try {
    await apidogService.logoutOperador()
  } catch {
    // ignora erros no logout, redireciona de qualquer forma
  } finally {
    isLoggingOut.value = false
    router.push('/operador/login')
  }
}

onMounted(loadOperador)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Header />

    <main class="flex-1">

      <!-- Cabeçalho do dashboard -->
      <div class="bg-gradient-to-r from-[#0F3460] to-[#2E8BC0] text-white">
        <div class="container mx-auto px-4 py-8">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center">
                <User class="w-7 h-7 text-white" />
              </div>
              <div>
                <p class="text-white/80 text-sm mb-0.5">Bem-vindo,</p>
                <div v-if="isLoadingOperador" class="h-6 w-40 bg-white/20 rounded animate-pulse" />
                <h1 v-else class="text-xl md:text-2xl font-bold">
                  {{ operador?.nome || operador?.name || 'Operador' }}
                </h1>
                <p v-if="operador?.email" class="text-white/70 text-sm">{{ operador.email }}</p>
              </div>
            </div>

            <Button
              :disabled="isLoggingOut"
              class="bg-white/10 text-white border border-white/30 hover:bg-white/20 flex items-center gap-2 disabled:opacity-50"
              @click="handleLogout"
            >
              <svg v-if="isLoggingOut" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <LogOut v-else class="w-4 h-4" />
              {{ isLoggingOut ? 'Saindo...' : 'Sair' }}
            </Button>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-10">

        <!-- Aviso de erro -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
          {{ errorMessage }}
        </div>

        <!-- Cards de estatísticas -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4"
          >
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', stat.bg]">
              <component :is="stat.icon" :class="['w-6 h-6', stat.color]" />
            </div>
            <div>
              <p class="text-2xl font-bold text-[#0F3460]">{{ stat.value }}</p>
              <p class="text-sm text-gray-500">{{ stat.label }}</p>
            </div>
          </div>
        </div>

        <!-- Ações rápidas -->
        <h2 class="text-xl font-bold text-[#0F3460] mb-4">Ações Rápidas</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <RouterLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-shadow group cursor-pointer"
          >
            <div :class="['w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110', link.color]">
              <component :is="link.icon" class="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 class="font-bold text-[#0F3460] text-base">{{ link.label }}</h3>
              <p class="text-sm text-gray-500">{{ link.description }}</p>
            </div>
            <div class="ml-auto">
              <svg class="w-5 h-5 text-gray-400 group-hover:text-[#D4AF37] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </RouterLink>
        </div>

        <!-- Informações do sistema -->
        <div class="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h2 class="text-lg font-bold text-[#0F3460] mb-4 flex items-center gap-2">
            <ClipboardList class="w-5 h-5 text-[#D4AF37]" />
            Informações da Sessão
          </h2>
          <div v-if="isLoadingOperador" class="space-y-3">
            <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
            <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
          <div v-else-if="operador" class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div v-for="(valor, chave) in operador" :key="chave" class="flex flex-col">
              <span class="text-gray-500 text-xs uppercase tracking-wide mb-0.5">{{ chave }}</span>
              <span class="font-semibold text-[#0F3460]">{{ valor }}</span>
            </div>
          </div>
          <div v-else class="text-gray-500 text-sm">
            Nenhuma informação disponível.
          </div>
        </div>

      </div>
    </main>

    <Footer />
  </div>
</template>
