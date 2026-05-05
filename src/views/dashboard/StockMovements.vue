<template>
  <div class="stock-movements-view p-4 md:p-6 flex flex-col gap-y-2">
    <!-- Header Section -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">
        Movimientos de Stock
      </h1>
      <p class="text-xl text-gray-400">
        Consulta el historial completo de movimientos de inventario
      </p>
    </div>

    <!-- Error State -->
    <div 
      v-if="error && !loading" 
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center flex flex-col gap-y-3"
    >
      <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
      <h3 class="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
        No pudimos cargar los movimientos de stock
      </h3>
      <p class="text-red-700 dark:text-red-300 mb-4">
        {{ error }}
      </p>
      <Button 
        label="Reintentar" 
        icon="pi pi-refresh" 
        @click="retryLoadMovements"
        severity="danger"
      />
    </div>

    <!-- Main Content -->
    <div v-else class="card flex flex-col gap-y-4">
      <!-- Toolbar -->
      <Toolbar class="mb-4 rounded-lg">
        <template #end>
          <span class="text-md text-gray-400">
            {{ totalRecords }} movimiento{{ totalRecords !== 1 ? 's' : '' }}
          </span>
        </template>
      </Toolbar>

      <!-- Filters Section -->
      <div class="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <!-- Search Input -->
        <div class="col-span-1 md:col-span-2">
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText
              v-model="filters.search"
              placeholder="Buscar en notas..."
              class="w-full"
              @input="onSearchInput"
              type="search"
            />
          </IconField>
        </div>

        <!-- Product Filter -->
        <div class="col-span-1">
          <Select
            v-model="filters.product_id"
            :options="products"
            option-label="search_alias"
            option-value="id"
            placeholder="Producto"
            class="w-full"
            show-clear
            filter
            @change="onProductChange"
          />
        </div>

        <!-- Order Filter -->
        <div class="col-span-1">
          <Select
            v-model="filters.order_id"
            :options="orders"
            option-label="search_alias"
            option-value="id"
            placeholder="Pedido"
            class="w-full"
            show-clear
            filter
            @change="onOrderChange"
          />
        </div>

        <!-- Movement Type Filter -->
        <div class="col-span-1">
          <Select
            v-model="filters.movement_type_id"
            :options="movementTypes"
            option-label="name"
            option-value="id"
            placeholder="Tipo de movimiento"
            class="w-full"
            show-clear
            @change="onMovementTypeChange"
          />
        </div>
      </div>

      <!-- DataTable -->
      <DataTable
        :value="movements"
        :loading="loading"
        :rows="pagination.per_page"
        :total-records="totalRecords"
        :rows-per-page-options="[5, 10, 20, 50]"
        lazy
        paginator
        data-key="id"
        removable-sort
        responsive-layout="scroll"
        showGridlines
        scrollable
        class="max-w-[90dvw]"
        @page="onPageChange"
        @sort="onSort"
      >
        <!-- Loading Template -->
        <template #loading>
          <div class="flex flex-col gap-2 p-4">
            <Skeleton v-for="i in 5" :key="i" height="3rem" />
          </div>
        </template>

        <!-- Empty State -->
        <template #empty>
          <div class="text-center p-6">
            <i class="pi pi-inbox text-4xl text-gray-400 mb-3"></i>
            <p class="text-gray-400">
              No se encontraron movimientos de stock
            </p>
          </div>
        </template>

        <!-- Date Column -->
        <Column 
          field="created_at" 
          header="Fecha" 
          :sortable="true"
          style="min-width: 150px"
        >
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="font-medium">{{ formatDate(data.created_at) }}</span>
              <span class="text-xs text-gray-500">{{ formatTime(data.created_at) }}</span>
            </div>
          </template>
        </Column>

        <!-- Product Column -->
        <Column 
          field="product.name" 
          header="Producto" 
          :sortable="false"
          style="min-width: 200px"
        >
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="font-medium">{{ data.product?.name || 'N/A' }}</span>
              <!-- <span class="text-xs text-gray-500">{{ data.product?.code || '' }}</span> -->
            </div>
          </template>
        </Column>

        <!-- Movement Type Column -->
        <Column 
          field="movement_type.name" 
          header="Tipo" 
          :sortable="false"
          style="min-width: 150px"
        >
          <template #body="{ data }">
            <Tag 
              :value="data.movement_type?.name || 'N/A'" 
              :severity="getMovementTypeSeverity(data.movement_type)"
            />
          </template>
        </Column>

        <!-- Quantity Column -->
        <Column 
          field="quantity_moved" 
          header="Cantidad" 
          :sortable="true"
          style="min-width: 120px"
        >
          <template #body="{ data }">
            <span 
              class="font-semibold text-lg"
              :class="getQuantityClass(data.movement_type)"
            >
              {{ formatQuantity(data.quantity_moved, data.movement_type) }}
            </span>
          </template>
        </Column>

        <!-- Notes Column -->
        <Column 
          field="notes" 
          header="Nota" 
          :sortable="false"
          style="min-width: 200px"
        >
          <template #body="{ data }">
            <span class="text-sm">
              {{ data.notes_info || '-' }}
            </span>
          </template>
        </Column>

        <!-- Order Column -->
        <Column 
          field="order.code" 
          header="Pedido" 
          :sortable="false"
          style="min-width: 120px"
        >
          <template #body="{ data }">
            <Tag 
              v-if="data.order"
              :value="data.order.code" 
              :severity="getMovementTypeSeverity(data.movement_type)"
              class="cursor-pointer"
              @click="viewOrderDetails(data.order)"
              v-tooltip.top="'Click para ver detalles'"
            />
            <span v-else class="text-gray-400 text-sm">-</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';

// PrimeVue Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Toolbar from 'primevue/toolbar';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

// Composables
const router = useRouter();
const route = useRoute();
const toast = useToast();

// ==================== STATE ====================

// Movements data
const movements = ref([]);

// Loading & Error states
const loading = ref(false);
const error = ref(null);

// Pagination state
const pagination = reactive({
  page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
  has_more: false
});

// Filters state
const filters = reactive({
  search: '',
  product_id: null,
  contact_id: null,
  order_id: null,
  movement_type_id: null,
  date_from: null,
  date_to: null,
  sort_by: 'created_at',
  sort_direction: 'desc'
});

// Filter options
const products = ref([]);
const contacts = ref([]);
const orders = ref([]);
const movementTypes = ref([]);
const dateRange = ref(null);

// Search debounce timer
let searchTimeout = null;

// ==================== COMPUTED ====================

const totalRecords = computed(() => pagination.total);

// ==================== LIFECYCLE ====================

onMounted(() => {
  loadFilters();
  initializeFromRoute();
  fetchMovements();
});

// ==================== WATCHERS ====================

// Watch route query changes (browser back/forward)
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    // Only sync if query actually changed (avoid infinite loops)
    if (JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
      syncFiltersFromRoute();
      fetchMovements();
    }
  },
  { deep: true }
);

// ==================== METHODS ====================

/**
 * Initialize filters and pagination from route query params
 */
function initializeFromRoute() {
  const query = route.query;

  // Read pagination
  if (query.page) {
    pagination.page = parseInt(query.page);
  }

  if (query.per_page) {
    pagination.per_page = parseInt(query.per_page);
  }

  // Read filters
  if (query.search) {
    filters.search = query.search;
  }

  if (query.product_id) {
    filters.product_id = parseInt(query.product_id);
  }

  if (query.contact_id) {
    filters.contact_id = parseInt(query.contact_id);
  }

  if (query.order_id) {
    filters.order_id = parseInt(query.order_id);
  }

  if (query.movement_type_id) {
    filters.movement_type_id = parseInt(query.movement_type_id);
  }

  if (query.date_from) {
    filters.date_from = query.date_from;
  }

  if (query.date_to) {
    filters.date_to = query.date_to;
  }

  if (query.sort_by) {
    filters.sort_by = query.sort_by;
  }

  if (query.sort_direction) {
    filters.sort_direction = query.sort_direction;
  }

  // Initialize date range if both dates present
  if (filters.date_from && filters.date_to) {
    dateRange.value = [
      parseDateFromString(filters.date_from),
      parseDateFromString(filters.date_to)
    ];
  }
}

/**
 * Sync filters from route (for browser back/forward)
 */
function syncFiltersFromRoute() {
  const query = route.query;

  filters.search = query.search || '';
  filters.product_id = query.product_id ? parseInt(query.product_id) : null;
  filters.contact_id = query.contact_id ? parseInt(query.contact_id) : null;
  filters.order_id = query.order_id ? parseInt(query.order_id) : null;
  filters.movement_type_id = query.movement_type_id ? parseInt(query.movement_type_id) : null;
  filters.date_from = query.date_from || null;
  filters.date_to = query.date_to || null;
  filters.sort_by = query.sort_by || 'created_at';
  filters.sort_direction = query.sort_direction || 'desc';

  pagination.page = query.page ? parseInt(query.page) : 1;
  pagination.per_page = query.per_page ? parseInt(query.per_page) : 10;

  // Sync date range
  if (filters.date_from && filters.date_to) {
    dateRange.value = [
      parseDateFromString(filters.date_from),
      parseDateFromString(filters.date_to)
    ];
  } else {
    dateRange.value = null;
  }
}

/**
 * Update route query params
 */
function updateRouteQuery() {
  const query = {
    page: pagination.page,
    per_page: pagination.per_page
  };

  // Add active filters
  if (filters.search) {
    query.search = filters.search;
  }

  if (filters.product_id) {
    query.product_id = filters.product_id;
  }

  if (filters.contact_id) {
    query.contact_id = filters.contact_id;
  }

  if (filters.order_id) {
    query.order_id = filters.order_id;
  }

  if (filters.movement_type_id) {
    query.movement_type_id = filters.movement_type_id;
  }

  if (filters.date_from) {
    query.date_from = filters.date_from;
  }

  if (filters.date_to) {
    query.date_to = filters.date_to;
  }

  if (filters.sort_by) {
    query.sort_by = filters.sort_by;
    query.sort_direction = filters.sort_direction || 'asc';
  }

  // Update route without triggering navigation
  router.replace({ query });
}

/**
 * Fetch stock movements from API
 */
async function fetchMovements() {
  loading.value = true;
  error.value = null;

  try {
    // Build query params
    const params = {
      page: pagination.page,
      per_page: pagination.per_page
    };

    if (filters.search) {
      params.search = filters.search;
    }

    if (filters.product_id) {
      params.product_id = filters.product_id;
    }

    if (filters.contact_id) {
      params.contact_id = filters.contact_id;
    }

    if (filters.order_id) {
      params.order_id = filters.order_id;
    }

    if (filters.movement_type_id) {
      params.movement_type_id = filters.movement_type_id;
    }

    if (filters.date_from) {
      params.date_from = filters.date_from;
    }

    if (filters.date_to) {
      params.date_to = filters.date_to;
    }

    if (filters.sort_by) {
      params.sort_by = filters.sort_by;
      params.sort_direction = filters.sort_direction || 'desc';
    }

    // Make API request
    const response = await axios.get(`${axios.defaults.baseURL}/stock-movements`, { params });

    if (response.data.success) {
      movements.value = response.data.data;

      // Update pagination info from meta
      const meta = response.data.meta.pagination;
      pagination.total = meta.total;
      pagination.total_pages = meta.total_pages;
      pagination.has_more = meta.has_more;
    } else {
      throw new Error(response.data.message || 'Error al cargar movimientos');
    }
  } catch (err) {
    console.error('Error fetching movements:', err);
    error.value = err.response?.data?.message || err.message || 'Error de conexión al servidor';
    movements.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * Load filter options from API
 */
async function loadFilters() {
  try {
    const response = await axios.get(`${axios.defaults.baseURL}/stock-movements/filters`);
    
    if (response.data.success) {
      const data = response.data.data;
      
      products.value = data.products || [];
      contacts.value = data.contacts || [];
      orders.value = data.orders || [];
      movementTypes.value = data.movement_types || [];
    }
  } catch (err) {
    console.error('Error loading filters:', err);
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'No se pudieron cargar los filtros',
      life: 3000
    });
  }
}

/**
 * Retry loading movements after error
 */
function retryLoadMovements() {
  error.value = null;
  fetchMovements();
}

/**
 * Handle page change event from DataTable
 */
function onPageChange(event) {
  pagination.page = event.page + 1; // PrimeVue uses 0-based index
  pagination.per_page = event.rows;

  updateRouteQuery();
  fetchMovements();
}

/**
 * Handle sort event from DataTable
 */
function onSort(event) {
  // Map field names to API field names
  const fieldMap = {
    'created_at': 'created_at',
    'quantity_moved': 'quantity_moved'
  };

  if (event.sortField && fieldMap[event.sortField]) {
    filters.sort_by = fieldMap[event.sortField];
    filters.sort_direction = event.sortOrder === 1 ? 'asc' : (event.sortOrder === -1 ? 'desc' : '');
  } else {
    filters.sort_by = 'created_at';
    filters.sort_direction = 'desc';
  }

  pagination.page = 1;
  updateRouteQuery();
  fetchMovements();
}

/**
 * Handle search input with debounce
 */
function onSearchInput() {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    pagination.page = 1;
    updateRouteQuery();
    fetchMovements();
  }, 500); // 500ms debounce
}

/**
 * Handle product filter change
 */
function onProductChange() {
  pagination.page = 1;
  updateRouteQuery();
  fetchMovements();
}

/**
 * Handle contact filter change
 */
function onContactChange() {
  pagination.page = 1;
  updateRouteQuery();
  fetchMovements();
}

/**
 * Handle order filter change
 */
function onOrderChange() {
  pagination.page = 1;
  updateRouteQuery();
  fetchMovements();
}

/**
 * Handle movement type filter change
 */
function onMovementTypeChange() {
  pagination.page = 1;
  updateRouteQuery();
  fetchMovements();
}

/**
 * Handle date range change
 */
function onDateRangeChange(value) {
  if (value && value.length === 2 && value[0] && value[1]) {
    filters.date_from = formatDateForAPI(value[0]);
    filters.date_to = formatDateForAPI(value[1]);
  } else {
    filters.date_from = null;
    filters.date_to = null;
  }

  pagination.page = 1;
  updateRouteQuery();
  fetchMovements();
}

/**
 * View order details (navigate to orders)
 */
function viewOrderDetails(order) {
  router.push({
    name: 'Pedidos',
    query: {
      search: order.code
    }
  });
}

/**
 * Format date for display (dd/mm/yyyy)
 */
function formatDate(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format time for display (HH:mm)
 */
function formatTime(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

/**
 * Format date for API (yyyy-mm-dd)
 */
function formatDateForAPI(date) {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  debugger
  return `${day}-${month}-${year}`;
}

/**
 * Parse date from string (yyyy-mm-dd)
 */
function parseDateFromString(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * Format quantity with sign
 */
function formatQuantity(quantity, movementType) {
  if (!quantity) return '0';

  const sign = movementType?.increase_stock ? '+' : '-';
  return `${sign}${Math.abs(quantity).toLocaleString('es-AR')}`;
}

/**
 * Get class for quantity based on movement type
 */
function getQuantityClass(movementType) {
  if (!movementType) return '';
  
  return movementType.increase_stock 
    ? 'text-green-400' 
    : 'text-red-400';
}

/**
 * Get severity for movement type tag
 */
function getMovementTypeSeverity(movementType) {
  if (!movementType) return 'secondary';

  const severityMap = {
    'compra': 'info',
    'venta': 'success',
    'ajuste positivo': 'warn',
    'ajuste negativo': 'danger'
  };

  return severityMap[movementType.name?.toLowerCase()] || 'secondary';
}
</script>

<style scoped>
/* Mobile-first responsive adjustments */
.stock-movements-view {
  min-height: 100vh;
}

/* Ensure table is scrollable on small screens */
:deep(.p-datatable-wrapper) {
  overflow-x: auto;
}

/* Improve mobile filters layout */
@media (max-width: 768px) {
  :deep(.p-toolbar) {
    flex-direction: column;
    gap: 1rem;
  }

  :deep(.p-toolbar-group-start),
  :deep(.p-toolbar-group-end) {
    width: 100%;
    justify-content: center;
  }
}

/* Tag cursor pointer */
:deep(.p-tag.cursor-pointer) {
  transition: opacity 0.2s;
}

:deep(.p-tag.cursor-pointer:hover) {
  opacity: 0.8;
}
</style>