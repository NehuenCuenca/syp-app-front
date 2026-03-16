<!-- ProductUpdateForm.vue -->
<!-- Formulario para editar un producto existente -->
<template>
  <div class="product-edit-form">
    <div class="flex flex-col gap-6 p-4">

      <!-- ==================== SECCIÓN IDENTIFICACIÓN ==================== -->
      <section class="form-section">
        <h3 class="section-title">
          <i class="pi pi-tag mr-2"></i>
          Identificación
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Nombre -->
          <div class="form-field">
            <label for="name" class="field-label required">
              Nombre del Producto
            </label>

            <InputText
              id="name"
              v-model="formData.name"
              class="w-full"
              :invalid="!!errors.name"
            />

            <small v-if="errors.name" class="field-error">
              {{ errors.name }}
            </small>
          </div>

          <!-- Categoría -->
          <div class="form-field">
            <label for="category" class="field-label">
              Categoría
            </label>

            <Select
              id="category"
              v-model="formData.category"
              :options="categories"
              option-label="search_alias"
              option-value="name"
              show-clear
              filter
              class="w-full"
              :invalid="!!errors.category"
            />

            <small v-if="errors.category" class="field-error">
              {{ errors.category }}
            </small>
          </div>

        </div>
      </section>

      <!-- ==================== SECCIÓN PRECIOS ==================== -->
      <section class="form-section">
        <h3 class="section-title">
          <i class="pi pi-dollar mr-2"></i>
          Precios y Ganancia
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Precio Compra -->
          <div class="form-field">
            <label for="buy_price" class="field-label required">
              Precio de Compra
            </label>

            <InputNumber
              id="buy_price"
              v-model="formData.buy_price"
              mode="currency"
              currency="ARS"
              locale="es-AR"
              :min="0"
              :max-fraction-digits="0"
              class="w-full"
              :invalid="!!errors.buy_price"
            />

            <small v-if="errors.buy_price" class="field-error">
              {{ errors.buy_price }}
            </small>
          </div>

          <!-- Ganancia -->
          <div class="form-field">
            <label for="profit_percentage" class="field-label required">
              Ganancia (%)
            </label>

            <InputNumber
              id="profit_percentage"
              v-model="formData.profit_percentage"
              suffix="%"
              :min="0"
              :max="500"
              :max-fraction-digits="2"
              class="w-full"
              :invalid="!!errors.profit_percentage"
            />

            <small v-if="errors.profit_percentage" class="field-error">
              {{ errors.profit_percentage }}
            </small>
          </div>

          <!-- Precio Venta -->
          <div class="form-field md:col-span-2">
            <label for="sale_price" class="field-label required">
              Precio de Venta
            </label>

            <InputNumber
              id="sale_price"
              v-model="formData.sale_price"
              mode="currency"
              currency="ARS"
              locale="es-AR"
              :min="0"
              :max-fraction-digits="0"
              class="w-full"
              :invalid="!!errors.sale_price"
            />

            <small v-if="errors.sale_price" class="field-error">
              {{ errors.sale_price }}
            </small>
          </div>

        </div>
      </section>

      <!-- ==================== SECCIÓN STOCK ==================== -->
      <section class="form-section">
        <h3 class="section-title">
          <i class="pi pi-box mr-2"></i>
          Inventario
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Stock actual -->
          <div class="form-field">
            <label for="current_stock" class="field-label required">
              Stock Actual
            </label>

            <InputNumber
              id="current_stock"
              v-model="formData.current_stock"
              show-buttons
              button-layout="vertical"
              :step="1"
              :min="0"
              :max="999999"
              class="w-full"
              :invalid="!!errors.current_stock"
            >
              <template #incrementbuttonicon>
                <i class="pi pi-plus"></i>
              </template>

              <template #decrementbuttonicon>
                <i class="pi pi-minus"></i>
              </template>
            </InputNumber>

            <small v-if="errors.current_stock" class="field-error">
              {{ errors.current_stock }}
            </small>
          </div>

          <!-- Alerta stock -->
          <div class="form-field">
            <label for="min_stock_alert" class="field-label required">
              Alerta de Stock Bajo
            </label>

            <InputNumber
              id="min_stock_alert"
              v-model="formData.min_stock_alert"
              show-buttons
              button-layout="vertical"
              :step="1"
              :min="1"
              :max="1000"
              class="w-full"
              :invalid="!!errors.min_stock_alert"
            >
              <template #incrementbuttonicon>
                <i class="pi pi-plus"></i>
              </template>

              <template #decrementbuttonicon>
                <i class="pi pi-minus"></i>
              </template>
            </InputNumber>

            <small v-if="errors.min_stock_alert" class="field-error">
              {{ errors.min_stock_alert }}
            </small>
          </div>

        </div>
      </section>

      <!-- ==================== ERROR GLOBAL ==================== -->
      <Message v-if="error" severity="error" :closable="true" @close="error = null">
        <div class="flex flex-col gap-2">
          <strong>Error al actualizar producto</strong>
          <span>{{ error }}</span>
        </div>
      </Message>

      <!-- ==================== BOTONES ==================== -->
      <div class="flex justify-end gap-3 pt-4 border-t">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="handleCancel"
        />

        <Button
          label="Actualizar Producto"
          icon="pi pi-check"
          severity="success"
          @click="handleSubmit"
          :disabled="loading"
        />
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


// Estado del formulario (inicializado con los datos del registro)
const formData = reactive({
  id: props.recordData.id || null,
  name: props.recordData.name || '',
  buy_price: parseInt(props.recordData.buy_price) || 0,
  profit_percentage: parseInt(props.recordData.profit_percentage).toFixed(0) || 1,
  sale_price: parseInt(props.recordData.sale_price) || 0,
  current_stock: props.recordData.current_stock || 10000,
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
  if (formData.current_stock < 0) {
    errors.value.current_stock = 'El stock inicial debe ser igual o mayor a 0';
    isValid = false;
  }

  // Validar alerta de stock (requerido y mayor a 0)
  if (formData.min_stock_alert < 0) {
    errors.value.min_stock_alert = 'El alerta de stock minimo debe ser igual o mayor a 0';
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
      toast.add({
        severity: 'success',
        summary: 'Producto actualizado',
        detail: 'El producto se actualizó exitosamente',
        life: 3000
      });
      emit('finish', updatedProduct);
    } else {
      console.error('Error al actualizar el producto:', error.value);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.value || 'No se pudo actualizar el producto',
        life: 5000
      });
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
@reference "../../style.css";

.product-create-form {
  @apply w-full;
}

/* Form Section */
.form-section {
  @apply dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6;
}

.section-title {
  @apply text-xl font-semibold text-white mb-4;
}

/* Form Field */
.form-field {
  @apply flex flex-col gap-2;
}

.field-label {
  @apply text-lg font-medium text-gray-300;
}

.field-label.required::after {
  content: ' *';
  @apply text-red-500;
}

.field-error {
  @apply text-sm text-red-400;
}

.field-hint {
  @apply text-sm text-gray-400;
}
</style>