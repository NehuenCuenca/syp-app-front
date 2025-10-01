// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Rutas no autenticadas
import Login from '../views/auth/Login.vue'

// Layout o componentes para autenticados
import Orders from '../views/dashboard/Orders.vue'
import StockMovements from '../views/dashboard/StockMovements.vue'
import Products from '../views/dashboard/Products.vue'
import Contacts from '../views/dashboard/Contacts.vue'

const routes = [
  // 📌 Rutas públicas (sin autenticación)
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },

  // 📌 Rutas protegidas (requieren login)
  {
    path: '/',
    redirect: '/pedidos',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'pedidos',
        name: 'Pedidos',
        component: Orders
      },
      {
        path: 'movimientos',
        name: 'Movimientos de stock',
        component: StockMovements
      },
      {
        path: 'productos',
        name: 'Productos',
        component: Products
      },
      {
        path: 'contactos',
        name: 'Contactos',
        component: Contacts
      }
    ]
  },
 
  // 📌 Si la ruta no existe → redirige a Pedidos
  {
    path: '/:pathMatch(.*)*',
    redirect: '/pedidos'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Verificar si la ruta requiere autenticación
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  
  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (requiresAuth && !authStore.isLoggedIn) {
    next('/login')
  } 
  // Si el usuario está autenticado y trata de acceder al login
  else if (to.path === '/login' && authStore.isLoggedIn) {
    next('/pedidos')
  } 
  // En cualquier otro caso, permitir la navegación
  else {
    next()
  }
})

export default router
