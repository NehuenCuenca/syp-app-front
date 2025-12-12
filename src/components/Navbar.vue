<template>
  <nav>
    <Menubar class="bg-surface-800 py-4 px-6 shadow-md" :model="items" />
    <ConfirmDialog></ConfirmDialog>
  </nav>
</template>

<script setup>
import { useToast } from 'primevue/usetoast';
import { useConfirm } from "primevue/useconfirm";
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const toast = useToast();
const confirm = useConfirm();

const showMessage = (success, message) => {
  const severity = success ? 'success' : 'error';
  toast.add({ severity, life: 3000, summary: message  });
};

const items = ref([
    {
        label: 'Pedidos',
        icon: 'pi pi-receipt',
        class: 'text-lg',
        command: () => {
          router.push({name: 'Pedidos'})
        }
    },
    {
        label: 'Movimientos',
        icon: 'pi pi-arrow-right-arrow-left',
        class: 'text-lg',
        command: () => {
          router.push({name: 'Movimientos de stock'})
        }
    },
    {
        label: 'Productos',
        icon: 'pi pi-th-large',
        class: 'text-lg',
        command: () => {
          router.push({name: 'Productos'})
        }
    },
    {
        label: 'Contactos',
        icon: 'pi pi-users',
        class: 'text-lg',
        command: () => {
          router.push({name: 'Contactos'})
        }
    },
    {
        label: 'Cerrar sesión',
        icon: 'pi pi-sign-out',
        class: 'logout-button text-xl',
        command: () => {
          handleLogout()
        },
    },
]);

const router = useRouter();
const authStore = useAuthStore();
const handleLogout = async() => {
  confirm.require({
      message: '¿Estas seguro de cerrar la sesión?',
      header: 'Cerrando sesión',
      icon: 'pi pi-info-circle',
      rejectLabel: 'No, cancelar',
      rejectProps: {
          label: 'No, cancelar',
          severity: 'secondary',
          outlined: true
      },
      acceptProps: {
          label: 'Si, cerrar',
          severity: 'danger'
      },
      accept: async() => {
        const { success, message } = await authStore.logout();
        showMessage(success, message);
        router.push({name: 'Login'});
      },
      reject: () => null
  });
  
};
</script>

<style>

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