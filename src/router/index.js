// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Rutas no autenticadas
import Login from '../views/auth/Login.vue'

const routes = [
  // 📌 Rutas públicas (sin autenticación)
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false },
  },

  // 📌 Rutas protegidas (requieren login)
  {
    path: '/productos',
    name: 'Productos',
    component: () => import('@/views/dashboard/Products.vue'),
    meta: {
      apiRoute: 'products',
      title: 'Productos',
      icon: 'pi-box'
    }
  },
  {
    path: '/pedidos',
    name: 'Pedidos',
    component: () => import('@/views/dashboard/Orders.vue'),
    meta: {
      apiRoute: 'orders',
      title: 'Pedidos',
      icon: 'pi-shopping-cart'
    }
  },
  {
    path: '/contactos',
    name: 'Contactos',
    component: () => import('@/views/dashboard/Contacts.vue'),
    meta: {
      apiRoute: 'contacts',
      title: 'Contactos',
      icon: 'pi-users'
    }
  },
  {
    path: '/movimientos',
    name: 'Movimientos de stock',
    component: () => import('@/views/dashboard/StockMovements.vue'),
    meta: {
      apiRoute: 'stock-movements',
      title: 'Movimientos de stock',
      icon: 'pi-sync'
    }
  },
 
  // 📌 Si la ruta no existe → redirige a Pedidos
  {
    path: '/:pathMatch(.*)*',
    redirect: '/pedidos'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Guard de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  document.title = to.meta.title 
    ? `${to.meta.title} - SyP app` 
    : 'SyP app';
  
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
