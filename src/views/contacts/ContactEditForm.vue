<!-- ContactUpdateForm.vue -->
<!-- Formulario para editar un contacto existente -->
<template>
  <div class="contact-update-form">
    <div class="form-content">
      <!-- Campo: Nombre negocio -->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-shop"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <InputText id="company_name" v-model="formData.company_name" :class="{ 'p-invalid': errors.company_name }"/>
          <label for="company_name">NEGOCIO</label>
        </FloatLabel>
        <Message v-if="errors.company_name" severity="error" variant="simple" size="small" class="p-error">{{ errors.company_name }}</Message>
      </InputGroup>

      <!-- Campo: Nombre titular -->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-user"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <InputText id="contact_name" v-model="formData.contact_name" :class="{ 'p-invalid': errors.contact_name }"/>
          <label for="contact_name">PROPIETARIO</label>
        </FloatLabel>
        <Message v-if="errors.contact_name" severity="error" variant="simple" size="small" class="p-error">{{ errors.contact_name }}</Message>
      </InputGroup>

      <!-- Campo: Telefono: -->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-phone"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <InputText id="phone" v-model="formData.phone" :class="{ 'p-invalid': errors.phone }"/>
          <label for="phone">TELEFONO</label>
        </FloatLabel>
        <Message v-if="errors.phone" severity="error" variant="simple" size="small" class="p-error">{{ errors.phone }}</Message>
      </InputGroup>

      <!-- Campo: Email: -->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-at"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <InputText id="email" v-model="formData.email" :class="{ 'p-invalid': errors.email }"/>
          <label for="email">EMAIL</label>
        </FloatLabel>
        <Message v-if="errors.email" severity="error" variant="simple" size="small" class="p-error">{{ errors.email }}</Message>
      </InputGroup>

      <!-- Campo: Direccion: -->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-map-marker"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <InputText id="address" v-model="formData.address" :class="{ 'p-invalid': errors.address }"/>
          <label for="address">DIRECCION</label>
        </FloatLabel>
        <Message v-if="errors.address" severity="error" variant="simple" size="small" class="p-error">{{ errors.address }}</Message>
      </InputGroup>

      <!-- Campo: Tipo de contacto -->
      <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-users"></i>
        </InputGroupAddon>
        <FloatLabel variant="in">
          <Select v-model="formData.contact_type" :options="contactTypes" showClear />
          <label for="contact_type">TIPO DE CONTACTO</label>
        </FloatLabel>
        <Message v-if="errors.contact_type" severity="error" variant="simple" size="small" class="p-error">{{ errors.contact_type }}</Message>
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
import { reactive, ref, onMounted } from 'vue';
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

const contactTypes = ref([]);
onMounted(async() => {
  await fetchFilters();

  if(!error.value && filters.value.contact_types.length > 0){
    contactTypes.value = filters.value.contact_types
  } else {
    contactTypes.value = [];
  }
})

// Estado del formulario (inicializado con los datos del registro)
const formData = reactive({
  id: props.recordData.id || '',
  company_name: props.recordData.company_name || '',
  contact_name: props.recordData.contact_name || '',
  email: props.recordData.email || '',
  phone: props.recordData.phone || '',
  address: props.recordData.address || '',
  contact_type: props.recordData.contact_type || '',
});

// Estado de errores de validación
const errors = ref({});

// Validación del formulario
const validateForm = () => {
  errors.value = {};
  let isValid = true;

  // Validar nombre (requerido)
  if (!formData.company_name || formData.company_name.trim() === '') {
    errors.value.company_name = 'El nombre del negocio es requerido';
    isValid = false;
  }
  
  if (!formData.contact_type || formData.contact_type.trim() === '') {
    errors.value.contact_type = 'El tipo de contacto es requerido';
    isValid = false;
  }

  return isValid;
};

// Maneja el envío del formulario
const handleSubmit = async() => {
  if (validateForm()) {
    const updatedContact = await updateItem(formData.id, formData)

    if(!error.value && data.value){
      emit('finish', updatedContact);
    } else {
      console.error('Error al actualizar el contacto:', error.value);
      return
    }
  }
};

// Maneja la cancelación
const handleCancel = () => {
  emit('close');
};
</script>

<style scoped>
.contact-update-form {
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