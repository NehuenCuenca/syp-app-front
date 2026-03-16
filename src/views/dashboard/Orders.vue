<template>
  <div class="orders-view p-4 md:p-6 flex flex-col gap-y-2">
    <!-- Header Section -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">
        Pedidos
      </h1>
      <p class="text-xl text-gray-400">
        Gestiona tus pedidos de compra y venta
      </p>
    </div>

    <!-- Error State -->
    <div 
      v-if="error && !loading" 
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center"
    >
      <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
      <h3 class="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
        No pudimos cargar los pedidos
      </h3>
      <p class="text-red-700 dark:text-red-300 mb-4">
        {{ error }}
      </p>
      <Button 
        label="Reintentar" 
        icon="pi pi-refresh" 
        @click="retryLoadOrders"
        severity="danger"
      />
    </div>

    <!-- Main Content -->
    <div v-else class="card flex flex-col gap-y-4">
      <!-- Toolbar -->
      <Toolbar class="mb-4 rounded-lg">
        <template #start>
          <Button 
            label="Nuevo Pedido" 
            icon="pi pi-plus" 
            @click="openCreateModal"
            class="mr-2"
          />
        </template>

        <template #end>
          <span class="text-md text-gray-400">
            {{ totalRecords }} pedido{{ totalRecords !== 1 ? 's' : '' }}
          </span>
        </template>
      </Toolbar>

      <!-- Filters Section -->
      <div class="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Search Input -->
        <div class="col-span-1 md:col-span-2">
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText
              v-model="filters.search"
              placeholder="Buscar por código de pedido o nombre de contacto..."
              class="w-full"
              @input="onSearchInput"
              type="search"
            />
          </IconField>
        </div>

        <!-- Movement Type Filter -->
        <div class="col-span-1">
          <Select
            v-model="filters.movement_type_id"
            :options="movementTypes"
            option-label="name"
            option-value="id"
            placeholder="Tipo de pedido"
            class="w-full"
            show-clear
            @change="onMovementTypeChange"
          />
        </div>

        <!-- Contact Filter -->
        <div class="col-span-1">
          <Select
            v-model="filters.contact_id"
            :options="contacts"
            option-label="search_alias"
            option-value="id"
            placeholder="Contacto"
            class="w-full"
            show-clear
            filter
            @change="onContactChange"
          />
        </div>

        <!-- Date Filter (Before Equal Date) -->
        <div class="col-span-1 md:col-span-2 lg:col-span-1">
          <DatePicker
            v-model="filters.before_equal_date"
            placeholder="Fecha y anteriores"
            date-format="yy/mm/dd"
            :max-date="maxDate"
            show-icon
            show-button-bar
            class="w-full"
            @date-select="onDateChange"
            @clear-click="onDateClear"
            locale="es-AR"
            showClear 
          />
        </div>
      </div>

      <!-- DataTable -->
      <DataTable
        :value="orders"
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
            <p class="text-gray-600 dark:text-gray-400">
              No se encontraron pedidos
            </p>
          </div>
        </template>

        <!-- Selection Column -->
        <!-- <Column 
          selection-mode="multiple" 
          header-style="width: 3rem"
          :exportable="false"
        /> -->

        <!-- Code Column -->
        <Column 
          field="code" 
          header="COD" 
          :sortable="false"
          frozen
        >
          <template #body="{ data }">
            <span class="font-mono text-sm font-semibold">{{ data.code }}</span>
          </template>
        </Column>

        <!-- Date Column -->
        <Column 
          field="created_at" 
          header="Fecha" 
          :sortable="true"
        >
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <i class="pi pi-calendar text-gray-500"></i>
              <span class="text-sm">{{ formatDate(data.created_at) }}</span>
            </div>
          </template>
        </Column>

        <!-- Contact Name Column -->
        <Column 
          field="contact.name" 
          header="Contacto" 
          :sortable="false"
        >
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="font-medium">{{ data.contact?.name || 'Sin contacto' }}</span>
            </div>
          </template>
        </Column>

        <!-- Movement Type Column -->
        <Column 
          field="movement_type.name" 
          header="Tipo Pedido" 
          :sortable="true"
          sortable-field="movement_type_id"
        >
          <template #body="{ data }">
            <Tag 
              v-if="data.movement_type" 
              :value="data.movement_type.name" 
              :severity="getMovementTypeSeverity(data.movement_type.name)"
            />
            <span v-else class="text-gray-400">Sin tipo</span>
          </template>
        </Column>

        <!-- Total Column -->
        <Column 
          field="total_net" 
          header="Total" 
          :sortable="true"
        >
          <template #body="{ data }">
            <span class="font-semibold text-green-600 dark:text-green-400">
              {{ data.total_net_as_currency || formatCurrency(data.total_net) }}
            </span>
          </template>
        </Column>

        <!-- Actions Column -->
        <Column 
          header="Acciones" 
          :exportable="false"
        >
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button
                v-if="data.is_exportable"
                icon="pi pi-download"
                severity="success"
                text
                rounded
                size="large"
                @click="handleDownloadOrder(data)"
                v-tooltip.top="'Exportar pedido'"
              />
              <Button
                icon="pi pi-pencil"
                severity="warning"
                text
                rounded
                size="large"
                @click="openEditModal(data)"
                v-tooltip.top="'Editar'"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                size="large"
                @click="confirmDelete(data)"
                v-tooltip.top="'Eliminar'"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Create Modal -->
    <ModalCRUDRegister
      :visible="createModalVisible"
      action="create"
      model-name="Pedido"
      :component-map="orderComponentMap"
      :record-data="{}"
      @close="closeCreateModal"
      @finish="handleFinish"
    />

    <!-- Edit Modal -->
    <ModalCRUDRegister
      :visible="editModalVisible"
      action="edit"
      model-name="Pedido"
      :component-map="orderComponentMap"
      :record-data="selectedOrder || {}"
      @close="closeEditModal"
      @finish="handleFinish"
    />

    <!-- View Modal -->
    <ModalCRUDRegister
      :visible="viewModalVisible"
      action="read"
      model-name="Pedido"
      :component-map="orderComponentMap"
      :record-data="selectedOrder || {}"
      @close="closeViewModal"
      @finish="closeViewModal"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
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

// Custom Components
import ModalCRUDRegister from '@/components/ModalCRUDRegister.vue';
import OrderCreateForm from '@/views/orders/OrderCreateForm.vue';
import OrderEditForm from '@/views/orders/OrderEditForm.vue';
import OrderReadDetails from '@/views/orders/OrderReadDetails.vue';

// Component map for CRUD operations
const orderComponentMap = {
  create: OrderCreateForm,
  edit: OrderEditForm,
  read: OrderReadDetails,
  delete: null // Using confirm dialog instead
};

// Composables
const router = useRouter();
const route = useRoute();
const toast = useToast();
const confirm = useConfirm();

// ==================== STATE ====================

// Orders data
const orders = ref([]);
const selectedOrders = ref([]);
const selectedOrder = ref(null);

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
  movement_type_id: null,
  contact_id: null,
  before_equal_date: null,
  sort_by: null,
  sort_direction: null
});

// Filter options
const movementTypes = ref([]);
const contacts = ref([]);
const maxDate = ref(new Date());

// Modals visibility
const createModalVisible = ref(false);
const editModalVisible = ref(false);
const viewModalVisible = ref(false);

// Modal action (for ModalCRUDRegister)
const modalAction = ref('create'); // 'create' | 'edit' | 'read'

// Search debounce timer
let searchTimeout = null;

// ==================== COMPUTED ====================

const totalRecords = computed(() => pagination.total);

// ==================== LIFECYCLE ====================

onMounted(() => {
  loadOrderFilters();
  initializeFromRoute();
  fetchOrders();
});

// ==================== WATCHERS ====================

// Watch route query changes (browser back/forward)
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    // Only sync if query actually changed (avoid infinite loops)
    if (JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
      syncFiltersFromRoute();
      fetchOrders();
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
  
  // Pagination
  pagination.page = parseInt(query.page) || 1;
  pagination.per_page = parseInt(query.per_page) || 10;
  
  // Filters
  filters.search = query.search || '';
  filters.movement_type_id = query.movement_type_id ? parseInt(query.movement_type_id) : null;
  filters.contact_id = query.contact_id ? parseInt(query.contact_id) : null;
  filters.before_equal_date = query.before_equal_date ? parseDateFromString(query.before_equal_date) : null;
  filters.sort_by = query.sort_by || null;
  filters.sort_direction = query.sort_direction || null;
}

/**
 * Sync local filters with route query params
 */
function syncFiltersFromRoute() {
  const query = route.query;
  
  filters.search = query.search || '';
  filters.movement_type_id = query.movement_type_id ? parseInt(query.movement_type_id) : null;
  filters.contact_id = query.contact_id ? parseInt(query.contact_id) : null;
  filters.before_equal_date = query.before_equal_date ? parseDateFromString(query.before_equal_date) : null;
  filters.sort_by = query.sort_by || null;
  filters.sort_direction = query.sort_direction || null;
  
  pagination.page = parseInt(query.page) || 1;
  pagination.per_page = parseInt(query.per_page) || 10;
}

/**
 * Update route query params (URL sync)
 */
function updateRouteQuery() {
  const query = {};
  
  // Always include page and per_page
  query.page = pagination.page;
  query.per_page = pagination.per_page;
  
  // Add filters only if they have values
  if (filters.search) {
    query.search = filters.search;
  }
  
  if (filters.movement_type_id) {
    query.movement_type_id = filters.movement_type_id;
  }
  
  if (filters.contact_id) {
    query.contact_id = filters.contact_id;
  }
  
  if (filters.before_equal_date) {
    query.before_equal_date = formatDateForAPI(filters.before_equal_date);
  }
  
  if (filters.sort_by) {
    query.sort_by = filters.sort_by;
    query.sort_direction = filters.sort_direction || 'asc';
  }
  
  // Update route without triggering navigation
  router.replace({ query });
}

/**
 * Fetch orders from API
 */
async function fetchOrders() {
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
    
    if (filters.movement_type_id) {
      params.movement_type_id = filters.movement_type_id;
    }
    
    if (filters.contact_id) {
      params.contact_id = filters.contact_id;
    }
    
    if (filters.before_equal_date) {
      params.before_equal_date = formatDateForAPI(filters.before_equal_date);
    }
    
    if (filters.sort_by) {
      params.sort_by = filters.sort_by;
      params.sort_direction = filters.sort_direction || 'asc';
    }
    
    // Make API request
    const response = await axios.get(`${axios.defaults.baseURL}/orders`, { params });
    
    if (response.data.success) {
      orders.value = response.data.data;
      
      // Update pagination info from meta
      const meta = response.data.meta.pagination;
      pagination.total = meta.total;
      pagination.total_pages = meta.total_pages;
      pagination.has_more = meta.has_more;
    } else {
      throw new Error(response.data.message || 'Error al cargar pedidos');
    }
  } catch (err) {
    console.error('Error fetching orders:', err);
    error.value = err.response?.data?.message || err.message || 'Error de conexión al servidor';
    orders.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * Load order filters (movement types, contacts)
 */
async function loadOrderFilters() {
  try {
    const response = await axios.get(`${axios.defaults.baseURL}/orders/filters`);
    if (response.data.success) {
      movementTypes.value = response.data.data.order_types || [];
      contacts.value = response.data.data.contacts || [];
      
      // Set max date if provided
      if (response.data.data.before_equal_date) {
        maxDate.value = parseDateFromString(response.data.data.before_equal_date);
      }
    }
  } catch (err) {
    console.error('Error loading order filters:', err);
  }
}

/**
 * Retry loading orders after error
 */
function retryLoadOrders() {
  error.value = null;
  fetchOrders();
}

/**
 * Handle page change event from DataTable
 */
function onPageChange(event) {
  pagination.page = event.page + 1; // PrimeVue uses 0-based index
  pagination.per_page = event.rows;
  
  updateRouteQuery();
  fetchOrders();
}

/**
 * Handle sort event from DataTable
 */
function onSort(event) {
  // Map field names to API field names
  const fieldMap = {
    'created_at': 'created_at',
    'movement_type.name': 'movement_type_id',
    'total_net': 'total_net'
  };
  
  if (event.sortField && event.sortOrder !== 0) {
    filters.sort_by = fieldMap[event.sortField] || event.sortField;
    filters.sort_direction = event.sortOrder === 1 ? 'asc' : 'desc';
  } else {
    // Remove sort (third click on removableSort)
    filters.sort_by = null;
    filters.sort_direction = null;
  }
  
  // Reset to first page when sorting
  pagination.page = 1;
  
  updateRouteQuery();
  fetchOrders();
}

/**
 * Handle search input with debounce
 */
function onSearchInput() {
  // Clear existing timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  // Set new timeout for debounced search
  searchTimeout = setTimeout(() => {
    // Reset to first page when searching
    pagination.page = 1;
    
    updateRouteQuery();
    fetchOrders();
  }, 500); // 500ms debounce
}

/**
 * Handle movement type filter change
 */
function onMovementTypeChange() {
  // Reset to first page when filtering
  pagination.page = 1;
  
  updateRouteQuery();
  fetchOrders();
}

/**
 * Handle contact filter change
 */
function onContactChange() {
  // Reset to first page when filtering
  pagination.page = 1;
  
  updateRouteQuery();
  fetchOrders();
}

/**
 * Handle date filter change
 */
function onDateChange() {
  // Reset to first page when filtering
  pagination.page = 1;
  
  updateRouteQuery();
  fetchOrders();
}

/**
 * Handle date filter clear
 */
function onDateClear() {
  filters.before_equal_date = null;
  pagination.page = 1;
  
  updateRouteQuery();
  fetchOrders();
}

/**
 * Open create order modal
 */
function openCreateModal() {
  modalAction.value = 'create';
  selectedOrder.value = null;
  createModalVisible.value = true;
}

/**
 * Close create order modal
 */
function closeCreateModal() {
  createModalVisible.value = false;
}

/**
 * Open edit order modal
 */
async function openEditModal(order) {
  modalAction.value = 'edit';
  selectedOrder.value = order;
  editModalVisible.value = true;
}

/**
 * Close edit order modal
 */
function closeEditModal() {
  editModalVisible.value = false;
  selectedOrder.value = null;
}

/**
 * Open view order modal
 */
async function openViewModal(order) {
  try {
    // Fetch full order details
    const response = await axios.get(`${axios.defaults.baseURL}/orders/${order.id}`);
    if (response.data.success) {
      modalAction.value = 'read';
      selectedOrder.value = response.data.data;
      viewModalVisible.value = true;
    } else {
      throw new Error(response.data.message || 'Error al obtener el pedido');
    }
  } catch (err) {
    console.error('Error fetching order details:', err);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo obtener los detalles del pedido',
      life: 5000
    });
  }
}

/**
 * Close view order modal
 */
function closeViewModal() {
  viewModalVisible.value = false;
  selectedOrder.value = null;
}

/**
 * Handle successful order creation, edit, or view close
 */
function handleFinish(data) {
  if (modalAction.value === 'create') {
    closeCreateModal();
    fetchOrders();
  } else if (modalAction.value === 'edit') {
    closeEditModal();
    fetchOrders();
  } else if (modalAction.value === 'read') {
    closeViewModal();
  }
}

/**
 * Confirm order deletion
 */
function confirmDelete(order) {
  confirm.require({
    message: `¿Estás seguro de que deseas eliminar el pedido "${order.search_alias}"? Revertirás sus movimientos.`,
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'No, cancelar',
    acceptLabel: 'Sí, borrar',
    rejectProps: {
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      severity: 'danger'
    },
    accept: () => {
      deleteOrder(order);
    }
  });
}

/**
 * Delete order via API
 */
async function deleteOrder(order) {
  try {
    const response = await axios.delete(`${axios.defaults.baseURL}/orders/${order.id}`);
    
    if (response.data.success) {
      toast.add({
        severity: 'success',
        summary: 'Pedido eliminado',
        detail: `El pedido "${order.search_alias}" se eliminó exitosamente`,
        life: 3000
      });
      
      // Refresh orders list
      fetchOrders();
    } else {
      throw new Error(response.data.message || 'Error al eliminar pedido');
    }
  } catch (err) {
    console.error('Error deleting order:', err);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.response?.data?.message || err.message || 'No se pudo eliminar el pedido',
      life: 5000
    });
  }
}

/**
 * Handle order download/export
 */
async function handleDownloadOrder(order) {
  try {
    const response = await axios.get(`${axios.defaults.baseURL}/orders/${order.id}/export-ticket`, {
      params: { include_header: 1 },
      responseType: 'blob'
    });
    
    // Get filename from header or generate one
    const filename = response.headers['x-filename'] || `boleta_${order.code}_${Date.now()}.xlsx`;
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    toast.add({
      severity: 'success',
      summary: 'Pedido exportado',
      detail: `El pedido "${order.code}" se descargó exitosamente`,
      life: 3000
    });
  } catch (err) {
    console.error('Error downloading order:', err);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo descargar el pedido',
      life: 5000
    });
  }
}

/**
 * Get severity for movement type badge
 */
function getMovementTypeSeverity(type) {
  const severityMap = {
    'compra': 'info',
    'venta': 'success',
    'ajuste': 'warn'
  };
  return severityMap[type?.toLowerCase()] || 'secondary';
}

/**
 * Format date for display (dd/mm/yyyy)
 */
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format date for API (yyyy-mm-dd)
 */
function formatDateForAPI(date) {
  if (!date) return null;
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
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
 * Format currency for display
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
}
</script>

<style scoped>
/* Mobile-first responsive adjustments */
.orders-view {
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

/* Better mobile button spacing */
@media (max-width: 640px) {
  .flex.gap-2 {
    gap: 0.5rem;
  }
}

/* DatePicker full width */
:deep(.p-datepicker-input-icon-container) {
  width: 100%;
}
</style>