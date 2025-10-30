<!-- ProductUpdateForm.vue -->
<!-- Formulario para editar un producto existente -->
<template>
  <div class="product-update-form">
    <div class="form-content">
      <!-- Campo: Nombre del producto -->
      <div class="field">
        <label for="name" class="required">Nombre del producto</label>
        <InputText
          id="name"
          v-model="formData.name"
          placeholder="Ingrese el nombre"
          :class="{ 'p-invalid': errors.name }"
        />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
      </div>

      <!-- Campo: categoria -->
      <div class="field">
        <label for="category">Categoria</label>
        <AutoComplete id="category" v-model="formData.category" dropdown :suggestions="categories" placeholder="Escribi o buscala"/>
        <small v-if="errors.category" class="p-error">{{ errors.category }}</small>
      </div>

      <!-- Campo: Precio de COMPRA-->
      <div class="field">
        <label for="buy_price" class="required">Precio de COMPRA</label>
        <InputNumber
          id="buy_price"
          v-model="formData.buy_price"
          mode="currency"
          currency="ARS"
          locale="es-AR"
          placeholder="0.00"
          :class="{ 'p-invalid': errors.buy_price }"
        />
        <small v-if="errors.buy_price" class="p-error">{{ errors.buy_price }}</small>
      </div>

      <!-- Campo: ganancia -->
      <div class="field">
        <label for="profit_percentage">Ganancia (%)</label>
        <InputNumber
          id="profit_percentage"
          v-model="formData.profit_percentage"
          mode="decimal"
          suffix="%"
          locale="es-AR"
          placeholder="Minimo 1.1 (10%)"
          :min="1.1"
          :maxFractionDigits="2"
          :class="{ 'p-invalid': errors.profit_percentage }"
        />
        <small v-if="errors.profit_percentage" class="p-error">{{ errors.profit_percentage }}</small>
      </div>

      <!-- Campo: precio de venta -->
      <div class="field">
        <label for="sale_price" class="required">Precio de VENTA</label>
        <InputNumber
          id="sale_price"
          v-model="formData.sale_price"
          mode="currency"
          currency="ARS"
          locale="es-AR"
          placeholder="0.00"
          :class="{ 'p-invalid': errors.sale_price }"
        />
        <small v-if="errors.sale_price" class="p-error">{{ errors.sale_price }}</small>
      </div>

      <!-- Campo: stock actual -->
      <div class="field">
        <label for="current_stock" class="required">Stock actual</label>
        <InputNumber
          id="current_stock"
          v-model="formData.current_stock"
          locale="es-AR"
          placeholder="1, 10, 1.000"
          :min="0"
          :class="{ 'p-invalid': errors.current_stock }"
        />
        <small v-if="errors.current_stock" class="p-error">{{ errors.current_stock }}</small>
      </div>

      <!-- Campo: Alerta minimo de stock -->
      <div class="field">
        <label for="min_stock_alert">Alerta minimo de stock</label>
        <InputNumber
          id="min_stock_alert"
          v-model="formData.min_stock_alert"
          locale="es-AR"
          placeholder="1, 5, 15"
          :min="2"
          :class="{ 'p-invalid': errors.min_stock_alert }"
        />
        <small v-if="errors.min_stock_alert" class="p-error">{{ errors.min_stock_alert }}</small>
      </div>

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
        label="Actualizar"
        icon="pi pi-check"
        @click="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue';
import { useCrudApi } from '../../composables/useCrudApi.js'

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

const categories = ref([]);
onMounted(async() => {
  await fetchFilters();

  if(!error.value && filters.value.categories.length > 0){
    categories.value = filters.value.categories.map(({name}) => name);
  } else {
    categories.value = [];
  }
})

// Estado del formulario (inicializado con los datos del registro)
const formData = reactive({
  id: props.recordData.id || null,
  name: props.recordData.name || '',
  buy_price: parseFloat(props.recordData.buy_price) || 0.00,
  profit_percentage: parseFloat(props.recordData.profit_percentage).toFixed(2) || 1.4,
  sale_price: parseFloat(props.recordData.sale_price) || 0.00,
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

  // Validar precio compra (requerido y mayor a 0)
  if (!formData.buy_price || formData.buy_price <= 0) {
    errors.value.buy_price = 'El precio compra debe ser mayor a 0';
    isValid = false;
  }

  // Validar porcentaje de ganancia (requerido y mayor a 0)
  if (!formData.profit_percentage || formData.profit_percentage < 1.1) {
    errors.value.profit_percentage = 'El porcentaje de ganancia debe ser mayor a 1.1 (10%)';
    isValid = false;
  }

  // Validar precio venta(requerido y mayor a 0)
  if (!formData.sale_price || formData.sale_price <= 0) {
    errors.value.sale_price = 'El precio venta debe ser mayor a 0';
    isValid = false;
  }

  // Validar precio (requerido y mayor a 0)
  if (formData.current_stock === null || formData.current_stock < 0) {
    errors.value.current_stock = 'El stock debe ser igual o mayor a 0';
    isValid = false;
  }

  // Validar precio (requerido y mayor a 0)
  if (!formData.min_stock_alert || formData.min_stock_alert <= 0) {
    errors.value.min_stock_alert = 'El alerta de stock minimo debe ser igual o mayor a 1';
    isValid = false;
  }

  // Validar categoria (requerido)
  if (!formData.category || formData.category.trim() === '') {
    formData.category = 'Varios';
  }

  return isValid;
};

// Maneja el envío del formulario
const handleSubmit = async() => {
  if (validateForm()) {
    const updatedProduct = await updateItem(formData.id, formData)

    if(!error.value && data.value){
      emit('finish', updatedProduct);
    } else {
      console.error('Error al actualizar el producto:', error.value);
      return
    }
  }
};

// Maneja la cancelación
const handleCancel = () => {
  emit('close');
};

const calculateSalePrice = () => {
    formData.sale_price = parseFloat((formData.buy_price * formData.profit_percentage).toFixed(2));
}

watch( () => formData.buy_price, calculateSalePrice );
watch( () => formData.profit_percentage, calculateSalePrice );
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