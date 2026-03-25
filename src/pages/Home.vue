<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import CategoriesSection from '@/components/CategoriesSection.vue'
import CollectionsSection from '@/components/CollectionsSection.vue'
import FeaturedEventsSection from '@/components/FeaturedEventsSection.vue'
import HeroSection from '@/components/HeroSection.vue'
import InfoSection from '@/components/InfoSection.vue'

import PButton from 'primevue/button'
</script>

<template>
  <DefaultLayout root-class="min-h-screen flex flex-col bg-white">
    <HeroSection />
    <CollectionsSection />
    <FeaturedEventsSection />
    <CategoriesSection />
    <InfoSection />
  </DefaultLayout>
</template>

