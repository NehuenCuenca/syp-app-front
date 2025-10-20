<template>
  <nav>
    <Menubar class="navbar" :model="items" />
  </nav>
</template>

<script setup>
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

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

<style>
.navbar {
  background: var(--bg-color-3);
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.p-menubar-item.logout-button .p-menubar-item-label{
  color: var(--p-red-200);
}
.p-menubar-item.logout-button:not(.p-disabled) > .p-menubar-item-content:hover .p-menubar-item-icon{
  color: var(--p-red-400);
}
.p-menubar-item.logout-button:hover .p-menubar-item-label{
  color: var(--p-red-200);
}
</style>