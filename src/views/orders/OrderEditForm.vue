<!-- OrderEditForm.vue -->
<!-- Formulario para editar un nuevo pedido -->
<template>
  <div class="flex items-center flex-col gap-4" v-if="editFormData">
    <div class="flex justify-center max-w-xl flex-wrap gap-10">
      <div class="w-full flex flex-wrap gap-4">
        <h3 class="text-lg flex-[1_2_100%] text-surface-200">Operacionales</h3>

        <div class="flex flex-col flex-[1_2_200px] gap-y-2">
          <!-- Campo: Tipo de pedido -->
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-receipt"></i>
            </InputGroupAddon>
            <FloatLabel variant="in">
              <!-- <Select disabled v-model="formData.order_type" :options="editFormData.order_types" optionLabel="name" showClear @change="handleChangeOrderType" /> -->
              <Select disabled v-model="editFormData.order.movement_type" :options="editFormData.order_types"
                optionLabel="name" :invalid="!!errors.movement_type" />
              <label for="movement_type">TIPO DE PEDIDO</label>
            </FloatLabel>
          </InputGroup>
          <Message v-if="errors.movement_type" severity="error" variant="simple" size="large" class="p-error">{{
            errors.movement_type }}</Message>
        </div>

        <!-- Campo: Contacto -->
        <div class="flex flex-col flex-[1_2_200px] gap-y-2">
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-user"></i>
            </InputGroupAddon>
            <FloatLabel variant="in">
              <AutoComplete showClear id="contact" v-model="editFormData.order.contact" dropdown
                :suggestions="filteredContacts" @complete="searchContact" optionLabel="search_alias" optionValue="id"
                emptySearchMessage="No se encontraron sugerencias." :invalid="!!errors.contact" />
              <label for="contact">CONTACTO (codigo)</label>
            </FloatLabel>
          </InputGroup>
          <Message v-if="errors.contact" severity="error" variant="simple" size="large" class="p-error">{{
            errors.contact
            }}</Message>
        </div>
      </div>

      <div class="w-full flex flex-wrap gap-4">
        <h3 class="text-lg flex-[1_2_100%] text-surface-200">Detalles</h3>

        <div class="w-full flex justify-center flex-wrap  gap-6 rounded-sm p-6 border">
          <Panel toggleable v-for="(detail, idx) in editFormData.order.order_details" :key="idx"
            v-if="hasSelectedOrderType" class="w-auto">
            <template #toggleicon="data">
              <i :class="['pi', data.collapsed ? 'pi-chevron-down' : 'pi-chevron-up']"></i>
            </template>
            <template #header="data">
              <span class="font-bold">Detalle #{{ idx + 1 }}</span>
              <Button v-if="!data.collapsed" icon="pi pi-trash" severity="danger" variant="outlined" text
                @click="() => removeTemporalDetail(idx)" />
            </template>

            <div class="flex flex-col gap-4 py-4">
              <!-- Campo: DETALLE_PRODUCTO -->
              <div class="flex flex-col flex-[1_2_100%] gap-y-2">
                <InputGroup>
                  <FloatLabel variant="in">
                    <AutoComplete showClear dropdown ref="detailProductAutoCompletes" id="detail_product"
                      v-model="detail.product" :suggestions="filteredProducts" @change="(e) => searchProduct(e)"
                      optionLabel="search_alias" optionValue="id" @option-select="(e) => handleOptionSelect(e, idx)"
                      emptySearchMessage="No se encontraron sugerencias." :invalid="!!errors[`detail${idx}_product`]"
                      />
                    <label for="detail_product">PRODUCTO (codigo)</label>
                  </FloatLabel>
                </InputGroup>
                <Message v-if="errors[`detail${idx}_product`]" severity="error" variant="simple" size="large"
                  class="p-error">
                  {{
                    errors[`detail${idx}_product`] }}</Message>
              </div>

              <template v-if="detail.product && detail.product.hasOwnProperty('code')">
                <!-- Campo: DETALLE_CANTIDAD_PRODUCTO -->
                <div class="flex flex-col flex-[1_2_100%] gap-y-2">
                  <InputGroup>
                    <FloatLabel variant="in">
                      <InputNumber id="detail_quantity" v-model="detail.quantity"
                        :invalid="!!errors[`detail${idx}_quantity`]" showButtons buttonLayout="horizontal" :step="5"
                        :min="0" :max="(isSaleOrder) ? detail.product.current_stock : null">
                        <template #incrementbuttonicon>
                          <span class="pi pi-plus" />
                        </template>
                        <template #decrementbuttonicon>
                          <span class="pi pi-minus" />
                        </template>
                      </InputNumber>
                      <label for="detail_quantity">CANTIDAD</label>
                    </FloatLabel>
                  </InputGroup>
                  <Message v-if="detail.product && !errors[`detail${idx}_quantity`]" size="large" severity="secondary"
                    variant="simple">
                    Stock previo: {{ detail.product.current_stock }}</Message>
                  <Message v-if="errors[`detail${idx}_quantity`]" severity="error" variant="simple" size="large"
                    class="p-error">{{
                      errors[`detail${idx}_quantity`] }}</Message>
                </div>

                <!-- Campo: DETALLE_PRECIO_PRODUCTO -->
                <div class="flex flex-col flex-[1_2_100%] gap-y-2">
                  <InputGroup>
                    <FloatLabel variant="in">
                      <InputNumber id="detail_unit_price" v-model="detail.unit_price" prefix="$"
                        :invalid="!!errors[`detail${idx}_unit_price`]" :min="0" />
                      <label for="detail_unit_price">PRECIO {{ (isSaleOrder) ? 'DE VENTA' : 'DE COMPRA' }}</label>
                    </FloatLabel>
                  </InputGroup>

                  <Message v-if="detail.product && isSaleOrder" size="large" severity="secondary" variant="simple">
                    Marcado con un: {{ detail.product.profit_percentage }}%
                  </Message>
                  <Message v-if="errors[`detail${idx}_unit_price`]" severity="error" variant="simple" size="large"
                    class="p-error">{{
                      errors[`detail${idx}_unit_price`] }}</Message>
                </div>

                <!-- Campo: DETALLE_PORCENTAJE_PRODUCTO -->
                <div class="flex flex-col flex-[1_2_100%] gap-y-2">
                  <InputGroup>
                    <FloatLabel variant="in">
                      <InputNumber id="detail_percentage_applied" v-model="detail.percentage_applied" suffix="%"
                        :invalid="!!errors[`detail${idx}_percentage_applied`]" :min="1" :max="500" />
                      <label for="selected_percentage_applied">{{ (isSaleOrder) ? 'DESCUENTO' : 'GANANCIA' }}
                        (%)</label>
                    </FloatLabel>
                  </InputGroup>

                  <Message v-if="errors[`detail${idx}_percentage_applied`]" severity="error" variant="simple"
                    size="large" class="p-error">{{ errors[`detail${idx}_percentage_applied`] }}</Message>
                </div>

                <Fieldset v-if="hasFilledDetailFields(idx)">
                  <template #legend>
                    <div class="flex items-center pl-2">
                      <i class="pi pi-info-circle" style="font-size: 1rem"></i>
                      <span v-if="isSaleOrder" class="font-bold p-2"> Subtotales</span>
                      <span v-else class="font-bold p-2"> Precio venta sugerido</span>
                    </div>
                  </template>

                  <template v-if="isSaleOrder">
                    <div class="flex flex-col gap-2">
                      <Message severity="secondary">Unidad <b>(x1)</b>: {{
                        formatToCurrency(getSaleSubtotalByQuantity(idx,
                          1))
                        }}</Message>
                      <Message severity="warn" v-if="detail.quantity > 1">Cantidad <b>(x{{ detail.quantity }})</b>: {{
                        formatToCurrency(getSaleSubtotalByQuantity(idx, detail.quantity)) }}</Message>
                    </div>
                  </template>

                  <template v-else>
                    <Message>Unidad (x1): {{ formatToCurrency(getSuggestedSalePrice(idx)) }}</Message>
                  </template>
                </Fieldset>
              </template>
            </div>
          </Panel>

          <Button class="w-3/4" label="Agregar detalle" icon="pi pi-plus" @click="addTemporalDetail"
            :disabled="!hasSelectedOrderType" severity="contrast" />

          <Message v-if="errors.order_details" severity="error" variant="simple" size="large">{{ errors.order_details }}
          </Message>
        </div>
      </div>

      <div class="w-full flex flex-wrap gap-4">
        <h3 class="text-lg flex-[1_2_100%] text-surface-200">Adicionales</h3>

        <!-- Campo: Ajuste (+/-)-->
        <div class="flex flex-col flex-[1_2_200px] gap-y-2">
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-sliders-h"></i>
            </InputGroupAddon>
            <FloatLabel variant="in">
              <InputNumber id="adjustment_amount" v-model="editFormData.order.adjustment_amount" prefix="$"
                :invalid="!!errors.adjustment_amount" />
              <label for="adjustment_amount">AJUSTE (+/-)</label>
            </FloatLabel>
          </InputGroup>
          <Message v-if="errors.adjustment_amount" severity="error" variant="simple" size="large" class="p-error">{{
            errors.adjustment_amount }}</Message>
        </div>

        <!-- Campo: Notas -->
        <div class="flex flex-col flex-[1_2_200px] gap-y-2">
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-clipboard"></i>
            </InputGroupAddon>
            <FloatLabel variant="in">
              <Textarea id="notes" v-model="editFormData.order.notes" :invalid="!!errors.notes" style="resize: none" />
              <label for="notes">NOTAS (opcional)</label>
            </FloatLabel>

          </InputGroup>
          <Message v-if="errors.notes" severity="error" variant="simple" size="small" class="p-error">{{ errors.notes }}
          </Message>
        </div>
      </div>

      <Message severity="warn" size="large" icon="pi pi-dollar" v-if="isSaleOrder && getSaleApproximateTotalNet !== 0">
        <template v-if="editFormData.order.adjustment_amount !== 0">
          <small><i>*AJUSTE APLICADO*</i></small>
          <br>
        </template>
        Total neto: <b>{{ formatToCurrency(getSaleApproximateTotalNet) }}</b>
      </Message>

      <Message severity="error" v-if="error">{{ error }}</Message>

      <!-- Botones de acción -->
      <div class="w-full flex justify-around">
        <Button label="Cancelar" severity="secondary" outlined @click="handleCancel" />
        <Button label="Guardar" icon="pi pi-check" @click="handleSubmit" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, toRaw, useTemplateRef, watch } from 'vue';
import { useCrudApi } from '../../composables/useCrudApi.js'
import { useToast } from 'primevue';

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

const toast = useToast();


const props = defineProps({
  recordData: {
    type: Object,
    required: true
  }
});


// Eventos emitidos
const emit = defineEmits(['finish', 'close']);

onMounted(async () => {
  await fetchEdit(props.recordData.id);

  if (!errorEditForm.value) {
    filteredContacts.value = [...editFormData.value.contacts];
  } else {
    console.error('Error al obtener los datos para editar un pedido: ', errorEditForm.value);
    toast.add({ severity: 'error', closable: true, summary: errorEditForm.value });
    emit('close')
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

  for (let idx = 0; idx < editFormData.value.order.order_details.length; idx++) {
    const detail = editFormData.value.order.order_details[idx];

    if(!detail.product.hasOwnProperty('code')){
      errors.value[`detail${idx}_product`] = `El producto es requerido`;
      isValid = false;
      continue
    } else {
      if (!detail.quantity || detail.quantity <= 0) {
        errors.value[`detail${idx}_quantity`] = `La cantidad debe ser mayor a 0`;
        isValid = false;
      }

      if (detail.unit_price < 0) {
        errors.value[`detail${idx}_price`] = `El precio no puede ser negativo`;
        isValid = false;
      }
    }
  }

  return isValid;
};

// Maneja el envío del formulario
const handleSubmit = async () => {
  if (validateForm()) {

    const { contact, adjustment_amount, notes, order_details } = toRaw(editFormData.value.order)

    const contactComeFromSuggesteds = contact && contact.hasOwnProperty('id')
    const contactKey = (contactComeFromSuggesteds)
      ? 'id_contact'
      : 'new_contact_name'

    const orderWithChanges = {
      // id_contact: contact.id,
      [contactKey]: (contactComeFromSuggesteds) ? contact.id : contact,
      adjustment_amount,
      notes,
      order_details: order_details.map(({ product, quantity, unit_price, percentage_applied }) => ({
        id_product: product.id,
        quantity,
        unit_price,
        percentage_applied
      }))
    }

    // console.log('Datos a enviar:', props.recordData.id, orderWithChanges);
    const updatedOrder = await updateItem(props.recordData.id, orderWithChanges)

    if (!error.value && editedOrder.value) {
      emit('finish', updatedOrder);
    } else {
      console.error('Error al editar el pedido:', error.value);
      return
    }
  } else {
    toast.add({ severity: 'error', life: 3500, summary: 'Error al validar', detail: 'Revise los campos invalidos.' });
  }
};

// Maneja la cancelación
const handleCancel = () => {
  emit('close');
};

const filteredContacts = ref([]);
const searchContact = (event) => {
  if (event.query && event.query.hasOwnProperty('company_name')) return

  if (!event.query || !event.query.trim().length) {
    filteredContacts.value = [...editFormData.value.contacts];
  } else {
    filteredContacts.value = editFormData.value.contacts.filter((contact) => {
      return contact.search_alias.toLowerCase().includes(event.query.toLowerCase());
    });
  }
}

const filteredProducts = ref([]);
const searchProduct = (event) => {
  if(event.value === null){
    filteredProducts.value = (isSaleOrder.value) 
                                ? editFormData.value.products.filter(product => product.current_stock > 0)
                                : [...editFormData.value.products]
    return
  }

  if(event.value && event.value.hasOwnProperty('search_alias')) return

  filteredProducts.value = editFormData.value.products.filter((product) => {
    const includesText = product.search_alias.toLowerCase().includes(event.value.toLowerCase())
    
    return (isSaleOrder.value)
      ? includesText && product.current_stock > 0
      : includesText;
  });
}

const handleChangeOrderType = (e) => {
  if (e.value.name === 'Venta') {
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

  if (isSaleOrder.value) {
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
  // console.log('Seleccion de sugerencia', e, idx);
  const detail = editFormData.value.order.order_details[idx]
  detail.unit_price = (isSaleOrder.value) ? e.value.sale_price : e.value.buy_price;
  detail.percentage_applied = (isSaleOrder.value) ? 0 : e.value.profit_percentage;
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
  if (!isSaleOrder.value) return 0;
  return (parseInt(detail.unit_price * discountMultiplier(detail)).toFixed(0) * quantity);
}


const getSuggestedSalePrice = (idx) => {
  const { unit_price, percentage_applied } = editFormData.value.order.order_details[idx];
  return parseInt((unit_price * (1 + percentage_applied / 100))).toFixed(0)
}

const formatToCurrency = (amount) => {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", currencyDisplay: "symbol", minimumFractionDigits: 0 }).format(amount);
}

const getSaleApproximateTotalNet = computed(() => {
  if (!isSaleOrder.value) return 0;

  let total = 0;
  editFormData.value.order.order_details.forEach((detail, idx) => {
    if (!hasFilledDetailFields(idx)) return
    total += parseInt(detail.unit_price * discountMultiplier(detail)).toFixed(0) * detail.quantity;
  });

  return total + editFormData.value.order.adjustment_amount;
})


watch(() => editFormData.order_details, (newDetails) => {
  const isAlreadyAdded = (product) => editFormData.value.order_details.some(detail => detail.product && detail.product.id === product.id);

  if (isSaleOrder.value) {
    filteredProducts.value = editFormData.value.products.filter(product => product.current_stock > 0 && !isAlreadyAdded(product));
  } else {
    filteredProducts.value = editFormData.value.products.filter(product => !isAlreadyAdded(product));
  }

  detailProductAutoCompletesRefs.value?.forEach(ref => {
    ref.overlayVisible = false
  })
}, { deep: true });
</script>

<style scoped></style>