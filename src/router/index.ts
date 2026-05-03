/**
 * router/index.ts
 *
 * Manual routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import Bus_stop from '@/pages/bus_stop_tb.vue'
import Bus from '@/pages/bus_tb.vue'
import Carrier from '@/pages/carrier_tb.vue'
import Customer from '@/pages/customer_tb.vue'
import Employee from '@/pages/employee_tb.vue'
import Index from '@/pages/index.vue'
import Role from '@/pages/role_tb.vue'
import Route_stop from '@/pages/route_stop_tb.vue'
import Route from '@/pages/route_tb.vue'
import Shift from '@/pages/shift_tb.vue'
import Ticket from '@/pages/ticket_tb.vue'
import Trip from '@/pages/trip_tb.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Index,
    },
    {
      path: '/ticket',
      component: Ticket,
    },
    {
      path: '/trip',
      component: Trip,
    },
    {
      path: '/shift',
      component: Shift,
    },
    {
      path: '/route',
      component: Route,
    },
    {
      path: '/routestop',
      component: Route_stop,
    },
    {
      path: '/role',
      component: Role,
    },
    {
      path: '/employee',
      component: Employee,
    },
    {
      path: '/customer',
      component: Customer,
    },
    {
      path: '/carrier',
      component: Carrier,
    },
    {
      path: '/bus',
      component: Bus,
    },
    {
      path: '/busstop',
      component: Bus_stop,
    },

  ],
})

export default router
