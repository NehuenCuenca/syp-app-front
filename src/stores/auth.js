// src/stores/auth.js
import { defineStore } from 'pinia'
import axios from 'axios'


export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    isLoggedIn: (state) => state.isAuthenticated
  },

  actions: {
    // Inicializar el estado desde localStorage al cargar la app
    initAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        this.isAuthenticated = true
        
        // Configurar el header de Authorization para todas las peticiones axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    },

    // Login del usuario
    async login(credentials) {
      try {
        axios.defaults.headers.common['Accept'] = `application/json`
        axios.defaults.headers.common['Content-Type'] = `application/json`
        
        const response = await axios.post('http://127.0.0.1:8000/api/login', credentials)
        
        // Suponiendo que el backend devuelve: { token, user: { id, name, email, ... } }
        const { token, user } = response.data.data
        
        // Guardar en el estado
        this.token = token
        this.user = user
        this.isAuthenticated = true
        
        // Guardar en localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Configurar axios para futuras peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        return { success: true }
      } catch (error) {
        // Manejar diferentes tipos de errores del backend
        let errorMessage = 'Error al iniciar sesión. Por favor, intente nuevamente.'
        
        if (error.response) {
          // El servidor respondió con un código de error
          if (error.response.status === 401) {
            errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.'
          } else if (error.response.status === 422) {
            // Errores de validación
            const errors = error.response.data.errors
            if (errors) {
              errorMessage = Object.values(errors).flat().join(', ')
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message
            }
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message
          }
        } else if (error.request) {
          // La petición se hizo pero no hubo respuesta
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.'
        }
        
        return { success: false, error: errorMessage }
      }
    },

    // Logout del usuario
    async logout() {
      try {
        axios.defaults.headers.common['Accept'] = `application/json`
        axios.defaults.headers.common['Content-Type'] = `application/json`
        
        const response = await axios.post('http://127.0.0.1:8000/api/logout')
        const { message } = response.data
        console.info(`${message}`)

        // Limpiar el estado
        this.user = null
        this.token = null
        this.isAuthenticated = false
        
        // Limpiar localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // Eliminar header de Authorization
        delete axios.defaults.headers.common['Authorization']
        return { success: true, message }
      } catch (error) {
        // Manejar errores si es necesario
        console.error('Ocurrio un error al intentar cerrar la sesión: ', error)
        return { success: false, message: 'Error al cerrar sesión. Por favor, intente nuevamente.'}
      }
    },

    // Verificar si el token sigue siendo válido (opcional)
    async checkAuth() {
      try {
        // Puedes hacer una petición a un endpoint para verificar el token
        await axios.get('http://127.0.0.1:8000/api/user')
        return true
      } catch (error) {
        // Si el token es inválido, hacer logout
        this.logout()
        return false
      }
    }
  }
})