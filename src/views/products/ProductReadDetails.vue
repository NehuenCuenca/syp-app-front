<!-- ProductReadDetails.vue -->
<!-- Vista de solo lectura de los detalles de un producto -->
<template>
  <div class="flex items-center flex-col gap-4">
    <div class="flex justify-between max-w-xl flex-wrap gap-6">
      <!-- Campo: Nombre del producto -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-th-large"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputText size="large" disabled id="name" v-model="recordData.search_alias" />
            <label for="name">NOMBRE DE PRODUCTO</label>
          </FloatLabel>
        </InputGroup>
      </div>


      <!-- Campo: categoria -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-tags"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <AutoComplete size="large" disabled id="category" v-model="recordData.category.search_alias"
              emptySearchMessage="No se encontraron sugerencias." />
            <label for="category">CATEGORIA</label>
          </FloatLabel>
        </InputGroup>
      </div>

      <!-- Campo: Precio de COMPRA-->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-dollar"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputNumber size="large" disabled id="buy_price" v-model="recordData.buy_price" prefix="$" :min="0" />
            <label for="buy_price">PRECIO DE COMPRA</label>
          </FloatLabel>
        </InputGroup>
      </div>

      <!-- Campo: ganancia -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-percentage"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputNumber size="large" disabled id="profit_percentage" v-model="recordData.profit_percentage" suffix="%"
              :min="1" />
            <label for="profit_percentage">GANANCIA (%)</label>
          </FloatLabel>
        </InputGroup>
      </div>

      <!-- Campo: precio de venta -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">

        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-dollar"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputNumber size="large" disabled id="sale_price" v-model="recordData.sale_price" prefix="$" :min="0" />
            <label for="sale_price">PRECIO DE VENTA</label>
          </FloatLabel>
        </InputGroup>
      </div>

      <!-- Campo: stock actual -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-wave-pulse"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputNumber size="large" disabled id="current_stock" v-model="recordData.current_stock" :min="1">
            </InputNumber>
            <label for="current_stock">STOCK ACTUAL</label>
          </FloatLabel>
        </InputGroup>
      </div>

      <!-- Campo: Alerta minimo de stock -->
      <div class="flex flex-col flex-[0_1_250px]">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-exclamation-triangle"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">

            <InputNumber size="large" disabled id="min_stock_alert" v-model="recordData.min_stock_alert"
              buttonLayout="horizontal" :step="5" :min="1">
            </InputNumber>
            <label for="min_stock_alert">ALERTA DE STOCK BAJO</label>
          </FloatLabel>
        </InputGroup>
      </div>

      <div class="w-full flex justify-around">
        <Button label="Cerrar" severity="primary" @click="handleClose" />
      </div>
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