<script setup>
import Toast from 'primevue/toast';
import Navbar from './components/Navbar.vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore()
</script>

<template>
  <div>
    <header>
      <Navbar v-if="authStore.isLoggedIn"/>
    </header>
    <main>
      <router-view />
      <Toast position="bottom-right"/>
    </main>
  </div>
</template>

<style scoped></style>