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

      <!-- Detalle: fecha -->
      <div class="detail-row">
        <span class="detail-label">Fecha:</span>
        <span class="detail-value">{{ `${recordData.created_at}` || '---'}}</span>
      </div>
    </div>
  </div>

  <br>

  <DataTable :value="recordData.order_details" size="large" showGridlines tableStyle="min-width: 50rem">
    <template #header>
      <h3>Detalles</h3>
    </template>
    <Column field="product.search_alias" header="Producto"></Column>
    <Column field="quantity" header="Cantidad"></Column>
    <Column field="unit_price" header="Precio unitario">
      <template #body="{ data }">
        {{data.formatted_unit_price}}
      </template>
    </Column>
    <Column v-if="isSaleOrder" field="discount_percentage_by_unit" header="Descuento (%)">
      <template #body="{ data }">
        -{{data.percentage_applied}}%
      </template>
    </Column>
    <Column v-else field="product.profit_percentage" header="Ganancia (%)">
      <template #body="{ data }">
        {{data.product.profit_percentage}}%
      </template>
    </Column>
    <Column field="formatted_line_subtotal" header="Subtotal"></Column>
    <ColumnGroup type="footer">
        <Row>
            <Column :footer="`Bruto: ${recordData.subtotal_currency}`" :colspan="3" footerStyle="text-align:right" />
            <Column :footer="`Ajuste: ${recordData.adjustment_currency}`" footerStyle="text-align:right"/>
            <Column :footer="`NETO: ${recordData.total_net_currency}`" footerStyle="text-align:right"/>
        </Row>
    </ColumnGroup>
  </DataTable>

  <br>
  <div class="order-read-details">
    <div class="details-content">
      <!-- Detalle: Notas -->
      <div class="detail-row">
        <span class="detail-label">Notas:</span>
        <span class="detail-value">
          {{ `${recordData.notes || '---'}`  }}
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
import { computed } from 'vue';

// Props del componente
const props = defineProps({
  recordData: {
    type: Object,
    required: true
  }
});

// Eventos emitidos
const emit = defineEmits(['finish', 'close']);


// Maneja el cierre
const handleClose = () => {
  emit('close');
};

const isSaleOrder = computed(() => {
  return props.recordData.movement_type && props.recordData.movement_type.name === 'Venta'
})
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