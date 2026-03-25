# 📊 Análise do Projeto Mirante Vue

## 🎯 Visão Geral do Projeto

Este é um **sistema de venda e reserva de ingressos** para o **Mirante Edileusa Lóz** em Boa Vista, Roraima. O projeto é uma aplicação web moderna construída com **Vue 3** e **Vite**.

### Tecnologias Utilizadas
- **Vue 3** (Composition API com `<script setup>`)
- **Vite** (Build tool)
- **Vue Router** (Roteamento)
- **PrimeVue** (Componentes UI)
- **Tailwind CSS** (Estilização)
- **Lucide Vue Next** (Ícones)

---

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de UI base (Button, Card, etc)
│   ├── Header.vue      # Cabeçalho do site
│   ├── Footer.vue      # Rodapé do site
│   ├── HeroSection.vue  # Seção hero da página inicial
│   ├── FeaturedEventsSection.vue  # Eventos em destaque
│   └── ...
├── pages/              # Páginas/rotas da aplicação
│   ├── Home.vue        # Página inicial
│   ├── SelectSector.vue    # Seleção de horários/setores
│   ├── PurchaseTicket.vue  # Compra de ingressos
│   ├── Checkout.vue        # Finalização de compra
│   ├── MyTickets.vue       # Visualização de ingressos
│   └── ...
├── router/             # Configuração de rotas
├── layouts/            # Layouts da aplicação
└── main.js             # Ponto de entrada
```

---

## 🎫 Funcionalidades Principais

### 1. **Página Inicial (Home)**
- Hero section com call-to-action
- Seção de eventos em destaque
- Categorias de eventos
- Informações sobre o Mirante

### 2. **Seleção de Setores/Horários (SelectSector)**
- Lista de horários disponíveis para visitação
- Indicação de horários esgotados/disponíveis
- Informações do evento (data, local, horário)
- Regras de visitação

### 3. **Compra de Ingressos (PurchaseTicket)**
- Seleção de quantidade (máximo 4 por pessoa)
- Formulário de dados pessoais:
  - Nome completo
  - Email
  - Telefone (com máscara)
  - CPF (com máscara e validação)
- Aceite de termos
- Resumo da reserva

### 4. **Checkout (Checkout)**
- Formulário de informações pessoais
- Formulário de pagamento (cartão de crédito)
- Resumo do pedido
- Cálculo de taxas

### 5. **Meus Ingressos (MyTickets)**
- Lista de ingressos comprados
- Código de confirmação
- QR Code para acesso
- Download de PDF
- Compartilhamento

---

## 🔌 Onde a API Será Necessária

### 📍 **Localização Recomendada para a API**

A estrutura de API deve ser criada em:
```
src/
├── api/                    # ← NOVA PASTA PARA API
│   ├── index.js           # Configuração base do cliente HTTP
│   ├── endpoints.js       # Definição de endpoints
│   ├── services/          # Serviços específicos
│   │   ├── events.js      # API de eventos
│   │   ├── tickets.js     # API de ingressos
│   │   ├── sectors.js     # API de setores/horários
│   │   ├── checkout.js    # API de checkout
│   │   └── users.js       # API de usuários/ingressos
│   └── interceptors.js    # Interceptores (auth, errors)
```

---

## 🎯 Endpoints de API Necessários

### 1. **Eventos**
```
GET    /api/events              # Listar todos os eventos
GET    /api/events/:id          # Detalhes de um evento
GET    /api/events/featured     # Eventos em destaque
```

### 2. **Setores/Horários**
```
GET    /api/sectors             # Listar setores/horários disponíveis
GET    /api/sectors/:id         # Detalhes de um setor
GET    /api/sectors/:id/availability  # Verificar disponibilidade
```

### 3. **Ingressos/Reservas**
```
POST   /api/tickets             # Criar reserva/ingresso
GET    /api/tickets             # Listar ingressos do usuário
GET    /api/tickets/:id         # Detalhes de um ingresso
GET    /api/tickets/:id/qrcode  # Gerar QR Code
POST   /api/tickets/:id/cancel  # Cancelar ingresso
```

### 4. **Checkout/Pagamento**
```
POST   /api/checkout            # Processar checkout
POST   /api/payment             # Processar pagamento
GET    /api/payment/:id/status  # Status do pagamento
```

### 5. **Validações**
```
POST   /api/validate/cpf        # Validar CPF
POST   /api/validate/email      # Validar email
GET    /api/availability        # Verificar disponibilidade geral
```

---

## 📝 Dados que Precisam Vir da API

### **Atualmente Hardcoded (precisam vir da API):**

1. **Eventos** (`FeaturedEventsSection.vue`, `SelectSector.vue`)
   - Lista de eventos
   - Imagens, títulos, datas, horários
   - Preços, capacidade, disponibilidade

2. **Setores/Horários** (`SelectSector.vue`)
   - Lista de horários disponíveis
   - Status (disponível/esgotado)
   - Informações do evento

3. **Ingressos** (`MyTickets.vue`)
   - Lista de ingressos do usuário
   - Códigos de confirmação
   - QR Codes
   - Status dos ingressos

4. **Dados do Evento** (várias páginas)
   - Data, horário, local
   - Endereço completo
   - Regras de visitação

---

## 🛠️ Implementação Sugerida

### 1. **Cliente HTTP (axios ou fetch)**

**Opção A: Usando Axios** (recomendado)
```bash
npm install axios
```

**Opção B: Usando Fetch nativo** (já disponível)

### 2. **Estrutura de Serviços**

Cada serviço deve ter métodos para:
- Listar recursos
- Buscar por ID
- Criar/Atualizar/Deletar
- Tratamento de erros
- Loading states

### 3. **Gerenciamento de Estado**

Considerar usar:
- **Pinia** (recomendado para Vue 3)
- Ou **Composables** com `ref`/`reactive`

### 4. **Variáveis de Ambiente**

Criar `.env` para:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
```

---

## 🔄 Fluxo de Dados com API

### **Fluxo de Compra de Ingresso:**

1. **Home** → `GET /api/events/featured` → Exibe eventos
2. **SelectSector** → `GET /api/sectors?eventId=X` → Lista horários
3. **PurchaseTicket** → `POST /api/tickets` → Cria reserva
4. **Checkout** → `POST /api/checkout` → Processa pagamento
5. **MyTickets** → `GET /api/tickets` → Lista ingressos

---

## ⚠️ Pontos de Atenção

1. **Autenticação**: Atualmente não há sistema de autenticação. Será necessário implementar:
   - Login/Registro
   - Tokens JWT
   - Refresh tokens

2. **Validação de CPF**: Implementar validação real de CPF

3. **Limite de 4 ingressos por CPF**: Validar no backend

4. **Bloqueio por ausência**: Sistema de bloqueio de 30 dias

5. **QR Codes**: Gerar QR Codes únicos para cada ingresso

6. **Emails**: Envio de confirmação por email

---

## 📦 Próximos Passos

1. ✅ Criar estrutura de pastas `src/api/`
2. ✅ Configurar cliente HTTP (axios ou fetch)
3. ✅ Criar serviços para cada recurso
4. ✅ Substituir dados hardcoded por chamadas de API
5. ✅ Implementar tratamento de erros
6. ✅ Adicionar loading states
7. ✅ Configurar variáveis de ambiente
8. ✅ Implementar autenticação (se necessário)

---

## 🎨 Design System

O projeto usa uma paleta de cores consistente:
- **Primária**: `#0F3460` (Azul escuro)
- **Secundária**: `#D4AF37` (Dourado)
- **Sucesso**: `#2D6A4F` (Verde)
- **Background**: Branco e tons de cinza
