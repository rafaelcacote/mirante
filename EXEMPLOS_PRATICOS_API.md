# 💡 Exemplos Práticos: Como Usar a API no Site

Este documento mostra exemplos práticos de como usar a API em diferentes situações.

---

## 📋 Índice

1. [Carregar Lista de Eventos](#1-carregar-lista-de-eventos)
2. [Carregar Detalhes de um Evento](#2-carregar-detalhes-de-um-evento)
3. [Tratamento de Erros](#3-tratamento-de-erros)
4. [Estados de Loading](#4-estados-de-loading)
5. [Fallback para Dados Padrão](#5-fallback-para-dados-padrão)

---

## 1. Carregar Lista de Eventos

### Exemplo: `FeaturedEventsSection.vue`

```vue
<script setup>
import { ref, onMounted } from 'vue'
import apidogService from '@/api/services/apidog.js'

const events = ref([])
const loading = ref(true)
const error = ref(null)

// Carregar eventos quando o componente é montado
onMounted(() => {
  loadEvents()
})

const loadEvents = async () => {
  loading.value = true
  error.value = null
  
  try {
    // ✅ Chama a API - autenticação é automática!
    const apiEvents = await apidogService.getEventsByPDV()
    
    // Se a API retornar eventos, usar eles
    if (apiEvents && apiEvents.length > 0) {
      events.value = apiEvents
    } else {
      // Caso contrário, usar eventos padrão
      console.warn('API retornou nenhum evento, usando eventos padrão')
      events.value = defaultEvents
    }
  } catch (err) {
    console.error('Erro ao carregar eventos da API:', err)
    error.value = err.message
    // Em caso de erro, usar eventos padrão
    events.value = defaultEvents
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section>
    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-4 gap-6">
      <div v-for="i in 4" :key="i" class="bg-gray-200 animate-pulse rounded-2xl h-96"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600 mb-4">Erro ao carregar eventos: {{ error }}</p>
      <p class="text-gray-600 text-sm">Exibindo eventos padrão</p>
    </div>

    <!-- Events grid -->
    <div v-else class="grid grid-cols-4 gap-6">
      <EventCard v-for="event in events" :key="event.id" v-bind="event" />
    </div>
  </section>
</template>
```

### O que acontece por trás:

1. **Componente monta** → `onMounted()` é chamado
2. **Chama `loadEvents()`** → Define `loading = true`
3. **Chama `apidogService.getEventsByPDV()`**
   - Sistema verifica se tem token válido
   - Se não tem, gera automaticamente usando token UNIT
   - Faz requisição GET para `/eventos/{pdv_id}`
   - API retorna JSON com eventos
4. **Processa resposta:**
   - Normaliza formato (pode vir como array, objeto com `data`, etc.)
   - Mapeia cada evento para formato do componente
   - Resolve URLs de imagens
   - Formata datas e horários
5. **Atualiza componente:**
   - `events.value = apiEvents`
   - `loading.value = false`
   - Componente re-renderiza com novos dados

---

## 2. Carregar Detalhes de um Evento

### Exemplo: `EventDetails.vue`

```vue
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import apidogService from '@/api/services/apidog.js'

const route = useRoute()
const event = ref(null)
const loading = ref(true)
const error = ref(null)

async function loadEvent() {
  loading.value = true
  error.value = null
  try {
    // ✅ Busca detalhes do evento pelo ID
    // route.params.id vem da URL (ex: /eventos/123)
    event.value = await apidogService.getEventDetail(route.params.id)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadEvent)
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading">Carregando evento...</div>
    
    <!-- Error -->
    <div v-else-if="error">
      <p class="text-red-600">Erro ao carregar evento</p>
      <p>{{ error }}</p>
      <Button @click="loadEvent">Tentar novamente</Button>
    </div>
    
    <!-- Event details -->
    <div v-else-if="event">
      <h1>{{ event.title }}</h1>
      <img :src="event.image" :alt="event.title" />
      <p>Data: {{ event.date }}</p>
      <p>Horário: {{ event.time }}</p>
      <p>Local: {{ event.location }}</p>
      <p>Preço: R$ {{ event.price.toFixed(2) }}</p>
      <p>Vagas disponíveis: {{ event.available }} / {{ event.capacity }}</p>
    </div>
  </div>
</template>
```

### O que acontece por trás:

1. **Usuário navega para `/eventos/123`**
2. **Componente monta** → `onMounted()` chama `loadEvent()`
3. **Chama `apidogService.getEventDetail('123')`**
   - Sistema garante token válido (automático)
   - Faz requisição GET para `/eventos/{pdv_id}/123`
   - API retorna JSON com detalhes do evento
4. **Processa resposta:**
   - Mapeia dados para formato do componente
   - Resolve URL da imagem
   - Formata data e horário
   - Calcula badge se necessário
5. **Atualiza componente:**
   - `event.value = dadosFormatados`
   - Componente exibe informações do evento

---

## 3. Tratamento de Erros

### Estrutura Básica

```javascript
try {
  const data = await apidogService.getEventsByPDV()
  // Sucesso!
} catch (err) {
  // Erro aconteceu
  console.error('Erro:', err.message)
  
  // Tipos de erro possíveis:
  // - "VITE_BUYSYSTEM_UNIT_TOKEN não configurado"
  // - "VITE_PDV_ID não configurado"
  // - "Erro de rede/CORS ao conectar na API BuySystem"
  // - "Timeout: a requisição demorou mais de 30 segundos"
  // - Mensagens de erro da API (ex: "Evento não encontrado")
}
```

### Exemplo Completo com Tratamento

```vue
<script setup>
import { ref, onMounted } from 'vue'
import apidogService from '@/api/services/apidog.js'

const events = ref([])
const loading = ref(true)
const error = ref(null)
const errorType = ref(null) // 'network' | 'auth' | 'api' | 'unknown'

const loadEvents = async () => {
  loading.value = true
  error.value = null
  errorType.value = null
  
  try {
    const apiEvents = await apidogService.getEventsByPDV()
    events.value = apiEvents
  } catch (err) {
    const message = err.message || 'Erro desconhecido'
    error.value = message
    
    // Identifica tipo de erro
    if (message.includes('CORS') || message.includes('rede')) {
      errorType.value = 'network'
    } else if (message.includes('token') || message.includes('não configurado')) {
      errorType.value = 'auth'
    } else if (message.includes('Timeout')) {
      errorType.value = 'network'
    } else {
      errorType.value = 'api'
    }
    
    // Log para debug
    console.error('Erro ao carregar eventos:', {
      message,
      type: errorType.value,
      error: err
    })
  } finally {
    loading.value = false
  }
}

onMounted(loadEvents)
</script>

<template>
  <div>
    <!-- Erro de rede -->
    <div v-if="errorType === 'network'" class="bg-yellow-50 border border-yellow-200 rounded p-4">
      <p class="text-yellow-800">Problema de conexão. Verifique sua internet.</p>
      <Button @click="loadEvents">Tentar novamente</Button>
    </div>
    
    <!-- Erro de autenticação -->
    <div v-else-if="errorType === 'auth'" class="bg-red-50 border border-red-200 rounded p-4">
      <p class="text-red-800">Erro de configuração: {{ error }}</p>
      <p class="text-sm text-red-600">Verifique as variáveis de ambiente.</p>
    </div>
    
    <!-- Erro da API -->
    <div v-else-if="errorType === 'api'" class="bg-orange-50 border border-orange-200 rounded p-4">
      <p class="text-orange-800">Erro da API: {{ error }}</p>
      <Button @click="loadEvents">Tentar novamente</Button>
    </div>
    
    <!-- Sucesso -->
    <div v-else>
      <EventCard v-for="event in events" :key="event.id" v-bind="event" />
    </div>
  </div>
</template>
```

---

## 4. Estados de Loading

### Loading Simples

```vue
<script setup>
const loading = ref(true)

const loadData = async () => {
  loading.value = true
  try {
    const data = await apidogService.getEventsByPDV()
    events.value = data
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="loading">Carregando...</div>
  <div v-else>
    <!-- Conteúdo -->
  </div>
</template>
```

### Loading com Skeleton

```vue
<template>
  <!-- Skeleton enquanto carrega -->
  <div v-if="loading" class="grid grid-cols-4 gap-6">
    <div v-for="i in 4" :key="i" class="bg-gray-200 animate-pulse rounded-2xl h-96">
      <div class="h-48 bg-gray-300 rounded-t-2xl"></div>
      <div class="p-4 space-y-2">
        <div class="h-4 bg-gray-300 rounded w-3/4"></div>
        <div class="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  </div>
  
  <!-- Conteúdo real -->
  <div v-else class="grid grid-cols-4 gap-6">
    <EventCard v-for="event in events" :key="event.id" v-bind="event" />
  </div>
</template>
```

### Loading com Spinner

```vue
<template>
  <div v-if="loading" class="flex items-center justify-center py-16">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F3460]"></div>
  </div>
  <div v-else>
    <!-- Conteúdo -->
  </div>
</template>
```

---

## 5. Fallback para Dados Padrão

### Exemplo: Eventos Padrão

```vue
<script setup>
import { ref, onMounted } from 'vue'
import apidogService from '@/api/services/apidog.js'

const events = ref([])

// Eventos padrão caso a API falhe
const defaultEvents = [
  {
    id: 1,
    title: 'Evento Padrão 1',
    date: '01 de Janeiro',
    time: '10:00',
    location: 'Boa Vista, RR',
    capacity: 100,
    available: 50,
    price: 0,
    image: 'https://exemplo.com/imagem.jpg',
    badge: 'Gratuito',
  },
  // ... mais eventos
]

const loadEvents = async () => {
  try {
    const apiEvents = await apidogService.getEventsByPDV()
    
    // Se a API retornar eventos, usar eles
    if (apiEvents && apiEvents.length > 0) {
      events.value = apiEvents
    } else {
      // Caso contrário, usar eventos padrão
      console.warn('API retornou nenhum evento, usando eventos padrão')
      events.value = defaultEvents
    }
  } catch (err) {
    console.error('Erro ao carregar eventos:', err)
    // Em caso de erro, usar eventos padrão
    events.value = defaultEvents
  }
}

onMounted(loadEvents)
</script>
```

---

## 🔄 Recarregar Dados

### Botão de Atualizar

```vue
<script setup>
const loading = ref(false)

const refreshEvents = async () => {
  loading.value = true
  try {
    events.value = await apidogService.getEventsByPDV()
  } catch (err) {
    console.error('Erro ao atualizar:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button @click="refreshEvents" :disabled="loading">
    {{ loading ? 'Atualizando...' : 'Atualizar' }}
  </button>
</template>
```

### Recarregar Automaticamente

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

let intervalId = null

const loadEvents = async () => {
  // ... código de carregamento
}

onMounted(() => {
  loadEvents()
  
  // Recarrega a cada 5 minutos
  intervalId = setInterval(() => {
    loadEvents()
  }, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>
```

---

## 🎯 Padrão Recomendado

Use este padrão para todos os componentes que consomem API:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import apidogService from '@/api/services/apidog.js'

// 1. Estados
const data = ref(null)
const loading = ref(true)
const error = ref(null)

// 2. Função de carregamento
const loadData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const result = await apidogService.getEventsByPDV()
    data.value = result
  } catch (err) {
    error.value = err.message
    console.error('Erro:', err)
    // Opcional: usar dados padrão
    // data.value = defaultData
  } finally {
    loading.value = false
  }
}

// 3. Carregar ao montar
onMounted(loadData)
</script>

<template>
  <!-- Loading -->
  <div v-if="loading">Carregando...</div>
  
  <!-- Error -->
  <div v-else-if="error">
    <p>Erro: {{ error }}</p>
    <button @click="loadData">Tentar novamente</button>
  </div>
  
  <!-- Success -->
  <div v-else>
    <!-- Seu conteúdo aqui -->
  </div>
</template>
```

---

## 📝 Checklist de Boas Práticas

✅ **Sempre use try/catch** para tratar erros

✅ **Sempre defina estados de loading** para melhor UX

✅ **Sempre trate erros** e mostre mensagens amigáveis

✅ **Use fallback** quando apropriado (dados padrão)

✅ **Log erros** no console para debug

✅ **Desabilite botões** durante loading para evitar requisições duplicadas

✅ **Limpe intervalos/timers** no `onUnmounted`

✅ **Use computed** para valores derivados dos dados da API

---

## 🐛 Debug

### Ver o que está sendo retornado

```javascript
const loadEvents = async () => {
  try {
    const apiEvents = await apidogService.getEventsByPDV()
    console.log('Eventos recebidos:', apiEvents)
    console.log('Quantidade:', apiEvents.length)
    events.value = apiEvents
  } catch (err) {
    console.error('Erro completo:', err)
    console.error('Mensagem:', err.message)
    console.error('Stack:', err.stack)
  }
}
```

### Ver tokens no localStorage

```javascript
const tokenState = localStorage.getItem('buysystem_token_state')
console.log('Token state:', JSON.parse(tokenState))
```

### Forçar renovação de token

```javascript
import apidogService from '@/api/services/apidog.js'

// Força renovação manual
await apidogService.forceRefreshToken()
```

---

## 📚 Próximos Passos

Agora que você entende como usar a API:

1. ✅ Use `apidogService.getEventsByPDV()` para listar eventos
2. ✅ Use `apidogService.getEventDetail(id)` para detalhes
3. ✅ Implemente tratamento de erros adequado
4. ✅ Adicione estados de loading
5. ✅ Use fallback quando necessário

Para mais informações, veja `PASSO_A_PASSO_API.md`.
