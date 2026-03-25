<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
  },
  type: {
    type: String,
    default: undefined,
  },
})

const classes = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F3460] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

  const variants = {
    default: 'bg-[#D4AF37] text-[#0F3460] hover:bg-white',
    outline: 'border border-gray-300 bg-transparent text-[#0F3460] hover:bg-gray-50',
  }

  return [base, variants[props.variant] || variants.default]
})
</script>

<template>
  <button :type="type" :class="classes">
    <slot />
  </button>
</template>

