<!-- ContactReadDetails.vue -->
<!-- Vista de solo lectura de los detalles de un contacto -->
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
            <InputText disabled id="name" v-model="recordData.name" />
            <label for="name">NOMBRE</label>
          </FloatLabel>
        </InputGroup>
      </div>

      <!-- Campo: Telefono: -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-phone"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputText disabled id="phone" v-model="recordData.phone" />
            <label for="phone">TELEFONO</label>
          </FloatLabel>
        </InputGroup>
      </div>


      <!-- Campo: Email: -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-at"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputText disabled id="email" v-model="recordData.email" />
            <label for="email">EMAIL</label>
          </FloatLabel>
        </InputGroup>
      </div>


      <!-- Campo: Direccion: -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-map-marker"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputText disabled id="address" v-model="recordData.address" />
            <label for="address">DIRECCION</label>
          </FloatLabel>
        </InputGroup>
      </div>

      <!-- Campo: Tipo de contacto -->
      <div class="flex flex-col flex-[1_2_200px] gap-y-2">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-users"></i>
          </InputGroupAddon>
          <FloatLabel variant="in">
            <InputText disabled v-model="recordData.contact_type" />
            <label for="contact_type">TIPO DE CONTACTO</label>
          </FloatLabel>
        </InputGroup>
      </div>

      <div class="w-full flex justify-around">
        <Button label="Cerrar" severity="primary" @click="handleClose" />
      </div>
    </div>
  </div>
</template>

<script setup>

// Props del componente
const props = defineProps({
  recordData: {
    type: Object,
    required: true
  }
});

// Eventos emitidos
const emit = defineEmits(['close']);

// Maneja el cierre
const handleClose = () => {
  emit('close');
};
</script>

<style scoped></style>