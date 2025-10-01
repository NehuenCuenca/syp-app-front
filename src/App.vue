<script setup>
import Toast from 'primevue/toast';
import Navbar from './components/Navbar.vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore()
</script>

<template>
  <div>
    <Navbar v-if="authStore.isLoggedIn"/>
    <router-view />
    <Toast position="bottom-right"/>
  </div>
</template>

<style scoped></style>
