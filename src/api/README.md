# 📡 Estrutura de API

Esta pasta contém toda a estrutura para comunicação com a API backend.

## 📁 Estrutura de Arquivos

```
api/
├── index.js              # Cliente HTTP base (configuração)
├── endpoints.js          # Definição de todos os endpoints
├── services/            # Serviços específicos por recurso
│   ├── events.js        # API de eventos
│   ├── sectors.js       # API de setores/horários
│   ├── tickets.js       # API de ingressos
│   ├── checkout.js      # API de checkout
│   ├── validation.js    # API de validações
│   └── apidog.js        # API externa Apidog (eventos por PDV)
└── README.md            # Este arquivo
```

## 🚀 Como Usar

### 1. Importar o serviço necessário

```javascript
import { eventsService } from '@/api/services/events'
import { ticketsService } from '@/api/services/tickets'
```

### 2. Usar nos componentes Vue

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { eventsService } from '@/api/services/events'

const events = ref([])
const loading = ref(false)
const error = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    events.value = await eventsService.getFeatured()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
VITE_APIDOG_PASSWORD=sua-senha-aqui
```

**⚠️ IMPORTANTE:** Nunca commite o arquivo `.env` no repositório. Use `.env.example` como template.

### Exemplo de Uso Completo

```javascript
// Em um componente Vue
import { ticketsService } from '@/api/services/tickets'

// Criar ingresso
const createTicket = async () => {
  try {
    const ticketData = {
      sectorId: 1,
      quantity: 2,
      customer: {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        phone: '(95) 98765-4321',
        cpf: '123.456.789-00',
      },
    }
    
    const ticket = await ticketsService.create(ticketData)
    console.log('Ingresso criado:', ticket)
  } catch (error) {
    console.error('Erro ao criar ingresso:', error)
  }
}
```

## 🔐 Autenticação

O cliente HTTP automaticamente adiciona o token de autenticação se estiver disponível no `localStorage` com a chave `auth_token`.

Para definir o token:
```javascript
import apiClient from '@/api'
apiClient.setAuthToken('seu-token-aqui')
```

## 🔌 Integração com API Externa (Apidog)

O projeto inclui integração com a API externa do Apidog para buscar eventos por PDV.

### Configuração

1. Configure a senha da API no arquivo `.env`:
```env
VITE_APIDOG_PASSWORD=nIrp4w0S
```

2. Use o serviço `apidogService` nos componentes:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import apidogService from '@/api/services/apidog.js'

const events = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    // Buscar eventos por PDV (opcional)
    events.value = await apidogService.getEventsByPDV()
    // Ou sem parâmetro para buscar todos
    // events.value = await apidogService.getEventsByPDV()
  } catch (error) {
    console.error('Erro ao carregar eventos:', error)
  } finally {
    loading.value = false
  }
})
</script>
```

### Mapeamento de Dados

O serviço `apidog.js` automaticamente mapeia os dados da API para o formato esperado pelos componentes. O mapeamento suporta diferentes estruturas de resposta da API:

- Array direto: `[{...}, {...}]`
- Objeto com `data`: `{ data: [{...}, {...}] }`
- Objeto com `eventos`: `{ eventos: [{...}, {...}] }`
- Objeto com `results`: `{ results: [{...}, {...}] }`

### Campos Mapeados

O serviço tenta mapear os seguintes campos da API para o formato do componente:

- `id` / `evento_id` / `codigo` → `id`
- `titulo` / `nome` / `title` → `title`
- `data` / `data_evento` / `date` → `date` (formatado em pt-BR)
- `hora` / `horario` / `time` → `time`
- `local` / `localizacao` / `location` → `location`
- `capacidade` / `total_vagas` / `capacity` → `capacity`
- `disponivel` / `vagas_disponiveis` / `available` → `available`
- `preco` / `valor` / `price` → `price`
- `imagem` / `imagem_url` / `image` → `image`

## 📝 Próximos Passos

1. ✅ Integração com API externa Apidog concluída
2. Substituir dados hardcoded nas páginas por chamadas de API
3. Adicionar tratamento de erros global
4. Implementar loading states
5. Adicionar cache se necessário
6. Implementar refresh token automático
7. Ajustar mapeamento de dados conforme estrutura real da API Apidog
