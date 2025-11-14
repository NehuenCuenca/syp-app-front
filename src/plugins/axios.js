// src/plugins/axios.js
import axios from 'axios'

const backendUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8000'

// Configuración base de axios
axios.defaults.baseURL = `${backendUrl}/api`
axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.defaults.headers.common['Accept'] = 'application/json'

// Interceptor para manejar errores globalmente
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado o inválido
      // Puedes hacer logout automático aquí si lo deseas
      console.error('No autorizado. Redirigiendo al login...')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

export default axios