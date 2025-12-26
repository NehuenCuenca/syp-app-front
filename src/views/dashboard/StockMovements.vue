<template>
  <TabLayout
    :loading="stockMovementsLoading"
    :error="stockMovementsError"
    :filters="stockMovementsFilters"
    title="Movimientos de stock"
    :icon-class="route.meta?.icon || 'pi pi-arrow-right-arrow-left'"
    :total-pages="stockMovementsPagination?.total_pages"
    :total-items="stockMovementsPagination?.total"
    :current-page="stockMovementsPagination?.current_page"
    :items-per-page="9"
    :show-create-button="false"
    @search="handleSearch"
    @page-change="handlePageChange"
    @clear-filters="handleClearFilters"
    ref="tabLayoutRef"
  >
    <!-- Filtros personalizados -->
    <!-- <template #filter-3></template> -->

    <!-- Tarjetas de movimientos de stock -->
    <template #cards>
      <UniversalCard
        v-for="stockMovement in stockMovementsData"
        :primary-text="stockMovement.sign_with_quantity_and_product"
        :primary-color="stockMovement.quantity_moved < 0 ? 'var(--error-color-900)':'var(--success-color-900)'"
        :secondary-text="stockMovement.notes_info"
        :tertiary-text="extractDate(stockMovement.created_at)"
        card-type="movimiento"
        @view="() => handleViewStockMovement(stockMovement)"
        @openOrder="() => handleOpenOrder(stockMovement.order)"
      />
    </template>
  </TabLayout>

  <!-- Modal CRUD Genérico -->
  <ModalCRUDRegister
    :visible="showModal"
    :action="currentAction"
    :modelName="'movimiento de stock'"
    :recordData="selectedStockMovement"
    :componentMap="stockMovementComponentMap"
    @close="closeModal"
    @finish="handleFinishAction"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import TabLayout from '~components/TabLayout.vue';
import { useCrudApi } from '~composables/useCrudApi';
import { useToast } from 'primevue/usetoast';
import StockMovementReadDetails from '../stockMovements/StockMovementReadDetails.vue';
import { extractDate } from '@/helpers/dates';

const toast = useToast();

const route = useRoute();

const localFilters = ref({
  id_category: route.query?.id_category || null,
  low_stock: route.query?.low_stock==='true' || false,
});

const {
  data: stockMovementsData,
  loading: stockMovementsLoading,
  error: stockMovementsError,
  filters: stockMovementsFilters,
  pagination: stockMovementsPagination,
  fetchData: fetchStockMovements,
  fetchFilters: fetchStockMovementFilters
} = useCrudApi();

const {
  data: singleStockMovementData,
  // loading: singleStockMovementLoading,
  error: singleStockMovementError,
  fetchById
} = useCrudApi();

// Cargar filtros al montar
onMounted(async () => {
  await fetchStockMovementFilters();
  await fetchStockMovements({ ...route.query, page: route.query?.page || 1 });
});

const handleViewStockMovement = async(e) => { 
  const stockMovement = await fetchById(e.id)
  if(!singleStockMovementError.value && singleStockMovementData.value){
    openModal('read', stockMovement);
  } else {
    toast.add({ severity: 'error', closable: true, summary: 'Error al obtener el movimiento de stock:'  + singleStockMovementError.value });  
    return;
  }
 }

  const handleSearch = async(searchTerm) => {
    console.log('Buscando mov. de stock por termino:', searchTerm);
    await fetchStockMovements({ ...route.query, ...localFilters.value, search: searchTerm, page: 1 });
  };

const handlePageChange = async(page) => {
  console.log('Cambiar a página:', page);
  await fetchStockMovements({ ...route.query, page });
};

const applyFilters = async() => {
  await fetchStockMovements({ ...route.query, ...localFilters.value, page: 1});
};

const tabLayoutRef = ref(null);

// Mapa de componentes CRUD para movimientos de stock
const stockMovementComponentMap = {
  read: StockMovementReadDetails,
  create: null,
  edit: null,
  delete: null,
};

// Estado de la aplicación
const showModal = ref(false);
const currentAction = ref('read');
const selectedStockMovement = ref({});

// Abrir modal con la acción y datos específicos
const openModal = (action, stockMovement = {}) => {
  currentAction.value = action;
  selectedStockMovement.value = stockMovement;
  showModal.value = true;
};

// Cerrar modal y limpiar estado
const closeModal = () => {
  showModal.value = false;
  setTimeout(() => {
    selectedStockMovement.value = {};
    currentAction.value = 'read';
  }, 300);
};

// Manejar el submit del formulario según la acción
const handleFinishAction = (modalData) => {
  // console.log('📦 Datos recibidos desde el modal:', modalData);
  console.log('🔧 Acción ejecutada:', currentAction.value);

  switch (currentAction.value) {
    case 'create':
      handleCreate(modalData);
      break;
    case 'edit':
      handleUpdate(modalData);
      break;
    case 'delete':
      handleDelete(modalData);
      break;
  }
};

// Crear nuevo movimiento de stock
const handleCreate = async(modalData) => {
  if(modalData){
    closeModal()
    toast.add({ severity: 'success', life: 3000, summary: 'StockMovemento creado exitosamente' });  
    await fetchStockMovements({ ...route.query, ...localFilters.value });
  }
}; 

// Actualizar movimiento de stock existente
const handleUpdate = async(modalData) => {
  if(modalData){
    closeModal()
    toast.add({ severity: 'success', life: 3000, summary: 'StockMovemento actualizado exitosamente' });  
    await fetchStockMovements({ ...route.query, ...localFilters.value });
  }
};

// Eliminar movimiento de stock
const handleDelete = async(modalData) => {
  if(modalData){
    closeModal()
    toast.add({ severity: 'success', life: 3000, summary: 'StockMovemento eliminado exitosamente' });  
    await fetchStockMovements({ ...route.query, ...localFilters.value });
  }
};

const handleClearFilters = async(newFilters) => { 
  localFilters.value.id_category = null;
  localFilters.value.low_stock = false;

  await fetchStockMovements(newFilters);
}

const handleOpenOrder = (order) => { 
  alert('EN DESARROLLO: Abrir pedido con ID ' + order?.id); 
}
</script>

<style scoped>
.filter-select {
  padding: 0.625rem 0.75rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.375rem;
  color: #fff;
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
  min-width: 120px;
  transition: border-color 0.2s;
}

.filter-select:focus {
  border-color: #3b82f6;
}

.filter-select option {
  background: #1e293b;
  color: #fff;
}

.stockMovement-card {
  background: #cbd5e1;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.stockMovement-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.stockMovement-image {
  width: 100%;
  height: 150px;
  background: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.stockMovement-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stockMovement-info {
  padding: 1rem;
}

.stockMovement-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.stockMovement-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
  margin: 0 0 0.5rem 0;
}

.stockMovement-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.stockMovement-status.activo {
  background: #dcfce7;
  color: #166534;
}

.stockMovement-status.inactivo {
  background: #fee2e2;
  color: #991b1b;
}
</style>