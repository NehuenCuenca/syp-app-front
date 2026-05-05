<template>
  <div class="contacts-view p-4 md:p-6 flex flex-col gap-y-2">
    <!-- Header Section -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">
        Contactos
      </h1>
      <p class="text-xl text-gray-400">
        Gestiona tu listado de contactos
      </p>
    </div>

    <!-- Error State -->
    <div 
      v-if="error && !loading" 
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center"
    >
      <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
      <h3 class="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
        No pudimos cargar los contactos
      </h3>
      <p class="text-red-700 dark:text-red-300 mb-4">
        {{ error }}
      </p>
      <Button 
        label="Reintentar" 
        icon="pi pi-refresh" 
        @click="retryLoadContacts"
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
              label="Nuevo Contacto" 
              icon="pi pi-plus" 
              @click="openCreateModal"
              class="mr-2"
            />
            <Button 
              label="Descargar Listado" 
              icon="pi pi-download" 
              severity="secondary"
              @click="handleDownloadContactsList"
            />
          </div>
        </template>

        <template #end>
          <span class="text-md text-gray-400">
            {{ totalRecords }} contacto{{ totalRecords !== 1 ? 's' : '' }}
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

        <!-- Contact Type Filter -->
        <div class="col-span-1">
          <Select
            v-model="filters.contact_type"
            :options="contactTypes"
            placeholder="Tipo de contacto"
            class="w-full"
            show-clear
            @change="onContactTypeChange"
          />
        </div>
      </div>

      <!-- DataTable -->
      <DataTable
        :value="contacts"
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
        :rowClass="deletedRowClass"
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
            <i class="pi pi-users text-4xl text-gray-400 mb-3"></i>
            <p class="text-gray-600 dark:text-gray-400">
              No se encontraron contactos
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
            <div class="flex flex-col">
              <span class="font-medium text-lg">{{ data.name }}</span>
              <span 
                v-if="data.deleted_at" 
                class="text-xs text-red-500 mt-1"
              >
                (Eliminado)
              </span>
            </div>
          </template>
        </Column>

        <!-- Phone Column -->
        <Column 
          field="phone" 
          header="Teléfono" 
          :sortable="false"
        >
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <i class="pi pi-phone text-gray-500"></i>
              <span v-if="data.phone_number_info">{{ data.phone_number_info}}</span>
              <span v-else class="text-gray-400">sin telefono</span>
            </div>
          </template>
        </Column>

        <!-- Contact Type Column -->
        <Column 
          field="contact_type" 
          header="Tipo" 
          :sortable="true"
        >
          <template #body="{ data }">
            <Tag 
              :value="data.contact_type" 
              :severity="getContactTypeSeverity(data.contact_type)"
            />
          </template>
        </Column>

        <!-- Last Order Column -->
        <Column 
          field="last_order" 
          header="Último pedido" 
          :sortable="false"
          style="min-width: 180px"
        >
          <template #body="{ data }">
            <span v-if="!!data.last_order">
              {{ data.last_order }}
            </span>
            <span v-else class="text-gray-400">
              No tiene pedidos
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
              <template v-if="!data.deleted_at">
                <Button
                  icon="pi pi-pencil"
                  severity="warning"
                  text
                  rounded
                  size="large"
                  @click="openEditModal(data)"
                  v-tooltip.top="'Editar'"
                  :disabled="!!data.deleted_at"
                />
                <Button
                  v-if="!data.deleted_at"
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  rounded
                  size="large"
                  @click="confirmDelete(data)"
                  v-tooltip.top="'Eliminar'"
                />
                <Button
                  v-if="!!data.last_order"
                  icon="pi pi-receipt"
                  severity="secondary"
                  text
                  rounded
                  size="large"
                  @click="viewContactOrders(data)"
                  v-tooltip.top="'Ver pedidos'"
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
      model-name="Contacto"
      :component-map="contactComponentMap"
      :record-data="{}"
      @close="closeCreateModal"
      @finish="handleFinish"
    />

    <!-- Edit Modal -->
    <ModalCRUDRegister
      :visible="editModalVisible"
      action="edit"
      model-name="Contacto"
      :component-map="contactComponentMap"
      :record-data="selectedContact || {}"
      @close="closeEditModal"
      @finish="handleFinish"
    />

    <!-- View Modal -->
    <ModalCRUDRegister
      :visible="viewModalVisible"
      action="read"
      model-name="Contacto"
      :component-map="contactComponentMap"
      :record-data="selectedContact || {}"
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
import Toolbar from 'primevue/toolbar';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

// Custom Components
import ModalCRUDRegister from '@/components/ModalCRUDRegister.vue';
import ContactCreateForm from '@/views/contacts/ContactCreateForm.vue';
import ContactEditForm from '@/views/contacts/ContactEditForm.vue';
import ContactReadDetails from '@/views/contacts/ContactReadDetails.vue';

// Component map for CRUD operations
const contactComponentMap = {
  create: ContactCreateForm,
  edit: ContactEditForm,
  read: ContactReadDetails,
  delete: null // Using confirm dialog instead
};

// Composables
const router = useRouter();
const route = useRoute();
const toast = useToast();
const confirm = useConfirm();

// ==================== STATE ====================

// Contacts data
const contacts = ref([]);
const selectedContacts = ref([]);
const selectedContact = ref(null);

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
  contact_type: null,
  sort_by: null,
  sort_direction: null
});

// Contact types for filter dropdown
const contactTypes = ref([]);

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
  loadContactFilters();
  initializeFromRoute();
  fetchContacts();
});

// ==================== WATCHERS ====================

// Watch route query changes (browser back/forward)
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    // Only sync if query actually changed (avoid infinite loops)
    if (JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
      syncFiltersFromRoute();
      fetchContacts();
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
  filters.contact_type = query.contact_type || null;
  filters.sort_by = query.sort_by || null;
  filters.sort_direction = query.sort_direction || null;
}

/**
 * Sync local filters with route query params
 */
function syncFiltersFromRoute() {
  const query = route.query;
  
  filters.search = query.search || '';
  filters.contact_type = query.contact_type || null;
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
  
  if (filters.contact_type) {
    query.contact_type = filters.contact_type;
  }
  
  if (filters.sort_by) {
    query.sort_by = filters.sort_by;
    query.sort_direction = filters.sort_direction || 'asc';
  }
  
  // Update route without triggering navigation
  router.replace({ query });
}

/**
 * Fetch contacts from API
 */
async function fetchContacts() {
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
    
    if (filters.contact_type) {
      params.contact_type = filters.contact_type;
    }
    
    if (filters.sort_by) {
      params.sort_by = filters.sort_by;
      params.sort_direction = filters.sort_direction || 'asc';
    }
    
    // Make API request
    const response = await axios.get(`${axios.defaults.baseURL}/contacts`, { params });
    
    if (response.data.success) {
      contacts.value = response.data.data;
      
      // Update pagination info from meta
      const meta = response.data.meta.pagination;
      pagination.total = meta.total;
      pagination.total_pages = meta.total_pages;
      pagination.has_more = meta.has_more;
    } else {
      throw new Error(response.data.message || 'Error al cargar contactos');
    }
  } catch (err) {
    console.error('Error fetching contacts:', err);
    error.value = err.response?.data?.message || err.message || 'Error de conexión al servidor';
    contacts.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * Load contact filters (contact types)
 */
async function loadContactFilters() {
  try {
    const response = await axios.get(`${axios.defaults.baseURL}/contacts/filters`);
    if (response.data.success) {
      contactTypes.value = response.data.data.contact_types || [];
    }
  } catch (err) {
    console.error('Error loading contact filters:', err);
  }
}

/**
 * Retry loading contacts after error
 */
function retryLoadContacts() {
  error.value = null;
  fetchContacts();
}

/**
 * Handle page change event from DataTable
 */
function onPageChange(event) {
  pagination.page = event.page + 1; // PrimeVue uses 0-based index
  pagination.per_page = event.rows;
  
  updateRouteQuery();
  fetchContacts();
}

/**
 * Handle sort event from DataTable
 */
function onSort(event) {
  // Map field names to API field names
  const fieldMap = {
    // 'code': 'code',
    'name': 'name',
    'contact_type': 'contact_type'
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
  fetchContacts();
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
    fetchContacts();
  }, 500); // 500ms debounce
}

/**
 * Handle contact type filter change
 */
function onContactTypeChange() {
  // Reset to first page when filtering
  pagination.page = 1;
  
  updateRouteQuery();
  fetchContacts();
}

/**
 * Open create contact modal
 */
function openCreateModal() {
  modalAction.value = 'create';
  selectedContact.value = null;
  createModalVisible.value = true;
}

/**
 * Close create contact modal
 */
function closeCreateModal() {
  createModalVisible.value = false;
}

/**
 * Open edit contact modal
 */
async function openEditModal(contact) {
  try {
    // Fetch full contact details
    const response = await axios.get(`${axios.defaults.baseURL}/contacts/${contact.id}`);
    if (response.data.success) {
      modalAction.value = 'edit';
      selectedContact.value = response.data.data;
      editModalVisible.value = true;
    } else {
      throw new Error(response.data.message || 'Error al obtener el contacto');
    }
  } catch (err) {
    console.error('Error fetching contact details:', err);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo obtener los detalles del contacto',
      life: 5000
    });
  }
}

/**
 * Close edit contact modal
 */
function closeEditModal() {
  editModalVisible.value = false;
  selectedContact.value = null;
}

/**
 * Close view contact modal
 */
function closeViewModal() {
  viewModalVisible.value = false;
  selectedContact.value = null;
}

/**
 * Handle successful contact creation, edit, or view close
 */
function handleFinish(data) {
  if (modalAction.value === 'create') {
    closeCreateModal();
    fetchContacts();
  } else if (modalAction.value === 'edit') {
    closeEditModal();
    fetchContacts();
  } else if (modalAction.value === 'read') {
    closeViewModal();
  }
}

/**
 * Confirm contact deletion
 */
function confirmDelete(contact) {
  confirm.require({
    message: `¿Estás seguro de que deseas eliminar el contacto "${contact.name}"?`,
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Eliminar',
    rejectProps: {
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      severity: 'danger'
    },
    accept: () => {
      deleteContact(contact);
    }
  });
}

/**
 * Delete contact via API
 */
async function deleteContact(contact) {
  try {
    const response = await axios.delete(`${axios.defaults.baseURL}/contacts/${contact.id}`);
    
    if (response.data.success) {
      toast.add({
        severity: 'success',
        summary: 'Contacto eliminado',
        detail: `El contacto "${contact.name}" se eliminó exitosamente`,
        life: 3000
      });
      
      // Refresh contacts list
      fetchContacts();
    } else {
      throw new Error(response.data.message || 'Error al eliminar contacto');
    }
  } catch (err) {
    console.error('Error deleting contact:', err);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.response?.data?.message || err.message || 'No se pudo eliminar el contacto',
      life: 5000
    });
  }
}

/**
 * Confirm contact restoration
 */
function confirmRestore(contact) {
  confirm.require({
    message: `¿Estás seguro de que deseas restaurar el contacto "${contact.name}"?`,
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
      restoreContact(contact);
    }
  });
}

/**
 * Restore contact via API
 */
async function restoreContact(contact) {
  try {
    const response = await axios.patch(`${axios.defaults.baseURL}/contacts/${contact.id}/restore`);
    
    if (response.data.success) {
      toast.add({
        severity: 'success',
        summary: 'Contacto restaurado',
        detail: `El contacto "${contact.name}" se restauró exitosamente`,
        life: 3000
      });
      
      // Refresh contacts list
      fetchContacts();
    } else {
      throw new Error(response.data.message || 'Error al restaurar contacto');
    }
  } catch (err) {
    console.error('Error restoring contact:', err);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.response?.data?.message || err.message || 'No se pudo restaurar el contacto',
      life: 5000
    });
  }
}

/**
 * Handle contacts list download
 */
async function handleDownloadContactsList() {
  try {
    const response = await axios.get(`${axios.defaults.baseURL}/contacts/export`, {
      responseType: 'blob'
    });
    
    // Get filename from header or generate one
    const filename = response.headers['x-filename'] || `listado_contactos_${Date.now()}.xlsx`;
    
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
      summary: 'Listado descargado',
      detail: 'El listado de contactos se descargó exitosamente',
      life: 3000
    });
  } catch (err) {
    console.error('Error downloading contacts list:', err);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo descargar el listado de contactos',
      life: 5000
    });
  }
}

/**
 * Get severity for contact type badge
 */
function getContactTypeSeverity(type) {
  const severityMap = {
    'cliente': 'success',
    'proveedor': 'info',
    'ambos': 'warn'
  };
  return severityMap[type] || 'secondary';
}

const deletedRowClass = (data) => {
    return [{ '!bg-red-300 !text-primary-contrast': !!data.deleted_at }];
};

function viewContactOrders(contact) {
  console.log(contact);
  // Navega a Orders con filtro
  router.push({
    name: 'Pedidos',
    query: {
      contact_id: contact.id,
      page: 1,
      per_page: 10
    }
  });
  
  // Toast informativo
  toast.add({
    severity: 'info',
    summary: 'Redirigiendo...',
    detail: `Mostrando pedidos de ${contact.name}`,
    life: 3500
  });
}
</script>

<style scoped>
/* Mobile-first responsive adjustments */
.contacts-view {
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

/* Deleted contact styling */
:deep(.p-datatable-tbody > tr:has(.text-red-500)) {
  opacity: 0.6;
  background-color: rgba(254, 202, 202, 0.1);
}
</style>