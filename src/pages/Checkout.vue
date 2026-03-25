<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, CreditCard, Lock, Mail, Phone, User } from 'lucide-vue-next'

import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()

const step = ref(1)
const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  cardNumber: '',
  cardName: '',
  expiryDate: '',
  cvv: '',
})

const eventTotal = 89.9 * 2
const tax = computed(() => eventTotal * 0.1)
const total = computed(() => eventTotal + tax.value)

const goBack = () => {
  router.back()
}

const handleSubmit = () => {
  if (step.value === 1) {
    step.value = 2
    return
  }
  window.alert('Pedido confirmado! Você receberá um email com seus ingressos.')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Header />

    <main class="flex-1">
      <div class="container mx-auto px-4 py-12">
        <button class="flex items-center gap-2 text-[#0F3460] hover:text-[#D4AF37] transition-colors mb-8" @click="goBack">
          <ChevronLeft class="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <div class="bg-white rounded-2xl shadow-lg p-8">
              <div class="flex gap-4 mb-8">
                <div class="flex-1 h-2 rounded-full transition-colors" :class="step >= 1 ? 'bg-[#0F3460]' : 'bg-gray-200'" />
                <div class="flex-1 h-2 rounded-full transition-colors" :class="step >= 2 ? 'bg-[#0F3460]' : 'bg-gray-200'" />
              </div>

              <form @submit.prevent="handleSubmit">
                <div v-if="step === 1">
                  <h2 class="heading text-[#0F3460] mb-6">Informações Pessoais</h2>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <User class="w-4 h-4 inline mr-2" />
                        Primeiro Nome
                      </label>
                      <input
                        v-model="formData.firstName"
                        type="text"
                        name="firstName"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                        placeholder="João"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Último Nome</label>
                      <input
                        v-model="formData.lastName"
                        type="text"
                        name="lastName"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                        placeholder="Silva"
                        required
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail class="w-4 h-4 inline mr-2" />
                        Email
                      </label>
                      <input
                        v-model="formData.email"
                        type="email"
                        name="email"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                        placeholder="joao@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone class="w-4 h-4 inline mr-2" />
                        Telefone
                      </label>
                      <input
                        v-model="formData.phone"
                        type="tel"
                        name="phone"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                        placeholder="(95) 98765-4321"
                        required
                      />
                    </div>
                  </div>

                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p class="text-sm text-blue-800">✓ Seus dados estão protegidos com criptografia SSL de 256 bits</p>
                  </div>

                  <Button type="submit" class="w-full bg-[#0F3460] text-white hover:bg-[#0D2A47] font-semibold py-3">
                    Continuar para Pagamento
                  </Button>
                </div>

                <div v-else>
                  <h2 class="heading text-[#0F3460] mb-6">Informações de Pagamento</h2>

                  <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      <CreditCard class="w-4 h-4 inline mr-2" />
                      Número do Cartão
                    </label>
                    <input
                      v-model="formData.cardNumber"
                      type="text"
                      name="cardNumber"
                      class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Nome no Cartão</label>
                    <input
                      v-model="formData.cardName"
                      type="text"
                      name="cardName"
                      class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                      placeholder="JOÃO SILVA"
                      required
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Validade (MM/AA)</label>
                      <input
                        v-model="formData.expiryDate"
                        type="text"
                        name="expiryDate"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                        placeholder="12/26"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                      <input
                        v-model="formData.cvv"
                        type="text"
                        name="cvv"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>

                  <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <Lock class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p class="text-sm text-green-800">
                      Pagamento seguro. Seus dados de cartão não são armazenados em nossos servidores.
                    </p>
                  </div>

                  <div class="flex gap-4">
                    <Button type="button" variant="outline" class="flex-1 py-3" @click="step = 1">Voltar</Button>
                    <Button type="submit" class="flex-1 bg-[#D4AF37] text-[#0F3460] hover:bg-white font-semibold py-3">
                      Confirmar Pedido
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div class="lg:col-span-1">
            <div class="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
              <h3 class="heading text-[#0F3460] mb-6">Resumo do Pedido</h3>

              <div class="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div class="flex justify-between">
                  <span class="text-gray-600">Experiência Premium - Pôr do Sol</span>
                  <span class="font-semibold text-[#0F3460]">2x</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">R$ 89,90 cada</span>
                  <span class="font-semibold text-[#0F3460]">R$ {{ eventTotal.toFixed(2) }}</span>
                </div>
              </div>

              <div class="space-y-3 mb-6">
                <div class="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {{ eventTotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Taxas (10%)</span>
                  <span>R$ {{ tax.toFixed(2) }}</span>
                </div>
              </div>

              <div class="border-t border-gray-200 pt-4">
                <div class="flex justify-between text-lg font-bold text-[#0F3460]">
                  <span>Total</span>
                  <span>R$ {{ total.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

