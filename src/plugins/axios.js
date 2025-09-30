// src/plugins/axios.js
import axios from 'axios'

// Configuración base de axios
axios.defaults.baseURL = 'http://127.0.0.1:8000/api'
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
    }
    return Promise.reject(error)
  }
)

export default axios