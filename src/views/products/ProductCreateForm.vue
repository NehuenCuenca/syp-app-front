<!-- ProductCreateForm.vue -->
<!-- Formulario para crear un nuevo producto -->
<template>
  <div class="product-create-form ">
    <!-- Form Content -->
    <div class="flex flex-col gap-6 p-4">
      
      <!-- ==================== SECCIÓN IDENTIFICACIÓN ==================== -->
      <section class="form-section">
        <h3 class="section-title">
          <i class="pi pi-tag mr-2"></i>
          Identificación
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Nombre del producto -->
          <div class="form-field">
            <label for="name" class="field-label required">
              Nombre del Producto
            </label>
            <InputText 
              id="name" 
              v-model="formData.name" 
              :invalid="!!errors.name"
              placeholder="Ej: Aspirina 500mg x 20 unidades"
              class="w-full"
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
              placeholder="Seleccione una categoría"
              show-clear
              filter
              class="w-full"
              :invalid="!!errors.category"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center gap-2">
                  <i class="pi pi-tags"></i>
                  <span>{{ slotProps.value }}</span>
                </div>
                <span v-else>{{ slotProps.placeholder }}</span>
              </template>
            </Select>
            <small v-if="errors.category" class="field-error">
              {{ errors.category }}
            </small>
          </div>
        </div>
      </section>

      <!-- ==================== SECCIÓN PRECIOS Y GANANCIA ==================== -->
      <section class="form-section">
        <h3 class="section-title">
          <i class="pi pi-dollar mr-2"></i>
          Precios y Ganancia
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Precio de Compra -->
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
              @input="calculateSalePrice"
            />
            <small v-if="errors.buy_price" class="field-error">
              {{ errors.buy_price }}
            </small>
            <small v-else class="field-hint">
              Precio al que compra el producto
            </small>
          </div>

          <!-- Ganancia (%) -->
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
              @input="calculateSalePrice"
            />
            <small v-if="errors.profit_percentage" class="field-error">
              {{ errors.profit_percentage }}
            </small>
            <small v-else class="field-hint">
              Porcentaje de ganancia sobre el precio de compra
            </small>
          </div>

          <!-- Precio de Venta -->
          <div class="form-field  md:col-span-2">
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
          
          <!-- Stock Inicial -->
          <div class="form-field">
            <label for="current_stock" class="field-label required">
              Stock Inicial
            </label>
            <InputNumber
              id="current_stock"
              v-model="formData.current_stock"
              show-buttons
              button-layout="vertical"
              :step="1"
              :min="0"
              :max="999999"
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

          <!-- Alerta de Stock Bajo -->
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

      <!-- ==================== MENSAJES DE ERROR GLOBALES ==================== -->
      <Message v-if="error" severity="error" :closable="true" @close="error = null">
        <div class="flex flex-col gap-2">
          <strong>Error al crear producto</strong>
          <span>{{ error }}</span>
        </div>
      </Message>

      <!-- ==================== BOTONES DE ACCIÓN ==================== -->
      <div class="flex justify-end gap-3 pt-4 border-t">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="handleCancel"
        />
        <Button
          label="Guardar Producto"
          icon="pi pi-check"
          severity="success"
          @click="handleSubmit"
          ref="submitButton"
          :disabled="loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useCrudApi } from '../../composables/useCrudApi.js'
import { useToast } from 'primevue';

// PrimeVue Components
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Message from 'primevue/message';

const {
  data,
  filters,
  loading,
  error,
  fetchFilters,
  createItem,
} = useCrudApi();

const toast = useToast();

// Eventos emitidos
const emit = defineEmits(['finish', 'close']);

const categories = ref([]);
onMounted(async () => {
  await fetchFilters();

  if (!error.value && filters.value.categories.length > 0) {
    categories.value = [...filters.value.categories];
  } else {
    categories.value = [];
  }
})

// Estado del formulario
const formData = reactive({
  name: '',
  category: '',
  buy_price: 0,
  profit_percentage: 0,
  sale_price: 0,
  current_stock: 10000,
  min_stock_alert: 5
});

// Estado de errores de validación
const errors = reactive({});

/**
 * Calculate sale price based on buy price and profit percentage
 */
function calculateSalePrice() {
  if (formData.buy_price > 0 && formData.profit_percentage >= 0) {
    formData.sale_price = Math.round(
      formData.buy_price * (1 + (formData.profit_percentage / 100))
    );
  }
}

/**
 * Validate form before submission
 */
function validateForm() {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key]);

  let isValid = true;

  // Validate name
  if (!formData.name || formData.name.trim().length === 0) {
    errors.name = 'El nombre del producto es obligatorio';
    isValid = false;
  }

  // Validate buy_price
  if (formData.buy_price === null || formData.buy_price < 0) {
    errors.buy_price = 'El precio de compra debe ser mayor o igual a 0';
    isValid = false;
  }

  // Validate profit_percentage
  if (formData.profit_percentage === null || formData.profit_percentage < 0) {
    errors.profit_percentage = 'El porcentaje de ganancia debe ser mayor o igual a 0';
    isValid = false;
  }

  // Validate sale_price
  if (formData.sale_price === null || formData.sale_price < 0) {
    errors.sale_price = 'El precio de venta debe ser mayor o igual a 0';
    isValid = false;
  }

  // Validate current_stock
  if (formData.current_stock === null || formData.current_stock < 0) {
    errors.current_stock = 'El stock inicial debe ser mayor o igual a 0';
    isValid = false;
  }

  // Validate min_stock_alert
  if (formData.min_stock_alert === null || formData.min_stock_alert < 1) {
    errors.min_stock_alert = 'La alerta de stock debe ser mayor o igual a 1';
    isValid = false;
  }

  return isValid;
}

/**
 * Handle form submission
 */
async function handleSubmit() {
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Validación fallida',
      detail: 'Por favor corrija los errores en el formulario',
      life: 5000
    });
    return;
  }

  const newProduct = await createItem(formData);

  if (!error.value && newProduct) {
    toast.add({
      severity: 'success',
      summary: 'Producto creado',
      detail: `El producto "${formData.name}" se creó exitosamente`,
      life: 3000
    });
    emit('finish', newProduct);
  } else {
    console.error('Error al crear el producto:', error.value);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.value || 'No se pudo crear el producto',
      life: 5000
    });
  }
}

/**
 * Handle form cancellation
 */
function handleCancel() {
  emit('close');
}

// Watch for changes in buy_price and profit_percentage to auto-calculate sale_price
watch(
  () => [formData.buy_price, formData.profit_percentage],
  () => {
    calculateSalePrice();
  }
);
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
  @apply text-xl font-semibold text-white mb-4 ;
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