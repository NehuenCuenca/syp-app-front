<template>
  <TabLayout
    :loading="contactsLoading"
    :error="contactsError"
    :filters="contactsFilters"
    title="Contactos"
    icon-class="pi-users"
    :total-pages="contactsPagination?.total_pages"
    :total-items="contactsPagination?.total"
    :current-page="contactsPagination?.current_page"
    :items-per-page="9"
    @create="() => openModal('create')"
    @search="handleSearch"
    @page-change="handlePageChange"
    ref="tabLayoutRef"
  >
    <!-- Filtros personalizados -->
    <template #filter-1>
      <Select v-model="localFilters.contact_type" @change="applyFilters" :options="contactsFilters.contact_types"  placeholder="Tipo" showClear />
    </template>

    <!-- <template #filter-3></template> -->

    <!-- Tarjetas de contactos -->
    <template #cards>
      <UniversalCard
        v-for="contact in contactsData"
        :primary-text="`${contact.id}| ${contact.company_name}`"
        :secondary-text="contact.last_order"
        card-type="contacto"
        @view="() => handleViewContact(contact)"
        @edit="() => handleEditContact(contact)"
        @delete="() => handleDeleteContact(contact)"
      >
        <template #firstTertiaryText>
          <p>{{ contact.phone ?? 'VACÍO' }}</p>
        </template>
    </UniversalCard>
    </template>
  </TabLayout>

  <!-- Modal CRUD Genérico -->
  <ModalCRUDRegister
    :visible="showModal"
    :action="currentAction"
    :modelName="'contacto'"
    :recordData="selectedContact"
    :componentMap="contactComponentMap"
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
import ContactCreateForm from '~views/contacts/ContactCreateForm.vue';
import ContactEditForm from '~views/contacts/ContactEditForm.vue';
import ContactReadDetails from '~views/contacts/ContactReadDetails.vue';
import ContactDeleteConfirm from '~views/contacts/ContactDeleteConfirm.vue';

const toast = useToast();

const route = useRoute();

const localFilters = ref({
  contact_type: route.query?.contact_type || null,
});

const {
  data: contactsData,
  loading: contactsLoading,
  error: contactsError,
  filters: contactsFilters,
  pagination: contactsPagination,
  fetchData: fetchContacts,
  fetchFilters: fetchContactFilters
} = useCrudApi();

const {
  data: singleContactData,
  // loading: singleContactLoading,
  error: singleContactError,
  fetchById
} = useCrudApi();

// Cargar filtros al montar
onMounted(async () => {
  await fetchContactFilters();
  await fetchContacts({ ...route.query, page: route.query?.page || 1 });
});

const handleViewContact = async(e) => { 
  const contact = await fetchById(e.id)
  if(!singleContactError.value && singleContactData.value){
    openModal('read', contact);
  } else {
    toast.add({ severity: 'error', closable: true, summary: 'Error al obtener el contacto:'  + singleContactError.value });  
    return;
  }
 }

const handleEditContact = async(e) => { 
  const contact = await fetchById(e.id)
  if(!singleContactError.value && singleContactData.value){
    openModal('edit', contact);
  } else {
    toast.add({ severity: 'error', closable: true, summary: 'Error al obtener el contacto:'  + singleContactError.value });  
    return;
  }
 }

const handleDeleteContact = async(e) => { 
  const contact = await fetchById(e.id)
  if(!singleContactError.value && singleContactData.value){
    openModal('delete', contact);
  } else {
    toast.add({ severity: 'error', closable: true, summary: 'Error al obtener el contacto:'  + singleContactError.value });  
    return;
  }
 }

const handleSearch = async(searchTerm) => {
  console.log('Buscando:', searchTerm);
  await fetchContacts({ ...route.query, ...localFilters.value, search: searchTerm, page: 1 });
};

const handlePageChange = async(page) => {
  console.log('Cambiar a página:', page);
  await fetchContacts({ ...route.query, page });
};

const applyFilters = async() => {
  console.log('Aplicar filtros:', localFilters.value);
  tabLayoutRef.value.updateQueryParams({ ...route.query, ...localFilters.value, page: 1 });
  await fetchContacts({ ...route.query, ...localFilters.value, page: 1 });
};

const tabLayoutRef = ref(null);

// Mapa de componentes CRUD para contactos
const contactComponentMap = {
  create: ContactCreateForm,
  edit: ContactEditForm,
  read: ContactReadDetails,
  delete: ContactDeleteConfirm
};

// Estado de la aplicación
const showModal = ref(false);
const currentAction = ref('create');
const selectedContact = ref({});

// Abrir modal con la acción y datos específicos
const openModal = (action, contact = {}) => {
  currentAction.value = action;
  selectedContact.value = contact;
  showModal.value = true;
};

// Cerrar modal y limpiar estado
const closeModal = () => {
  showModal.value = false;
  setTimeout(() => {
    selectedContact.value = {};
    currentAction.value = 'create';
  }, 300);
};

// Manejar el submit del formulario según la acción
// ! CAMBIAR ESTO: no manejar el submit aca, manejar la logica en cada formulario individual (validaciones de back), y de ahi si, handlear la logica luego de creacion, actualizacion, eliminacion 
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

// Crear nuevo contacto
const handleCreate = async(modalData) => {
  if(modalData){
    closeModal()
    toast.add({ severity: 'success', life: 3000, summary: 'Contacto creado exitosamente' });  
    await fetchContacts({ ...route.query, ...localFilters.value });
  }
}; 

// Actualizar contacto existente
const handleUpdate = async(modalData) => {
  if(modalData){
    closeModal()
    toast.add({ severity: 'success', life: 3000, summary: 'Contacto actualizado exitosamente' });  
    await fetchContacts({ ...route.query, ...localFilters.value });
  }
};

// Eliminar contacto
const handleDelete = async(modalData) => {
  if(modalData){
    closeModal()
    toast.add({ severity: 'success', life: 3000, summary: 'Contacto eliminado exitosamente' });  
    await fetchContacts({ ...route.query, ...localFilters.value });
  }
};
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

.contact-card {
  background: #cbd5e1;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.contact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.contact-image {
  width: 100%;
  height: 150px;
  background: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.contact-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.contact-info {
  padding: 1rem;
}

.contact-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.contact-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
  margin: 0 0 0.5rem 0;
}

.contact-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.contact-status.activo {
  background: #dcfce7;
  color: #166534;
}

.contact-status.inactivo {
  background: #fee2e2;
  color: #991b1b;
}
</style>