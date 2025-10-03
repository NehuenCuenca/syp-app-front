import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Lara from '@primeuix/themes/lara';
import ToastService from 'primevue/toastservice';
import './style.css'
import App from './App.vue'
import router from './router'
import './plugins/axios'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ToastService)
app.use(PrimeVue, {
    theme: {
        preset: Lara,
        options: {
            prefix: 'p',
            darkModeSelector: '.my-app-dark',
        },
    }
})

const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
