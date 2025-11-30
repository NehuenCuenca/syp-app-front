<template>
  <TabLayout
    :loading="productsLoading"
    :error="productsError"
    :filters="productsFilters"
    title="Productos"
    :icon-class="route.meta?.icon || 'pi pi-th-large'"
    :total-pages="productsPagination?.total_pages"
    :total-items="productsPagination?.total"
    :current-page="productsPagination?.current_page"
    :items-per-page="9"
    @create="() => openModal('create')"
    @search="handleSearch"
    @page-change="handlePageChange"
    @clear-filters="handleClearFilters"
    ref="tabLayoutRef"
  >
    <template #second-button>
      <Button icon="pi pi-download" label="Descargar catalogo" severity="secondary" @click="handleDownloadCatalog" />
    </template>

    <!-- Filtros personalizados -->
    <template #filter-1>
      <div class="flex items-center gap-2">
        <Checkbox v-model="localFilters.low_stock" @change="applyFilters" inputId="isLowStock" name="is_low_stock" binary/>
        <label for="isLowStock">Stock bajo</label>
      </div>
    </template>

    <template #filter-2>
      <Select v-model="localFilters.id_category" @change="applyFilters" :options="productsFilters.categories" optionLabel="search_alias" optionValue="id" placeholder="Categoria" showClear />
    </template>

    <!-- <template #filter-3></template> -->

    <!-- Tarjetas de productos -->
    <template #cards>
      <UniversalCard
        v-for="product in productsData"
        :primary-text="`${product.search_alias}`"
        :secondary-text="product.stock_availability"
        :secondary-color="(product.is_low_stock) ? 'var(--error-color-900)':'var(--success-color-900)'"
        :tertiary-text="product.category.search_alias"
        card-type="producto"
        @view="() => handleViewProduct(product)"
        @edit="() => handleEditProduct(product)"
        @delete="() => handleDeleteProduct(product)"
      />
    </template>
  </TabLayout>

  <!-- Modal CRUD Genérico -->
  <ModalCRUDRegister
    :visible="showModal"
    :action="currentAction"
    :modelName="'producto'"
    :recordData="selectedProduct"
    :componentMap="productComponentMap"
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
import ProductCreateForm from '~views/products/ProductCreateForm.vue';
import ProductEditForm from '~views/products/ProductEditForm.vue';
import ProductReadDetails from '~views/products/ProductReadDetails.vue';
import ProductDeleteConfirm from '~views/products/ProductDeleteConfirm.vue';
import { useConfirm } from "primevue/useconfirm";
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';


const toast = useToast();
const route = useRoute();
const confirm = useConfirm();

const localFilters = ref({
  id_category: route.query?.id_category || null,
  low_stock: route.query?.low_stock==='true' || false,
});

const {
  data: productsData,
  loading: productsLoading,
  error: productsError,
  filters: productsFilters,
  pagination: productsPagination,
  fetchData: fetchProducts,
  fetchFilters: fetchProductFilters
} = useCrudApi();

const {
  data: singleProductData,
  // loading: singleProductLoading,
  error: singleProductError,
  fetchById,
  deleteItem
} = useCrudApi();

// Cargar filtros al montar
onMounted(async () => {
  await fetchProductFilters();
  await fetchProducts({ ...route.query, page: route.query?.page || 1 });
});

const handleViewProduct = async(e) => { 
  const product = await fetchById(e.id)
  if(!singleProductError.value && singleProductData.value){
    openModal('read', product);
  } else {
    toast.add({ severity: 'error', closable: true, summary: 'Error al obtener el producto:'  + singleProductError.value });  
    return;
  }
 }

const handleEditProduct = async(e) => { 
  const product = await fetchById(e.id)
  if(!singleProductError.value && singleProductData.value){
    openModal('edit', product);
  } else {
    toast.add({ severity: 'error', closable: true, summary: 'Error al obtener el producto:'  + singleProductError.value });  
    return;
  }
 }

const handleDeleteProduct = async(e) => { 
  const product = await fetchById(e.id)
  showModal.value = false
  currentAction.value = 'delete' 
  selectedProduct.value = product 

  const resetModalData = () => { 
    currentAction.value = 'create' 
    selectedProduct.value = {}
  }

  confirm.require({
      message: `¿Estas seguro de borrar "${product.search_alias}"?`,
      header: 'Borrar producto',
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
        const deletedProduct = await deleteItem(product.id)
          if(!singleProductError.value && deletedProduct){
            toast.add({ severity: 'success', closable: true, summary: `Producto eliminado exitosamente`, life: 3500 });  
            resetModalData()
            await fetchProducts({ ...route.query, ...localFilters.value });

          } else {
            console.error('Error al eliminar el producto:', error.value);
            toast.add({ severity: 'error', closable: true, summary: `Error al eliminar el producto: ${product.search_alias}`, life: 3500});  
            resetModalData()
            return
          }
      },
      reject: () => resetModalData()
  });
}

const handleSearch = async(searchTerm) => {
  console.log('Buscando:', searchTerm);
  await fetchProducts({ ...route.query, ...localFilters.value, search: searchTerm, page: 1 });
};

const handlePageChange = async(page) => {
  console.log('Cambiar a página:', page);
  await fetchProducts({ ...route.query, page });
};

const applyFilters = async() => {
  await fetchProducts({ ...route.query, ...localFilters.value, page: 1});
};

const tabLayoutRef = ref(null);

// Mapa de componentes CRUD para productos
const productComponentMap = {
  create: ProductCreateForm,
  edit: ProductEditForm,
  read: ProductReadDetails,
  delete: ProductDeleteConfirm
};

// Estado de la aplicación
const showModal = ref(false);
const currentAction = ref('create');
const selectedProduct = ref({});

// Abrir modal con la acción y datos específicos
const openModal = (action, product = {}) => {
  currentAction.value = action;
  selectedProduct.value = product;
  showModal.value = true;
};

// Cerrar modal y limpiar estado
const closeModal = () => {
  showModal.value = false;
  setTimeout(() => {
    selectedProduct.value = {};
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

// Crear nuevo producto
const handleCreate = async(modalData) => {
  if(modalData){
    closeModal()
    toast.add({ severity: 'success', life: 3000, summary: 'Producto creado exitosamente' });  
    await fetchProducts({ ...route.query, ...localFilters.value });
  }
}; 

// Actualizar producto existente
const handleUpdate = async(modalData) => {
  if(modalData){
    closeModal()
    toast.add({ severity: 'success', life: 3000, summary: 'Producto actualizado exitosamente' });  
    await fetchProducts({ ...route.query, ...localFilters.value });
  }
};

// Eliminar producto
const handleDelete = async(modalData) => {
  if(modalData){
    closeModal()
    toast.add({ severity: 'success', life: 3000, summary: 'Producto eliminado exitosamente' });  
    await fetchProducts({ ...route.query, ...localFilters.value });
  }
};

const handleClearFilters = async(newFilters) => { 
  localFilters.value.id_category = null;
  localFilters.value.low_stock = false;

  await fetchProducts(newFilters);
}

const authStore = useAuthStore()

const handleDownloadCatalog = async() => { 
  try {
    const { VITE_BACKEND_LOCAL_API_URL, VITE_BACKEND_SHARED_NETWORK_API_URL } = import.meta.env
    const linkToApi = new URL(`${VITE_BACKEND_SHARED_NETWORK_API_URL}/api/products/export-catalog`);
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
      : link.setAttribute('download', `catalogo_productos_${Date.now()}.xlsx`);

    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log('la descarga del catalogo falló', error);
    toast.add({ severity: 'error', closable: true, summary: 'Error al descargar el catalogo:'  + error });
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

.product-card {
  background: #cbd5e1;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.product-image {
  width: 100%;
  height: 150px;
  background: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 1rem;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
  margin: 0 0 0.5rem 0;
}

.product-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.product-status.activo {
  background: #dcfce7;
  color: #166534;
}

.product-status.inactivo {
  background: #fee2e2;
  color: #991b1b;
}
</style>