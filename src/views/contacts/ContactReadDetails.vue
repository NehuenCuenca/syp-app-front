<!-- ContactReadDetails.vue -->
<!-- Vista de solo lectura de los detalles de un contacto -->
<template>
  <div class="contact-read-details">
    <div class="details-content">      
      <!-- Detalle: Nombre -->
      <div class="detail-row">
        <span class="detail-label">Negocio:</span>
        <span class="detail-value">{{ recordData.search_alias }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Titular:</span>
        <span class="detail-value">{{ recordData.contact_name || '---'}}</span>
      </div>

      <!-- Detalle: Telefono -->
      <div class="detail-row">
        <span class="detail-label">Telefono:</span>
        <span class="detail-value">
          {{ recordData.phone || '---'}}
        </span>
      </div>

      <!-- Detalle: Email -->
      <div class="detail-row">
        <span class="detail-label">Email:</span>
        <span class="detail-value">
          {{ recordData.email || '---'}}
        </span>
      </div>

      <!-- Detalle: Direccion -->
      <div class="detail-row">
        <span class="detail-label">Direccion:</span>
        <span class="detail-value">
          {{ recordData.address || '---'}}
        </span>
      </div>

      <!-- Detalle: Tipo -->
      <div class="detail-row">
        <span class="detail-label">Tipo de contacto:</span>
        <span class="detail-value">
          {{ recordData.contact_type }}
        </span>
      </div>
    </div>

    <!-- Botón de cerrar -->
    <div class="form-actions">
      <Button
        label="Cerrar"
        severity="secondary"
        @click="handleClose"
      />
    </div>
  </div>
</template>

<script setup>

// Props del componente
const props = defineProps({
  recordData: {
    type: Object,
    required: true
  }
});

// Eventos emitidos
const emit = defineEmits(['close']);

// Formatear precio como moneda
const formatCurrency = (value) => {
  if (!value) return '$0.00';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value);
};

// Maneja el cierre
const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
.contact-read-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 6px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 1rem;
  color: #111827;
  margin-top: 0.25rem;
}

.detail-id {
  font-family: monospace;
  font-size: 0.875rem;
  color: #6b7280;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}
</style>