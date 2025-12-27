<!-- OrderCreateForm.vue -->
<!-- Formulario para crear un nuevo pedido -->
<template>
  <div class="flex items-center flex-col gap-4" v-if="createFormData">
    <div class="flex justify-center max-w-xl flex-wrap gap-10">
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <!-- Campo: Tipo de pedido -->
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-receipt"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <Select v-model="formData.order_type" :options="createFormData.order_types" optionLabel="name" showClear
              @change="handleChangeOrderType" :invalid="!!errors.order_type" />
            <label for="order_type">TIPO DE PEDIDO</label>
          </FloatLabel>
        </InputGroup>
        <Message v-if="errors.order_type" severity="error" variant="simple" size="large">{{
          errors.order_type }}</Message>
      </div>

      <!-- Campo: Contacto -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-user"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <AutoComplete showClear id="contact" v-model="formData.contact" dropdown :suggestions="filteredContacts"
              @complete="searchContact" optionLabel="search_alias" optionValue="id"
              emptySearchMessage="No se encontraron sugerencias." :invalid="!!errors.contact" :delay="150"
              dropdownClass="max-w-[150px]" />
            <label for="contact">CONTACTO</label>
          </FloatLabel>
        </InputGroup>
        <Message v-if="errors.contact" severity="error" variant="simple" size="large">{{ errors.contact
        }}</Message>
      </div>

      <div class="w-full flex justify-center flex-wrap gap-6 rounded-sm p-6 border">
        <Panel toggleable v-for="(detail, idx) in formData.order_details" :key="idx" v-if="hasSelectedOrderType"
          class="w-auto">
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
                  <AutoComplete showClear ref="detailProductAutoCompletes" id="detail_product" v-model="detail.product"
                    dropdown :suggestions="filteredProducts" @complete="searchProduct" optionLabel="search_alias"
                    optionValue="id" @option-select="(e) => handleOptionSelect(e, idx)"
                    emptySearchMessage="No se encontraron sugerencias." :invalid="!!errors[`detail${idx}_product`]" />
                  <label for="detail_product">PRODUCTO</label>
                </FloatLabel>
              </InputGroup>

              <Message v-if="errors[`detail${idx}_product`]" severity="error" variant="simple" size="large">{{
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
                  En stock: {{ detail.product.current_stock }}</Message>
                <Message v-else severity="error" variant="simple" size="large">{{
                  errors[`detail${idx}_quantity`] }}</Message>
              </div>


              <!-- Campo: DETALLE_PRECIO_PRODUCTO -->
              <div class="flex flex-col flex-[1_2_100%] gap-y-2">
                <InputGroup>
                  <FloatLabel variant="in">
                    <InputNumber id="detail_unit_price" v-model="detail.unit_price" prefix="$"
                      :invalid="!!errors[`detail${idx}_unit_price`]" :min="0" />
                    <label for="detail_unit_price">PRECIO {{ (isSaleOrder) ? 'DE VENTA' : 'DE COMPRA' }} (x
                      unidad)</label>
                  </FloatLabel>
                </InputGroup>

                <Message v-if="errors[`detail${idx}_unit_price`]" severity="error" variant="simple" size="large">{{
                  errors[`detail${idx}_unit_price`] }}</Message>
              </div>


              <!-- Campo: DETALLE_PORCENTAJE_PRODUCTO -->
              <div class="flex flex-col flex-[1_2_100%] gap-y-2">

                <InputGroup>
                  <FloatLabel variant="in">
                    <InputNumber id="selected_percentage_applied" v-model="detail.percentage_applied" suffix="%"
                      :invalid="!!errors[`detail${idx}_percentage_applied`]"
                      :min="(isSaleOrder && detail.product) ? 0 : 1"
                      :max="(isSaleOrder && detail.product) ? 100 : 500" />
                    <label for="selected_percentage_applied">{{ (isSaleOrder) ? 'DESCUENTO' : 'GANANCIA' }} (%)</label>
                  </FloatLabel>
                </InputGroup>

                <Message v-if="errors[`detail${idx}_percentage_applied`]" severity="error" variant="simple"
                  size="large">{{
                    errors[`detail${idx}_percentage_applied`] }}</Message>
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
                    <Message severity="secondary">Unidad <b>(x1)</b>: {{ formatToCurrency(getSaleSubtotalByQuantity(idx,
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
      </div>

      <!-- Campo: Ajuste (+/-)-->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-sliders-h"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputNumber id="adjustment_amount" v-model="formData.adjustment_amount" prefix="$"
              :invalid="!!errors.adjustment_amount" />
            <label for="adjustment_amount">AJUSTE (+/-)</label>
          </FloatLabel>
        </InputGroup>
        <Message v-if="errors.adjustment_amount" severity="error" variant="simple" size="large">{{
          errors.adjustment_amount }}</Message>
      </div>

      <!-- Campo: Notas -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-clipboard"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <Textarea id="notes" v-model="formData.notes" style="resize: none" :invalid="!!errors.notes" />
            <label for="notes">NOTAS (opcional)</label>
          </FloatLabel>

        </InputGroup>
        <Message v-if="errors.notes" severity="error" variant="simple" size="large">{{ errors.notes }}
        </Message>
      </div>

      <Message severity="warn" size="large" icon="pi pi-dollar" v-if="isSaleOrder && getSaleApproximateTotalNet !== 0">
        <template v-if="formData.adjustment_amount !== 0">
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
import { computed, onMounted, reactive, ref, useTemplateRef, watch } from 'vue';
import { useCrudApi } from '../../composables/useCrudApi.js'
import { useToast } from 'primevue';

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

const toast = useToast();

// Eventos emitidos
const emit = defineEmits(['finish', 'close']);

onMounted(async () => {
  await fetchCreate();

  if (!errorCreateForm.value) {
    filteredContacts.value = [...createFormData.value.contacts];
  } else {
    console.error('Error al obtener los datos para crear un pedido: ', errorCreateForm.value);
    toast.add({ severity: 'error', closable: true, summary: errorCreateForm.value });
    emit('close')
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
    if (detail.unit_price < 0) {
      errors.value[`detail${index}_price`] = `El precio no puede ser negativo`;
      isValid = false;
    }
  });

  return isValid;
};

// Maneja el envío del formulario
const handleSubmit = async () => {
  if (validateForm()) {
    const contactComeFromSuggesteds = formData.contact && formData.contact.hasOwnProperty('id')
    const contactKey = (contactComeFromSuggesteds)
                                    ? 'id_contact'
                                    : 'new_contact_name'
    const formDataToSend = {
      [contactKey]: (contactComeFromSuggesteds) ? formData.contact.id : formData.contact,
      id_movement_type: formData.order_type.id,
      notes: formData.notes,
      adjustment_amount: formData.adjustment_amount,
      order_details: formData.order_details.map(({ product, quantity, unit_price, percentage_applied }) => ({
        id_product: product.id,
        quantity, unit_price, percentage_applied,
      }))
    }
    // console.log('Datos a enviar:', formDataToSend);
    const createdOrder = await createItem(formDataToSend)

    if (!error.value && newOrder.value) {
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
  if (event.query && event.query.hasOwnProperty('company_name')) return

  if (!event.query || !event.query.trim().length) {
    filteredContacts.value = [...createFormData.value.contacts];
  } else {
    filteredContacts.value = createFormData.value.contacts.filter((contact) => {
      return contact.search_alias.toLowerCase().includes(event.query.toLowerCase());
    });
  }
}

const filteredProducts = ref([]);
const searchProduct = (event) => {
  const selectProductFromDropdown = event.query && event.query.hasOwnProperty('name')
  const autoCompleteIsEmpty = !event.query.trim().length
  if (selectProductFromDropdown || autoCompleteIsEmpty) return

  filteredProducts.value = createFormData.value.products.filter((product) => {
    return product.search_alias.toLowerCase().includes(event.query.toLowerCase());
  });
}


const handleChangeOrderType = (e) => {
  if (e.value === null) {
    console.log('Reiniciando los detalles');
    formData.order_details = [];
    return
  }

  const changeToSaleOrder = e.value.name === 'Venta'
  if (changeToSaleOrder) {
    filteredProducts.value = createFormData.value.products.filter(product => product.current_stock > 0);
  } else {
    filteredProducts.value = [...createFormData.value.products];
  }

  if (formData.order_details.length === 0) return
  for (const detail of formData.order_details) {
    if (!!detail.product) {
      detail.unit_price = (changeToSaleOrder) ? detail.product?.sale_price : detail.product?.buy_price
      detail.percentage_applied = (changeToSaleOrder) ? 0 : detail.product?.profit_percentage
    }
  }
}

const addTemporalDetail = () => {
  const detail = reactive({
    product: null,
    quantity: 0,
    unit_price: 0,
    percentage_applied: (isSaleOrder.value) ? 0 : 30
  });

  formData.order_details.push(detail)

  const isAlreadyAdded = (product) => formData.order_details.some(detail => detail.product && detail.product.id === product.id);

  if (isSaleOrder.value) {
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
  // console.log('Seleccion de sugerencia', e, idx);
  const detail = formData.order_details[idx]
  detail.unit_price = (isSaleOrder.value) ? e.value.sale_price : e.value.buy_price;
  detail.percentage_applied = (isSaleOrder.value) ? 0 : detail?.product.profit_percentage;
}

const hasFilledDetailFields = (idx) => {
  const detail = formData.order_details[idx];
  return detail && detail.product && detail.quantity > 0 && detail.unit_price >= 0 && detail.percentage_applied >= 0;
}

const discountMultiplier = (detail) => (detail.percentage_applied && detail.percentage_applied > 0)
  ? (1 - (detail.percentage_applied / 100))
  : 1;

const getSaleSubtotalByQuantity = (idx, quantity) => {
  const detail = formData.order_details[idx];
  if (!isSaleOrder.value) return 0;
  return (parseInt(detail.unit_price * discountMultiplier(detail)).toFixed(0) * quantity);
}

const getSuggestedSalePrice = (idx) => {
  const detail = formData.order_details[idx];
  return parseInt((detail.unit_price * (1 + detail.percentage_applied / 100))).toFixed(0)
}

const formatToCurrency = (amount) => {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", currencyDisplay: "symbol", minimumFractionDigits: 0 }).format(amount);
}

const getSaleApproximateTotalNet = computed(() => {
  if (!isSaleOrder.value) return 0;

  let total = 0;
  formData.order_details.forEach((detail) => {
    total += parseInt(detail.unit_price * discountMultiplier(detail)).toFixed(0) * detail.quantity;
  });

  return total + formData.adjustment_amount;
})

watch(() => formData.order_details, (newDetails) => {
  const isAlreadyAdded = (product) => formData.order_details.some(detail => detail.product && detail.product.id === product.id);

  if (isSaleOrder.value) {
    filteredProducts.value = createFormData.value.products.filter(product => product.current_stock > 0 && !isAlreadyAdded(product));
  } else {
    filteredProducts.value = createFormData.value.products.filter(product => !isAlreadyAdded(product));
  }

  detailProductAutoCompletesRefs.value?.forEach(ref => {
    ref.overlayVisible = false
  })
}, { deep: true });
</script>

<style scoped></style>