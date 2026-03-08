<!-- ProductUpdateForm.vue -->
<!-- Formulario para editar un producto existente -->
<template>
  <div class="flex items-center flex-col gap-4">
    <div class="flex justify-between max-w-xl flex-wrap gap-10">
      <div class="w-full flex flex-wrap gap-4">
        <h3 class="text-lg flex-[1_2_100%] text-surface-200">Identificacion</h3>
        <!-- Campo: Nombre del producto -->
        <div class="flex flex-col flex-[1_2_200px] gap-y-2">
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-th-large"></i>
            </InputGroupAddon>
            <FloatLabel variant="in">
              <InputText id="name" v-model="formData.name" :invalid="!!errors.name" />
              <label for="name">NOMBRE DE PRODUCTO</label>
            </FloatLabel>
          </InputGroup>
          <Message v-if="errors.name" severity="error" variant="simple" size="large" class="p-error">{{ errors.name }}
          </Message>
        </div>

        <!-- Campo: categoria -->
        <div class="flex flex-col flex-[1_2_200px] gap-y-2">
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-tags"></i>
            </InputGroupAddon>
            <FloatLabel variant="in">
              <Select
                  v-model="formData.category"
                  :options="categories"
                  option-label="search_alias"
                  option-value="name"
                  class="w-full"
                  show-clear
                  filter
                  label="Categoria"
                />
              <label for="category">CATEGORIA</label>
            </FloatLabel>
          </InputGroup>
          <Message v-if="errors.category" severity="error" variant="simple" size="large" class="p-error">{{
            errors.category }}</Message>
        </div>
      </div>

      <div class="w-full flex flex-wrap gap-4">
        <h3 class="text-lg flex-[1_2_100%] text-surface-200">Precios y ganancia</h3>
        <!-- Campo: Precio de COMPRA-->
        <div class="flex flex-col flex-[1_2_200px] gap-y-2">
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-dollar"></i>
            </InputGroupAddon>
            <FloatLabel variant="in">
              <InputNumber id="buy_price" v-model="formData.buy_price" prefix="$" :invalid="!!errors.buy_price"
                :min="0" />
              <label for="buy_price">PRECIO DE COMPRA</label>
            </FloatLabel>
          </InputGroup>
          <Message v-if="errors.buy_price" severity="error" variant="simple" size="large" class="p-error">{{
            errors.buy_price }}</Message>
        </div>

        <!-- Campo: ganancia -->
        <div class="flex flex-col flex-[1_2_200px] gap-y-2">
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-percentage"></i>
            </InputGroupAddon>
            <FloatLabel variant="in">
              <InputNumber id="profit_percentage" v-model="formData.profit_percentage" suffix="%"
                :invalid="!!errors.profit_percentage" :min="1" />
              <label for="profit_percentage">GANANCIA (%)</label>
            </FloatLabel>
          </InputGroup>
          <Message v-if="errors.profit_percentage" severity="error" variant="simple" size="large" class="p-error">{{
            errors.profit_percentage }}</Message>
        </div>


        <!-- Campo: precio de venta -->
        <div class="flex flex-col flex-[1_2_200px] gap-y-2">
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-dollar"></i>
            </InputGroupAddon>
            <FloatLabel variant="in">
              <InputNumber id="sale_price" v-model="formData.sale_price" prefix="$" :invalid="!!errors.sale_price"
                :min="0" />
              <label for="sale_price">PRECIO DE VENTA</label>
            </FloatLabel>
          </InputGroup>
          <Message v-if="errors.sale_price" severity="error" variant="simple" size="large" class="p-error">{{
            errors.sale_price }}</Message>
        </div>
      </div>

      <div class="w-full flex flex-wrap gap-4">
        <h3 class="text-lg flex-[1_2_100%] text-surface-200">Stock</h3>
        <!-- Campo: stock actual -->
        <div class="flex flex-col flex-[1_2_200px] gap-y-2">
          <InputGroup>
            <FloatLabel variant="in">
              <InputNumber id="current_stock" v-model="formData.current_stock" :invalid="!!errors.current_stock"
                showButtons buttonLayout="horizontal" :step="5" :min="1">
                <template #incrementbuttonicon>
                  <span class="pi pi-plus" />
                </template>
                <template #decrementbuttonicon>
                  <span class="pi pi-minus" />
                </template>
              </InputNumber>
              <label for="current_stock">STOCK ACTUAL</label>
            </FloatLabel>
          </InputGroup>
          <Message v-if="errors.current_stock" severity="error" variant="simple" size="large" class="p-error">{{
            errors.current_stock }}</Message>
        </div>

        <!-- Campo: Alerta minimo de stock -->
        <div class="flex flex-col flex-[1_2_200px] gap-y-2">
          <InputGroup>
            <FloatLabel variant="in">
              <InputNumber id="min_stock_alert" v-model="formData.min_stock_alert" :invalid="!!errors.min_stock_alert"
                showButtons buttonLayout="horizontal" :step="5" :min="1">
                <template #incrementbuttonicon>
                  <span class="pi pi-plus" />
                </template>
                <template #decrementbuttonicon>
                  <span class="pi pi-minus" />
                </template>
              </InputNumber>
              <label for="min_stock_alert">ALERTA DE STOCK BAJO</label>
            </FloatLabel>
          </InputGroup>
          <Message v-if="errors.min_stock_alert" severity="error" variant="simple" size="large" class="p-error">{{
            errors.min_stock_alert }}</Message>
        </div>
      </div>

      <Message severity="error" v-if="error">{{ error }}</Message>

      <!-- Botones de acción -->
      <div class="w-full flex justify-around">
        <Button label="Cancelar" severity="secondary" outlined @click="handleCancel" />
        <Button label="Actualizar" icon="pi pi-check" @click="handleSubmit" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue';
import { useCrudApi } from '../../composables/useCrudApi.js'
import { useToast } from 'primevue';

// Props del componente
const props = defineProps({
  recordData: {
    type: Object,
    required: true
  }
});

// Eventos emitidos
const emit = defineEmits(['finish', 'close']);

const {
  data,
  filters,
  loading,
  error,
  fetchFilters,
  updateItem,
} = useCrudApi();

const toast = useToast();

const categories = ref([]);
onMounted(async () => {
  await fetchFilters();

  if (!error.value && filters.value.categories.length > 0) {
    categories.value = [...filters.value.categories];
  } else {
    categories.value = [];
  }
})

const searchCategory = (event) => {
  setTimeout(() => {
    if (!event.query.trim().length) {
      categories.value = [...filters.value.categories];
    } else {
      categories.value = filters.value.categories.filter((category) => {
        return category.search_alias.toLowerCase().includes(event.query.toLowerCase())
      });
    }
  }, 250);
}

// Estado del formulario (inicializado con los datos del registro)
const formData = reactive({
  id: props.recordData.id || null,
  name: props.recordData.name || '',
  buy_price: parseInt(props.recordData.buy_price) || 0,
  profit_percentage: parseInt(props.recordData.profit_percentage).toFixed(0) || 1,
  sale_price: parseInt(props.recordData.sale_price) || 0,
  current_stock: props.recordData.current_stock || 0,
  min_stock_alert: props.recordData.min_stock_alert || 10,
  category: props.recordData.category.name || ''
});

// Estado de errores de validación
const errors = ref({});

// Validación del formulario
const validateForm = () => {
  errors.value = {};
  let isValid = true;

  // Validar nombre (requerido)
  if (!formData.name || formData.name.trim() === '') {
    errors.value.name = 'El nombre es requerido';
    isValid = false;
  }

  /* if (!formData.category || formData.category.trim() === '') {
    errors.value.category = 'La categoria es requerida';
    isValid = false;
  } */

  // Validar precio compra (requerido y mayor a 0)
  if (!formData.buy_price || formData.buy_price <= 0) {
    errors.value.buy_price = 'El precio compra debe ser mayor a 0';
    isValid = false;
  }

  // Validar porcentaje de ganancia (requerido y mayor a 0)
  if (!formData.profit_percentage || formData.profit_percentage < 1) {
    errors.value.profit_percentage = 'El porcentaje de ganancia debe ser mayor a 1%)';
    isValid = false;
  }

  // Validar precio venta (requerido y mayor a 0)
  if (!formData.sale_price || formData.sale_price <= 0) {
    errors.value.sale_price = 'El precio venta debe ser mayor a 0';
    isValid = false;
  }

  // Validar precio venta (que sea mayor al precio de compra)
  if (formData.sale_price && formData.sale_price <= formData.buy_price) {
    errors.value.sale_price = 'El precio venta debe ser mayor al precio compra';
    isValid = false;
  }

  // Validar stock inicial (requerido y mayor a 0)
  if (formData.current_stock === null || formData.current_stock < 0) {
    errors.value.current_stock = 'El stock debe ser igual o mayor a 0';
    isValid = false;
  }

  // Validar alerta de stock (requerido y mayor a 0)
  if (!formData.min_stock_alert || formData.min_stock_alert <= 0) {
    errors.value.min_stock_alert = 'El alerta de stock minimo debe ser igual o mayor a 1';
    isValid = false;
  }

  // Si no escribe la categoria, se asigna a "Varios"
  if (!formData.category || formData.category.trim() === '') {
    formData.category = 'Varios';
  }

  return isValid;
};

// Maneja el envío del formulario
const handleSubmit = async () => {
  if (validateForm()) {
    const updatedProduct = await updateItem(formData.id, formData)

    if (!error.value && data.value) {
      emit('finish', updatedProduct);
    } else {
      console.error('Error al actualizar el producto:', error.value);
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

const calculateSalePrice = () => {
  formData.sale_price = parseInt((formData.buy_price * (formData.profit_percentage / 100 + 1)).toFixed(0));
}

watch(() => formData.buy_price, calculateSalePrice);
watch(() => formData.profit_percentage, calculateSalePrice);
</script>

<style scoped>
.product-update-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
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
</style>