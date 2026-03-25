<script setup>
import { ref } from 'vue'
import { AlertCircle, CheckCircle, ChevronLeft, QrCode, RotateCcw, Search, XCircle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Button from '@/components/ui/Button.vue'
import { apidogService } from '@/api/services/apidog.js'

const router = useRouter()

const codigo = ref('')
const isLoading = ref(false)
const result = ref(null) // null | 'success' | 'error' | 'already_used' | 'invalid'
const resultMessage = ref('')
const resultDetail = ref(null)
const history = ref([])

const goBack = () => router.back()

const resetForm = () => {
  codigo.value = ''
  result.value = null
  resultMessage.value = ''
  resultDetail.value = null
}

const handleCheckin = async () => {
  const code = codigo.value.trim()
  if (!code) return

  isLoading.value = true
  result.value = null
  resultMessage.value = ''
  resultDetail.value = null

  try {
    const response = await apidogService.fazerCheckin(code)

    result.value = 'success'
    resultMessage.value = 'Check-in realizado com sucesso!'
    resultDetail.value = response

    history.value.unshift({
      codigo: code,
      status: 'success',
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      mensagem: 'Check-in confirmado',
    })
  } catch (err) {
    const msg = err?.message || ''

    if (msg.toLowerCase().includes('já utilizado') || msg.toLowerCase().includes('already')) {
      result.value = 'already_used'
      resultMessage.value = 'Ingresso já utilizado'
    } else if (msg.toLowerCase().includes('inválido') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('não encontrado')) {
      result.value = 'invalid'
      resultMessage.value = 'Ingresso inválido ou não encontrado'
    } else {
      result.value = 'error'
      resultMessage.value = msg || 'Erro ao validar ingresso. Tente novamente.'
    }

    history.value.unshift({
      codigo: code,
      status: result.value,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      mensagem: resultMessage.value,
    })
  } finally {
    isLoading.value = false
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Enter') handleCheckin()
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Header />

    <main class="flex-1">
      <!-- Barra de navegação -->
      <div class="bg-white border-b border-gray-200">
        <div class="container mx-auto px-4 py-4">
          <button class="flex items-center gap-2 text-[#0F3460] hover:text-[#D4AF37] transition-colors" @click="goBack">
            <ChevronLeft class="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      <div class="container mx-auto px-4 py-10">
        <div class="max-w-xl mx-auto">

          <!-- Título -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0F3460]/10 mb-4">
              <QrCode class="w-9 h-9 text-[#0F3460]" />
            </div>
            <h1 class="text-2xl md:text-3xl font-bold text-[#0F3460] mb-2">Check-in de Ingresso</h1>
            <p class="text-gray-600">Digite ou escaneie o código do ingresso para validar a entrada</p>
          </div>

          <!-- Card de busca -->
          <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              Código do Ingresso
            </label>
            <div class="flex gap-3">
              <input
                v-model="codigo"
                type="text"
                placeholder="Ex: MIR-2026-001234"
                class="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-[#0F3460] font-mono text-base focus:outline-none focus:ring-2 focus:ring-[#0F3460] uppercase"
                :disabled="isLoading"
                @keydown="handleKeydown"
              />
              <Button
                :disabled="!codigo.trim() || isLoading"
                class="bg-[#0F3460] text-white hover:bg-[#0D2A47] px-5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                @click="handleCheckin"
              >
                <Search v-if="!isLoading" class="w-5 h-5" />
                <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </Button>
            </div>
            <p class="text-xs text-gray-500 mt-2">Pressione Enter ou clique no botão para validar</p>
          </div>

          <!-- Resultado -->
          <div v-if="result" class="mb-6">

            <!-- Sucesso -->
            <div
              v-if="result === 'success'"
              class="bg-green-50 border border-green-200 rounded-2xl p-6 text-center shadow-sm"
            >
              <CheckCircle class="w-14 h-14 text-green-600 mx-auto mb-3" />
              <h2 class="text-xl font-bold text-green-800 mb-1">{{ resultMessage }}</h2>
              <p v-if="resultDetail?.nome" class="text-green-700 font-semibold text-lg mb-1">{{ resultDetail.nome }}</p>
              <p v-if="resultDetail?.evento" class="text-green-600 text-sm">{{ resultDetail.evento }}</p>
              <p v-if="resultDetail?.horario" class="text-green-600 text-sm">Horário: {{ resultDetail.horario }}h</p>
              <Button
                class="mt-5 bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 mx-auto"
                @click="resetForm"
              >
                <RotateCcw class="w-4 h-4" />
                Validar próximo
              </Button>
            </div>

            <!-- Já utilizado -->
            <div
              v-else-if="result === 'already_used'"
              class="bg-yellow-50 border border-yellow-300 rounded-2xl p-6 text-center shadow-sm"
            >
              <AlertCircle class="w-14 h-14 text-yellow-600 mx-auto mb-3" />
              <h2 class="text-xl font-bold text-yellow-800 mb-1">{{ resultMessage }}</h2>
              <p class="text-yellow-700 text-sm">Este ingresso já foi utilizado anteriormente.</p>
              <Button
                class="mt-5 bg-yellow-600 text-white hover:bg-yellow-700 flex items-center gap-2 mx-auto"
                @click="resetForm"
              >
                <RotateCcw class="w-4 h-4" />
                Tentar outro
              </Button>
            </div>

            <!-- Inválido ou erro -->
            <div
              v-else
              class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm"
            >
              <XCircle class="w-14 h-14 text-red-600 mx-auto mb-3" />
              <h2 class="text-xl font-bold text-red-800 mb-1">{{ resultMessage }}</h2>
              <p class="text-red-600 text-sm">Verifique o código e tente novamente.</p>
              <Button
                class="mt-5 bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 mx-auto"
                @click="resetForm"
              >
                <RotateCcw class="w-4 h-4" />
                Tentar novamente
              </Button>
            </div>
          </div>

          <!-- Histórico da sessão -->
          <div v-if="history.length > 0" class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="font-bold text-[#0F3460] mb-4">Histórico da sessão</h3>
            <div class="space-y-2">
              <div
                v-for="(item, index) in history"
                :key="index"
                class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div class="flex items-center gap-3">
                  <CheckCircle v-if="item.status === 'success'" class="w-5 h-5 text-green-600 flex-shrink-0" />
                  <AlertCircle v-else-if="item.status === 'already_used'" class="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <XCircle v-else class="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p class="font-mono text-sm font-semibold text-gray-700">{{ item.codigo }}</p>
                    <p class="text-xs text-gray-500">{{ item.mensagem }}</p>
                  </div>
                </div>
                <span class="text-xs text-gray-400 flex-shrink-0 ml-4">{{ item.hora }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
