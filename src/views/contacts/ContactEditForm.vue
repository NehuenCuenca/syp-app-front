<!-- ContactUpdateForm.vue -->
<!-- Formulario para editar un contacto existente -->
<template>
  <div class="contact-update-form">
    <div class="form-content">
      <!-- Campo: Nombre negocio -->
      <div class="field">
        <label for="company_name" class="required">Negocio</label>
        <InputText
          id="company_name"
          v-model="formData.company_name"
          placeholder="Ej: Kiosquito La tortuga"
          :class="{ 'p-invalid': errors.company_name }"
        />
        <small v-if="errors.company_name" class="p-error">{{ errors.company_name }}</small>
      </div>

      <!-- Campo: Nombre titular -->
      <div class="field">
        <label for="contact_name" class="required">Titular</label>
        <InputText
          id="contact_name"
          v-model="formData.contact_name"
          placeholder="Ej: Juan Perez"
          :class="{ 'p-invalid': errors.contact_name }"
        />
        <small v-if="errors.contact_name" class="p-error">{{ errors.contact_name }}</small>
      </div>

      <!-- Campo: Telefono: -->
      <div class="field">
        <label for="phone">Telefono</label>
        <InputText
          id="phone"
          v-model="formData.phone"
          placeholder="Ej: 3446..."
          :class="{ 'p-invalid': errors.phone }"
        />
        <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
      </div>

      <!-- Campo: Email: -->
      <div class="field">
        <label for="email">Email</label>
        <InputText
          id="email"
          v-model="formData.email"
          placeholder="Ej: juan.perez123@gmail.com"
          :class="{ 'p-invalid': errors.email }"
        />
        <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
      </div>

      <!-- Campo: Direccion: -->
      <div class="field">
        <label for="address">Direccion</label>
        <InputText
          id="address"
          v-model="formData.address"
          placeholder="Ej: Calle Falsa 123"
          :class="{ 'p-invalid': errors.address }"
        />
        <small v-if="errors.address" class="p-error">{{ errors.address }}</small>
      </div>

      <!-- Campo: Tipo de contacto -->
      <div class="field">
        <label for="contact_type" class="required">Tipo de contacto</label>
        <Select v-model="formData.contact_type" :options="contactTypes" placeholder="Cliente o Proveedor" showClear />
        <small v-if="errors.contact_type" class="p-error">{{ errors.contact_type }}</small>
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
  if (!formData.contact_name || formData.contact_name.trim() === '') {
    errors.value.contact_name = 'El nombre del contacto es requerido';
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