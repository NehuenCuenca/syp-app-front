<!-- Componente genérico que determina qué formulario CRUD renderizar -->
<template>
  <BaseModal
    :visible="visible"
    :headerTitle="dynamicTitle"
    @close="handleClose"
  >
    <!-- Renderizado dinámico del componente CRUD según la acción -->
    <component
      :is="currentComponent"
      :recordData="recordData"
      @finish="handleFinish"
      @close="handleClose"
    />
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue';
import BaseModal from './BaseModal.vue';

// Props del componente
const props = defineProps({
  // Control de visibilidad del modal
  visible: {
    type: Boolean,
    required: true,
    default: false
  },
  // Acción CRUD: 'create' | 'read' | 'edit' | 'delete'
  action: {
    type: String,
    required: true,
    validator: (value) => ['create', 'read', 'edit', 'delete'].includes(value)
  },
  // Nombre del modelo (ej: 'producto', 'contacto')
  modelName: {
    type: String,
    required: true
  },
  // Datos del registro (usado en read, edit, delete)
  recordData: {
    type: Object,
    default: () => ({})
  },
  // Mapa de componentes CRUD del modelo
  componentMap: {
    type: Object,
    required: true,
    validator: (value) => {
      // return value.create && value.read && value.edit && value.delete;
      return Object.keys(value).every(key => ['create', 'read', 'edit', 'delete'].includes(key));
    }
  }
});

// Eventos emitidos
const emit = defineEmits(['close', 'finish']);

// Computed: Componente actual a renderizar según la acción
const currentComponent = computed(() => {
  return props.componentMap[props.action];
});

// Computed: Título dinámico según la acción y modelo
const dynamicTitle = computed(() => {
  const actionTitles = {
    create: `Creando ${props.modelName}`,
    read: `Viendo ${props.modelName}`,
    edit: `Editando ${props.modelName}`,
    delete: `Eliminando ${props.modelName}`
  };
  return actionTitles[props.action] || props.modelName;
});

// Maneja el cierre del modal
const handleClose = () => {
  emit('close');
};

// Maneja el envío de datos desde el formulario
const handleFinish = (data) => {
  emit('finish', data);
};
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>