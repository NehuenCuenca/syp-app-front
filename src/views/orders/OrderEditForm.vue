<!-- OrderEditForm.vue -->
<!-- Formulario para editar un nuevo pedido -->
<template>
  <div class="order-edit-form" v-if="editFormData">
    <div class="form-content" >
      <!-- Campo: Tipo de pedido -->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-receipt"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <!-- <Select disabled v-model="formData.order_type" :options="editFormData.order_types" optionLabel="name" showClear @change="handleChangeOrderType" /> -->
          <Select disabled v-model="editFormData.order.movement_type" :options="editFormData.order_types" optionLabel="name" showClear @change="handleChangeOrderType" />
          <label for="movement_type">TIPO DE PEDIDO</label>
        </FloatLabel>
        <Message v-if="errors.movement_type" severity="error" variant="simple" size="small" class="p-error">{{ errors.movement_type }}</Message>
      </InputGroup>

      <!-- Campo: Contacto -->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-user"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <AutoComplete showClear id="contact" v-model="editFormData.order.contact" dropdown :suggestions="filteredContacts" @complete="searchContact" optionLabel="search_alias" optionValue="id" emptySearchMessage="No se encontraron sugerencias."/>
          <label for="contact">CONTACTO (codigo)</label>
        </FloatLabel>
        <Message v-if="errors.contact" severity="error" variant="simple" size="small" class="p-error">{{ errors.contact }}</Message>
      </InputGroup>
      
      <Panel toggleable v-for="(detail, idx) in editFormData.order.order_details" :key="idx" v-if="hasSelectedOrderType" class="detail-panel">
        <template #toggleicon="data">
          <i :class="['pi', data.collapsed ? 'pi-chevron-down' : 'pi-chevron-up']"></i>
        </template>
        <template #header="data">
          <span class="font-bold">Detalle #{{ idx+1 }}</span>
          <Button v-if="!data.collapsed" icon="pi pi-trash" severity="danger" variant="outlined" text @click="() => removeTemporalDetail(idx)"/>
        </template> 

        <!-- Campo: DETALLE_PRODUCTO -->
        <InputGroup>
          <FloatLabel variant="in">
            <AutoComplete showClear dropdown ref="detailProductAutoCompletes" id="detail_product" v-model="detail.product"  :suggestions="filteredProducts" @complete="searchProduct" optionLabel="search_alias" optionValue="id" @option-select="(e) => handleOptionSelect(e, idx)" emptySearchMessage="No se encontraron sugerencias."/>
            <label for="detail_product">PRODUCTO (codigo)</label>
          </FloatLabel>
          <Message v-if="errors[`detail${idx}_product`]" severity="error" variant="simple" size="small" class="p-error">{{ errors[`detail${idx}_product`] }}</Message>
        </InputGroup>

        <template v-if="detail.product">
          <!-- Campo: DETALLE_CANTIDAD_PRODUCTO -->
          <InputGroup>
            <FloatLabel variant="in">
              <InputNumber id="detail_quantity" v-model="detail.quantity"
              :class="{ 'p-invalid': errors[`detail${idx}_quantity`] }" showButtons
              buttonLayout="horizontal" :step="5"
              :min="0" :max="(isSaleOrder) ? detail.product.current_stock : null"
              >
                <template #incrementbuttonicon>
                    <span class="pi pi-plus" />
                </template>
                <template #decrementbuttonicon>
                    <span class="pi pi-minus" />
                </template>
              </InputNumber>
              <label for="detail_quantity">CANTIDAD {{ (detail.product) ? `(${detail.product.current_stock} disponibles)` : ''}}</label>
            </FloatLabel>
            <Message v-if="errors[`detail${idx}_quantity`]" severity="error" variant="simple" size="small" class="p-error">{{ errors[`detail${idx}_quantity`] }}</Message>
          </InputGroup>

          <!-- Campo: DETALLE_PRECIO_PRODUCTO -->
          <InputGroup>
            <FloatLabel variant="in">
              <InputNumber id="detail_unit_price" v-model="detail.unit_price"
                prefix="$" :class="{ 'p-invalid': errors[`detail${idx}_unit_price`] }"
                :min="0"
              />
              <label for="detail_unit_price">PRECIO {{ (isSaleOrder) ? 'DE VENTA' : 'DE COMPRA' }}</label>
            </FloatLabel>
            <Message v-if="errors[`detail${idx}_unit_price`]" severity="error" variant="simple" size="small" class="p-error">{{ errors[`detail${idx}_unit_price`] }}</Message>
          </InputGroup>

          <!-- Campo: DETALLE_PORCENTAJE_PRODUCTO -->
          <InputGroup>
            <FloatLabel variant="in">
              <InputNumber id="detail_percentage_applied" v-model="detail.percentage_applied"
              suffix="%" :class="{ 'p-invalid': errors[`detail${idx}_percentage_applied`] }"
              :min="1" :max="500" />
              <label for="selected_percentage_applied">{{ (isSaleOrder) ? 'DESCUENTO' : 'GANANCIA'}} (%)</label>
            </FloatLabel>
            <Message v-if="errors[`detail${idx}_percentage_applied`]" severity="error" variant="simple" size="small" class="p-error">{{ errors[`detail${idx}_percentage_applied`] }}</Message>
          </InputGroup>

          <Fieldset v-if="hasFilledDetailFields(idx)">
            <template #legend>
                <div class="flex items-center pl-2">
                    <i class="pi pi-info-circle" style="font-size: 1rem"></i>
                    <span v-if="isSaleOrder" class="font-bold p-2"> Subtotales</span>
                    <span v-else class="font-bold p-2"> Precio venta sugerido</span>
                </div>
            </template>

            <template v-if="isSaleOrder">
              <Message severity="info">Unidad (x1): {{ formatToCurrency(getSaleSubtotalByQuantity(idx, 1)) }}</Message>
              <br>
              <Message severity="info">Cantidad (x{{ detail.quantity }}): {{ formatToCurrency(getSaleSubtotalByQuantity(idx, detail.quantity)) }}</Message>
            </template>

            <template v-else>
              <Message>Unidad (x1): {{ formatToCurrency(getSuggestedSalePrice(idx)) }}</Message>
            </template>
          </Fieldset>
      </template>
    </Panel>

    <Button label="Agregar detalle" icon="pi pi-plus" @click="addTemporalDetail" :disabled="!hasSelectedOrderType" />
      
      <!-- Campo: Ajuste (+/-)-->
      <InputGroup>
        <FloatLabel variant="in"> 
          <InputNumber id="adjustment_amount" v-model="editFormData.order.adjustment_amount"
            prefix="$" :class="{ 'p-invalid': errors.adjustment_amount }"/>
          <label for="adjustment_amount">AJUSTE (+/-)</label>
        </FloatLabel>
        <Message v-if="errors.adjustment_amount" severity="error" variant="simple" size="small" class="p-error">{{ errors.adjustment_amount }}</Message>
      </InputGroup>

      <Message severity="contrast" size="large" icon="pi pi-dollar" v-if="isSaleOrder && getSaleApproximateTotalNet!==0">
        <template v-if="editFormData.order.adjustment_amount!==0">
          <small><i>*AJUSTE APLICADO*</i></small>
          <br>
        </template>
        Total neto: <b>{{ formatToCurrency(getSaleApproximateTotalNet) }}</b>
      </Message>

      <!-- Campo: Notas -->
      <InputGroup>
        <FloatLabel variant="in">
          <Textarea id="notes" v-model="editFormData.order.notes"
            :class="{ 'p-invalid': errors.notes }" rows="3" cols="50"
            style="resize: none"
          />
          <label for="notes">NOTAS (opcional)</label>
        </FloatLabel>

        <Message v-if="errors.notes" severity="error" variant="simple" size="small" class="p-error">{{ errors.notes }}</Message>
      </InputGroup>

      <Message severity="error" v-if="error">{{ error }}</Message>
    </div>

    <!-- Botones de acción -->
    <div class="form-actions">
      <Button
        label="Cancelar"
        severity="secondary"
        outlined
        @click="handleCancel"
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        @click="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, toRaw, useTemplateRef, watch } from 'vue';
import { useCrudApi } from '../../composables/useCrudApi.js'

const {
  data: editFormData,
  loading: loadingEditForm,
  error: errorEditForm,
  fetchEdit,

} = useCrudApi();

const {
  data: editedOrder,
  loading,
  error,
  updateItem,
} = useCrudApi();

const props = defineProps({
  recordData: {
    type: Object,
    required: true
  }
});


// Eventos emitidos
const emit = defineEmits(['finish', 'close']);

onMounted(async() => {
  await fetchEdit(props.recordData.id);

  if(!error.value && editFormData.value.contacts.length > 0){
    filteredContacts.value = editFormData.value.contacts.map(({ name }) => name);
  } else {
    filteredContacts.value = [];
  }

})

const detailProductAutoCompletesRefs = useTemplateRef('detailProductAutoCompletes')

// Estado del formulario
let formData = reactive({
  contact: props.recordData.contact || null,
  order_type: props.recordData.movement_type || null,
  adjustment_amount: props.recordData.adjustment_amount,
  notes: props.recordData.notes || '',
  order_details: [...props.recordData.order_details] || [],
});

// Estado de errores de validación
const errors = ref({});

// Validación del formulario
const validateForm = () => {
  errors.value = {};
  let isValid = true;

  if (!editFormData.value.order.movement_type) {
    errors.value.movement_type = 'El tipo de pedido es requerido';
    isValid = false;
  }

  if (!editFormData.value.order.contact) {
    errors.value.contact = 'El contacto es requerido';
    isValid = false;
  }
  
  if (editFormData.value.order.order_details.length === 0) {
    errors.value.order_details = 'Debe agregar al menos un detalle al pedido';
    isValid = false;
  }

  editFormData.value.order.order_details.forEach((detail, index) => {
    if (!detail.product) {
      errors.value[`detail${index}_product`] = `El producto es requerido`;
      isValid = false;
    }
    if (!detail.quantity || detail.quantity <= 0) {
      errors.value[`detail${index}_quantity`] = `La cantidad debe ser mayor a 0`;
      isValid = false;
    }
    if (detail.unit_price < 0) {
      errors.value[`detail${index}_price`] = `El precio no puede ser negativo`;
      isValid = false;
    }
  });

  return isValid;
};

// Maneja el envío del formulario
const handleSubmit = async() => {
  if (validateForm()) {

    const {contact, adjustment_amount, notes, order_details} = toRaw(editFormData.value.order)

    const orderWithChanges = {
      id_contact: contact.id,
      adjustment_amount,
      notes,
      order_details: order_details.map(({product, quantity, unit_price, percentage_applied}) => ({
        id_product: product.id,
        quantity,
        unit_price,
        percentage_applied
      }))
    }
    
    console.log('Datos a enviar:', props.recordData.id, orderWithChanges);

    const updatedOrder = await updateItem(props.recordData.id, orderWithChanges)

    if(!error.value && editedOrder.value){
      emit('finish', updatedOrder);
    } else {
      console.error('Error al editar el pedido:', error.value);
      return
    }
  }
};

// Maneja la cancelación
const handleCancel = () => {
  emit('close');
};

const filteredContacts = ref([]);
const searchContact = (event) => {
  if(event.query && event.query.hasOwnProperty('company_name')) return
  
  setTimeout(() => {
      if (!event.query || !event.query.trim().length) {
          filteredContacts.value = [...editFormData.value.contacts];
      } else {
          filteredContacts.value = editFormData.value.contacts.filter((contact) => {
              return contact.search_alias.toLowerCase().includes(event.query.toLowerCase());
              // return contact.search_alias.toLowerCase().startsWith(event.query.toLowerCase());
          });
      }
  }, 250);
}

const filteredProducts = ref([]);
const searchProduct = (event) => {
  const selectProductFromDropdown = event.query && event.query.hasOwnProperty('name')
  const autoCompleteIsEmpty = !event.query.trim().length
  if(selectProductFromDropdown || autoCompleteIsEmpty) return

  setTimeout(() => {
      filteredProducts.value = createFormData.value.products.filter((product) => {
          return product.search_alias.toLowerCase().includes(event.query.toLowerCase());
      });
  }, 250);
}


const handleChangeOrderType = (e) => { 
  // console.log(e.value.name);
  // if(e.value === null){
  //   console.log('reiniciando los detalles');
  //   editFormData.order.order_details = [];
  //   return
  // }

  if(e.value.name === 'Venta'){    
    filteredProducts.value = editFormData.value.products.filter(product => product.current_stock > 0);
  } else {
    filteredProducts.value = [...editFormData.value.products];
  }
}

const addTemporalDetail = () => { 
  const detail = reactive({ 
    product: null, 
    quantity: 0, 
    price: 0, 
    percentage: (isSaleOrder.value) ? 0 : 30 
  });

  editFormData.value.order.order_details.push(detail)

  const isAlreadyAdded = (product) => editFormData.value.order.order_details.some(detail => detail.product && detail.product.id === product.id);
  
  if(isSaleOrder.value) {
    filteredProducts.value = editFormData.value.products.filter(product => product.current_stock > 0 && !isAlreadyAdded(product));
  } else {
    filteredProducts.value = editFormData.value.products.filter(product => !isAlreadyAdded(product));
  }
}

const removeTemporalDetail = (idxDetail) => { 
  editFormData.value.order.order_details.splice(idxDetail, 1);
}

const hasSelectedOrderType = computed(() => {
  return editFormData.value.order.movement_type !== null
})

const isSaleOrder = computed(() => {
  return props.recordData.movement_type && props.recordData.movement_type.name === 'Venta'
})

const handleOptionSelect = (e, idx) => { 
  console.log('handleOptionSelect', e, idx);
  editFormData.value.order.order_details[idx].unit_price = (isSaleOrder.value) ? e.value.sale_price : e.value.buy_price;
}

const hasFilledDetailFields = (idx) => { 
  const detail = editFormData.value.order.order_details[idx];
  return detail && detail.product && detail.quantity > 0 && detail.unit_price >= 0 && detail.percentage_applied >= 0;
}

const discountMultiplier = (detail) => (detail.percentage_applied && detail.percentage_applied > 0) 
                              ? (1 - (detail.percentage_applied / 100)) 
                              : 1;

const getSaleSubtotalByQuantity = (idx, quantity) => { 
  const detail = editFormData.value.order.order_details[idx];
  if(!isSaleOrder.value) return 0; 
  return (parseInt(detail.unit_price * discountMultiplier(detail)).toFixed(0) * quantity);
}


const getSuggestedSalePrice = (idx) => { 
  console.log(editFormData.value.order);
  const { unit_price, percentage_applied } = editFormData.value.order.order_details[idx];
  
  return parseInt((unit_price * (1 + percentage_applied / 100))).toFixed(0)
}

const formatToCurrency = (amount) => {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", currencyDisplay: "symbol", minimumFractionDigits: 0 }).format(amount);
}

const getSaleApproximateTotalNet = computed(() => { 
  if(!isSaleOrder.value) return 0;

  let total = 0;
  editFormData.value.order.order_details.forEach((detail, idx) => {
    if(!hasFilledDetailFields(idx)) return
    total += parseInt(detail.unit_price * discountMultiplier(detail)).toFixed(0) * detail.quantity;
  });

  return total + editFormData.value.order.adjustment_amount; 
})


watch(() => editFormData.order_details, (newDetails) => {
  const isAlreadyAdded = (product) => editFormData.value.order_details.some(detail => detail.product && detail.product.id === product.id);
  
  if(isSaleOrder.value) {
    filteredProducts.value = editFormData.value.products.filter(product => product.current_stock > 0 && !isAlreadyAdded(product));
  } else {
    filteredProducts.value = editFormData.value.products.filter(product => !isAlreadyAdded(product));
  }

  detailProductAutoCompletesRefs.value?.forEach( ref => {
    ref.overlayVisible = false
  })
}, { deep: true });
</script>

<style scoped>
.order-edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-content {
  display: flex;
  /* flex-direction: column; */
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  font-size: 0.95rem;
  color: #495057;
}

label.required::after {
  content: ' *';
  color: #e24c4c;
}

.p-error {
  color: #e24c4c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.w-full {
  width: 100%;
}

.w-half {
  width: 50%;
}

.form-detail-content {
  padding: 1rem .5rem ;
  background-color: var(--bg-color-1);
}
</style>