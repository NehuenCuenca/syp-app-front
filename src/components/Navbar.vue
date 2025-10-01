<template>
  <nav class="navbar">
    <Menubar :model="items" />
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
        icon: 'pi pi-receipt',
        command: () => {
          router.push({name: 'Pedidos'})
        }
    },
    {
        label: 'Movimientos',
        icon: 'pi pi-arrow-right-arrow-left',
        command: () => {
          router.push({name: 'Movimientos de stock'})
        }
    },
    {
        label: 'Productos',
        icon: 'pi pi-th-large',
        command: () => {
          router.push({name: 'Productos'})
        }
    },
    {
        label: 'Contactos',
        icon: 'pi pi-users',
        command: () => {
          router.push({name: 'Contactos'})
        }
    },
    {
        label: 'Cerrar sesión',
        icon: 'pi pi-sign-out',
        class: 'logout-button',
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
  router.push({name: 'Login'});
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

.logout-button .p-menubar-end	{
  color: var(--error-color-900) !important;
}

</style>