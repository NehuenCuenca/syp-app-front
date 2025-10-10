<template>
  <TabLayout
    title="Productos"
    icon-class="pi-box"
    :total-pages="totalPages"
    :total-items="products.length"
    :items-per-page="9"
    @create="handleCreate"
    @search="handleSearch"
    @page-change="handlePageChange"
  >
    <!-- Filtros personalizados -->
    <template #filter-1>
      <select v-model="filters.category" @change="applyFilters" class="filter-select">
        <option value="">Filtro 1</option>
        <option value="electronics">Electrónica</option>
        <option value="clothing">Ropa</option>
        <option value="food">Alimentos</option>
      </select>
    </template>

    <template #filter-2>
      <select v-model="filters.status" @change="applyFilters" class="filter-select">
        <option value="">Filtro 2</option>
        <option value="active">Activos</option>
        <option value="inactive">Inactivos</option>
      </select>
    </template>

    <template #filter-3>
      <select v-model="filters.stock" @change="applyFilters" class="filter-select">
        <option value="">Filtro 3</option>
        <option value="in_stock">En stock</option>
        <option value="low_stock">Stock bajo</option>
        <option value="out_of_stock">Sin stock</option>
      </select>
    </template>

    <!-- Tarjetas de productos -->
    <template #cards>
      <UniversalCard
        v-for="product in products"
        :primary-text="product.name"
        :secondary-text="product.status"
        :tertiary-text="product.price"
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
// import axios from 'axios';

const route = useRoute();

const products = ref([]);
const totalPages = ref(68);
const filters = ref({
  category: '',
  status: '',
  stock: ''
});

// Cargar productos
const loadProducts = async () => {
  try {
    // Ejemplo de cómo se haría la petición
    // const params = {
    //   search: route.query.search,
    //   page: route.query.page || 1,
    //   sort_by: route.query.sort_by,
    //   sort_direction: route.query.sort_direction,
    //   category: filters.value.category,
    //   status: filters.value.status,
    //   stock: filters.value.stock
    // };
    
    // const response = await axios.get('/api/products', { params });
    // products.value = response.data.items;
    // totalPages.value = response.data.totalPages;
    
    // Datos de ejemplo
    products.value = Array.from({ length: 29 }, (_, i) => ({
      id: i + 1,
      name: `Producto ${i + 1}`,
      price: (Math.random() * 100).toFixed(2),
      status: Math.random() > 0.5 ? 'activo' : 'inactivo',
      image: `https://via.placeholder.com/200x150?text=Producto+${i + 1}`
    }));
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
};

const handleViewProduct = (e) => { 
  console.log('handleViewProduct', e);
 }

// Handlers
const handleCreate = () => {
  console.log('Crear nuevo producto');
  // Navegar a formulario de creación o abrir modal
};

const handleSearch = (searchTerm) => {
  console.log('Buscando:', searchTerm);
  loadProducts();
};

const handlePageChange = (page) => {
  console.log('Cambiar a página:', page);
  loadProducts();
};

const applyFilters = () => {
  console.log('Aplicar filtros:', filters.value);
  loadProducts();
};

// Observar cambios en query params
watch(() => route.query, () => {
  loadProducts();
}, { deep: true });

onMounted(() => {
  loadProducts();
});
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