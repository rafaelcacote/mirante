<script setup>
import { useRouter } from 'vue-router'
import { AlertCircle, Home } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'

const router = useRouter()

const handleGoHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
    <Card class="w-full max-w-lg mx-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardContent class="pt-8 pb-8 text-center">
        <div class="flex justify-center mb-6">
          <div class="relative">
            <div class="absolute inset-0 bg-red-100 rounded-full animate-pulse" />
            <AlertCircle class="relative h-16 w-16 text-red-500" />
          </div>
        </div>

        <h1 class="text-4xl font-bold text-slate-900 mb-2">404</h1>

        <h2 class="text-xl font-semibold text-slate-700 mb-4">Page Not Found</h2>

        <p class="text-slate-600 mb-8 leading-relaxed">
          Sorry, the page you are looking for doesn't exist.
          <br />
          It may have been moved or deleted.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            @click="handleGoHome"
          >
            <Home class="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

