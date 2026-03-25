<script setup>
import { Info } from 'lucide-vue-next'
import Dialog from 'primevue/dialog'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'

defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
})

defineEmits(['update:visible'])
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    header="Informações Importantes"
    :style="{ width: '90vw', maxWidth: '800px' }"
    :pt="{
      root: { class: 'rounded-2xl' },
      header: { class: 'bg-gradient-to-r from-[#0F3460] to-[#2E8BC0] text-white rounded-t-2xl p-6' },
      headerTitle: { class: 'text-2xl font-bold text-white' },
      content: { class: 'p-0' },
    }"
  >
    <div class="p-6">
      <div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#0F3460] to-[#2E8BC0]">
          <Info class="w-6 h-6 text-white" />
        </div>
        <div>
          <p class="text-sm text-gray-600">Tudo que você precisa saber sobre sua visita</p>
        </div>
      </div>

      <Accordion :multiple="true" :activeIndex="[0]">
        <!-- Horários e Funcionamento -->
        <AccordionTab>
          <template #header>
            <div class="flex items-center gap-3">
              <i class="pi pi-clock text-[#0F3460]"></i>
              <span class="font-semibold text-[#0F3460]">Horários e Funcionamento</span>
            </div>
          </template>
          <div class="space-y-3 pt-4">
            <div class="flex items-start gap-3">
              <i class="pi pi-check-circle text-[#2E8BC0] mt-1"></i>
              <p class="text-gray-700"><strong>Funcionamos:</strong> De quarta a domingo</p>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-check-circle text-[#2E8BC0] mt-1"></i>
              <p class="text-gray-700"><strong>Horário:</strong> 15:00h às 21:00h</p>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-check-circle text-[#2E8BC0] mt-1"></i>
              <p class="text-gray-700"><strong>Ingressos:</strong> Gratuitos</p>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-check-circle text-[#2E8BC0] mt-1"></i>
              <p class="text-gray-700">
                <strong>Permanência:</strong> Cada entrada terá permanência de 20 minutos no observatório
              </p>
            </div>
          </div>
        </AccordionTab>

        <!-- Regras para Crianças -->
        <AccordionTab>
          <template #header>
            <div class="flex items-center gap-3">
              <i class="pi pi-users text-[#0F3460]"></i>
              <span class="font-semibold text-[#0F3460]">Regras para Crianças</span>
            </div>
          </template>
          <div class="space-y-3 pt-4">
            <div class="flex items-start gap-3">
              <i class="pi pi-info-circle text-[#D4AF37] mt-1"></i>
              <p class="text-gray-700">
                Crianças a partir de <strong>3 anos</strong> precisam emitir ingresso
              </p>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-info-circle text-[#D4AF37] mt-1"></i>
              <p class="text-gray-700">
                Crianças menores de <strong>12 anos</strong> precisam estar acompanhadas de responsável maior de
                <strong>18 anos</strong>
              </p>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-info-circle text-[#D4AF37] mt-1"></i>
              <p class="text-gray-700">
                Crianças a partir de 3 anos devem possuir ingresso próprio. Contudo, não é exigida a troca nominal caso
                estejam acompanhadas por um responsável
              </p>
            </div>
          </div>
        </AccordionTab>

        <!-- Ingressos e Reservas -->
        <AccordionTab>
          <template #header>
            <div class="flex items-center gap-3">
              <i class="pi pi-ticket text-[#0F3460]"></i>
              <span class="font-semibold text-[#0F3460]">Ingressos e Reservas</span>
            </div>
          </template>
          <div class="space-y-3 pt-4">
            <div class="flex items-start gap-3">
              <i class="pi pi-check-circle text-[#2E8BC0] mt-1"></i>
              <p class="text-gray-700">
                Os ingressos para o Mirante de Boa Vista são liberados <strong>semanalmente no período da tarde</strong>
              </p>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-check-circle text-[#2E8BC0] mt-1"></i>
              <p class="text-gray-700">
                Cada <strong>CPF pode emitir até 4 ingressos</strong> para o Mirante
              </p>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-check-circle text-[#2E8BC0] mt-1"></i>
              <p class="text-gray-700">
                Caso o titular da reserva esteja presente, o acesso dos convidados será permitido normalmente
              </p>
            </div>
            <div class="bg-blue-50 border-l-4 border-[#2E8BC0] p-4 rounded-r-lg mt-4">
              <p class="text-sm text-gray-700">
                <strong>⚠️ Importante:</strong> Em caso de ausência no horário reservado, o usuário ficará bloqueado
                por <strong>30 dias</strong> para realizar novas reservas.
              </p>
            </div>
          </div>
        </AccordionTab>

        <!-- Pontualidade e Atrasos -->
        <AccordionTab>
          <template #header>
            <div class="flex items-center gap-3">
              <i class="pi pi-exclamation-triangle text-[#0F3460]"></i>
              <span class="font-semibold text-[#0F3460]">Pontualidade e Atrasos</span>
            </div>
          </template>
          <div class="space-y-3 pt-4">
            <div class="flex items-start gap-3">
              <i class="pi pi-clock text-[#D4AF37] mt-1"></i>
              <p class="text-gray-700">
                Caso o visitante chegue <strong>atrasado</strong> à visitação, terá direito aos minutos restantes
                relativos a seu horário agendado
              </p>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-times-circle text-red-500 mt-1"></i>
              <p class="text-gray-700">
                Caso o visitante chegue <strong>fora do horário marcado</strong> será necessário emitir outro ingresso
              </p>
            </div>
          </div>
        </AccordionTab>

        <!-- Condições Climáticas -->
        <AccordionTab>
          <template #header>
            <div class="flex items-center gap-3">
              <i class="pi pi-cloud text-[#0F3460]"></i>
              <span class="font-semibold text-[#0F3460]">Condições Climáticas</span>
            </div>
          </template>
          <div class="space-y-3 pt-4">
            <div class="flex items-start gap-3">
              <i class="pi pi-info-circle text-[#2E8BC0] mt-1"></i>
              <p class="text-gray-700">
                Após a chuva (em dias de chuva rápida) é necessário aguardar <strong>30 minutos</strong> para liberação
                do Mirante à visitação, sendo assim, os agendados deste horário precisarão remarcar
              </p>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-exclamation-triangle text-orange-500 mt-1"></i>
              <p class="text-gray-700">
                Nos dias de <strong>chuva intensa</strong>, as visitações serão suspensas, sendo necessário emitir novo
                ingresso
              </p>
            </div>
          </div>
        </AccordionTab>

        <!-- Reserva de Grupos -->
        <AccordionTab>
          <template #header>
            <div class="flex items-center gap-3">
              <i class="pi pi-building text-[#0F3460]"></i>
              <span class="font-semibold text-[#0F3460]">Reserva de Grupos</span>
            </div>
          </template>
          <div class="space-y-3 pt-4">
            <p class="text-gray-700">
              Para agendamento de grupos escolares e turísticos, entre em contato pelo e-mail:
            </p>
            <div class="bg-gradient-to-r from-[#0F3460] to-[#2E8BC0] p-4 rounded-lg">
              <a
                href="mailto:presi.fetec@boavista.rr.gov.br"
                class="text-white font-semibold hover:underline flex items-center gap-2"
              >
                <i class="pi pi-envelope"></i>
                presi.fetec@boavista.rr.gov.br
              </a>
            </div>
          </div>
        </AccordionTab>

        <!-- Regras de Acesso -->
        <AccordionTab>
          <template #header>
            <div class="flex items-center gap-3">
              <i class="pi pi-shield text-[#0F3460]"></i>
              <span class="font-semibold text-[#0F3460]">Regras de Acesso</span>
            </div>
          </template>
          <div class="space-y-4 pt-4">
            <div>
              <h4 class="font-semibold text-[#0F3460] mb-3 flex items-center gap-2">
                <i class="pi pi-ban text-red-500"></i>
                Não é permitido:
              </h4>
              <ul class="space-y-2 ml-6">
                <li class="flex items-start gap-2 text-gray-700">
                  <i class="pi pi-times text-red-500 mt-1"></i>
                  <span>Comer ou beber no observatório</span>
                </li>
                <li class="flex items-start gap-2 text-gray-700">
                  <i class="pi pi-times text-red-500 mt-1"></i>
                  <span>Entrar e deixar crianças desacompanhadas</span>
                </li>
                <li class="flex items-start gap-2 text-gray-700">
                  <i class="pi pi-times text-red-500 mt-1"></i>
                  <span>Entrada com animais, exceto cães guia ou animais de apoio emocional</span>
                </li>
              </ul>
            </div>
            <div class="bg-gradient-to-r from-[#0F3460] to-[#2E8BC0] p-4 rounded-lg text-white">
              <p class="font-semibold mb-2">Programe sua visita com segurança e sem imprevistos.</p>
              <p class="text-sm text-gray-100">
                Importante: em caso de ausência no horário reservado, o usuário ficará bloqueado por 30 dias para
                realizar novas reservas.
              </p>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </div>
  </Dialog>
</template>
