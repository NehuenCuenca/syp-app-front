<!-- ProductReadDetails.vue -->
<!-- Vista de solo lectura de los detalles de un producto -->
<template>
  <div class="product-read-details">
    <div class="details-content">
      <!-- Detalle: Nombre -->
      <div class="detail-row">
        <span class="detail-label">Nombre:</span>
        <span class="detail-value">{{ recordData.search_alias || '---'}}</span>
      </div>

      <!-- Detalle: Categoria -->
      <div class="detail-row">
        <span class="detail-label">Categoria:</span>
        <span class="detail-value">
          {{ recordData.category.search_alias || '---'}}
        </span>
      </div>

      <!-- Detalle: Precio COMPRA -->
      <div class="detail-row">
        <span class="detail-label">Precio COMPRA:</span>
        <span class="detail-value">
          ${{ recordData.buy_price || '---'}}
        </span>
      </div>

      <!-- Detalle: Porcentaje de ganancia -->
      <div class="detail-row">
        <span class="detail-label">Ganancia (%):</span>
        <span class="detail-value">
          {{ `${recordData.profit_percentage}%` || '---' }}
        </span>
      </div>

      <!-- Detalle: Precio VENTA -->
      <div class="detail-row">
        <span class="detail-label">Precio VENTA:</span>
        <span class="detail-value">
          ${{ recordData.sale_price || '---'}}
        </span>
      </div>
      
      <!-- Detalle: Stock actual -->
      <div class="detail-row">
        <span class="detail-label">Stock actual:</span>
        <span class="detail-value">
          {{ recordData.current_stock || '0'}}
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

// Formatear precio como moneda
const formatCurrency = (value) => {
  if (!value) return '$0.00';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value);
};

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