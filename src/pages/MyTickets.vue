<script setup>
import { onMounted, ref } from 'vue'
import { Calendar, Download, MapPin, QrCode, Share2, Ticket, Users } from 'lucide-vue-next'

import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Button from '@/components/ui/Button.vue'
import apidogService from '@/api/services/apidog.js'

const loading = ref(true)
const error = ref('')
const tickets = ref([])

const fallbackTickets = [
  {
    id: 1,
    eventName: 'Experiência Premium - Pôr do Sol',
    date: '03 de Fevereiro de 2026',
    time: '17:30',
    location: 'Boa Vista, RR',
    quantity: 2,
    status: 'Confirmado',
    confirmationCode: 'MIR-2026-001234',
    qrCode: 'https://via.placeholder.com/150',
  },
  {
    id: 2,
    eventName: 'Visita Diurna - Mirante Edileusa Lóz',
    date: '02 de Fevereiro de 2026',
    time: '15:00',
    location: 'Boa Vista, RR',
    quantity: 1,
    status: 'Confirmado',
    confirmationCode: 'MIR-2026-001233',
    qrCode: 'https://via.placeholder.com/150',
  },
]

async function loadTickets() {
  loading.value = true
  error.value = ''
  try {
    const customerRaw = localStorage.getItem('mirante_last_customer')
    const customer = customerRaw ? JSON.parse(customerRaw) : {}
    const apiTickets = await apidogService.getMyTickets(customer)
    tickets.value = apiTickets?.length ? apiTickets : fallbackTickets
  } catch (err) {
    error.value = err?.message || 'Nao foi possivel carregar ingressos agora.'
    tickets.value = fallbackTickets
  } finally {
    loading.value = false
  }
}

onMounted(loadTickets)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Header />

    <main class="flex-1">
      <div class="container mx-auto px-4 py-12">
        <div class="mb-12">
          <h1 class="display text-[#0F3460] mb-2">Meus Ingressos</h1>
          <p class="text-gray-600 text-lg">Visualize e gerencie seus ingressos para os eventos</p>
        </div>

        <div v-if="loading" class="grid grid-cols-1 gap-4">
          <div v-for="i in 3" :key="i" class="h-40 rounded-2xl bg-gray-200 animate-pulse" />
        </div>

        <div v-else class="space-y-6">
          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          <div
            v-for="ticket in tickets"
            :key="ticket.id"
            class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 p-8">
              <div class="md:col-span-2">
                <h3 class="text-lg font-bold text-[#0F3460] mb-4">{{ ticket.eventName }}</h3>

                <div class="space-y-3">
                  <div class="flex items-center gap-3 text-gray-600">
                    <Calendar class="w-4 h-4 text-[#D4AF37]" />
                    <span class="text-sm">{{ ticket.date }}</span>
                  </div>
                  <div class="flex items-center gap-3 text-gray-600">
                    <Ticket class="w-4 h-4 text-[#D4AF37]" />
                    <span class="text-sm">{{ ticket.time }}</span>
                  </div>
                  <div class="flex items-center gap-3 text-gray-600">
                    <MapPin class="w-4 h-4 text-[#D4AF37]" />
                    <span class="text-sm">{{ ticket.location }}</span>
                  </div>
                  <div class="flex items-center gap-3 text-gray-600">
                    <Users class="w-4 h-4 text-[#D4AF37]" />
                    <span class="text-sm">{{ ticket.quantity }} ingresso(s)</span>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                  <p class="text-xs text-gray-500 mb-1">Código de Confirmação</p>
                  <p class="font-mono font-bold text-[#0F3460]">{{ ticket.confirmationCode }}</p>
                </div>
              </div>

              <div class="flex flex-col items-center justify-center">
                <div class="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <QrCode class="w-16 h-16 text-gray-300" />
                </div>
                <span class="text-xs text-gray-500">QR Code</span>
              </div>

              <div class="flex flex-col justify-between">
                <div>
                  <div class="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold mb-4">
                    {{ ticket.status }}
                  </div>
                </div>

                <div class="space-y-2">
                  <Button class="w-full bg-[#0F3460] text-white hover:bg-[#0D2A47] flex items-center justify-center gap-2">
                    <Download class="w-4 h-4" />
                    Baixar PDF
                  </Button>
                  <Button variant="outline" class="w-full flex items-center justify-center gap-2">
                    <Share2 class="w-4 h-4" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="tickets.length === 0" class="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Ticket class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-xl font-bold text-gray-600 mb-2">Nenhum ingresso encontrado</h3>
          <p class="text-gray-500 mb-6">Você ainda não comprou ingressos. Comece a explorar eventos agora!</p>
          <Button class="bg-[#D4AF37] text-[#0F3460] hover:bg-white font-semibold">Explorar Eventos</Button>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

