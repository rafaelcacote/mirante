<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

defineProps({
  rootClass: {
    type: String,
    default: 'min-h-screen flex flex-col bg-white',
  },
})
</script>

<template>
  <div :class="rootClass">
    <Header />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
  </div>
</template>

