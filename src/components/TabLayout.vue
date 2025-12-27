<template>
  <div class="w-full max-w-7xl px-4 py-8 flex flex-col gap-6">
    <!-- Header con título e icono -->
    <header class="flex items-center gap-3">
      <i style="font-size: 2rem" class="text-2xl" :class="['pi', iconClass]"></i>
      <h1 class="text-3xl font-semibold">{{ title }}</h1>
    </header>

    <!-- Sección de filtros -->
    <template v-if="!loading && error === null">
      <Toolbar>
        <template #start>
          <div class="flex gap-3">
            <Button size="large" label="Nuevo" icon="pi pi-plus" v-if="showCreateButton" @click="$emit('create')" severity="primary" />
            <slot name="download-btn"></slot>
          </div>
        </template>

        <template #center>
          <!-- Buscador -->
          <IconField v-if="showSearchInput" class="my-6">
            <InputIcon class="pi pi-search" />
            <InputText type="search" :placeholder="searchPlaceHolder" v-model.trim="searchValue" @input="handleSearchInput"/>
          </IconField>
        </template>

        <template #end v-if="filters && !loading">
          <div class="flex flex-wrap gap-5">
            <slot name="filter-1"></slot>
            <slot name="filter-2"></slot>
            <slot name="filter-3"></slot>
            <Button label="Limpiar" severity="secondary" size="small" v-if="canClearFilters" icon="pi pi-delete-left" @click="handleClearFilters"/>
          </div>
        </template>
      </Toolbar>

      <!-- Grid de tarjetas -->
      <div class="self-center w-full max-w-5xl grid grid-cols-1 justify-items-center sm:grid-cols-2 md:grid-cols-3 gap-5">
        <slot name="cards" v-if="(totalItems > 0) && (currentPage <= totalPages)"></slot>
        <Message v-else severity="error" style="text-align: center;">No se encontraron registros.</Message>
      </div>

      <!-- Paginación -->
      <Paginator
        :first="first"
        :rows="itemsPerPage"
        :totalRecords="totalItems"
        @page="onPageChange"
        :template="{
          '640px': 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
          '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
          default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink'
        }"
        currentPageReportTemplate="Página {currentPage}/{last}"
      />
    </template>

    <div v-else-if="!loading && error !== null" class="py-12 px-4 flex flex-col items-center justify-center gap-4 min-h-[150px] w-full">
      <Message severity="error" style="text-align: center;">{{error}}. <br> Inténtalo de nuevo más tarde.</Message>
      <Button label="Recargar" severity="contrast" icon="pi pi-refresh" iconPos="bottom" @click="() => this.$router.go()"/>
    </div>
    <div v-else class="rounded-md py-12 px-4 flex flex-col items-center justify-center text-surface-100 text-2xl font-normal min-h-[150px]">
       <ProgressSpinner style="width: 100px; height: 100px" strokeWidth="2" fill="transparent"
            animationDuration="1s" aria-label="Custom ProgressSpinner" />
      <span>Cargando {{ title.toLocaleLowerCase() }}...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
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
  showSearchInput: {
    type: Boolean,
    default: true
  },
  currentPage: {
    type: Number,
    default: 1
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
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: [String, Object, null],
    default: null
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  searchPlaceHolder: {
    type: String,
    default: 'Buscador'
  }
});

const emit = defineEmits(['create', 'clear-filters', 'page-change', 'search']);

const route = useRoute();
const router = useRouter();

const searchValue = ref('');
const sortBy = ref('');
const sortDirection = ref('');
// const currentPage = ref(1);
const first = computed(() => (props.currentPage - 1) * props.itemsPerPage);

// Inicializar valores desde query params
onMounted(() => {
  searchValue.value = route.query?.search || '';
  // currentPage.value = parseInt(route.query.page) || 1;
  sortBy.value = route.query.sort_by || '';
  sortDirection.value = route.query.sort_direction || '';
});

// Manejo del buscador con debounce
let searchTimeout;
const handleSearchInput = () => {  
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    updateQueryParams({ search: searchValue.value, page: 1 });
    emit('search', searchValue.value);
  }, 1000);
};

// Cambiar página
const onPageChange = (event) => {
  const newPage = event.page + 1; // Paginator usa base 0
  if (newPage < 1 || newPage > props.totalPages || props.currentPage === newPage ) return;

  // currentPage.value = newPage;
  updateQueryParams({ page: newPage });
  emit('page-change', newPage);

  window.scrollTo({ top: 0, behavior: 'smooth' });
} 

// Actualizar query params en la URL
const updateQueryParams = (params) => {
  let query = { ...params };
  
  Object.keys(query).forEach(key => {
    if (params[key] === '' || params[key] === null || params[key] === undefined) {
      delete query[key];
    } else {
      query[key] = params[key];
    }
  });
  
  router.push({ query });
};

const handleClearFilters = () => { 
  let clearedParams = { search: '', page: 1 };
  searchValue.value = '';

  if(route.name === 'Contactos'){
    clearedParams = { ...clearedParams, contact_type: null };
  } else if(route.name === 'Productos'){
    clearedParams = { ...clearedParams, id_category: null, low_stock: false };
  }

  updateQueryParams(clearedParams);
  emit('clear-filters', clearedParams);
}

const canClearFilters = computed(() => {
  return !!route.query?.search || !!route.query?.id_category 
  || route.query?.low_stock==='true' || !!route.query?.contact_type;
});

// Exponer funciones para uso externo
defineExpose({
  updateQueryParams,
  // currentPage,
  searchValue
});
</script>

<style scoped></style>