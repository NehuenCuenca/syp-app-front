<!-- Componente contenedor genérico para modales usando PrimeVue Dialog -->
<template>
  <Dialog
    :visible="visible"
    :header="headerTitle"
    :modal="true"
    :closable="true"
    :draggable="false"
    class="sm:min-w-sreen md:min-w-[80vw] lg:min-w-[60vw] overflow-hidden"
    @update:visible="handleClose"
    maximizable 
    ref="dialog" 
  >
    <!-- Slot para inyectar contenido dinámico -->
    <slot></slot>
  </Dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue';

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

const dialog = ref();

onMounted(() => {
  // init dialog maximizable
  if (!dialog.value.maximized) {
    dialog.value.maximize();
  }
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>