<script setup>
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-vue-next'
</script>

<template>
  <footer class="bg-gradient-to-r from-[#0F3460] to-[#0D2A47] text-white">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 class="font-bold text-lg mb-4">Mirante Ingressos</h3>
          <p class="text-gray-300 text-sm mb-4">
            Plataforma oficial de venda de ingressos para o Mirante Edileusa Lóz em Boa Vista.
          </p>
          <div class="flex gap-3">
            <a href="#" class="hover:text-[#D4AF37] transition-colors">
              <Facebook class="w-5 h-5" />
            </a>
            <a href="#" class="hover:text-[#D4AF37] transition-colors">
              <Instagram class="w-5 h-5" />
            </a>
            <a href="#" class="hover:text-[#D4AF37] transition-colors">
              <Twitter class="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 class="font-semibold mb-4">Links Rápidos</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <RouterLink to="/" class="text-gray-300 hover:text-[#D4AF37] transition-colors">Início</RouterLink>
            </li>
            <li><a href="#" class="text-gray-300 hover:text-[#D4AF37] transition-colors">Eventos</a></li>
            <li><a href="#" class="text-gray-300 hover:text-[#D4AF37] transition-colors">Sobre</a></li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold mb-4">Informações</h4>
          <ul class="space-y-3 text-sm">
            <li class="flex gap-2">
              <Phone class="w-4 h-4 flex-shrink-0 text-[#D4AF37]" />
              <span class="text-gray-300">(95) 3623-1234</span>
            </li>
            <li class="flex gap-2">
              <Mail class="w-4 h-4 flex-shrink-0 text-[#D4AF37]" />
              <span class="text-gray-300">info@miranteingressos.com</span>
            </li>
            <li class="flex gap-2">
              <MapPin class="w-4 h-4 flex-shrink-0 text-[#D4AF37]" />
              <span class="text-gray-300">Boa Vista, RR</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold mb-4">Horário de Funcionamento</h4>
          <ul class="space-y-2 text-sm text-gray-300">
            <li><span class="font-semibold">Quarta a Domingo</span></li>
            <li>15:00 - 21:00</li>
            <li class="pt-2 border-t border-gray-600 mt-2">
              <span class="text-[#D4AF37]">Ingressos Gratuitos</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-600 pt-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <p>&copy; 2026 Mirante Ingressos. Todos os direitos reservados.</p>
          </div>
          <div class="flex gap-4 md:justify-end">
            <a href="#" class="hover:text-[#D4AF37] transition-colors">Política de Privacidade</a>
            <a href="#" class="hover:text-[#D4AF37] transition-colors">Termos de Uso</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

