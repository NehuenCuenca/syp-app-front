<!-- ProductReadDetails.vue -->
<!-- Vista de solo lectura de los detalles de un producto -->
<template>
  <div class="product-read-details">
    <div class="details-content">
      <!-- Detalle: Producto -->
      <div class="detail-row">
        <span class="detail-label">Producto:</span>
        <span class="detail-value">{{ recordData.product?.search_alias || '---'}}</span>
      </div>

      <!-- Detalle: Cantidad movida -->
      <div class="detail-row">
        <span class="detail-label">Cantidad movida:</span>
        <span class="detail-value">
          {{ recordData.quantity_moved || '---'}}
        </span>
      </div>

      <!-- Detalle: Notas -->
      <div class="detail-row">
        <span class="detail-label">Notas:</span>
        <span class="detail-value">
          {{ recordData.notes || '---'}}
        </span>
      </div>

      <!-- Detalle: Porcentaje de ganancia -->
      <div class="detail-row">
        <span class="detail-label">Pedido:</span>
        <span class="detail-value">
          {{ `${recordData.order?.code}` || '---' }}
        </span>
      </div>

      <!-- Detalle: Tipo de movimiento -->
      <div class="detail-row">
        <span class="detail-label">Tipo de movimiento:</span>
        <span class="detail-value">
          {{ recordData.movement_type.name || '---'}}
        </span>
      </div>
    </div>

    <!-- Botón de cerrar -->
    <div class="form-actions">
      <Button
        label="Cerrar"
        severity="secondary"
        @click="handleClose"
      />
    </div>
  </div>
</template>

<script setup>

// Props del componente
const props = defineProps({
  recordData: {
    type: Object,
    required: true
  }
});

// Eventos emitidos
const emit = defineEmits(['close']);

// Maneja el cierre
const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
.product-read-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 6px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 1rem;
  color: #111827;
  margin-top: 0.25rem;
}

.detail-id {
  font-family: monospace;
  font-size: 0.875rem;
  color: #6b7280;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}
</style>