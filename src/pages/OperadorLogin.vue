<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import logoMirante from '@/assets/images/logo-colorido.png'
import { apidogService } from '@/api/services/apidog.js'

const router = useRouter()

const formData = reactive({
  email: '',
  senha: '',
})
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!formData.email || !formData.senha) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    await apidogService.autenticarOperador(formData.email, formData.senha)
    router.push('/operador/dashboard')
  } catch (err) {
    errorMessage.value = err?.message || 'Email ou senha incorretos. Tente novamente.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <!-- Tela cheia sem Header nem Footer — layout dedicado de login -->
  <div class="min-h-screen flex bg-gray-50">

    <!-- Coluna esquerda — decorativa (visível em telas grandes) -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F3460] to-[#2E8BC0] flex-col items-center justify-center px-12 relative overflow-hidden">
      <!-- Círculos decorativos -->
      <div class="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-white/5" />
      <div class="absolute bottom-[-60px] right-[-60px] w-96 h-96 rounded-full bg-white/5" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/3" />

      <div class="relative z-10 text-center">
        <!-- Logo -->
        <div class="bg-white rounded-2xl p-5 inline-block mb-8 shadow-xl">
          <img :src="logoMirante" alt="Mirante Edileusa Lóz" class="h-20 w-auto object-contain" />
        </div>
        <h2 class="text-3xl font-bold text-white mb-4">Área do Operador</h2>
        <p class="text-white/75 text-lg leading-relaxed max-w-sm">
          Gerencie ingressos, faça check-in de visitantes e acompanhe o fluxo do Mirante Edileusa Lóz.
        </p>
      </div>
    </div>

    <!-- Coluna direita — formulário -->
    <div class="flex-1 flex flex-col min-h-screen">

      <!-- Barra superior com botão voltar -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white">
        <!-- Logo mobile -->
        <div class="flex items-center gap-3 lg:hidden">
          <div class="bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm">
            <img :src="logoMirante" alt="Mirante" class="h-8 w-auto object-contain" />
          </div>
          <span class="font-bold text-[#0F3460] text-sm">Mirante Edileusa Lóz</span>
        </div>
        <div class="hidden lg:block" />

        <!-- Botão voltar ao site -->
        <RouterLink
          to="/"
          class="flex items-center gap-2 text-sm font-semibold text-[#0F3460] bg-[#0F3460]/8 hover:bg-[#0F3460] hover:text-white px-4 py-2 rounded-lg transition-all duration-200 group"
        >
          <ArrowLeft class="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Voltar ao site
        </RouterLink>
      </div>

      <!-- Conteúdo do formulário centralizado -->
      <div class="flex-1 flex items-center justify-center px-6 py-10">
        <div class="w-full max-w-sm">

          <!-- Título -->
          <div class="mb-8">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0F3460]/10 mb-4">
              <Lock class="w-6 h-6 text-[#0F3460]" />
            </div>
            <h1 class="text-2xl font-bold text-[#0F3460] mb-1">Entrar</h1>
            <p class="text-gray-500 text-sm">Acesse com suas credenciais de operador</p>
          </div>

          <!-- Mensagem de erro -->
          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-red-600 text-sm"
          >
            {{ errorMessage }}
          </div>

          <!-- Formulário -->
          <form class="space-y-5" @submit.prevent="handleLogin">

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <Mail class="w-4 h-4 inline mr-1.5" />
                Email
              </label>
              <input
                v-model="formData.email"
                type="email"
                autocomplete="username"
                placeholder="operador@mirante.com"
                required
                class="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F3460] focus:border-transparent transition"
              />
            </div>

            <!-- Senha -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <Lock class="w-4 h-4 inline mr-1.5" />
                Senha
              </label>
              <div class="relative">
                <input
                  v-model="formData.senha"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  required
                  class="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F3460] focus:border-transparent transition"
                />
                <button
                  type="button"
                  class="absolute right-3 top-3.5 text-gray-400 hover:text-[#0F3460] transition-colors"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" class="w-5 h-5" />
                  <Eye v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Botão entrar -->
            <Button
              type="submit"
              :disabled="!formData.email || !formData.senha || isLoading"
              class="w-full bg-[#0F3460] text-white hover:bg-[#0D2A47] font-semibold py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <LogIn v-else class="w-5 h-5" />
              {{ isLoading ? 'Entrando...' : 'Entrar' }}
            </Button>

          </form>

          <!-- Aviso -->
          <p class="text-xs text-gray-400 text-center mt-6">
            Área restrita. Acesso exclusivo para operadores do Mirante Edileusa Lóz.
          </p>

        </div>
      </div>

      <!-- Rodapé simples -->
      <div class="px-6 py-4 border-t border-gray-100 text-center">
        <p class="text-xs text-gray-400">&copy; 2026 Mirante Ingressos. Todos os direitos reservados.</p>
      </div>

    </div>
  </div>
</template>
