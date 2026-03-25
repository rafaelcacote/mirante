<script setup>
import { ref } from 'vue'
import {
  Music,
  PartyPopper,
  Theater,
  Mic,
  Gift,
  MapPin,
  Baby,
  Dumbbell,
  Presentation,
  ChevronRight,
} from 'lucide-vue-next'

const categories = [
  { id: 1, name: 'Festas e Shows', icon: Music },
  { id: 2, name: 'Carnaval', icon: PartyPopper },
  { id: 3, name: 'Teatros e Espetáculos', icon: Theater },
  { id: 4, name: 'Stand Up Comedy', icon: Mic },
  { id: 5, name: 'Descontos exclusivos', icon: Gift },
  { id: 6, name: 'Passeios e Tours', icon: MapPin },
  { id: 7, name: 'Infantil', icon: Baby },
  { id: 8, name: 'Esportes', icon: Dumbbell },
  { id: 9, name: 'Congressos e Palestras', icon: Presentation },
]

const scrollContainer = ref(null)

const scrollRight = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({
      left: 300,
      behavior: 'smooth',
    })
  }
}

// Ative/desative a exibição desta seção sem remover o código.
const showCollections = false
</script>


<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
