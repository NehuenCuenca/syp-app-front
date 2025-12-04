<template>
  <div class="universal-card" :class="isDeleted ? 'universal-card_deleted':''">
    <!-- Texto terciario -->
    <div class="card-tertiary">
      {{ tertiaryText }}
    </div>

    <!-- Contenedor del texto primario y menú -->
    <div class="card-header">
      <div class="card-primary" :style="{ color: primaryColor }" :title="primaryText">
        {{ truncateText(primaryText, 25) }}
      </div>

      <!-- Botón del menú -->
      <Button 
        icon="pi pi-ellipsis-v" 
        :size="'large'"
        text 
        rounded
        class="menu-button"
        @click="toggleMenu"
        aria-label="Opciones"
      />
      
      <!-- Menu Popup -->
      <Menu 
        ref="menu" 
        :model="menuItems" 
        :popup="true"
        class="custom-menu"
      />
    </div>

    <!-- Texto secundario -->
    <div v-if="secondaryText && !isProductCard" class="card-secondary" :style="{ color: secondaryColor }" :title="secondaryText">
      {{ truncateText(secondaryText, 35) }}
    </div>
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
  secondaryColor: {
    type: String,
    default: 'var(--bg-color-1)'
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
  background-color: var(--txt-color-1);
  border-radius: 8px;
  padding: 10px;
  position: relative;
  min-height: 100px;
}

.universal-card_deleted{
  background-color: var(--p-surface-400);
}

.card-tertiary {
  font-size: clamp(14px, 1.5vw, 16px);
  font-weight: bold;
  color: var(--bg-color-1);
  display: flex;
  gap: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* gap: 10px; */
}

.card-primary {
  font-size: clamp(var(--body-lg-fs), 2.5vw, var(--subtitle-fs));
  font-weight: bold;
  color: var(--bg-color-3);
  flex: 1;
  word-break: break-word;
}

.menu-button {
  color: var(--bg-color-1) !important;
  flex-shrink: 0;
}

.menu-button:hover {
  background-color: rgba(51, 52, 70, 0.1) !important;
}

.card-secondary {
  font-size: clamp(18px, 1.4vw, 24px);
  font-weight: normal;
  color: var(--bg-color-1);
}

/* Estilos personalizados para el menú */
:deep(.custom-menu) {
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
}
</style>