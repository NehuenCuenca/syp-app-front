<template>
  <div class="bg-surface-100 p-3 radius rounded-lg flex flex-col justify-between gap-3 max-w-xs w-full min-h-28" 
  :class="{'bg-surface-400': isDeleted}">
  
    <!-- Contenedor del texto primario y menú -->
    <div class="flex justify-between items-start">
      <div class="flex flex-col justify-between items-start w-4/5">
        <!-- Texto terciario -->
        <p class="text-md md:text-lg font-bold text-surface-600 flex gap-3.5">
          {{ tertiaryText }}
        </p>
        <p class="text-2xl md:text-xl font-bold text-surface-800 flex-1 break-normal w-4/5" :style="{ color: primaryColor }" :title="primaryText">
          <!-- {{ truncateText(primaryText, 20) }} -->
            {{ primaryText }}
        </p>
      </div>

      <!-- Botón del menú -->
      <Button
        icon="pi pi-ellipsis-v" 
        :size="'large'" 
        @click="toggleMenu"
        aria-label="Opciones"
        severity="contrast" rounded 
      />
      
      <!-- Menu Popup -->
      <Menu 
        ref="menu" 
        :model="menuItems" 
        :popup="true"
      />
    </div>

    <!-- Texto secundario -->
    <p v-if="secondaryText && !isProductCard" class="text-lg text-surface-600" :title="secondaryText">
      {{ truncateText(secondaryText, 35) }}
    </p>
    <slot name="product-stock"></slot>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  // Textos
  primaryText: {
    type: String,
    required: true
  },
  secondaryText: {
    type: String,
    default: ''
  },
  tertiaryText: {
    type: [String, Number],
    default: ''
  },
  
  // Colores personalizados
  primaryColor: {
    type: String,
    default: 'var(--bg-color-3)'
  },
  
  // Tipo de card para determinar las opciones del menú
  cardType: {
    type: String,
    default: 'default', // 'producto', 'contacto', 'pedido', 'movimiento'
    validator: (value) => ['default', 'producto', 'contacto', 'pedido', 'movimiento'].includes(value)
  },

  isExportable: {
    type: Boolean,
    default: false
  },

  isDeleted: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['view', 'edit', 'delete', 'download', 'openOrder', 'restore']);

const menu = ref();

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Toggle del menú
const toggleMenu = (event) => {
  menu.value.toggle(event);
};

// Configuración del menú según el tipo de card
const menuItems = computed(() => {
  if (props.cardType === 'movimiento') {
    return [
      {
        label: 'Ver movimiento',
        icon: 'pi pi-eye',
        command: () => emit('view')
      },
      // {
      //   label: 'Abrir pedido',
      //   icon: 'pi pi-receipt',
      //   command: () => emit('openOrder')
      // }
    ];
  }

  if (props.isDeleted) {
    return [
      {
        label: 'Recuperar',
        icon: 'pi pi-refresh',
        command: () => emit('restore')
      },
    ];
  }

  const baseItems = [
    {
      label: getViewLabel(),
      icon: 'pi pi-eye',
      command: (e) => emit('view')
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => emit('edit')
    },
    {
      label: 'Borrar',
      icon: 'pi pi-trash',
      command: () => emit('delete')
    }
  ];

  // Agregar opción de descarga solo para pedidos
  if (props.cardType === 'pedido' && props.isExportable) {
    baseItems.push({
      label: 'Descargar',
      icon: 'pi pi-download',
      command: () => emit('download')
    });
  }

  return baseItems;
});

// Etiqueta del botón "Ver" según el tipo
const getViewLabel = () => {
  const labels = {
    producto: 'Ver producto',
    contacto: 'Ver contacto',
    pedido: 'Ver pedido',
    movimiento: 'Ver movimiento',
    default: 'Ver elemento'
  };
  return labels[props.cardType] || labels.default;
};

const isProductCard = computed(() => props.cardType === 'producto')
</script>

<style scoped>
.universal-card {
  /* position: relative; */
}

.universal-card_deleted{
  /* background-color: var(--p-surface-400); */
}

/* .menu-button:hover {
  background-color: rgba(51, 52, 70, 0.1) !important;
} */

/* Estilos personalizados para el menú */
/* :deep(.custom-menu) {
  background-color: var(--bg-color-3) !important;
  border: none !important;
  border-radius: 8px;
}

:deep(.custom-menu .p-menuitem-link) {
  color: var(--txt-color-1) !important;
  padding: 0.75rem 1rem;
}

:deep(.custom-menu .p-menuitem-link:hover) {
  background-color: rgba(234, 239, 239, 0.1) !important;
}

:deep(.custom-menu .p-menuitem-icon) {
  color: var(--txt-color-1) !important;
}

:deep(.custom-menu .p-menuitem-text) {
  color: var(--txt-color-1) !important;
} */
</style>