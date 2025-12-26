// composables/useCrudApi.js
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

/**
 * Composable genérico para operaciones CRUD
 * Utiliza route.meta.apiRoute para construir las URLs de API
 * 
 * @returns {Object} Objeto con estados reactivos y métodos CRUD
 */
export function useCrudApi() {
  const route = useRoute();
  const router = useRouter();

  // Estados reactivos
  const data = ref(null);
  const filters = ref(null);
  const pagination = ref(null);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Obtiene la ruta base de la API desde route.meta
   * @returns {string} Ruta base de la API
   */
  const getApiRoute = () => {
    if (!route.meta?.apiRoute) {
      throw new Error('route.meta.apiRoute no está definido');
    }
    return route.meta.apiRoute;
  };

  // Actualizar query params en la URL
  const updateQueryParams = (params) => {
    let query = { ...params };
    
    Object.keys(query).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete query[key];
      } else {
        query[key] = params[key];
      }
    });
    
    router.push({ query });
  };

  /**
   * Maneja errores de las respuestas del backend
   * @param {Error} err - Error capturado
   */
  const handleError = (err) => {
    if (err.response?.data) {
      const { message, errors } = err.response.data;
      
      // Construir mensaje de error detallado
      let errorMessage = message || 'Error desconocido';
      
      if (errors && typeof errors === 'object') {
        const errorDetails = Object.entries(errors)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        
        if (errorDetails) {
          errorMessage += ` (${errorDetails})`;
        }
      }
      
      error.value = errorMessage;
    } else if (err.message) {
      error.value = err.message;
    } else {
      error.value = 'Error de conexión con el servidor';
    }
    
    console.error('Error en useCrudApi:', err);
  };

  /**
   * Resetea el estado de error
   */
  const clearError = () => {
    error.value = null;
  };

  /**
   * Obtiene los filtros disponibles
   * GET /${apiRoute}/filters
   * 
   * @returns {Promise<Object|null>} Filtros disponibles o null en caso de error
   */
  const fetchFilters = async () => {
    loading.value = true;
    clearError();
    
    try {
      const apiRoute = getApiRoute();
      const response = await axios.get(`/${apiRoute}/filters`);
      
      if (response.data.success) {
        filters.value = response.data.data;
        return response.data.data;
      } else {
        error.value = response.data.message || 'Error al obtener filtros';
        return null;
      }
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtiene datos filtrados con paginación
   * GET /${apiRoute}/filtered
   * 
   * @param {Object} queryParams - Parámetros de consulta (filtros, paginación)
   * @returns {Promise<Object|null>} Datos filtrados o null en caso de error
   */
  const fetchData = async (queryParams = null) => {
    loading.value = true;
    clearError();
    
    try {
      const apiRoute = getApiRoute();
      
      // Usar queryParams proporcionados o los del route.query
      const params = queryParams;
      
      const response = await axios.get(`/${apiRoute}`, { params });
      
      if (response.data.success) {
        data.value = response.data.data;
        
        // Extraer metadatos de paginación si existen
        if (response.data.meta?.pagination) {
          pagination.value = response.data.meta.pagination;
        }

        updateQueryParams(params);
        
        return {
          data: response.data.data,
          meta: response.data.meta
        };
      } else {
        error.value = response.data.message || 'Error al obtener datos';
        return null;
      }
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtiene un registro por ID
   * GET /${apiRoute}/:id
   * 
   * @param {number|string} id - ID del registro
   * @returns {Promise<Object|null>} Registro o null en caso de error
   */
  const fetchById = async (id) => {
    loading.value = true;
    clearError();
    
    try {
      const apiRoute = getApiRoute();
      const response = await axios.get(`/${apiRoute}/${id}`);
      
      if (response.data.success) {
        data.value = response.data.data;
        return response.data.data;
      } else {
        error.value = response.data.message || 'Error al obtener el registro';
        return null;
      }
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtiene datos iniciales para el formulario de creación
   * GET /${apiRoute}/create
   * 
   * @returns {Promise<Object|null>} Datos iniciales o null en caso de error
   */
  const fetchCreate = async () => {
    loading.value = true;
    clearError();
    
    try {
      const apiRoute = getApiRoute();
      const response = await axios.get(`/${apiRoute}/create`);
      
      if (response.data.success) {
        data.value = response.data.data;
        return response.data.data;
      } else {
        error.value = response.data.message || 'Error al obtener datos de creación';
        return null;
      }
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtiene datos iniciales para el formulario de edición
   * GET /${apiRoute}/:id/edit
   * 
   * @param {number|string} id - ID del registro a editar
   * @returns {Promise<Object|null>} Datos para edición o null en caso de error
   */
  const fetchEdit = async (id) => {
    loading.value = true;
    clearError();
    
    try {
      const apiRoute = getApiRoute();
      const response = await axios.get(`/${apiRoute}/${id}/edit`);
      
      if (response.data.success) {
        data.value = response.data.data;
        return response.data.data;
      } else {
        error.value = response.data.message || 'Error al obtener datos de edición';
        return null;
      }
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Crea un nuevo registro
   * POST /${apiRoute}
   * 
   * @param {Object} payload - Datos del nuevo registro
   * @returns {Promise<Object|null>} Registro creado o null en caso de error
   */
  const createItem = async (payload) => {
    loading.value = true;
    clearError();
    
    try {
      const apiRoute = getApiRoute();
      const response = await axios.post(`/${apiRoute}`, payload);
      
      if (response.data.success) {
        data.value = response.data.data;
        return response.data.data;
      } else {
        error.value = response.data.message || 'Error al crear el registro';
        return null;
      }
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Actualiza un registro existente
   * PUT /${apiRoute}/:id
   * 
   * @param {number|string} id - ID del registro a actualizar
   * @param {Object} payload - Datos actualizados
   * @returns {Promise<Object|null>} Registro actualizado o null en caso de error
   */
  const updateItem = async (id, payload) => {
    loading.value = true;
    clearError();
    
    try {
      const apiRoute = getApiRoute();
      const response = await axios.put(`/${apiRoute}/${id}`, payload);
      
      if (response.data.success) {
        data.value = response.data.data;
        return response.data.data;
      } else {
        error.value = response.data.message || 'Error al actualizar el registro';
        return null;
      }
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Elimina un registro
   * DELETE /${apiRoute}/:id
   * 
   * @param {number|string} id - ID del registro a eliminar
   * @returns {Promise<boolean>} true si se eliminó correctamente, false en caso de error
   */
  const deleteItem = async (id) => {
    loading.value = true;
    clearError();
    
    try {
      const apiRoute = getApiRoute();
      const response = await axios.delete(`/${apiRoute}/${id}`);
      
      if (response.data.success) {
        return true;
      } else {
        error.value = response.data.message || 'Error al eliminar el registro';
        return false;
      }
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Restaura un registro eliminado
   * POST /${apiRoute}/:id/restore
   * 
   * @param {number|string} id - ID del registro a restaurar
   * @returns {Promise<Object|null>} Registro restaurado o null en caso de error
   */
  const restoreItem = async (id) => {
    loading.value = true;
    clearError();
    
    try {
      const apiRoute = getApiRoute();
      const response = await axios.patch(`/${apiRoute}/${id}/restore`);
      
      if (response.data.success) {
        data.value = response.data.data;
        return response.data.data;
      } else {
        error.value = response.data.message || 'Error al restaurar el registro';
        return null;
      }
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Retornar API pública del composable
  return {
    // Estados reactivos
    data,
    filters,
    pagination,
    loading,
    error,

    // Métodos de lectura
    fetchFilters,
    fetchData,
    fetchById,
    fetchCreate,
    fetchEdit,

    // Métodos de escritura
    createItem,
    updateItem,
    deleteItem,
    restoreItem,

    // Utilidades
    clearError
  };
}