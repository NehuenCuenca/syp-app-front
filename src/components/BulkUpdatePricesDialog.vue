// Bulkupdatepricesdialog.vue
<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :header="dialogTitle"
    :style="{ width: '600px' }"
    :closable="!isSubmitting"
    @hide="handleClose"
  >
    <!-- Loading State -->
    <div v-if="isLoadingFilters" class="flex justify-center items-center p-8">
      <ProgressSpinner />
    </div>

    <!-- Form Content -->
    <div v-else-if="filterData" class="flex flex-col gap-6">
      
      <!-- Selected Products Info -->
      <div class="info-banner">
        <i class="pi pi-info-circle mr-2"></i>
        <span>
          {{ selectedProducts.length }} producto{{ selectedProducts.length !== 1 ? 's' : '' }} seleccionado{{ selectedProducts.length !== 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Direction Selection -->
      <div class="form-field">
        <label class="field-label required">Dirección del cambio</label>
        <div class="flex gap-4">
          <div 
            v-for="direction in filterData.update_prices_directions" 
            :key="direction"
            class="flex items-center"
          >
            <RadioButton
              v-model="form.direction"
              :inputId="`direction_${direction}`"
              :value="direction"
              :invalid="!!fieldErrors.direction"
            />
            <label :for="`direction_${direction}`" class="ml-2 cursor-pointer">
              <i :class="getDirectionIcon(direction)" class="mr-1"></i>
              {{ capitalizeFirst(direction) }}
            </label>
          </div>
        </div>
        <small v-if="fieldErrors.direction" class="field-error">
          {{ fieldErrors.direction }}
        </small>
      </div>

      <!-- Value Inputs -->
      <div class="grid grid-cols-2 gap-4">
        
        <!-- Percentage Input -->
        <div class="form-field">
          <label for="percentage_value" class="field-label">
            Por Porcentaje
          </label>
          <InputNumber
            id="percentage_value"
            v-model="form.percentage_value"
            suffix="%"
            :min="1"
            :max="500"
            :disabled="form.mode !== 'porcentaje'"
            class="w-full"
            :invalid="!!fieldErrors.value && form.mode === 'porcentaje'"
            @input="() => { if (form.mode === 'porcentaje') calculatePreview() }"
          />
          <small v-if="fieldErrors.value && form.mode === 'porcentaje'" class="field-error">
            {{ fieldErrors.value }}
          </small>
          <small v-else class="field-hint">
            Entre 1% y 500%
          </small>
        </div>

        <!-- Absolute Price Input -->
        <div class="form-field">
          <label for="price_value" class="field-label">
            Por Valor Fijo
          </label>
          <InputNumber
            id="price_value"
            v-model="form.price_value"
            mode="currency"
            currency="ARS"
            locale="es-AR"
            :min="1"
            :max="50000"
            :max-fraction-digits="0"
            :disabled="form.mode !== 'precio'"
            class="w-full"
            :invalid="!!fieldErrors.value && form.mode === 'precio'"
            @input="() => { if (form.mode === 'precio') calculatePreview() }"
          />
          <small v-if="fieldErrors.value && form.mode === 'precio'" class="field-error">
            {{ fieldErrors.value }}
          </small>
          <small v-else class="field-hint">
            Entre $1 y $50.000
          </small>
        </div>
      </div>

      <!-- Mode Selection -->
      <div class="form-field">
        <label class="field-label required">Modo de actualización</label>
        <div class="flex gap-4">
          <div 
            v-for="mode in filterData.update_prices_modes" 
            :key="mode"
            class="flex items-center"
          >
            <RadioButton
              v-model="form.mode"
              :inputId="`mode_${mode}`"
              :value="mode"
              :invalid="!!fieldErrors.mode"
              @change="calculatePreview"
            />
            <label :for="`mode_${mode}`" class="ml-2 cursor-pointer">
              {{ getModeLabel(mode) }}
            </label>
          </div>
        </div>
        <small v-if="fieldErrors.mode" class="field-error">
          {{ fieldErrors.mode }}
        </small>
      </div>

      <!-- Preview Section -->
      <div v-if="preview.length > 0" class="preview-section">
        <h4 class="preview-title">
          <i class="pi pi-eye mr-2"></i>
          Vista Previa de Cambios
        </h4>

        <div class="preview-scroll">
          <div 
            v-for="item in preview" 
            :key="item.id"
            class="preview-item"
          >
            <div class="preview-product">
              <span class="font-medium text-black">{{ item.name }}</span>
              <span class="text-xs text-gray-500">{{ item.code }}</span>
            </div>
            <div class="preview-prices">
              <div class="price-change">
                <span class="old-price">{{ formatCurrency(item.oldPrice) }}</span>
                <i :class="form.direction === 'subir' ? 'pi pi-arrow-right' : 'pi pi-arrow-down'" class="arrow-icon"></i>
                <span class="new-price" :class="getPriceChangeClass(item.oldPrice, item.newPrice)">
                  {{ formatCurrency(item.newPrice) }}
                </span>
              </div>
              <span class="price-diff" :class="getPriceChangeClass(item.oldPrice, item.newPrice)">
                {{ formatPriceDiff(item.oldPrice, item.newPrice) }}
              </span>
            </div>
          </div>
        </div>

        <div class="preview-summary">
          <div class="summary-item">
            <span>Total de productos:</span>
            <span class="font-semibold">{{ preview.length }}</span>
          </div>
          <div class="summary-item">
            <span>Cambio promedio:</span>
            <span class="font-semibold" :class="getPriceChangeClass(0, averageChange)">
              {{ formatPriceDiff(0, averageChange) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Global Error Message -->
      <Message v-if="globalError" severity="error" :closable="true" @close="globalError = null">
        <div class="flex flex-col gap-2">
          <strong>Error al actualizar precios</strong>
          <span>{{ globalError }}</span>
        </div>
      </Message>
    </div>

    <!-- Footer Buttons -->
    <template #footer>
      <div class="flex justify-end gap-3">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="handleClose"
          :disabled="isSubmitting"
        />
        <Button
          label="Actualizar Precios"
          icon="pi pi-check"
          severity="success"
          @click="handleSubmit"
          :loading="isSubmitting"
          :disabled="!canSubmit || isSubmitting"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';

// PrimeVue Components
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import RadioButton from 'primevue/radiobutton';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';

// ==================== PROPS & EMITS ====================

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  selectedProducts: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:visible', 'success']);

// ==================== COMPOSABLES ====================

const toast = useToast();

// ==================== STATE ====================

const isLoadingFilters = ref(false);
const isSubmitting = ref(false);

const filterData = ref(null);

const form = reactive({
  direction: 'subir',
  percentage_value: 10,
  price_value: 100,
  mode: 'porcentaje'
});

const fieldErrors = reactive({});
const globalError = ref(null);

const preview = ref([]);

// ==================== COMPUTED ====================

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const dialogTitle = computed(() => {
  return `Actualizar Precios de ${props.selectedProducts.length} Producto${props.selectedProducts.length !== 1 ? 's' : ''}`;
});

const canSubmit = computed(() => {
  return props.selectedProducts.length > 0 &&
         form.direction &&
         form.mode &&
         preview.value.length > 0 &&
         !isSubmitting.value;
});

const averageChange = computed(() => {
  if (preview.value.length === 0) return 0;
  
  const totalChange = preview.value.reduce((sum, item) => {
    return sum + (item.newPrice - item.oldPrice);
  }, 0);
  
  return Math.round(totalChange / preview.value.length);
});

// ==================== WATCHERS ====================

watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadFilterData();
    calculatePreview();
  } else {
    resetForm();
  }
});

watch(() => form.direction, () => {
  calculatePreview();
});

// ==================== METHODS ====================

/**
 * Load filter data from API
 */
async function loadFilterData() {
  if (filterData.value) {
    // Already loaded
    calculatePreview();
    return;
  }

  isLoadingFilters.value = true;
  
  try {
    const response = await axios.get(`${axios.defaults.baseURL}/products/filters`);
    
    if (response.data.success) {
      filterData.value = response.data.data;
    } else {
      throw new Error(response.data.message || 'Error al cargar filtros');
    }
  } catch (err) {
    console.error('Error loading filters:', err);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos necesarios',
      life: 5000
    });
    handleClose();
  } finally {
    isLoadingFilters.value = false;
  }
}

/**
 * Calculate preview of price changes
 */
function calculatePreview() {
  if (props.selectedProducts.length === 0) {
    preview.value = [];
    return;
  }

  const value = form.mode === 'porcentaje' ? form.percentage_value : form.price_value;
  
  if (!value || value <= 0) {
    preview.value = [];
    return;
  }

  preview.value = props.selectedProducts.map(product => {
    const oldPrice = product.buy_price;
    let delta = 0;

    if (form.mode === 'porcentaje') {
      delta = Math.round(oldPrice * (value / 100));
    } else {
      delta = value;
    }

    let newPrice;
    if (form.direction === 'subir') {
      newPrice = oldPrice + delta;
    } else {
      newPrice = Math.max(1, oldPrice - delta);
    }

    return {
      id: product.id,
      code: product.code,
      name: product.name,
      oldPrice,
      newPrice
    };
  });
}

/**
 * Validate form
 */
function validateForm() {
  // Clear previous errors
  Object.keys(fieldErrors).forEach(key => delete fieldErrors[key]);
  globalError.value = null;
  
  let isValid = true;

  // Validate products
  if (props.selectedProducts.length === 0) {
    globalError.value = 'Debe seleccionar al menos un producto';
    isValid = false;
  }

  // Validate direction
  if (!form.direction || !['subir', 'bajar'].includes(form.direction)) {
    fieldErrors.direction = 'Debe seleccionar una dirección válida';
    isValid = false;
  }

  // Validate mode
  if (!form.mode || !['porcentaje', 'precio'].includes(form.mode)) {
    fieldErrors.mode = 'Debe seleccionar un modo válido';
    isValid = false;
  }

  // Validate value
  const value = form.mode === 'porcentaje' ? form.percentage_value : form.price_value;
  
  if (!value || value <= 0) {
    fieldErrors.value = 'El valor debe ser mayor a 0';
    isValid = false;
  }

  if (form.mode === 'porcentaje') {
    if (value < 1 || value > 500) {
      fieldErrors.value = 'El porcentaje debe estar entre 1% y 500%';
      isValid = false;
    }
  } else {
    if (value < 1 || value > 50000) {
      fieldErrors.value = 'El precio debe estar entre $1 y $50.000';
      isValid = false;
    }
  }

  return isValid;
}

/**
 * Build payload for API
 */
function buildPayload() {
  const value = form.mode === 'porcentaje' ? form.percentage_value : form.price_value;

  return {
    products_ids: props.selectedProducts.map(p => p.id),
    mode: form.mode,
    value: Math.round(value),
    direction: form.direction
  };
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

  isSubmitting.value = true;
  globalError.value = null;

  try {
    const payload = buildPayload();
    
    const response = await axios.post(
      `${axios.defaults.baseURL}/products/update-prices`,
      payload
    );

    if (response.data.success) {
      toast.add({
        severity: 'success',
        summary: 'Precios actualizados',
        detail: `Se actualizaron ${response.data.data.length} producto${response.data.data.length !== 1 ? 's' : ''} exitosamente`,
        life: 3000
      });

      emit('success', response.data.data);
      handleClose();
    } else {
      throw new Error(response.data.message || 'Error al actualizar precios');
    }
  } catch (err) {
    console.error('Error updating prices:', err);

    // Handle validation errors from backend
    if (err.response?.data?.errors) {
      const backendErrors = err.response.data.errors;
      
      Object.keys(backendErrors).forEach(key => {
        if (key === 'products_ids') {
          globalError.value = backendErrors[key][0];
        } else if (key === 'mode') {
          fieldErrors.mode = backendErrors[key][0];
        } else if (key === 'value') {
          fieldErrors.value = backendErrors[key][0];
        } else if (key === 'direction') {
          fieldErrors.direction = backendErrors[key][0];
        } else {
          globalError.value = backendErrors[key][0];
        }
      });

      toast.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: err.response.data.message || 'Los datos proporcionados no son válidos',
        life: 5000
      });
    } else {
      globalError.value = err.response?.data?.message || err.message || 'Error al actualizar precios';
      
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: globalError.value,
        life: 5000
      });
    }
  } finally {
    isSubmitting.value = false;
  }
}

/**
 * Handle dialog close
 */
function handleClose() {
  if (!isSubmitting.value) {
    isVisible.value = false;
  }
}

/**
 * Reset form to initial state
 */
function resetForm() {
  form.direction = 'subir';
  form.percentage_value = 10;
  form.price_value = 100;
  form.mode = 'porcentaje';
  
  preview.value = [];
  
  Object.keys(fieldErrors).forEach(key => delete fieldErrors[key]);
  globalError.value = null;
}

/**
 * Get direction icon
 */
function getDirectionIcon(direction) {
  return direction === 'subir' ? 'pi pi-arrow-up' : 'pi pi-arrow-down';
}

/**
 * Get mode label
 */
function getModeLabel(mode) {
  return mode === 'porcentaje' ? 'Por Porcentaje (%)' : 'Por Valor Fijo (ARS)';
}

/**
 * Get price change class
 */
function getPriceChangeClass(oldPrice, newPrice) {
  if (newPrice > oldPrice) return 'text-green-600 dark:text-green-400';
  if (newPrice < oldPrice) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
}

/**
 * Format currency
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0);
}

/**
 * Format price difference
 */
function formatPriceDiff(oldPrice, newPrice) {
  const diff = newPrice - oldPrice;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${formatCurrency(diff)}`;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
</script>

<style>
@reference "../style.css";

/* Info Banner */
.info-banner {
  @apply flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300;
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
  @apply text-sm text-red-600 dark:text-red-400;
}

.field-hint {
  @apply text-xs  text-gray-400;
}

/* Preview Section */
.preview-section {
  @apply border  border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800;
}

.preview-title {
  @apply text-sm font-semibold  text-white mb-3 flex items-center;
}

.preview-scroll {
  @apply max-h-64 overflow-y-auto space-y-2 mb-3;
}

.preview-item {
  @apply flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700;
}

.preview-product {
  @apply flex flex-col;
}

.preview-prices {
  @apply flex flex-col items-end gap-1;
}

.price-change {
  @apply flex items-center gap-2;
}

.old-price {
  @apply text-sm text-gray-500 dark:text-gray-400 line-through;
}

.arrow-icon {
  @apply text-xs text-gray-400;
}

.new-price {
  @apply text-sm font-semibold;
}

.price-diff {
  @apply text-xs font-medium;
}

/* Preview Summary */
.preview-summary {
  @apply flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700 text-black;
}

.summary-item {
  @apply flex gap-2 text-sm;
}
</style>