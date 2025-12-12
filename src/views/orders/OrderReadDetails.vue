<!-- ProductReadDetails.vue -->
<!-- Vista de solo lectura de los detalles de un ordero -->
<template>
  <div class="flex items-center flex-col gap-4">
    <div class="flex justify-center max-w-xl flex-wrap gap-10">
      <div class="flex flex-col flex-[1_2_100%] gap-y-2">
        <!-- Campo: pedido -->
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-receipt"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputText id="order" disabled v-model="recordData.search_alias" />
            <label for="order">PEDIDO</label>
          </FloatLabel>
        </InputGroup>
      </div>

      <!-- Detalle: CONTACTO -->
      <div class="flex flex-col flex-[1_2_100%] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-user"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputText disabled id="contact" v-model="recordData.contact.search_alias" />
            <label for="contact">CONTACTO</label>
          </FloatLabel>
        </InputGroup>
      </div>

    <DataTable :value="recordData.order_details" size="small" showGridlines class="max-w-[280px] xl:max-w-full">
      <template #header>
        <h3 class="text-xl">Detalles ({{recordData.order_details.length}})</h3>
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

    <div class="flex flex-col flex-[1_2_200px] gap-y-2" v-if="!!recordData.notes">
      <InputGroup>
        <InputGroupAddon>
          <i class="pi pi-clipboard"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <Textarea disabled id="notes" v-model="recordData.notes"
            autoResize=""/>
          <label for="notes">NOTAS (opcional)</label>
        </FloatLabel>
      </InputGroup>
    </div>

    <div class="flex flex-col flex-[1_2_200px] gap-y-2">
      <InputGroup>
        <InputGroupAddon>
          <i class="pi pi-calendar"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <InputText disabled id="created_at" v-model="recordData.created_at"
            style="resize: none" />
          <label for="created_at">CREADO EN</label>
        </FloatLabel>
      </InputGroup>
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

<style scoped></style>