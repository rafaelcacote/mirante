<script setup>
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-vue-next'
import Carousel from 'primevue/carousel'

import { apiUrl } from '@/api/config'
import ENDPOINTS from '@/api/endpoints'

const NOTICIAS_URL = apiUrl(ENDPOINTS.BOAVISTA.NOTICIAS)

/** Ordem: maior breakpoint primeiro — o último que casar com a largura vence (comportamento do PrimeVue). */
const carouselResponsiveOptions = [
  { breakpoint: '1023px', numVisible: 2, numScroll: 1 },
  { breakpoint: '767px', numVisible: 1, numScroll: 1 },
]

const noticias = ref([])
const loading = ref(true)
const error = ref(null)

const formatDate = (iso) => {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

const loadNoticias = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(NOTICIAS_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const data = Array.isArray(json?.data) ? json.data : []
    noticias.value = data
  } catch (e) {
    console.error('Erro ao carregar notícias:', e)
    error.value = e?.message || 'Falha ao carregar'
    noticias.value = []
  } finally {
    loading.value = false
  }
}

const carouselCircular = computed(() => noticias.value.length > 1)
const carouselAutoplayMs = computed(() => (noticias.value.length > 1 ? 5500 : 0))

onMounted(() => {
  loadNoticias()
})
</script>

<template>
  <section class="py-16 md:py-24 bg-white">
    <div class="container mx-auto px-4">
      <div class="mb-12 text-center sm:text-left">
        <h2 class="heading text-[#0F3460] mb-2">Notícias de Boa Vista</h2>
        <p class="text-gray-600 text-lg max-w-2xl sm:mx-0 mx-auto">
          Fique por dentro das últimas informações da Prefeitura de Boa Vista
        </p>
      </div>

      <div v-if="loading" class="flex gap-6 overflow-hidden">
        <div
          v-for="i in 4"
          :key="i"
          class="rounded-2xl overflow-hidden border border-gray-100 shadow-sm shrink-0 w-full min-[768px]:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
        >
          <div class="bg-gray-200 animate-pulse aspect-[16/10]" />
          <div class="p-5 space-y-3">
            <div class="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
            <div class="h-4 bg-gray-200 rounded animate-pulse" />
            <div class="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
          </div>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-12 rounded-2xl bg-[#F5F5F5]">
        <p class="text-red-600 mb-2">Não foi possível carregar as notícias.</p>
        <p class="text-gray-600 text-sm mb-4">{{ error }}</p>
        <button
          type="button"
          class="text-[#0F3460] font-medium underline hover:text-[#2E8BC0]"
          @click="loadNoticias"
        >
          Tentar novamente
        </button>
      </div>

      <div v-else-if="noticias.length === 0" class="text-center py-12 text-gray-600">
        Nenhuma notícia disponível no momento.
      </div>

      <Carousel
        v-else
        :value="noticias"
        :num-visible="4"
        :num-scroll="1"
        :responsive-options="carouselResponsiveOptions"
        :circular="carouselCircular"
        :autoplay-interval="carouselAutoplayMs"
        :show-navigators="true"
        :show-indicators="true"
        content-class="news-carousel__content items-stretch gap-4 md:gap-6"
        container-class="news-carousel"
        class="news-carousel-root"
      >
        <template #previcon>
          <ChevronLeft class="w-5 h-5 text-[#0F3460]" />
        </template>
        <template #nexticon>
          <ChevronRight class="w-5 h-5 text-[#0F3460]" />
        </template>
        <template #item="{ data: item }">
          <article
            class="group flex flex-col h-full rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-md hover:shadow-xl transition-shadow duration-300 mx-1"
          >
            <a
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block aspect-[16/10] overflow-hidden bg-gray-100 shrink-0"
            >
              <img
                :src="item.thumb || item.imagem"
                :alt="item.titulo"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </a>
            <div class="p-5 flex flex-col flex-1 min-h-0">
              <div class="flex items-center justify-between gap-2 mb-2">
                <span
                  v-if="item.categoria?.nome"
                  class="text-xs font-semibold uppercase tracking-wide text-[#2E8BC0] truncate"
                >
                  {{ item.categoria.nome }}
                </span>
                <time
                  v-if="formatDate(item.data_publicacao)"
                  class="text-xs text-gray-500 whitespace-nowrap shrink-0"
                  :datetime="item.data_publicacao"
                >
                  {{ formatDate(item.data_publicacao) }}
                </time>
              </div>
              <h3 class="font-semibold text-[#0F3460] text-base leading-snug mb-2 line-clamp-2">
                <a
                  :href="item.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:text-[#2E8BC0] transition-colors"
                >
                  {{ item.titulo }}
                </a>
              </h3>
              <p
                v-if="item.resumo"
                class="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1 mb-4 min-h-0"
              >
                {{ item.resumo }}
              </p>
              <a
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-sm font-medium text-[#0F3460] hover:text-[#D4AF37] transition-colors mt-auto"
              >
                Ler na prefeitura
                <ExternalLink class="w-4 h-4 opacity-70 shrink-0" />
              </a>
            </div>
          </article>
        </template>
      </Carousel>
    </div>
  </section>
</template>

<style scoped>
.news-carousel-root :deep(.p-carousel-content-container) {
  overflow: visible;
}

.news-carousel-root :deep(.p-carousel-item-list) {
  align-items: stretch;
}

.news-carousel-root :deep(.p-carousel-item) {
  display: flex;
  flex: 1 0 auto;
}

.news-carousel-root :deep(.p-carousel-indicator-list) {
  margin-top: 1.25rem;
}

.news-carousel-root :deep(.p-carousel-indicator-button) {
  background-color: rgb(209 213 219);
}

.news-carousel-root :deep(.p-carousel-indicator-active .p-carousel-indicator-button) {
  background-color: #0f3460;
}
</style>
