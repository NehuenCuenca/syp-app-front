<!-- ContactCreateForm.vue -->
<!-- Formulario para crear un nuevo contacto -->
<template>
  <div class="contact-create-form ">
    <!-- Form Content -->
    <div class="flex flex-col gap-6 p-4">
   
      <!-- ==================== SECCIÓN IDENTIFICACIÓN ==================== -->
      <section class="form-section">
        <h3 class="section-title">
          <i class="pi pi-id-card mr-2"></i>
          Identificación
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Nombre del contacto -->
          <div class="form-field">
            <label for="name" class="field-label required">
              Nombre del Contacto
            </label>
            <InputText 
              id="name" 
              v-model="formData.name" 
              :invalid="!!errors.name"
              placeholder="Ej: Kiosco Almafuerte"
              class="w-full"
            />
            <small v-if="errors.name" class="field-error">
              {{ errors.name }}
            </small>
          </div>

          <!-- Categoría -->
          <div class="form-field">
            <label for="contact_type" class="field-label required">
              Tipo de contacto
            </label>
            <Select
              id="contact_type"
              v-model="formData.contact_type"
              :options="contactTypes"
              placeholder="Seleccione un cliente o proveedor"
              show-clear
              class="w-full"
              :invalid="!!errors.contact_type"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center gap-2">
                  <i class="pi pi-users"></i>
                  <span>{{ slotProps.value }}</span>
                </div>
                <span v-else>{{ slotProps.placeholder }}</span>
              </template>
            </Select>
            <small v-if="errors.contact_type" class="field-error">
              {{ errors.contact_type }}
            </small>
          </div>
        </div>
      </section>

      <!-- ==================== SECCIÓN DATOS SECUNDARIOS ==================== -->
      <section class="form-section">
        <h3 class="section-title">
          <i class="pi pi-objects-column mr-2"></i>
          Datos secundarios
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- telefono del contacto -->
          <div class="form-field">
            <label for="phone" class="field-label">
              Telefono
            </label>
            <InputText id="phone" v-model="formData.phone" :invalid="!!errors.phone" />
            <small v-if="errors.phone" class="field-error">
              {{ errors.phone }}
            </small>
          </div>
          
          <!-- email del contacto -->
          <div class="form-field">
            <label for="email" class="field-label">
              Email
            </label>
            <InputText id="email" v-model="formData.email" :invalid="!!errors.email" />
            <small v-if="errors.email" class="field-error">
              {{ errors.email }}
            </small>
          </div>

          <!-- direccion del contacto -->
          <div class="form-field">
            <label for="address" class="field-label">
              Dirección
            </label>
            <InputText id="address" v-model="formData.address" :invalid="!!errors.email" />
            <small v-if="errors.address" class="field-error">
              {{ errors.address }}
            </small>
          </div>
        </div>
      </section>
    </div>

    <Message severity="error" v-if="error">{{ error }}</Message>

    <div class="w-full flex justify-around">
      <Button label="Cancelar" severity="secondary" outlined @click="handleCancel" />

      <Button label="Guardar" icon="pi pi-check" @click="handleSubmit" ref="submitButton" :disabled="loading" />
    </div>
  </div>

  
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useCrudApi } from '../../composables/useCrudApi.js'
import { useToast } from 'primevue';

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

const contactTypes = ref([]);
onMounted(async () => {
  await fetchFilters();

  if (!error.value && filters.value.contact_types.length > 0) {
    contactTypes.value = filters.value.contact_types
  } else {
    contactTypes.value = [];
  }
})

// Estado del formulario
const formData = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  contact_type: 'cliente',
});

// Estado de errores de validación
const errors = ref({});

// Validación del formulario
const validateForm = () => {
  errors.value = {};
  let isValid = true;

  // Validar nombre (requerido)
  if (!formData.name || formData.name.trim() === '') {
    errors.value.name = 'El nombre del contacto es requerido';
    isValid = false;
  }

  if (!formData.contact_type || formData.contact_type.trim() === '') {
    errors.value.contact_type = 'El tipo de contacto es requerido';
    isValid = false;
  }

  return isValid;
};

// Maneja el envío del formulario
const handleSubmit = async () => {
  if (validateForm()) {
    const newContact = await createItem(formData)

    if (!error.value && data.value) {
      toast.add({
        severity: 'success',
        summary: 'Contacto creado',
        detail: 'El contacto se creó exitosamente',
        life: 3000
      });
      emit('finish', newContact);
    } else {
      console.error('Error al crear el contacto:', error.value);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.value || 'No se pudo crear el contacto',
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
</script>

<style scoped>
@reference "../../style.css";

.contact-create-form {
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