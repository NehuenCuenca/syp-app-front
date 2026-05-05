<template>
  <div class="products-view p-4 md:p-6 flex flex-col gap-y-2">
    <!-- Header Section -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">
        Productos
      </h1>
      <p class="text-xl text-gray-400">
        Gestiona tu catálogo de productos
      </p>
    </div>

    <!-- Error State -->
    <div 
      v-if="error && !loading" 
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center flex
      flex-col gap-y-3"
    >
      <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
      <h3 class="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
        No pudimos cargar los productos
      </h3>
      <p class="text-red-700 dark:text-red-300 mb-4">
        {{ error }}
      </p>
      <Button 
        label="Reintentar" 
        icon="pi pi-refresh" 
        @click="retryLoadProducts"
        severity="danger"
      />
    </div>

    <!-- Main Content -->
    <div v-else class="card flex flex-col gap-y-4">
      <!-- Toolbar -->
      <Toolbar class="mb-4 rounded-lg">
        <template #start>
          <div class="flex flex-wrap gap-2">
            <Button 
              label="Nuevo Producto" 
              icon="pi pi-plus" 
              @click="openCreateModal"
              class="mr-2"
            />
            <Button 
              label="Exportar Catálogo" 
              icon="pi pi-download" 
              severity="secondary"
              @click="handleDownloadCatalog"
            />
            <Button 
              label="Actualizar Precios" 
              icon="pi pi-dollar" 
              severity="secondary"
              @click="openBulkUpdatePricesDialog"
              :disabled="selectedProducts.length === 0"
              v-tooltip.top="selectedProducts.length === 0 ? 'Seleccione productos para actualizar precios' : ''"
            />
          </div>
        </template>

        <template #end>
          <span class="text-md text-gray-400">
            {{ totalRecords }} producto{{ totalRecords !== 1 ? 's' : '' }}
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
              placeholder="Buscar por código o nombre..."
              class="w-full"
              @input="onSearchInput"
              type="search"
            />
          </IconField>
        </div>

        <!-- Category Filter -->
        <div class="col-span-1">
          <Select
            v-model="filters.category_id"
            :options="categories"
            option-label="search_alias"
            option-value="id"
            placeholder="Todas las categorías"
            class="w-full"
            show-clear
            @change="onCategoryChange"
            filter
          />
        </div>
      </div>

      <!-- DataTable -->
      <DataTable
        v-model:selection="selectedProducts"
        :value="products"
        :loading="loading"
        :rows="pagination.per_page"
        :total-records="totalRecords"
        :rows-per-page-options="[5, 10, 20, 50]"
        lazy
        paginator
        selection-mode="multiple"
        data-key="id"
        removable-sort
        edit-mode="cell"
        responsive-layout="scroll"
        showGridlines 
        scrollable  
        class="max-w-[90dvw]"
        :rowClass="deletedRowClass"
        @page="onPageChange"
        @sort="onSort"
        @cell-edit-complete="onSalePriceCellEditComplete"
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
              No se encontraron productos
            </p>
          </div>
        </template>

        <!-- Selection Column -->
        <Column 
          selection-mode="multiple" 
          header-style="width: 3rem"
          :exportable="false"
        />

        <!-- Code Column -->
        <Column 
          field="code" 
          header="COD" 
          frozen 
        >
          <template #body="{ data }">
            <span class="font-mono text-sm">{{ data.code }}</span>
          </template>
        </Column>

        <!-- Name Column -->
        <Column 
          field="name" 
          header="Nombre" 
          :sortable="true"
          style="min-width: 200px"
        >
          <template #body="{ data }">
            <span class="font-medium">{{ data.name }}</span>
          </template>
        </Column>

        <!-- Category Column -->
        <Column 
          field="category.name" 
          header="Categoría" 
          :sortable="false"
        >
          <template #body="{ data }">
            <Tag 
              v-if="data.category" 
              :value="data.category.search_alias" 
              severity="secondary"
            />
            <span v-else class="text-gray-400">Sin categoría</span>
          </template>
        </Column>

        <!-- Stock Column -->
        <Column 
          field="current_stock" 
          header="Stock" 
          :sortable="true"
          style="min-width: 100px"
        >
          <template #body="{ data }">
            <Tag 
              :value="data.stock_availability" 
              :severity="getStockSeverity(data)"
            />
          </template>
        </Column>

        <!-- Sale Price Column (Editable) -->
        <Column 
          field="sale_price" 
          header="Precio de Venta" 
          :sortable="false"
        >
          <template #body="{ data }">
            <span class="font-semibold text-green-600 dark:text-green-400">
              {{ data.sale_price_as_currency }}
            </span>
          </template>
          <template #editor="{ data, field }">
            <InputNumber
              v-model="data[field]"
              mode="currency"
              currency="ARS"
              locale="es-AR"
              :min="0"
              :minFractionDigits="0"
              :maxFractionDigits="0"
              autofocus
              class="w-full"
            />
          </template>
        </Column>

        <!-- Last buyed at Column -->
        <Column 
          field="last_buyed_at" 
          header="Ultima compra" 
          style="min-width: 100px"
        >
          <template #body="{ data }">
            <span v-if="!!data.last_buyed_at">{{ data.last_buyed_at }}</span>
            <span v-else class="text-gray-400">sin compras</span>
          </template>
        </Column>

        <!-- Actions Column -->
        <Column 
          header="Acciones" 
          :exportable="false"
          style="min-width: 150px"
        >
          <template #body="{ data }">
            <div class="flex gap-2">
              <template v-if="!data.deleted_at">
                <Button
                  icon="pi pi-pencil"
                  severity="info"
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
              </template>
            
            <Button
                v-else
                icon="pi pi-replay"
                severity="contrast"
                rounded
                size="large"
                @click="confirmRestore(data)"
                v-tooltip.top="'Restaurar'"
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
      model-name="Producto"
      :component-map="productComponentMap"
      :record-data="{}"
      @close="closeCreateModal"
      @finish="handleFinish"
    />

    <!-- Edit Modal -->
    <ModalCRUDRegister
      :visible="editModalVisible"
      action="edit"
      model-name="Producto"
      :component-map="productComponentMap"
      :record-data="selectedProduct || {}"
      @close="closeEditModal"
      @finish="handleFinish"
    />

    <!-- Catalog Export Dialog -->
    <Dialog
      v-model:visible="catalogExportDialogVisible"
      header="Exportar Catálogo"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex flex-col gap-4">
        <p class="text-gray-300">
          Selecciona el tipo de catálogo a exportar:
        </p>
        <div class="flex flex-col gap-2">
          <Button
            label="Catálogo Público"
            icon="pi pi-users"
            @click="exportCatalog(false)"
            class="w-full"
          />
          <Button
            label="Catálogo Privado"
            icon="pi pi-lock"
            severity="secondary"
            @click="exportCatalog(true)"
            class="w-full"
          />
        </div>
      </div>
    </Dialog>

    <!-- Bulk Update Prices Dialog -->
    <BulkUpdatePricesDialog
      v-model:visible="bulkUpdatePricesDialogVisible"
      :selected-products="selectedProducts"
      @success="handleBulkUpdateSuccess"
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
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Toolbar from 'primevue/toolbar';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import Dialog from 'primevue/dialog';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

// Custom Components (assumed to exist in your project)
import ModalCRUDRegister from '@/components/ModalCRUDRegister.vue';
import ProductCreateForm from '@/views/products/ProductCreateForm.vue';
import ProductEditForm from '@/views/products/ProductEditForm.vue';
import BulkUpdatePricesDialog from '@/components/BulkUpdatePricesDialog.vue';
import { getAxiosConfigForBlobResponse } from '@/helpers/downloads';

// Component map for CRUD operations
const productComponentMap = {
  create: ProductCreateForm,
  edit: ProductEditForm,
  read: null, // Not used in this view
  delete: null // Using confirm dialog instead
};

// Composables
const router = useRouter();
const route = useRoute();
const toast = useToast();
const confirm = useConfirm();

// ==================== STATE ====================

// Products data
const products = ref([]);
const selectedProducts = ref([]);
const selectedProduct = ref(null);

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
  category_id: null,
  sort_by: null,
  sort_direction: null
});

// Categories for filter dropdown
const categories = ref([]);

// Modals visibility
const createModalVisible = ref(false);
const editModalVisible = ref(false);
const catalogExportDialogVisible = ref(false);
const bulkUpdatePricesDialogVisible = ref(false);

// Modal action (for ModalCRUDRegister)
const modalAction = ref('create'); // 'create' | 'edit'


// Search debounce timer
let searchTimeout = null;

// ==================== COMPUTED ====================

const totalRecords = computed(() => pagination.total);

// ==================== LIFECYCLE ====================

onMounted(() => {
  loadCategories();
  initializeFromRoute();
  fetchProducts();
});

// ==================== WATCHERS ====================

// Watch route query changes (browser back/forward)
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    // Only sync if query actually changed (avoid infinite loops)
    if (JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
      syncFiltersFromRoute();
      fetchProducts();
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
  filters.category_id = query.category_id ? parseInt(query.category_id) : null;
  filters.sort_by = query.sort_by || null;
  filters.sort_direction = query.sort_direction || null;
}

/**
 * Sync local filters with route query params
 */
function syncFiltersFromRoute() {
  const query = route.query;
  
  filters.search = query.search || '';
  filters.category_id = query.category_id ? parseInt(query.category_id) : null;
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
  
  if (filters.category_id) {
    query.category_id = filters.category_id;
  }
  
  if (filters.sort_by) {
    query.sort_by = filters.sort_by;
    query.sort_direction = filters.sort_direction || 'asc';
  }
  
  // Update route without triggering navigation
  router.replace({ query });
}

/**
 * Fetch products from API
 */
async function fetchProducts() {
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
    
    if (filters.category_id) {
      params.category_id = filters.category_id;
    }
    
    if (filters.sort_by) {
      params.sort_by = filters.sort_by;
      params.sort_direction = filters.sort_direction || 'asc';
    }
    
    // Make API request
    const response = await axios.get(`${axios.defaults.baseURL}/products`, { params });
    
    if (response.data.success) {
      products.value = response.data.data;
      
      // Update pagination info from meta
      const meta = response.data.meta.pagination;
      pagination.total = meta.total;
      pagination.total_pages = meta.total_pages;
      pagination.has_more = meta.has_more;
    } else {
      throw new Error(response.data.message || 'Error al cargar productos');
    }
  } catch (err) {
    console.error('Error fetching products:', err);
    error.value = err.response?.data?.message || err.message || 'Error de conexión al servidor';
    products.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * Load categories for filter dropdown
 */
async function loadCategories() {
  try {
    const response = await axios.get(`${axios.defaults.baseURL}/products/filters`);
    if (response.data.success) {
      categories.value = response.data.data.categories;
    }
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}

/**
 * Retry loading products after error
 */
function retryLoadProducts() {
  error.value = null;
  fetchProducts();
}

/**
 * Handle page change event from DataTable
 */
function onPageChange(event) {
  pagination.page = event.page + 1; // PrimeVue uses 0-based index
  pagination.per_page = event.rows;
  
  updateRouteQuery();
  fetchProducts();
}

/**
 * Handle sort event from DataTable
 */
function onSort(event) {
  // Map field names to API field names
  const fieldMap = {
    'code': 'code',
    'name': 'name',
    'current_stock': 'current_stock'
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
  fetchProducts();
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
    fetchProducts();
  }, 500); // 500ms debounce
}

/**
 * Handle category filter change
 */
function onCategoryChange() {
  // Reset to first page when filtering
  pagination.page = 1;
  
  updateRouteQuery();
  fetchProducts();
}

/**
 * Handle cell edit complete for sale_price column
 */
async function onSalePriceCellEditComplete(event) {
  const { data, newValue, field } = event;
  
  if (newValue === data[field]) {
    // No change, skip update
    return;
  }
  
  try {
    // Update product price via API
    const response = await axios.put(`${axios.defaults.baseURL}/products/${data.id}`, {
      sale_price: newValue
    });
    
    if (response.data.success) {
      // Update local data
      const updatedIndex = products.value.findIndex( product => product.id === data.id)
      if( updatedIndex === -1 ) throw new Error('Error al actualizar precio: no se encontro el producto actualizado en el array'); 
      products.value = products.value.toSpliced(updatedIndex, 1, response.data.data);

      toast.add({
        severity: 'success',
        summary: 'Precio actualizado',
        detail: `El precio de venta se actualizó correctamente`,
        life: 3000
      });
    } else {
      throw new Error(response.data.message || 'Error al actualizar precio');
    }
  } catch (err) {
    console.error('Error updating price:', err);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.response?.data?.message || err.message || 'No se pudo actualizar el precio',
      life: 5000
    });
    
    // Revert to old value
    event.data[field] = event.originalEvent.target.defaultValue;
  }
}

/**
 * Open create product modal
 */
 function openCreateModal() {
  modalAction.value = 'create';
  selectedProduct.value = null;
  createModalVisible.value = true;
}

/**
 * Close create product modal
 */
function closeCreateModal() {
  createModalVisible.value = false;
}

/**
 * Handle successful product creation or edit
 */
function handleFinish(data) {
  if (modalAction.value === 'create') {
    closeCreateModal();
  } else if (modalAction.value === 'edit') {
    closeEditModal();
  }
  
  // Refresh products list
  loadCategories();
  fetchProducts();
}

/**
 * Open edit product modal
 */
async function openEditModal(product) {
  try {
    const response = await axios.get(`${axios.defaults.baseURL}/products/${product.id}`)
    if(response.data.success){
      modalAction.value = 'edit';
      selectedProduct.value = { ...response.data.data };
      editModalVisible.value = true;
    } else {
      throw new Error(response.data.message || 'Error al obtener el producto seleccionado')
    }
  } catch (error) {
    console.error('Error trying to get product: ', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || error.message || 'No se pudo conseguir los datos del producto',
      life: 5000
    });
  }
  
}

/**
 * Close edit product modal
 */
function closeEditModal() {
  editModalVisible.value = false;
  selectedProduct.value = null;
}

/**
 * Confirm product deletion
 */
function confirmDelete(product) {
  confirm.require({
    message: `¿Estás seguro de que deseas eliminar el producto "${product.name}"?`,
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Eliminar',
    rejectClass: 'p-button-secondary p-button-text',
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteProduct(product);
    }
  });
}

/**
 * Delete product via API
 */
async function deleteProduct(product) {
  try {
    const response = await axios.delete(`${axios.defaults.baseURL}/products/${product.id}`);
    
    if (response.data.success) {
      toast.add({
        severity: 'success',
        summary: 'Producto eliminado',
        detail: `El producto "${product.name}" se eliminó exitosamente`,
        life: 3000
      });
      
      // Refresh products list
      fetchProducts();
    } else {
      throw new Error(response.data.message || 'Error al eliminar producto');
    }
  } catch (err) {
    console.error('Error deleting product:', err);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.response?.data?.message || err.message || 'No se pudo eliminar el producto',
      life: 5000
    });
  }
}

/**
 * Handle catalog download button click
 */
function handleDownloadCatalog() {
  catalogExportDialogVisible.value = true;
}

/**
 * Export catalog (public or private)
 */
async function exportCatalog(with_special_category=false) {
  catalogExportDialogVisible.value = false;
  
  try {
    const linkToApi = new URL(`${axios.defaults.baseURL}/products/export-catalog`);
    if(!with_special_category) linkToApi.searchParams.append("exclude_category", 28);
    const response = await axios.get(linkToApi, { ...getAxiosConfigForBlobResponse() });

    // const catalogType = (exclude_special_category) ? 'PUBLICO' : 'PRIVADO'
    const filename = response.headers.get('x-filename') || `catalogo_productos_${Date.now()}.xlsx`;
    
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
      summary: 'Catálogo exportado',
      detail: `El catálogo '${filename}'' se descargó exitosamente`,
      life: 3000
    });
  } catch (err) {
    console.error('Error exporting catalog:', err);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo exportar el catálogo',
      life: 5000
    });
  }
}

/**
 * Get severity for stock badge
 */
function getStockSeverity({ is_empty_stock, is_low_stock}) {
  if (is_empty_stock) return 'danger';
  if (is_low_stock) return 'warn';
  return 'success';
}

function formatStockQuantity(stock) {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(stock);
}

const deletedRowClass = (data) => {
    return [{ '!bg-red-300 !text-primary-contrast': !!data.deleted_at }];
};

/**
 * Confirm product restoration
 */
 function confirmRestore(product) {
  confirm.require({
    message: `¿Estás seguro de que deseas restaurar el producto "${product.name}"?`,
    header: 'Confirmar Restauración',
    icon: 'pi pi-question-circle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Restaurar',
    rejectProps: {
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      severity: 'success'
    },
    accept: () => {
      restoreProduct(product);
    }
  });
}

/**
 * Restore product via API
 */
 async function restoreProduct(product) {
  try {
    const response = await axios.patch(`${axios.defaults.baseURL}/products/${product.id}/restore`);
    
    if (response.data.success) {
      toast.add({
        severity: 'success',
        summary: 'Producto restaurado',
        detail: `El producto "${product.name}" se restauró exitosamente`,
        life: 3000
      });
      
      // Refresh products list
      fetchProducts();
    } else {
      throw new Error(response.data.message || 'Error al restaurar producto');
    }
  } catch (err) {
    console.error('Error restoring product:', err);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.response?.data?.message || err.message || 'No se pudo restaurar el producto',
      life: 5000
    });
  }
}

/**
 * Open bulk update prices dialog
 */
function openBulkUpdatePricesDialog() {
  bulkUpdatePricesDialogVisible.value = true;
}

/**
 * Handle successful bulk price update
 */
function handleBulkUpdateSuccess(updatedProducts) {
  // Replace updated products in the current products array
  const updatedProductsMap = new Map(updatedProducts.map(p => [p.id, p]));
  
  // Update products array
  products.value = products.value.map(product => {
    if (updatedProductsMap.has(product.id)) {
      return updatedProductsMap.get(product.id);
    }
    return product;
  });
  
  // Clear selection
  selectedProducts.value = [];
  
  // Close dialog
  bulkUpdatePricesDialogVisible.value = false;
}

</script>

<style scoped>
/* Mobile-first responsive adjustments */
.products-view {
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
</style>