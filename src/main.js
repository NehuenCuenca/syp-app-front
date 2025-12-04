import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Lara from '@primeuix/themes/lara';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice'
import './style.css'
import App from './App.vue'
import router from './router'
import './plugins/axios'
import { useAuthStore } from './stores/auth'
import { definePreset } from '@primeuix/themes';

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ToastService)
app.use(ConfirmationService)

const MyPreset = definePreset(Lara, {
    components: {
        toast: {
            colorScheme: {
                dark: {
                    success: {
                        background: '{green.800}',
                        color: '{green.100}',
                    },
                    error: {
                        background: '{red.800}',
                        color: '{red.100}',
                    },
                }
            }
        },
    },
    semantic: {
        primary: {
            50: '{indigo.50}',
            100: '{indigo.100}',
            200: '{indigo.200}',
            300: '{indigo.300}',
            400: '{indigo.400}',
            500: '{indigo.500}',
            600: '{indigo.600}',
            700: '{indigo.700}',
            800: '{indigo.800}',
            900: '{indigo.900}',
            950: '{indigo.950}'
        },
        
        colorScheme: {
            light: {
                semantic: {
                    highlight: {
                        background: '{primary.50}',
                        color: '{primary.700}',
                    }
                }
            },
            dark: {
                surface: {
                    0: '#ffffff',
                    50: '{slate.50}',
                    100: '{slate.100}',
                    200: '{slate.200}',
                    300: '{slate.300}',
                    400: '{slate.400}',
                    500: '{slate.500}',
                    600: '{slate.600}',
                    700: '{slate.700}',
                    800: '{slate.800}',
                    900: '{slate.900}',
                    950: '{slate.950}'
                },
                semantic: {
                    highlight: {
                        background: '{primary.200}',
                        color: '{primary.900}',
                    },
                }
            }
        }
    },
});

app.use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            darkModeSelector: '.my-app-dark',
        },
    }
 });

const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
