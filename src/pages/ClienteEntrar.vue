<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Eye, EyeOff, Lock, LogIn, Mail, UserPlus } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import logoMirante from '@/assets/images/logo-colorido.png'
import { apidogService } from '@/api/services/apidog.js'

const router = useRouter()

const mode = ref('login')

const loginForm = reactive({
  login: '',
  senha: '',
})

const cadastroForm = reactive({
  nome: '',
  email: '',
  cpf: '',
  senha: '',
  senhaConfirmacao: '',
})

const showPasswordLogin = ref(false)
const showPasswordCadastro = ref(false)
const showPasswordCadastro2 = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

function onlyCpfDigits(v) {
  return String(v || '').replace(/\D/g, '').slice(0, 11)
}

function formatCpfDisplay(digits) {
  const d = onlyCpfDigits(digits)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function onCpfInput(e) {
  cadastroForm.cpf = onlyCpfDigits(e.target.value)
  e.target.value = formatCpfDisplay(cadastroForm.cpf)
}

function pickCustomerId(payload) {
  const p = payload?.data ?? payload
  return (
    p?.cliente_id ||
    p?.clienteId ||
    p?.id ||
    payload?.cliente_id ||
    payload?.clienteId ||
    payload?.id ||
    null
  )
}

function setMode(next) {
  mode.value = next
  errorMessage.value = ''
}

async function handleLogin() {
  const login = String(loginForm.login || '').trim()
  const senha = loginForm.senha
  if (!login || !senha) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    await apidogService.loginCliente(login, senha)
    await router.push('/meus-ingressos')
  } catch (err) {
    errorMessage.value = err?.message || 'Não foi possível entrar. Verifique login e senha.'
  } finally {
    isLoading.value = false
  }
}

async function handleCadastro() {
  errorMessage.value = ''

  const nome = String(cadastroForm.nome || '').trim()
  const email = String(cadastroForm.email || '').trim()
  const cpf = onlyCpfDigits(cadastroForm.cpf)
  const senha = cadastroForm.senha
  const senhaConfirmacao = cadastroForm.senhaConfirmacao

  if (!nome || !email || !cpf || !senha) {
    errorMessage.value = 'Preencha nome, e-mail, CPF e senha.'
    return
  }
  if (cpf.length !== 11) {
    errorMessage.value = 'Informe um CPF válido (11 dígitos).'
    return
  }
  if (senha.length < 6) {
    errorMessage.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }
  if (senha !== senhaConfirmacao) {
    errorMessage.value = 'A confirmação da senha não confere.'
    return
  }

  isLoading.value = true

  try {
    const created = await apidogService.cadastrarCliente({
      nome,
      email,
      cpf,
      senha,
    })

    const id = pickCustomerId(created)
    localStorage.setItem(
      'mirante_last_customer',
      JSON.stringify({
        email,
        cpf,
        ...(id != null && id !== '' ? { id } : {}),
      }),
    )

    try {
      await apidogService.loginCliente(email, senha)
    } catch {
      // Cadastro ok; login pode falhar se a API ainda não associar senha neste endpoint
    }

    await router.push('/meus-ingressos')
  } catch (err) {
    errorMessage.value = err?.message || 'Não foi possível concluir o cadastro agora.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50">
    <div
      class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F3460] to-[#2E8BC0] flex-col items-center justify-center px-12 relative overflow-hidden"
    >
      <div class="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-white/5" />
      <div class="absolute bottom-[-60px] right-[-60px] w-96 h-96 rounded-full bg-white/5" />
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/3"
      />

      <div class="relative z-10 text-center">
        <div class="bg-white rounded-2xl p-5 inline-block mb-8 shadow-xl">
          <img :src="logoMirante" alt="Mirante Edileusa Lóz" class="h-20 w-auto object-contain" />
        </div>
        <h2 class="text-3xl font-bold text-white mb-4">Área do visitante</h2>
        <p class="text-white/75 text-lg leading-relaxed max-w-sm">
          Entre com sua conta para acessar seus ingressos e acompanhar suas experiências no Mirante Edileusa Lóz.
        </p>
      </div>
    </div>

    <div class="flex-1 flex flex-col min-h-screen">
      <div class="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white">
        <div class="flex items-center gap-3 lg:hidden">
          <div class="bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm">
            <img :src="logoMirante" alt="Mirante" class="h-8 w-auto object-contain" />
          </div>
          <span class="font-bold text-[#0F3460] text-sm">Mirante Edileusa Lóz</span>
        </div>
        <div class="hidden lg:block" />

        <RouterLink
          to="/"
          class="flex items-center gap-2 text-sm font-semibold text-[#0F3460] bg-[#0F3460]/8 hover:bg-[#0F3460] hover:text-white px-4 py-2 rounded-lg transition-all duration-200 group"
        >
          <ArrowLeft class="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Voltar ao site
        </RouterLink>
      </div>

      <div class="flex-1 flex items-center justify-center px-6 py-10">
        <div class="w-full max-w-sm">
          <div class="flex rounded-xl bg-gray-100 p-1 mb-8">
            <button
              type="button"
              class="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors"
              :class="
                mode === 'login' ? 'bg-white text-[#0F3460] shadow-sm' : 'text-gray-600 hover:text-[#0F3460]'
              "
              @click="setMode('login')"
            >
              Entrar
            </button>
            <button
              type="button"
              class="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors"
              :class="
                mode === 'cadastro'
                  ? 'bg-white text-[#0F3460] shadow-sm'
                  : 'text-gray-600 hover:text-[#0F3460]'
              "
              @click="setMode('cadastro')"
            >
              Cadastrar
            </button>
          </div>

          <div class="mb-6">
            <div
              class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0F3460]/10 mb-4"
            >
              <Lock v-if="mode === 'login'" class="w-6 h-6 text-[#0F3460]" />
              <UserPlus v-else class="w-6 h-6 text-[#0F3460]" />
            </div>
            <h1 class="text-2xl font-bold text-[#0F3460] mb-1">
              {{ mode === 'login' ? 'Entrar' : 'Criar conta' }}
            </h1>
            <p class="text-gray-500 text-sm">
              {{
                mode === 'login'
                  ? 'Use o login cadastrado (e-mail ou CPF) e sua senha'
                  : 'Preencha os dados para criar seu acesso'
              }}
            </p>
          </div>

          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-red-600 text-sm"
          >
            {{ errorMessage }}
          </div>
          <form v-if="mode === 'login'" class="space-y-5" @submit.prevent="handleLogin">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <Mail class="w-4 h-4 inline mr-1.5" />
                Login (e-mail ou CPF)
              </label>
              <input
                v-model="loginForm.login"
                type="text"
                autocomplete="username"
                placeholder="email@teste.com"
                required
                class="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F3460] focus:border-transparent transition"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <Lock class="w-4 h-4 inline mr-1.5" />
                Senha
              </label>
              <div class="relative">
                <input
                  v-model="loginForm.senha"
                  :type="showPasswordLogin ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  required
                  class="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F3460] focus:border-transparent transition"
                />
                <button
                  type="button"
                  class="absolute right-3 top-3.5 text-gray-400 hover:text-[#0F3460] transition-colors"
                  @click="showPasswordLogin = !showPasswordLogin"
                >
                  <EyeOff v-if="showPasswordLogin" class="w-5 h-5" />
                  <Eye v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <Button
              type="submit"
              :disabled="!loginForm.login || !loginForm.senha || isLoading"
              class="w-full bg-[#0F3460] text-white hover:bg-[#0D2A47] font-semibold py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <LogIn v-else class="w-5 h-5" />
              {{ isLoading ? 'Entrando...' : 'Entrar' }}
            </Button>
          </form>

          <form v-else class="space-y-4" @submit.prevent="handleCadastro">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Nome completo</label>
              <input
                v-model="cadastroForm.nome"
                type="text"
                autocomplete="name"
                required
                class="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F3460] focus:border-transparent transition"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <Mail class="w-4 h-4 inline mr-1.5" />
                E-mail
              </label>
              <input
                v-model="cadastroForm.email"
                type="email"
                autocomplete="email"
                required
                class="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F3460] focus:border-transparent transition"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">CPF</label>
              <input
                :value="formatCpfDisplay(cadastroForm.cpf)"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                placeholder="000.000.000-00"
                required
                maxlength="14"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F3460] focus:border-transparent transition"
                @input="onCpfInput"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
              <div class="relative">
                <input
                  v-model="cadastroForm.senha"
                  :type="showPasswordCadastro ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  minlength="6"
                  class="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F3460] focus:border-transparent transition"
                />
                <button
                  type="button"
                  class="absolute right-3 top-3.5 text-gray-400 hover:text-[#0F3460] transition-colors"
                  @click="showPasswordCadastro = !showPasswordCadastro"
                >
                  <EyeOff v-if="showPasswordCadastro" class="w-5 h-5" />
                  <Eye v-else class="w-5 h-5" />
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Confirmar senha</label>
              <div class="relative">
                <input
                  v-model="cadastroForm.senhaConfirmacao"
                  :type="showPasswordCadastro2 ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  minlength="6"
                  class="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F3460] focus:border-transparent transition"
                />
                <button
                  type="button"
                  class="absolute right-3 top-3.5 text-gray-400 hover:text-[#0F3460] transition-colors"
                  @click="showPasswordCadastro2 = !showPasswordCadastro2"
                >
                  <EyeOff v-if="showPasswordCadastro2" class="w-5 h-5" />
                  <Eye v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <Button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-[#0F3460] text-white hover:bg-[#0D2A47] font-semibold py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <UserPlus v-else class="w-5 h-5" />
              {{ isLoading ? 'Cadastrando...' : 'Cadastrar' }}
            </Button>
          </form>

          <p class="text-xs text-gray-400 text-center mt-6">
            Problemas com o acesso? Verifique se você já possui cadastro e use a aba Entrar.
          </p>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-100 text-center">
        <p class="text-xs text-gray-400">&copy; 2026 Mirante Ingressos. Todos os direitos reservados.</p>
      </div>
    </div>
  </div>
</template>
