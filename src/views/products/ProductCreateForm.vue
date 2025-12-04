<!-- ProductCreateForm.vue -->
<!-- Formulario para crear un nuevo producto -->
<template>
  <div class="product-create-form">
    <div class="form-content">
      <!-- Campo: Nombre del producto -->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-th-large"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <InputText id="name" v-model="formData.name" :class="{ 'p-invalid': errors.name }"/>
          <label for="name">NOMBRE DE PRODUCTO</label>
        </FloatLabel>
        <Message v-if="errors.name" severity="error" variant="simple" size="small" class="p-error">{{ errors.name }}</Message>
      </InputGroup>

      <!-- Campo: categoria -->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-tags"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <AutoComplete showClear id="category" v-model="formData.category" dropdown :suggestions="categories" @complete="searchCategory" optionLabel="search_alias" optionValue="name" @item-select="(e) => formData.category = e.value.name" emptySearchMessage="No se encontraron sugerencias."/>
          <label for="category">CATEGORIA</label>
        </FloatLabel>
        <Message v-if="errors.category" severity="error" variant="simple" size="small" class="p-error">{{ errors.category }}</Message>
      </InputGroup>

      <!-- Campo: Precio de COMPRA-->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-dollar"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <InputNumber id="buy_price" v-model="formData.buy_price"
          prefix="$" :class="{ 'p-invalid': errors.buy_price }"
          :min="0"
        />
          <label for="buy_price">PRECIO DE COMPRA</label>
        </FloatLabel>
        <Message v-if="errors.buy_price" severity="error" variant="simple" size="small" class="p-error">{{ errors.buy_price }}</Message>
      </InputGroup>

      <!-- Campo: ganancia -->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-percentage"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <InputNumber id="profit_percentage" v-model="formData.profit_percentage"
          suffix="%" :class="{ 'p-invalid': errors.profit_percentage }"
          :min="1" />
          <label for="profit_percentage">GANANCIA (%)</label>
        </FloatLabel>
        <Message v-if="errors.profit_percentage" severity="error" variant="simple" size="small" class="p-error">{{ errors.profit_percentage }}</Message>
      </InputGroup>

      <!-- Campo: precio de venta -->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-dollar"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <InputNumber id="sale_price" v-model="formData.sale_price"
            prefix="$" :class="{ 'p-invalid': errors.sale_price }"
            :min="0" />
          <label for="sale_price">PRECIO DE VENTA</label>
        </FloatLabel>
        <Message v-if="errors.sale_price" severity="error" variant="simple" size="small" class="p-error">{{ errors.sale_price }}</Message>
      </InputGroup>

      <!-- Campo: stock inicial -->
      <InputGroup>
        <FloatLabel variant="in">
          <InputNumber id="current_stock" v-model="formData.current_stock"
          :class="{ 'p-invalid': errors.current_stock }" showButtons
          buttonLayout="horizontal" :step="5"
          :min="1" 
          >
            <template #incrementbuttonicon>
                <span class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
                <span class="pi pi-minus" />
            </template>
          </InputNumber>
          <label for="current_stock">STOCK INICIAL</label>
        </FloatLabel>
        <Message v-if="errors.current_stock" severity="error" variant="simple" size="small" class="p-error">{{ errors.current_stock }}</Message>
      </InputGroup>

      <!-- Campo: Alerta minimo de stock -->
      <InputGroup>
        <FloatLabel variant="in">
          <InputNumber id="min_stock_alert" v-model="formData.min_stock_alert"
          :class="{ 'p-invalid': errors.min_stock_alert }" showButtons
          buttonLayout="horizontal" :step="5"
          :min="1" 
          >
            <template #incrementbuttonicon>
                <span class="pi pi-plus" />
            </template>
            <template #decrementbuttonicon>
                <span class="pi pi-minus" />
            </template>
          </InputNumber>
          <label for="min_stock_alert">ALERTA DE STOCK BAJO</label>
        </FloatLabel>
        <Message v-if="errors.min_stock_alert" severity="error" variant="simple" size="small" class="p-error">{{ errors.min_stock_alert }}</Message>
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
import { onMounted, reactive, ref, watch } from 'vue';
import { useCrudApi } from '../../composables/useCrudApi.js'

const {
  data,
  filters,
  loading,
  error,
  fetchFilters,
  createItem,
} = useCrudApi();

// Eventos emitidos
const emit = defineEmits(['finish', 'close']);

const categories = ref([]);
onMounted(async() => {
  await fetchFilters();

  if(!error.value && filters.value.categories.length > 0){
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

// Estado del formulario
const formData = reactive({
  name: '',
  buy_price: 0,
  profit_percentage: 10,
  sale_price: 0,
  current_stock: 1,
  min_stock_alert: 10,
  category: ''
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
  if (!formData.min_stock_alert || formData.min_stock_alert <= 0) {
    errors.value.min_stock_alert = 'El alerta de stock minimo debe ser igual o mayor a 1';
    isValid = false;
  }

  // Validar categoria (requerido)
  if (!formData.category || (formData.category.trim() === '' && !formData.category.hasOwnProperty('name'))) {
    formData.category = 'Varios';
  }

  return isValid;
};

// Maneja el envío del formulario
const handleSubmit = async() => {
  if (validateForm()) {
    const productBeforeCreate = {
      ...formData, 
      category: (formData.category.hasOwnProperty('name')) ? formData.category.name : formData.category
    }
    const newProduct = await createItem(productBeforeCreate)

    if(!error.value && data.value){
      emit('finish', newProduct);
    } else {
      console.error('Error al crear el producto:', error.value);
      return
    }
  }
};

// Maneja la cancelación
const handleCancel = () => {
  emit('close');
};

const calculateSalePrice = () => {
    formData.sale_price = parseInt((formData.buy_price * (formData.profit_percentage/100 + 1)).toFixed(0));
}

watch( () => formData.buy_price, calculateSalePrice );
watch( () => formData.profit_percentage, calculateSalePrice );
</script>

<style scoped>
.product-create-form {
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
</style>