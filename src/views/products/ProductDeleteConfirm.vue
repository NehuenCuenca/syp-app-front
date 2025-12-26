<!-- ProductDeleteConfirm.vue -->
<!-- Confirmación de eliminación de un producto -->
<template>
  <div class="product-delete-confirm">
    <!-- Mensaje de advertencia -->
    <div class="warning-content">
      <i class="pi pi-exclamation-triangle warning-icon"></i>
      <div class="warning-message">
        <p class="warning-title">¿Está seguro que desea eliminar el producto '{{ recordData.name }}'?</p>
        <p class="warning-subtitle">Esta acción no se puede deshacer.</p>
      </div>
    </div>

    <Message severity="error" v-if="error">{{ error }}</Message>

    <!-- Detalles del producto a eliminar -->
    <!-- <div class="product-info">
      <div class="info-row">
        <span class="info-label">Nombre:</span>
        <span class="info-value">{{ recordData.name }}</span>
      </div>
    </div> -->

    <!-- Botones de acción -->
    <div class="form-actions">
      <Button
        label="Cancelar"
        severity="secondary"
        outlined
        @click="handleCancel"
      />
      <Button
        label="Eliminar"
        severity="danger"
        icon="pi pi-trash"
        @click="handleDelete"
        :disabled="error"
      />
    </div>
  </div>
</template>

<script setup>
import { useCrudApi } from '../../composables/useCrudApi.js'


// Props del componente
const props = defineProps({
  recordData: {
    type: Object,
    required: true
  }
});

// Eventos emitidos
const emit = defineEmits(['finish', 'close']);

const {
  data,
  loading,
  error,
  fetchFilters,
  deleteItem,
} = useCrudApi();



// Maneja la eliminación
const handleDelete = async() => {
    const deletedProduct = await deleteItem(props.recordData.id)
    if(!error.value && deletedProduct){
      emit('finish', deletedProduct);
    } else {
      console.error('Error al eliminar el producto:', error.value);
      // toast.add({ severity: 'error', closable: true, summary: 'Error al eliminar el producto:'  + props.recordData.name });  
      return
    }
};

// Maneja la cancelación
const handleCancel = () => {
  emit('close');
};
</script>

<style scoped>
.product-delete-confirm {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.warning-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

.warning-icon {
  font-size: 1.5rem;
  color: #dc2626;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.warning-message {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.warning-title {
  font-weight: 600;
  font-size: 1rem;
  color: #991b1b;
  margin: 0;
}

.warning-subtitle {
  font-size: 0.875rem;
  color: #b91c1c;
  margin: 0;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 6px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #6b7280;
}

.info-value {
  font-size: 0.95rem;
  color: #111827;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}
</style>