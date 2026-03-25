import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/pages/Home.vue'
import EventDetails from '@/pages/EventDetails.vue'
import Checkout from '@/pages/Checkout.vue'
import MyTickets from '@/pages/MyTickets.vue'
import SobreMirante from '@/pages/SobreMirante.vue'
import NotFound from '@/pages/NotFound.vue'
import SelectSector from '@/pages/SelectSector.vue'
import PurchaseTicket from '@/pages/PurchaseTicket.vue'
import CompraConfirmada from '@/pages/CompraConfirmada.vue'
import CheckIn from '@/pages/CheckIn.vue'
import OperadorLogin from '@/pages/OperadorLogin.vue'
import OperadorDashboard from '@/pages/OperadorDashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    // Público
    { path: '/', name: 'home', component: Home },
    { path: '/o-mirante', name: 'sobre-mirante', component: SobreMirante },
    { path: '/evento/:id', name: 'event-details', component: EventDetails },
    { path: '/evento/:id/setores', name: 'select-sector', component: SelectSector },
    { path: '/evento/:id/comprar/:sectorId', name: 'purchase-ticket', component: PurchaseTicket },
    { path: '/checkout', name: 'checkout', component: Checkout },
    { path: '/meus-ingressos', name: 'my-tickets', component: MyTickets },
    { path: '/compra-confirmada', name: 'compra-confirmada', component: CompraConfirmada },

    // Operadores
    { path: '/checkin', name: 'checkin', component: CheckIn },
    { path: '/operador/login', name: 'operador-login', component: OperadorLogin },
    { path: '/operador/dashboard', name: 'operador-dashboard', component: OperadorDashboard },

    // Fallback
    { path: '/404', name: 'not-found', component: NotFound },
    { path: '/:pathMatch(.*)*', redirect: '/404' },
  ],
})

export default router
