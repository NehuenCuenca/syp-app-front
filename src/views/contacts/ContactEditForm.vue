<!-- ContactUpdateForm.vue -->
<!-- Formulario para editar un contacto existente -->
<template>
  <div class="flex items-center flex-col gap-4">
    <div class="flex justify-between max-w-xl flex-wrap gap-6">
      <!-- Campo: Nombre negocio -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
              <i class="pi pi-user"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputText id="name" v-model="formData.name" :invalid="!!errors.name"/>
            <label for="name">NOMBRE</label>
          </FloatLabel>
        </InputGroup>
        <Message v-if="errors.name" severity="error" variant="simple" size="large" class="p-error">{{ errors.name }}</Message>
      </div>

      <!-- Campo: Telefono: -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
              <i class="pi pi-phone"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputText id="phone" v-model="formData.phone" :invalid="!!errors.phone"/>
            <label for="phone">TELEFONO</label>
          </FloatLabel>
        </InputGroup>
        <Message v-if="errors.phone" severity="error" variant="simple" size="large" class="p-error">{{ errors.phone }}</Message>
      </div>

      <!-- Campo: Email: -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
              <i class="pi pi-at"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputText id="email" v-model="formData.email" :invalid="!!errors.email"/>
            <label for="email">EMAIL</label>
          </FloatLabel>
        </InputGroup>
        <Message v-if="errors.email" severity="error" variant="simple" size="large" class="p-error">{{ errors.email }}</Message>
      </div>

      <!-- Campo: Direccion: -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
              <i class="pi pi-map-marker"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputText id="address" v-model="formData.address" :invalid="!!errors.address"/>
            <label for="address">DIRECCION</label>
          </FloatLabel>
        </InputGroup>
        <Message v-if="errors.address" severity="error" variant="simple" size="large" class="p-error">{{ errors.address }}</Message>
      </div>

      <!-- Campo: Tipo de contacto -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
              <i class="pi pi-users"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <Select v-model="formData.contact_type" :options="contactTypes" showClear :invalid="!!errors.contact_type" />
            <label for="contact_type">TIPO DE CONTACTO</label>
          </FloatLabel>
        </InputGroup>
        <Message v-if="errors.contact_type" severity="error" variant="simple" size="large" class="p-error">{{ errors.contact_type }}</Message>
      </div>

      <Message severity="error" v-if="error">{{ error }}</Message>

      <!-- Botones de acción -->
      <div class="w-full flex justify-around">
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
  name: props.recordData.name || '',
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
  if (!formData.name || formData.name.trim() === '') {
    errors.value.name = 'El nombre del negocio es requerido';
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

<style scoped></style>