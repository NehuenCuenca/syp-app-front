import { createRouter, createWebHistory } from 'vue-router'

// Rutas no autenticadas
import Login from '../views/auth/Login.vue'
import PasswordRecovery from '../views/auth/PasswordRecovery.vue'
import ResetPassword from '../views/auth/ResetPassword.vue'

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
    meta: { requiresAuth: false }
  },
  /* {
    path: '/recuperar-contraseña',
    name: 'PasswordRecovery',
    component: PasswordRecovery,
    meta: { requiresAuth: false }
  }, */

  /* {
    path: '/resetear-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: { requiresAuth: false },
    props: route => ({
      token: route.query.token,
      email: route.query.email
    }),
    beforeEnter: (to, from, next) => {
      if (!to.query.token) {
        // Redirigir al login si no hay token
        return next({ name: 'Login' })
      }
      next()
    }
  }, */

  // 📌 Rutas protegidas (requieren login)
  {
    path: '/',
    redirect: '/pedidos',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'pedidos',
        name: 'Orders',
        component: Orders
      },
      {
        path: 'movimientos',
        name: 'StockMovements',
        component: StockMovements
      },
      {
        path: 'productos',
        name: 'Products',
        component: Products
      },
      {
        path: 'contactos',
        name: 'Contacts',
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

// Middleware simple para proteger rutas
router.beforeEach((to, from, next) => {
  const isAuthenticated = false // ⚡ Cambiar por tu lógica real (ej. token en localStorage)
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
