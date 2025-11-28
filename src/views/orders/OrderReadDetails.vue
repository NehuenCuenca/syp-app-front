<!-- ProductReadDetails.vue -->
<!-- Vista de solo lectura de los detalles de un ordero -->
<template>
  <div class="order-read-details">
    <div class="details-content">
      <!-- Detalle: Pedido -->
      <div class="detail-row">
        <span class="detail-label">Pedido:</span>
        <span class="detail-value">{{ `${recordData.search_alias}` || '---'}}</span>
      </div>
      
      <!-- Detalle: Ajuste -->
      <div class="detail-row">
        <span class="detail-label">Ajuste:</span>
        <span class="detail-value">
          ${{ recordData.adjustment_amount || '---'}}
        </span>
      </div>

      <!-- Detalle: Total NETO -->
      <div class="detail-row">
        <span class="detail-label">Total NETO:</span>
        <span class="detail-value">
          ${{ recordData.total_net || '---'}}
        </span>
      </div>

      <!-- Detalle: Notas -->
      <div class="detail-row">
        <span class="detail-label">Notas:</span>
        <span class="detail-value">
          {{ `${recordData.notes}` || '---' }}
        </span>
      </div>
    </div>

    <!-- DETALLES DEL PEDIDO -->
    <div class="details-content" v-for="({quantity, product, unit_price_at_order, line_subtotal, discount_percentage_by_unit, }, idx) in recordData.order_details" :key="idx">
      
      <!-- Detalle -->
      <div class="detail-row">
        <span class="detail-label">Detalle #{{ idx + 1 }}:</span>
        <span class="detail-value">{{ `${product.search_alias}` || '---'}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Cantidad:</span>
        <span class="detail-value">{{ `${quantity}` || '---'}}</span>
      </div>
      <div class="detail-row" v-if="recordData.movement_type.name==='Compra'">
        <span class="detail-label">Ganancia (%):</span>
        <span class="detail-value">{{ `${product.profit_percentage}%` || '---'}}</span>
      </div>
      <div class="detail-row" v-if="recordData.movement_type.name==='Venta' && discount_percentage_by_unit!==0">
        <span class="detail-label">Descuento (%):</span>
        <span class="detail-value">{{ `${discount_percentage_by_unit}%` || '---'}}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Subtotales:</span>
        <span class="detail-value" v-if="quantity!==1">{{ `Por unidad (x1): $${unit_price_at_order}` || '---'}}</span>
        <span class="detail-value">{{ `Por cantidad (x${quantity}): $${line_subtotal}` || '---'}}</span>
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
.order-read-details {
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