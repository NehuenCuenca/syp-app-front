<template>
  <div class="tab-layout">
    <!-- Header con título e icono -->
    <header class="tab-header">
      <i :class="['pi', iconClass]"></i>
      <h1 class="tab-title">{{ title }}</h1>
    </header>

    <!-- Sección de filtros -->
    <div class="filters-section">
      <div class="filters-left">
        <!-- Botón crear nuevo -->
        <Button label="Nuevo" size="large" icon="pi pi-plus" v-if="showCreateButton" @click="$emit('create')" class="btn-create"/>

        <!-- Buscador -->
        <IconField>
           <InputIcon class="pi pi-search" />
           <InputText placeholder="Buscador" :value="searchValue" @input="handleSearchInput"/>
        </IconField>
      </div>

      <!-- Filtros personalizados (slots) -->
      <div class="filters-right">
        <slot name="filter-1"></slot>
        <slot name="filter-2"></slot>
        <slot name="filter-3"></slot>
      </div>
    </div>

    <!-- Grid de tarjetas -->
    <div class="cards-grid">
      <slot name="cards">
        <!-- Placeholder si no hay contenido -->
        <div v-for="i in 9" :key="i" class="card-placeholder">
          <span>card</span>
        </div>
      </slot>
    </div>

    <!-- Paginación -->
    <Paginator
      v-model:first="offset"
      @page="onPageChange"
      :template="{
          '640px': 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
          '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
          default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink'
      }"
      currentPageReportTemplate="Página {currentPage}"
      :rows="props.itemsPerPage" 
      :totalRecords="props.totalItems"
      >
    </Paginator>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  iconClass: {
    type: String,
    default: 'pi-list'
  },
  showCreateButton: {
    type: Boolean,
    default: true
  },
  totalPages: {
    type: Number,
    default: 68
  },
  itemsPerPage: {
    type: Number,
    default: 9
  },
  totalItems: {
    type: Number,
    default: 0
  },
});

const emit = defineEmits(['create', 'filter-change', 'page-change', 'search']);

const route = useRoute();
const router = useRouter();

const searchValue = ref('');
const currentPage = ref(1);
const sortBy = ref('');
const sortDirection = ref('');

// Inicializar valores desde query params
onMounted(() => {
  searchValue.value = route.query.search || '';
  currentPage.value = parseInt(route.query.page) || 1;
  sortBy.value = route.query.sort_by || '';
  sortDirection.value = route.query.sort_direction || '';
});

// Observar cambios en la ruta
watch(() => route.query, (newQuery) => {
  searchValue.value = newQuery.search || '';
  currentPage.value = parseInt(newQuery.page) || 1;
  sortBy.value = newQuery.sort_by || '';
  sortDirection.value = newQuery.sort_direction || '';
}, { deep: true });

// Manejo del buscador con debounce
let searchTimeout;
const handleSearchInput = (event) => {
  const value = event.target.value;
  searchValue.value = value;
  
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    updateQueryParams({ search: value, page: 1 });
    emit('search', value);
  }, 500);
};

const offset = ref(0);

// Cambiar página
const onPageChange = (event) => {
  const newPage = event.page + 1; // Convert to 1-indexed            
  if (newPage < 1 || newPage > props.totalPages) return;
  currentPage.value = newPage;
  updateQueryParams({ page: newPage });
  emit('page-change', newPage);
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
} 

// Actualizar query params en la URL
const updateQueryParams = (params) => {
  const query = { ...route.query };
  
  Object.keys(params).forEach(key => {
    if (params[key] === '' || params[key] === null || params[key] === undefined) {
      delete query[key];
    } else {
      query[key] = params[key];
    }
  });
  
  router.push({ query });
};

// Exponer funciones para uso externo
defineExpose({
  updateQueryParams,
  currentPage,
  searchValue
});
</script>

<style scoped>
.tab-layout {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

/* Header */
.tab-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.tab-header i {
  font-size: 2rem;
  color: #fff;
}

.tab-title {
  font-size: 2rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

/* Filtros */
.filters-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filters-left {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  width: 100%;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-wrapper i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.875rem;
}

.search-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.25rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.375rem;
  color: #fff;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input::placeholder {
  color: #64748b;
}

.search-input:focus {
  border-color: #3b82f6;
}


.btn-create {
  background-color: var(--txt-color-2);
  border-color: transparent;
}

:is(.btn-create:not(:disabled):hover, .btn-create:not(:disabled):active){
  background-color: var(--txt-color-1);
  border-color: transparent;
}

.filters-right {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  width: 100%;
  justify-content: flex-start;
}

/* Grid de tarjetas */
.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.card-placeholder {
  background: #cbd5e1;
  border-radius: 0.5rem;
  padding: 3rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e293b;
  font-weight: 500;
  min-height: 150px;
}

/* Paginación */
.pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  color: #fff;
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination-number {
  min-width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #334155;
  border-radius: 0.375rem;
  color: #94a3b8;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-number:hover:not(.active):not(.ellipsis) {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  color: #fff;
}

.pagination-number.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
  font-weight: 600;
}

.pagination-number.ellipsis {
  border: none;
  cursor: default;
}

/* Tablet */
@media (min-width: 640px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pagination {
    flex-direction: row;
    justify-content: space-between;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .tab-layout {
    padding: 2rem;
  }
  
  .filters-section {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .filters-left {
    flex: 0 0 auto;
    width: auto;
  }
  
  .filters-right {
    flex: 0 0 auto;
    width: auto;
    justify-content: flex-end;
  }
  
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}
</style>