<!-- Componente contenedor genérico para modales usando PrimeVue Dialog -->
<template>
  <Dialog
    :visible="visible"
    :header="headerTitle"
    :modal="true"
    :closable="true"
    :draggable="false"
    :style="{ width: '80vw' }"
    @update:visible="handleClose"
  >
    <!-- Slot para inyectar contenido dinámico -->
    <slot></slot>
  </Dialog>
</template>

<script setup>

// Props del componente
const props = defineProps({
  // Control de visibilidad del modal
  visible: {
    type: Boolean,
    required: true,
    default: false
  },
  // Título que se muestra en el header del modal
  headerTitle: {
    type: String,
    required: true,
    default: ''
  }
});

// Eventos emitidos
const emit = defineEmits(['close']);

// Maneja el cierre del modal
const handleClose = (value) => {
  if (!value) {
    emit('close');
  }
};
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>