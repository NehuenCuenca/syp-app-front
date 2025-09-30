<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- Header -->
      <div class="header">
        <h1 class="title">
          ¡Bienvenido a <span class="highlight">SyP app</span>!
        </h1>
        <p class="subtitle">Inicia sesión y armá tus pedidos.</p>
      </div>

      <!-- Login Card -->
      <div class="login-card">
        <h2 class="card-title">Acceso a la plataforma</h2>

        <form @submit.prevent="handleSubmit" novalidate>
          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              @blur="() => handleBlur('email')"
              @input="() => handleInput('email')"
              :class="['form-input', { 'input-error': touched.email && errors.email }]"
              placeholder="tu@email.com"
            />
            <p v-if="touched.email && errors.email" class="error-message">
              {{ errors.email }}
            </p>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              @blur="() => handleBlur('password')"
              @input="() => handleInput('password')"
              :class="['form-input', { 'input-error': touched.password && errors.password }]"
              placeholder="••••••••"
            />
            <p v-if="touched.password && errors.password" class="error-message">
              {{ errors.password }}
            </p>
          </div>

          <!-- General Error Message -->
          <div v-if="errors.general" class="general-error">
            {{ errors.general }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="!isFormValid || isSubmitting"
            :class="['submit-button', { 'button-disabled': !isFormValid || isSubmitting }]"
          >
            <span v-if="isSubmitting" class="loading-spinner"></span>
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
/* Container principal */
.login-container {
  min-height: 100vh;
  background: #333446;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-wrapper {
  width: 100%;
  max-width: 28rem;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
  line-height: 1.2;
}

.highlight {
  color: #B8CFCE;
}

.subtitle {
  color: #cbd5e1;
  font-size: 0.875rem;
}

/* Login Card */
.login-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
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
  transition: all 0.2s;
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

.error-message {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* General Error */
.general-error {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 0.5rem;
  color: #991b1b;
  font-size: 0.875rem;
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

.link {
  font-size: 0.875rem;
  color: #0891b2;
  text-decoration: none;
  transition: all 0.2s;
}

.link:hover {
  color: #0e7490;
  text-decoration: underline;
}

/* Footer */
.footer {
  margin-top: 1.5rem;
  text-align: center;
}

.footer-text {
  color: #cbd5e1;
  font-size: 0.875rem;
}

.link-highlight {
  color: #B8CFCE;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.link-highlight:hover {
  color: #a0bfbd;
  text-decoration: underline;
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