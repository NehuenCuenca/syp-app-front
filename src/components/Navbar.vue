<template>
  <nav class="navbar">
    <!-- <div class="navbar-content">
      <div class="navbar-brand">
        <h1>SyP App</h1>
      </div>
      
      <div class="navbar-user">
        <button @click="handleLogout" class="logout-button">
          Cerrar sesión
        </button>
      </div>
    </div> -->
    <Menubar :model="items">

    </MenuBar>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Menubar from 'primevue/menubar';
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const showMessage = (success, message) => {
  const severity = success ? 'success' : 'error';
  toast.add({ severity, life: 3000, summary: message  });
};

const items = ref([
    {
        label: 'Pedidos',
        icon: 'pi pi-link',
        command: () => {
            router.push('/pedidos');
        }
    },
    {
        label: 'Movimientos',
        icon: 'pi pi-link',
        command: () => {
            router.push('/movimientos');
        }
    },
    {
        label: 'Productos',
        icon: 'pi pi-link',
        command: () => {
            router.push('/productos');
        }
    },
    {
        label: 'Contactos',
        icon: 'pi pi-link',
        command: () => {
            router.push('/contactos');
        }
    },
    {
        label: 'Cerrar sesión',
        icon: 'pi pi-link',
        command: () => {
          handleLogout()
        },
    },
]);

const router = useRouter();
const authStore = useAuthStore();
const handleLogout = async() => {
  const { success, message } = await authStore.logout();
  showMessage(success, message);
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  background: #333446;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.navbar-brand h1 {
  color: #B8CFCE;
  font-size: 1.5rem;
  margin: 0;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  color: white;
  font-size: 0.9rem;
}

.logout-button {
  padding: 0.5rem 1rem;
  background: transparent;
  color: #B8CFCE;
  border: 1px solid #B8CFCE;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.logout-button:hover {
  background: #B8CFCE;
  color: #333446;
}
</style>