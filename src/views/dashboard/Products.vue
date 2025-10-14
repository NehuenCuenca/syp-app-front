<template>
  <TabLayout
    :loading="loading"
    :error="error"
    :filters="filters"
    title="Productos"
    icon-class="pi-box"
    :total-pages="pagination?.total_pages"
    :total-items="pagination?.total"
    :items-per-page="9"
    @create="handleCreate"
    @search="handleSearch"
    @page-change="handlePageChange"
    ref="tabLayoutRef"
  >
    <!-- Filtros personalizados -->
    <template #filter-1>
      <div class="flex items-center gap-2">
        <Checkbox v-model="localFilters.low_stock" @change="applyFilters" inputId="isLowStock" name="is_low_stock" binary/>
        <label for="isLowStock">Stock bajo</label>
      </div>
    </template>

    <template #filter-2>
      <Select v-model="localFilters.id_category" @change="applyFilters" :options="filters.categories" optionLabel="name" optionValue="id" placeholder="Categoria" showClear />
    </template>

    <!-- <template #filter-3></template> -->

    <!-- Tarjetas de productos -->
    <template #cards>
      <UniversalCard
        v-for="product in data"
        :primary-text="product.name"
        :secondary-text="product.current_stock + ' disponibles'"
        :tertiary-text="'ID '+product.id"
        :secondary-color="(product.is_low_stock) ? 'var(--error-color-900)':'var(--success-color-900)'"
        card-type="producto"
        @view="() => handleViewProduct(product)"
      />
    </template>
  </TabLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import TabLayout from '../../components/TabLayout.vue';
import { useCrudApi } from '../../composables/useCrudApi';

const route = useRoute();

const localFilters = ref({
  id_category: null,
  low_stock: false,
});

const {
  data,
  filters,
  pagination,
  loading,
  error,
  fetchFilters,
  fetchData,
  fetchById,
  createItem,
  updateItem,
  deleteItem
} = useCrudApi();

// Cargar filtros al montar
onMounted(async () => {
  await fetchFilters();
  await fetchData();
  console.log({data, filters, pagination, loading, error  });
});

const handleViewProduct = (e) => { 
  console.log('handleViewProduct', e);
 }

// Handlers
const handleCreate = () => {
  console.log('Crear nuevo producto');
  // Navegar a formulario de creación o abrir modal
};

const handleSearch = async(searchTerm) => {
  console.log('Buscando:', searchTerm);
  await fetchData();
};

const handlePageChange = async(page) => {
  console.log('Cambiar a página:', page);
  await fetchData();
};

const applyFilters = async() => {
  console.log('Aplicar filtros:', localFilters.value);
  tabLayoutRef.value.updateQueryParams({ ...localFilters.value, page: 1 });
  await fetchData(localFilters.value);
};

// Observar cambios en query params
watch(() => route.query, async() => {
    await fetchData();
}, { deep: true });

const tabLayoutRef = ref(null);

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