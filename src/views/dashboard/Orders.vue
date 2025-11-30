<template>
  <TabLayout
    :loading="ordersLoading"
    :error="ordersError"
    :filters="ordersFilters"
    title="Pedidos"
    :icon-class="route.meta?.icon || 'pi pi-th-large'"
    :total-pages="ordersPagination?.total_pages"
    :total-items="ordersPagination?.total"
    :current-page="ordersPagination?.current_page"
    :items-per-page="9"
    @create="() => openModal('create')"
    @search="handleSearch"
    @page-change="handlePageChange"
    @clear-filters="handleClearFilters"
    ref="tabLayoutRef"
  >
    <!-- Filtros personalizados -->
    <!-- <template #filter-1>
      <label for="before_equal_date">Fecha y anteriores</label>
      <DatePicker v-model="localFilters.before_equal_date" id="before_equal_date" showIcon dateFormat="yy/mm/dd" :maxDate="createDateFromDDMMYYYY(ordersFilters.before_equal_date)" @change="applyFilters" /> 
    </template> -->

    <!-- <template #filter-2>
      <Select v-model="localFilters.id_category" @change="applyFilters" :options="ordersFilters.categories" optionLabel="search_alias" optionValue="id" placeholder="Categoria" showClear />
    </template> -->

    <!-- <template #filter-3></template> -->

    <!-- Tarjetas de pedidos -->
    <template #cards>
      <UniversalCard
        v-for="order in ordersData"
        :primary-text="order.search_alias"
        :secondary-text="order.order_type_with_total_net"
        :tertiary-text="order.created_at"
        card-type="pedido"
        :is-exportable="order.is_exportable"
        @view="() => handleViewOrder(order)"
        @edit="() => handleEditOrder(order)"
        @delete="() => handleDeleteOrder(order)"
        @download="() => handleDownloadOrder(order)"
      />
    </template>
  </TabLayout>

  <!-- Modal CRUD Genérico -->
  <ModalCRUDRegister
    :visible="showModal"
    :action="currentAction"
    :modelName="'pedido'"
    :recordData="selectedOrder"
    :componentMap="orderComponentMap"
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
import ModalCRUDRegister from '~components/ModalCRUDRegister.vue';
import OrderCreateForm from '~views/orders/OrderCreateForm.vue';
import OrderReadDetails from '~views/orders/OrderReadDetails.vue';
import OrderEditForm from '~views/orders/OrderEditForm.vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useConfirm } from 'primevue';
// import OrderDeleteConfirm from '~views/orders/OrderDeleteConfirm.vue';

const toast = useToast();
const route = useRoute();
const confirm = useConfirm();

const localFilters = ref({
  before_equal_date: route.query?.before_equal_date || null,
});

const {
  data: ordersData,
  loading: ordersLoading,
  error: ordersError,
  filters: ordersFilters,
  pagination: ordersPagination,
  fetchData: fetchOrders,
  fetchFilters: fetchOrderFilters
} = useCrudApi();

const {
  data: singleOrderData,
  // loading: singleOrderLoading,
  error: singleOrderError,
  fetchById,
  deleteItem
} = useCrudApi();

// Cargar filtros al montar
onMounted(async () => {
  await fetchOrderFilters();
  await fetchOrders({ ...route.query, page: route.query?.page || 1 });
});

const handleViewOrder = async(e) => { 
  const order = await fetchById(e.id)
  if(!singleOrderError.value && singleOrderData.value){
    openModal('read', order);
  } else {
    toast.add({ severity: 'error', closable: true, summary: 'Error al obtener el pedido:'  + singleOrderError.value });  
    return;
  }
 }

const handleEditOrder = async(e) => { 
  const order = await fetchById(e.id)
  if(!singleOrderError.value && singleOrderData.value){
    openModal('edit', order);
  } else {
    toast.add({ severity: 'error', closable: true, summary: 'Error al obtener el pedido:'  + singleOrderError.value });  
    return;
  }
 }

 const handleDeleteOrder = async(e) => {
  const order = await fetchById(e.id)
  showModal.value = false
  currentAction.value = 'delete' 
  selectedOrder.value = order 

  const resetModalData = () => { 
    currentAction.value = 'create' 
    selectedOrder.value = {}
  }

  confirm.require({
      message: `¿Estas seguro de borrar "${order.search_alias}"?`,
      header: 'Borrar pedido',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'No, cancelar',
      rejectProps: {
          label: 'No, cancelar',
          severity: 'secondary',
          outlined: true
      },
      acceptProps: {
          label: 'Si, borrar',
          severity: 'danger'
      },
      accept: async() => {
        const deletedOrder = await deleteItem(order.id)
          if(!singleOrderError.value && deletedOrder){
            toast.add({ severity: 'success', closable: true, summary: `Pedido eliminado exitosamente`, life: 3500 });  
            resetModalData()
            await fetchOrders({ ...route.query, ...localFilters.value });
          } else {
            console.error('Error al eliminar el pedido:', error.value);
            toast.add({ severity: 'error', closable: true, summary: `Error al eliminar el pedido: ${order.search_alias}`, life: 3500});  
            resetModalData()
            return
          }
      },
      reject: () => resetModalData()
  });
}

/* const handleDeleteOrder = async(e) => { 
  const order = await fetchById(e.id)
  if(!singleOrderError.value && singleOrderData.value){
    openModal('delete', order);
  } else {
    toast.add({ severity: 'error', closable: true, summary: 'Error al obtener el pedido:'  + singleOrderError.value });  
    return;
  }
 } */

const handleSearch = async(searchTerm) => {
  console.log('Buscando:', searchTerm);
  await fetchOrders({ ...route.query, ...localFilters.value, search: searchTerm, page: 1 });
};

const handlePageChange = async(page) => {
  console.log('Cambiar a página:', page);
  await fetchOrders({ ...route.query, page });
};

const applyFilters = async() => {
  await fetchOrders({ ...route.query, ...localFilters.value, page: 1});
};

const tabLayoutRef = ref(null);

// Mapa de componentes CRUD para pedidos
const orderComponentMap = {
  read: OrderReadDetails,
  create: OrderCreateForm,
  edit: OrderEditForm,
  // delete: OrderDeleteConfirm
};

// Estado de la aplicación
const showModal = ref(false);
const currentAction = ref('create');
const selectedOrder = ref({});

// Abrir modal con la acción y datos específicos
const openModal = (action, order = {}) => {
  currentAction.value = action;
  selectedOrder.value = order;
  showModal.value = true;
};

// Cerrar modal y limpiar estado
const closeModal = () => {
  showModal.value = false;
  setTimeout(() => {
    selectedOrder.value = {};
    currentAction.value = 'create';
  }, 300);
};

// Manejar el submit del formulario según la acción
const handleFinishAction = (modalData) => {
  console.log('📦 Datos recibidos desde el modal:', modalData);
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

// Crear nuevo pedido
const handleCreate = async(modalData) => {
  if(modalData){
    closeModal()
    toast.add({ severity: 'success', life: 3000, summary: 'Pedido creado exitosamente' });  
    await fetchOrders({ ...route.query, ...localFilters.value });
  }
}; 

// Actualizar pedido existente
const handleUpdate = async(modalData) => {
  if(modalData){
    closeModal()
    toast.add({ severity: 'success', life: 3000, summary: 'Pedido actualizado exitosamente' });  
    await fetchOrders({ ...route.query, ...localFilters.value });
  }
};

// Eliminar pedido
const handleDelete = async(modalData) => {
  if(modalData){
    closeModal()
    toast.add({ severity: 'success', life: 3000, summary: 'Pedido eliminado exitosamente' });  
    await fetchOrders({ ...route.query, ...localFilters.value });
  }
};

const handleClearFilters = async(newFilters) => { 
  localFilters.value.id_category = null;
  localFilters.value.low_stock = false;

  await fetchOrders(newFilters);
}

const authStore = useAuthStore()

const handleDownloadOrder = async(order) => { 
  try {
    const { VITE_BACKEND_LOCAL_API_URL, VITE_BACKEND_SHARED_NETWORK_API_URL } = import.meta.env
    const linkToApi = new URL(`${VITE_BACKEND_LOCAL_API_URL}/api/orders/${order.id}/export-excel`);
    linkToApi.searchParams.append("include_header", 1);
    const response = await axios.get(linkToApi, {
      responseType: 'blob', // Importante para manejar archivos binarios
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
    }); 

    const filename = response.headers.get('x-filename');

    // Crear un enlace para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    // get filename from content-disposition header if exists
    (filename.length>0)
      ? link.setAttribute('download', filename)
      : link.setAttribute('download', `pedido_${order.code}.xlsx`);

    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log('la descarga de boleta falló', error);
    toast.add({ severity: 'error', closable: true, summary: 'Error al descargar el pedido:'  + error });
  }
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

.order-card {
  background: #cbd5e1;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.order-image {
  width: 100%;
  height: 150px;
  background: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.order-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.order-info {
  padding: 1rem;
}

.order-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.order-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
  margin: 0 0 0.5rem 0;
}

.order-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.order-status.activo {
  background: #dcfce7;
  color: #166534;
}

.order-status.inactivo {
  background: #fee2e2;
  color: #991b1b;
}
</style>