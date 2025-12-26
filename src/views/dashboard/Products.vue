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
    <template #download-btn>
      <Button type="button" icon="pi pi-download" label="Descargar" severity="secondary" @click="togglePopover" />
      <Popover ref="op">
        <div class="flex flex-col gap-3">
          <Message size="small" severity="secondary">Catálogo de tipo...</Message>
          <ButtonGroup>
            <Button label="Público (sin)" severity="primary" @click="() => handleDownloadCatalog(true)" />
              <Button label="Privado (con)" severity="secondary" @click="() => handleDownloadCatalog(false)" />
            </ButtonGroup>
        </div>
      </Popover>
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
        :tertiary-text="product.category.search_alias"
        card-type="producto"
        @view="() => handleViewProduct(product)"
        @edit="() => handleEditProduct(product)"
        @delete="() => handleDeleteProduct(product)"
        @restore="() => handleRestoreProduct(product)"
        :is-deleted="!!product.deleted_at"
      >
      <template #product-stock>
        <Tag class="w-fit" v-if="!product.is_low_stock && !product.is_empty_stock" severity="success" value="Success">{{product.stock_availability}}</Tag>
        <Tag class="w-fit" v-else-if="product.is_empty_stock" severity="danger" value="Danger">{{product.stock_availability}}</Tag>
        <Tag class="w-fit" v-else="product.is_low_stock && !product.is_empty_stock" severity="warn" value="Warn">{{product.stock_availability}}</Tag>
      </template>
    </UniversalCard>
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
import { createTemporalLink, getAxiosConfigForBlobResponse } from '@/helpers/downloads';


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
  deleteItem,
  restoreItem
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
            console.error('Error al eliminar el producto:', singleProductError.value);
            toast.add({ severity: 'error', closable: true, summary: `Error al eliminar el producto: ${product.search_alias}`, life: 3500});  
            resetModalData()
            return
          }
      },
      reject: () => resetModalData()
  });
}

const handleRestoreProduct = async(product) => { 
    const restoredProduct = await restoreItem(product.id)
    
    if(!singleProductError.value && restoredProduct){
      toast.add({ severity: 'success', closable: true, summary: `Producto recuperado exitosamente`, life: 3500 });  
      await fetchProducts({ ...route.query, ...localFilters.value });
    } else {
      console.error('Error al recuperar el producto:', singleProductError.value);
      toast.add({ severity: 'error', closable: true, summary: `Error al recuperar el producto: ${product.search_alias}`, life: 3500});  
      return
    }
}

const handleSearch = async(searchTerm) => {
  console.log('Buscando producto por termino:', searchTerm);
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

const op = ref();
const togglePopover = (event) => {
  op.value.toggle(event);
}

const handleDownloadCatalog = async(exclude_special_category=false) => { 
  try {
    const linkToApi = new URL(`${axios.defaults.baseURL}/products/export-catalog`);
    if(exclude_special_category) linkToApi.searchParams.append("exclude_category", 28);

    const response = await axios.get(linkToApi, { ...getAxiosConfigForBlobResponse() }); 
    const filename = response.headers.get('x-filename') || `catalogo_productos_${Date.now()}.xlsx`;

    createTemporalLink({ blob: response.data, filename })
    const catalogType = (exclude_special_category) ? 'PUBLICO' : 'PRIVADO'
    toast.add({ severity: 'success', closable: true, life: 3500, summary: `Se descargó catalogo ${catalogType}.` });
  } catch (error) {
    console.error('la descarga del catalogo falló', error);
    toast.add({ severity: 'error', closable: true, summary: 'Error al descargar el catalogo:'  + error });
  }
}
</script>

<style scoped></style>