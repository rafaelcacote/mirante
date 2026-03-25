<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar, CheckCircle, Clock, Download, Home, MapPin, QrCode, Share2, Ticket } from 'lucide-vue-next'

import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Button from '@/components/ui/Button.vue'

const route = useRoute()
const router = useRouter()

// Dados vindos da query string (enviados pelo PurchaseTicket após confirmação)
const confirmationCode = computed(() => route.query.codigo || route.query.code || 'MIR-' + Date.now())
const eventName = computed(() => route.query.evento || 'Visita ao Mirante Edileusa Lóz')
const eventDate = computed(() => route.query.data || 'Data informada no ingresso')
const eventTime = computed(() => route.query.horario || '')
const quantity = computed(() => Number(route.query.quantidade) || 1)
const customerEmail = computed(() => route.query.email || '')

const animateIn = ref(false)

onMounted(() => {
  setTimeout(() => {
    animateIn.value = true
  }, 100)
})

const goHome = () => router.push('/')
const goToMyTickets = () => router.push('/meus-ingressos')
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Header />

    <main class="flex-1">
      <div class="container mx-auto px-4 py-12">

        <!-- Ícone de sucesso animado -->
        <div
          class="text-center mb-10 transition-all duration-700"
          :class="animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        >
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6 shadow-lg">
            <CheckCircle class="w-14 h-14 text-green-600" />
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-[#0F3460] mb-3">Reserva Confirmada!</h1>
          <p class="text-gray-600 text-lg max-w-md mx-auto">
            Sua reserva foi realizada com sucesso.
            <span v-if="customerEmail"> Enviamos a confirmação para <strong>{{ customerEmail }}</strong>.</span>
          </p>
        </div>

        <div
          class="max-w-2xl mx-auto transition-all duration-700 delay-150"
          :class="animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        >

          <!-- Card principal do ingresso -->
          <div class="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">

            <!-- Cabeçalho dourado -->
            <div class="bg-gradient-to-r from-[#0F3460] to-[#2E8BC0] px-8 py-6 text-white">
              <div class="flex items-center gap-3 mb-1">
                <Ticket class="w-6 h-6 text-[#D4AF37]" />
                <span class="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider">Ingresso Confirmado</span>
              </div>
              <h2 class="text-xl md:text-2xl font-bold">{{ eventName }}</h2>
            </div>

            <!-- Corpo do ingresso -->
            <div class="p-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                <!-- Coluna de informações -->
                <div class="space-y-4">
                  <div class="flex items-start gap-3">
                    <div class="p-2 bg-[#D4AF37]/10 rounded-lg flex-shrink-0">
                      <Calendar class="w-5 h-5 text-[#0F3460]" />
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 mb-0.5">Data</p>
                      <p class="font-semibold text-[#0F3460]">{{ eventDate }}</p>
                    </div>
                  </div>

                  <div v-if="eventTime" class="flex items-start gap-3">
                    <div class="p-2 bg-[#D4AF37]/10 rounded-lg flex-shrink-0">
                      <Clock class="w-5 h-5 text-[#0F3460]" />
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 mb-0.5">Horário</p>
                      <p class="font-semibold text-[#0F3460]">{{ eventTime }}h</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <div class="p-2 bg-[#D4AF37]/10 rounded-lg flex-shrink-0">
                      <MapPin class="w-5 h-5 text-[#0F3460]" />
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 mb-0.5">Local</p>
                      <p class="font-semibold text-[#0F3460]">Mirante Edileusa Lóz</p>
                      <p class="text-xs text-gray-500">Boa Vista, RR</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3">
                    <div class="p-2 bg-[#D4AF37]/10 rounded-lg flex-shrink-0">
                      <Ticket class="w-5 h-5 text-[#0F3460]" />
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 mb-0.5">Quantidade</p>
                      <p class="font-semibold text-[#0F3460]">{{ quantity }} ingresso{{ quantity > 1 ? 's' : '' }}</p>
                    </div>
                  </div>
                </div>

                <!-- QR Code placeholder -->
                <div class="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div class="w-28 h-28 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm border border-gray-200">
                    <QrCode class="w-16 h-16 text-[#0F3460]" />
                  </div>
                  <p class="text-xs text-gray-500 text-center">Apresente este QR Code na entrada</p>
                </div>
              </div>

              <!-- Código de confirmação -->
              <div class="bg-[#0F3460]/5 border border-[#0F3460]/20 rounded-xl p-4 text-center mb-6">
                <p class="text-xs text-gray-500 mb-1">Código de Confirmação</p>
                <p class="text-2xl font-mono font-bold text-[#0F3460] tracking-widest">{{ confirmationCode }}</p>
              </div>

              <!-- Aviso importante -->
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p class="text-sm text-yellow-800">
                  <strong>Importante:</strong> Apresente um documento oficial com foto e este ingresso na entrada.
                  Cada CPF pode emitir até 4 ingressos por dia.
                </p>
              </div>

              <!-- Botões de ação -->
              <div class="flex flex-col sm:flex-row gap-3">
                <Button class="flex-1 bg-[#0F3460] text-white hover:bg-[#0D2A47] flex items-center justify-center gap-2">
                  <Download class="w-4 h-4" />
                  Baixar PDF
                </Button>
                <Button variant="outline" class="flex-1 flex items-center justify-center gap-2">
                  <Share2 class="w-4 h-4" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </div>

          <!-- Botões de navegação -->
          <div class="flex flex-col sm:flex-row gap-3">
            <Button
              class="flex-1 bg-[#D4AF37] text-[#0F3460] hover:bg-[#c9a430] font-semibold flex items-center justify-center gap-2"
              @click="goToMyTickets"
            >
              <Ticket class="w-4 h-4" />
              Ver Meus Ingressos
            </Button>
            <Button
              variant="outline"
              class="flex-1 flex items-center justify-center gap-2"
              @click="goHome"
            >
              <Home class="w-4 h-4" />
              Voltar ao Início
            </Button>
          </div>

        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
