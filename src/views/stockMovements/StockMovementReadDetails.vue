<!-- StockMovementReadDetails.vue -->
<!-- Vista de solo lectura de los detalles de un movemento -->
<template>
  <div class="flex items-center flex-col gap-4">
    <div class="flex justify-between max-w-xl flex-wrap gap-6">
      <!-- Detalle: Producto -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
              <i class="pi pi-th-large"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputText disabled id="product" v-model="recordData.product.search_alias"/>
            <label for="product">Producto</label>
          </FloatLabel>
        </InputGroup>
      </div>

      <!-- Detalle: Cantidad movida -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
              <i class="pi pi-arrow-right-arrow-left"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputText disabled id="quantity_moved" v-model="recordData.quantity_moved"/>
            <label for="quantity_moved">Cantidad movida</label>
          </FloatLabel>
        </InputGroup>
      </div>

      <!-- Detalle: Notas -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
              <i class="pi pi-clipboard"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <Textarea disabled id="notes" v-model="recordData.notes"/>
            <label for="notes">Notas</label>
          </FloatLabel>
        </InputGroup>
      </div>
      

      <!-- Detalle: pedido -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2" v-if="!!recordData.order">
        <InputGroup>
          <InputGroupAddon>
              <i class="pi pi-receipt"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputText disabled id="order" v-model="recordData.order.search_alias" />
            <label for="order">Pedido</label>
          </FloatLabel>
        </InputGroup>
      </div>

      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-calendar"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputText disabled id="created_at" v-model="recordData.created_at" style="resize: none" />
            <label for="created_at">CREADO EN</label>
          </FloatLabel>
        </InputGroup>
      </div>
    </div>

    <!-- Botón de cerrar -->
    <div class="w-full flex justify-around">
        <Button
          label="Cerrar"
          severity="primary"
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
.movement-read-details {
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