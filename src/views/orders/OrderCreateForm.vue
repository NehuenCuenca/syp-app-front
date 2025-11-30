<!-- OrderCreateForm.vue -->
<!-- Formulario para crear un nuevo pedido -->
<template>
  <div class="order-create-form" v-if="createFormData">
    <div class="form-content" >
      <!-- Campo: Tipo de pedido -->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-receipt"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <Select v-model="formData.order_type" :options="createFormData.order_types" optionLabel="name" showClear @change="handleChangeOrderType" />
          <label for="order_type">TIPO DE PEDIDO</label>
        </FloatLabel>
        <Message v-if="errors.order_type" severity="error" variant="simple" size="small" class="p-error">{{ errors.order_type }}</Message>
      </InputGroup>

      <!-- Campo: Contacto -->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-user"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <AutoComplete showClear id="contact" v-model="formData.contact" dropdown :suggestions="filteredContacts" @complete="searchContact" optionLabel="search_alias" optionValue="id"/>
          <label for="contact">CONTACTO (codigo)</label>
        </FloatLabel>
        <Message v-if="errors.contact" severity="error" variant="simple" size="small" class="p-error">{{ errors.contact }}</Message>
      </InputGroup>
      
      <Panel toggleable v-for="(detail, idx) in formData.order_details" :key="idx" v-if="hasSelectedOrderType" class="detail-panel">
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
            <AutoComplete showClear ref="detailProductAutoCompletes" id="detail_product" v-model="detail.product" dropdown :suggestions="filteredProducts" @change="searchProduct" optionLabel="search_alias" optionValue="id" @option-select="(e) => handleOptionSelect(e, idx)"/>
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
              <InputNumber id="detail_price" v-model="detail.price"
              prefix="$" :class="{ 'p-invalid': errors[`detail${idx}_price`] }"
              :min="0"
            />
              <label for="detail_price">PRECIO {{ (isSaleOrder) ? 'DE VENTA' : 'DE COMPRA' }}</label>
            </FloatLabel>
            <Message v-if="errors[`detail${idx}_price`]" severity="error" variant="simple" size="small" class="p-error">{{ errors[`detail${idx}_price`] }}</Message>
          </InputGroup>

          <!-- Campo: DETALLE_PORCENTAJE_PRODUCTO -->
          <InputGroup>
            <FloatLabel variant="in">
              <InputNumber id="selected_percentage" v-model="detail.percentage"
              suffix="%" :class="{ 'p-invalid': errors[`detail${idx}_percentage`] }"
              :min="(isSaleOrder && detail.product) ? 0 : 1" :max="(isSaleOrder && detail.product) ? 100 : 500"
              />
              <label for="selected_percentage" v-if="isSaleOrder">DESCUENTO (%)</label>
              <label for="selected_percentage" v-else>GANANCIA (%)</label>
            </FloatLabel>
            <Message v-if="errors[`detail${idx}_percentage`]" severity="error" variant="simple" size="small" class="p-error">{{ errors[`detail${idx}_percentage`] }}</Message>
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
        <InputGroupAddon>
            <i class="pi pi-sliders-h"></i>
        </InputGroupAddon>
        <FloatLabel variant="in"> 
          <InputNumber id="adjustment_amount" v-model="formData.adjustment_amount"
            prefix="$" :class="{ 'p-invalid': errors.adjustment_amount }"/>
          <label for="adjustment_amount">AJUSTE (+/-)</label>
        </FloatLabel>
        <Message v-if="errors.adjustment_amount" severity="error" variant="simple" size="small" class="p-error">{{ errors.adjustment_amount }}</Message>
      </InputGroup>

      <Message severity="contrast" size="large" icon="pi pi-dollar" v-if="isSaleOrder && getSaleApproximateTotalNet!==0">
        <template v-if="formData.adjustment_amount!==0">
          <small><i>*AJUSTE APLICADO*</i></small>
          <br>
        </template>
        Total neto: <b>{{ formatToCurrency(getSaleApproximateTotalNet) }}</b>
      </Message>

      <!-- Campo: Notas -->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-clipboard"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <Textarea id="notes" v-model="formData.notes"
            :class="{ 'p-invalid': errors.notes }" rows="3" cols="30"
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
import { computed, onMounted, reactive, ref, useTemplateRef, watch } from 'vue';
import { useCrudApi } from '../../composables/useCrudApi.js'

const {
  data: createFormData,
  loading: loadingCreateForm,
  error: errorCreateForm,
  fetchCreate,
} = useCrudApi();

const {
  data: newOrder,
  loading,
  error,
  createItem,
} = useCrudApi();

// Eventos emitidos
const emit = defineEmits(['finish', 'close']);

onMounted(async() => {
  await fetchCreate();

  if(!error.value && createFormData.value.contacts.length > 0){
    filteredContacts.value = createFormData.value.contacts.map(({ name }) => name);
  } else {
    filteredContacts.value = [];
  }
})

const detailProductAutoCompletesRefs = useTemplateRef('detailProductAutoCompletes')


// Estado del formulario
const formData = reactive({
  contact: null,
  // new_contact: null,
  order_type: null,
  adjustment_amount: 0,
  notes: '',
  order_details: [],
});

// Estado de errores de validación
const errors = ref({});

// Validación del formulario
const validateForm = () => {
  errors.value = {};
  let isValid = true;

  
  if (!formData.order_type) {
    errors.value.order_type = 'El tipo de pedido es requerido';
    isValid = false;
  }

  if (!formData.contact) {
    errors.value.contact = 'El contacto es requerido';
    isValid = false;
  }
  
  if (formData.order_details.length === 0) {
    errors.value.order_details = 'Debe agregar al menos un detalle al pedido';
    isValid = false;
  }

  formData.order_details.forEach((detail, index) => {
    if (!detail.product) {
      errors.value[`detail${index}_product`] = `El producto es requerido`;
      isValid = false;
    }
    if (!detail.quantity || detail.quantity <= 0) {
      errors.value[`detail${index}_quantity`] = `La cantidad debe ser mayor a 0`;
      isValid = false;
    }
    if (detail.price < 0) {
      errors.value[`detail${index}_price`] = `El precio no puede ser negativo`;
      isValid = false;
    }
  });

  return isValid;
};

// Maneja el envío del formulario
const handleSubmit = async() => {
  if (validateForm()) {
    const formDataToSend = {
      id_contact: formData.contact.id,
      id_movement_type: formData.order_type.id, // Venta
      notes: formData.notes,
      adjustment_amount: formData.adjustment_amount,
      order_details: formData.order_details.map(detail => ({
        id_product: detail.product.id,
        quantity: detail.quantity,
        unit_price_at_order: detail.price,
        [ (isSaleOrder.value) 
            ? 'discount_percentage_by_unit'
            : 'profit_percentage'
        ]: detail.percentage
      }))
    }
    console.log('Datos a enviar:', formDataToSend);
    const createdOrder = await createItem(formDataToSend)

    if(!error.value && newOrder.value){
      emit('finish', createdOrder);
    } else {
      console.error('Error al crear el pedido:', error.value);
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
  setTimeout(() => {
      if (!event.query.trim().length) {
          filteredContacts.value = [...createFormData.value.contacts];
      } else {
          filteredContacts.value = createFormData.value.contacts.filter((contact) => {
              return contact.search_alias.toLowerCase().startsWith(event.query.toLowerCase());
          });
      }
  }, 250);
}

const filteredProducts = ref([]);
const searchProduct = (event) => {
  if(event.value && event.value.hasOwnProperty('name')) return

  setTimeout(() => {
      if (!event.value.trim().length) {
          filteredProducts.value = [...createFormData.value.products];
      } else {
          filteredProducts.value = createFormData.value.products.filter((product) => {
              return product.search_alias.toLowerCase().startsWith(event.value.toLowerCase());
          });
      }
  }, 250);
}


const handleChangeOrderType = (e) => { 
  // console.log(e.value.name);
  if(e.value === null){
    console.log('reiniciando los detalles');
    formData.order_details = [];
    return
  }

  if(e.value.name === 'Venta'){    
    filteredProducts.value = createFormData.value.products.filter(product => product.current_stock > 0);
  } else {
    filteredProducts.value = [...createFormData.value.products];
  }
}

const addTemporalDetail = () => { 
  const detail = reactive({ 
    product: null, 
    quantity: 0, 
    price: 0, 
    percentage: (isSaleOrder.value) ? 0 : 30 
  });

  formData.order_details.push(detail)

  const isAlreadyAdded = (product) => formData.order_details.some(detail => detail.product && detail.product.id === product.id);
  
  if(isSaleOrder.value) {
    filteredProducts.value = createFormData.value.products.filter(product => product.current_stock > 0 && !isAlreadyAdded(product));
  } else {
    filteredProducts.value = createFormData.value.products.filter(product => !isAlreadyAdded(product));
  }
}

const removeTemporalDetail = (idxDetail) => { 
  formData.order_details.splice(idxDetail, 1);
}

const hasSelectedOrderType = computed(() => {
  return formData.order_type !== null
})

const isSaleOrder = computed(() => {
  return formData.order_type && formData.order_type.name === 'Venta'
})

const handleOptionSelect = (e, idx) => { 
  console.log('handleOptionSelect', e, idx);
  formData.order_details[idx].price = (isSaleOrder.value) ? e.value.sale_price : e.value.buy_price;
}

const hasFilledDetailFields = (idx) => { 
  const detail = formData.order_details[idx];
  return detail && detail.product && detail.quantity > 0 && detail.price >= 0 && detail.percentage >= 0;
}

const discountMultiplier = (detail) => (detail.percentage && detail.percentage > 0) 
                              ? (1 - (detail.percentage / 100)) 
                              : 1;

const getSaleSubtotalByQuantity = (idx, quantity) => { 
  const detail = formData.order_details[idx];
  if(!isSaleOrder.value) return 0; 
  return (parseInt(detail.price * discountMultiplier(detail)).toFixed(0) * quantity);
}


const getSuggestedSalePrice = (idx) => { 
  const detail = formData.order_details[idx];
  return parseInt((detail.price * (1 + detail.percentage / 100))).toFixed(0)
}

const formatToCurrency = (amount) => {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", currencyDisplay: "symbol", minimumFractionDigits: 0 }).format(amount);
}

const getSaleApproximateTotalNet = computed(() => { 
  if(!isSaleOrder.value) return 0;

  let total = 0;
  formData.order_details.forEach((detail) => {
    total += parseInt(detail.price * discountMultiplier(detail)).toFixed(0) * detail.quantity;
  });

  return total + formData.adjustment_amount; 
})

watch(() => formData.order_details, (newDetails) => {
  const isAlreadyAdded = (product) => formData.order_details.some(detail => detail.product && detail.product.id === product.id);
  
  if(isSaleOrder.value) {
    filteredProducts.value = createFormData.value.products.filter(product => product.current_stock > 0 && !isAlreadyAdded(product));
  } else {
    filteredProducts.value = createFormData.value.products.filter(product => !isAlreadyAdded(product));
  }

  detailProductAutoCompletesRefs.value?.forEach( ref => {
    ref.overlayVisible = false
  })
}, { deep: true });
</script>

<style scoped>
.order-create-form {
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