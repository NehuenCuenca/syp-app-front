<template>
  <div class="min-h-dvh flex items-center justify-center p-4">
    <div class="max-w-md flex flex-col gap-6">
      <!-- Header -->
      <div class="text-center flex flex-col gap-1">
        <h1 class="text-2xl font-bold ">
          ¡Bienvenido a <span class="text-primary-300">SyP app</span>!
        </h1>
        <p class="text-primary-100">Inicia sesión y armá tus pedidos.</p>
      </div>

      <!-- Login Card -->
      <div class="bg-surface-200 rounded p-7 shadow-2xl flex flex-col gap-4">
        <h2 class="text-xl text-surface-800 font-semibold">Acceso a la plataforma</h2>

        <form @submit.prevent="handleSubmit" novalidate class="flex flex-col gap-6">
          <!-- Email Field -->
          <div class="flex flex-col gap-2">
            <label for="email" class="block text-lg text-surface-800">Email</label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              @blur="() => handleBlur('email')"
              @input="() => handleInput('email')"
              :class="['p-3 bg-surface-100 text-surface-800 border border-surface-900 outline-none rounded-lg placeholder:text-surface-400 focus:shadow-md', { 'border-red-400 focus:shadow-red-900': touched.email && errors.email }]"
              placeholder="tu@email.com"
            />
            <p v-if="touched.email && errors.email" class="text-md text-red-700">
              {{ errors.email }}
            </p>
          </div>

          <!-- Password Field -->
          <div class="flex flex-col gap-2">
            <label for="password" class="block text-lg text-surface-800">Contraseña</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              @blur="() => handleBlur('password')"
              @input="() => handleInput('password')"
              :class="['p-3 bg-surface-100 text-surface-800 border-1 border-surface-900 outline-none rounded-lg placeholder:text-surface-400 focus:shadow-md', { 'border-red-400 focus:shadow-red-900': touched.password && errors.password }]"
              placeholder="••••••••"
            />
            <p v-if="touched.password && errors.password" class="text-md text-red-700">
              {{ errors.password }}
            </p>
          </div>

          <!-- General Error Message -->
          <div v-if="errors.general" class="p-3 bg-red-100 border border-red-300 rounded-lg text-red-900 text-md">
            {{ errors.general }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="!isFormValid || isSubmitting"
            :class="['p-4 bg-surface-800 border-none rounded-lg text-lg cursor-pointer transition-all shadow-md hover:not-disabled:bg-surface-900 shadow-lg', { 'disabled:bg-surface-800 cursor-not-allowed shadow-none opacity-60': !isFormValid || isSubmitting }]"
          >
            <!-- <span v-if="isSubmitting" class="loading-spinner"></span> -->
            {{ isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { z } from 'zod';

// Router y Store
const router = useRouter();
const authStore = useAuthStore();

// Schema de validación con Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
});

// Estado reactivo
const formData = ref({
  email: 'sergioross73@hotmail.com',
  password: 'Admin123'
});

const errors = ref({
  email: '',
  password: '',
  general: ''
});

const touched = ref({
  email: false,
  password: false
});

const isSubmitting = ref(false);

// Validar un campo específico
const validateField = (field) => {
  try {
    if (field === 'email') {
      loginSchema.shape.email.parse(formData.value.email);
      errors.value.email = '';
    } else if (field === 'password') {
      loginSchema.shape.password.parse(formData.value.password);
      errors.value.password = '';
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      if (field === 'email') {
        errors.value.email = error.issues[0].message;
      } else if (field === 'password') {
        errors.value.password = error.issues[0].message;
      }
    }
  }
};

// Manejar blur (cuando el usuario sale del campo)
const handleBlur = (field) => {
  touched.value[field] = true;
  validateField(field);
};

// Manejar input (limpiar errores mientras se escribe)
const handleInput = (field) => {
  if (touched.value[field]) {
    validateField(field);
  }
  errors.value.general = '';
};

// Computed property para verificar si el formulario es válido
const isFormValid = computed(() => {
  try {
    loginSchema.parse(formData.value);
    return true;
  } catch {
    return false;
  }
});

// Manejar envío del formulario
const handleSubmit = async () => {
  // Marcar todos los campos como tocados
  touched.value.email = true;
  touched.value.password = true;

  // Validar todo el formulario
  try {
    loginSchema.parse(formData.value);
    errors.value.email = '';
    errors.value.password = '';
    errors.value.general = '';
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.issues.forEach((err) => {
        const field = err.path[0];
        errors.value[field] = err.message;
      });
    }
    return;
  }

  isSubmitting.value = true;

  try {
    // Llamar al store para hacer login
    const result = await authStore.login({
      email: formData.value.email,
      password: formData.value.password
    });

    if (result.success) {
      // Login exitoso - redirigir a pedidos
      router.push('/pedidos');
    } else {
      // Mostrar error del backend
      errors.value.general = result.error;
    }
  } catch (error) {
    // Error inesperado
    errors.value.general = 'Error inesperado. Por favor, intente nuevamente.';
    console.error('Error en login:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>

.title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
  /* line-height: 1.2; */
}


.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 1.5rem;
}

/* Form */
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #000000;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 1rem;
  /* transition: all 0.2s; */
  outline: none;
  color: #000000;
  background: white;
}

.form-input::placeholder {
  color: #94a3b8;
}

.form-input:focus {
  border-color: #B8CFCE;
  box-shadow: 0 0 0 3px rgba(184, 207, 206, 0.2);
}

.form-input.input-error {
  border-color: #ef4444;
}

.form-input.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}



/* Submit Button */
.submit-button {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: #0f172a;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.submit-button:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-button.button-disabled {
  background: #333333;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  opacity: 0.6;
}

.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Additional Links */
.additional-links {
  margin-top: 1.5rem;
  text-align: center;
}

/* Responsive - Tablet y Desktop */
@media (min-width: 768px) {
  .title {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .login-card {
    padding: 2rem;
  }

  .card-title {
    font-size: 1.5rem;
  }
}
</style>