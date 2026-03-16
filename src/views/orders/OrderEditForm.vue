<template>
  <div class="order-edit-form">
    <!-- Loading State -->
    <div v-if="isLoadingInitialData" class="flex justify-center items-center p-8">
      <ProgressSpinner />
    </div>

    <!-- Form Content -->
    <div v-else-if="initialData && orderData" class="flex flex-col gap-6 mx-auto p-4">
      
      <!-- Order Info Header -->
      <div class="info-banner">
        <div class="flex items-center gap-3">
          <i class="pi pi-file-edit text-2xl"></i>
          <div>
            <h3 class="font-semibold text-lg">Pedido {{ orderData.code }}</h3>
            <p class="text-gray-400">
              Creado: {{ formatDate(orderData.created_at) }}
            </p>
          </div>
        </div>
        <Tag :value="orderData.movement_type.name" :severity="getMovementTypeSeverity(orderData.movement_type.name)" />
      </div>

      <!-- ==================== SECCIÓN OPERACIONAL ==================== -->
      <section class="form-section">
        <h3 class="section-title">
          <i class="pi pi-cog mr-2"></i>
          Información Operacional
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Tipo de Pedido (DISABLED - No se puede cambiar) -->
          <div class="form-field">
            <label for="movement_type" class="field-label required">
              Tipo de Pedido
            </label>
            <Select
              id="movement_type"
              v-model="form.movement_type_id"
              :options="initialData.order_types"
              option-label="name"
              option-value="id"
              placeholder="Tipo de pedido"
              disabled
              class="w-full"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center gap-2 opacity-60">
                  <i :class="getMovementTypeIcon(slotProps.value)"></i>
                  <span>{{ getMovementTypeName(slotProps.value) }}</span>
                  <i class="pi pi-lock ml-auto text-xs"></i>
                </div>
              </template>
            </Select>
            <small class="field-hint">
              <i class="pi pi-info-circle mr-1"></i>
              No se puede cambiar el tipo de pedido al editar
            </small>
            <small v-if="fieldErrors.movement_type_id" class="field-error">
              {{ fieldErrors.movement_type_id }}
            </small>
          </div>

          <!-- Contacto -->
          <div class="form-field">
            <label for="contact" class="field-label required">
              Contacto
            </label>
            <Select
              id="contact"
              v-model="form.contact_id"
              :options="availableContacts"
              option-label="search_alias"
              option-value="id"
              placeholder="Seleccione un contacto"
              show-clear
              filter
              class="w-full"
              :invalid="!!fieldErrors.contact"
              @change="handleContactChange"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex items-center gap-2">
                  <i class="pi pi-user"></i>
                  <span>{{ getContactName(slotProps.value) }}</span>
                </div>
                <span v-else>{{ slotProps.placeholder }}</span>
              </template>
            </Select>
            <small v-if="fieldErrors.contact" class="field-error">
              {{ fieldErrors.contact }}
            </small>
          </div>
        </div>
      </section>

      <!-- ==================== SECCIÓN DETALLES ==================== -->
      <section class="form-section flex flex-col gap-y-4">
        <div class="flex flex-wrap justify-between items-center mb-4">
          <h3 class="section-title">
            <i class="pi pi-list mr-2"></i>
            Detalles del Pedido
          </h3>
          <Button
            label="Agregar Producto"
            icon="pi pi-plus"
            size="small"
            @click="addDetail"
            v-show="form.order_details.length > 3"
          />
        </div>

        <!-- Lista de Detalles -->
        <div v-if="form.order_details.length > 0" class="flex flex-col gap-y-4">
          <Panel
            v-for="(detail, index) in form.order_details"
            :key="detail._uid"
            toggleable
            class="detail-panel"
          >
          <template #toggleicon="data">
            <Button
              :icon="'pi ' + (data.collapsed ? 'pi-eye' : 'pi-eye-slash')"
              class="p-button-text p-button-sm"
            />
          </template>
            <template #header>
              <div class="flex items-center justify-between w-full pr-4">
                <span class="font-semibold">
                  <i class="pi pi-box mr-2"></i>
                  Producto {{ index + 1 }}
                  <span v-if="detail.product_id" class="text-primary-400 ml-2">
                  : {{ getProductName(detail.product_id) }}
                  </span>
                  <span v-if="detail.quantity>0&&detail.product_id" class="text-gray-300 ml-2">
                    (x{{ detail.quantity }} unidades)
                  </span>
                </span>
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  rounded
                  size="small"
                  @click.stop="removeDetail(index)"
                  v-tooltip.top="'Eliminar detalle'"
                />
              </div>
            </template>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              
              <!-- Producto -->
              <div class="form-field md:col-span-2">
                <label :for="`product_${index}`" class="field-label required">
                  Producto
                </label>
                <Select
                  :id="`product_${index}`"
                  v-model="detail.product_id"
                  :options="getAvailableProducts(index)"
                  option-label="search_alias"
                  option-value="id"
                  placeholder="Seleccione un producto"
                  show-clear
                  filter
                  class="w-full"
                  :invalid="!!fieldErrors[`detail_${index}_product`]"
                  @change="(e) => handleProductSelect(index, e.value)"
                >
                  <template #value="slotProps">
                    <div v-if="slotProps.value">
                      {{ getProductName(slotProps.value) }}
                    </div>
                    <span v-else>{{ slotProps.placeholder }}</span>
                  </template>
                  <template #option="slotProps">
                    <div class="flex flex-col">
                      <span class="font-medium">{{ slotProps.option.search_alias }}</span>
                      <span class="text-xs text-gray-500">
                        Stock: {{ slotProps.option.current_stock }} | 
                        Precio: {{ formatCurrency(isPurchase ? slotProps.option.buy_price : slotProps.option.sale_price) }}
                      </span>
                    </div>
                  </template>
                </Select>
                <small v-if="fieldErrors[`detail_${index}_product`]" class="field-error">
                  {{ fieldErrors[`detail_${index}_product`] }}
                </small>
              </div>

              <!-- Campos visibles solo si hay producto seleccionado -->
              <template v-if="detail.product_id">
                
                <!-- Cantidad -->
                <div class="form-field">
                  <label :for="`quantity_${index}`" class="field-label required">
                    Cantidad
                  </label>
                  <InputNumber
                    :id="`quantity_${index}`"
                    v-model="detail.quantity"
                    show-buttons
                    button-layout="vertical"
                    :min="1"
                    :max="getMaxQuantity(detail.product_id)"
                    :step="1"
                    class="w-full"
                    :invalid="!!fieldErrors[`detail_${index}_quantity`]"
                    @input="() => calculateDetailSubtotal(index)"
                  >
                    <template #incrementbuttonicon>
                      <i class="pi pi-plus"></i>
                    </template>
                    <template #decrementbuttonicon>
                      <i class="pi pi-minus"></i>
                    </template>
                  </InputNumber>
                  <small v-if="fieldErrors[`detail_${index}_quantity`]" class="field-error">
                    {{ fieldErrors[`detail_${index}_quantity`] }}
                  </small>
                  <small v-else class="field-hint">
                    Stock actual: {{ getProductStock(detail.product_id) }} unidades
                  </small>
                </div>

                <!-- Precio Unitario -->
                <div class="form-field">
                  <label :for="`unit_price_${index}`" class="field-label required">
                    Precio {{ isPurchase ? 'de Compra' : 'de Venta' }} (unitario)
                  </label>
                  <InputNumber
                    :id="`unit_price_${index}`"
                    v-model="detail.unit_price"
                    mode="currency"
                    currency="ARS"
                    locale="es-AR"
                    :min="0"
                    :max-fraction-digits="0"
                    class="w-full"
                    :invalid="!!fieldErrors[`detail_${index}_unit_price`]"
                    @input="() => calculateDetailSubtotal(index)"
                  />
                  <small v-if="fieldErrors[`detail_${index}_unit_price`]" class="field-error">
                    {{ fieldErrors[`detail_${index}_unit_price`] }}
                  </small>
                </div>

                <!-- Porcentaje Aplicado -->
                <div class="form-field">
                  <label :for="`percentage_${index}`" class="field-label">
                    {{ isPurchase ? 'Ganancia' : 'Descuento' }} (%)
                  </label>
                  <InputNumber
                    :id="`percentage_${index}`"
                    v-model="detail.percentage_applied"
                    suffix="%"
                    :min="0"
                    :max="isPurchase ? 500 : 100"
                    :max-fraction-digits="2"
                    class="w-full"
                    :invalid="!!fieldErrors[`detail_${index}_percentage`]"
                    @input="() => calculateDetailSubtotal(index)"
                  />
                  <small v-if="fieldErrors[`detail_${index}_percentage`]" class="field-error">
                    {{ fieldErrors[`detail_${index}_percentage`] }}
                  </small>
                  <small v-else-if="!isPurchase && detail.percentage_applied > 0" class="field-hint text-orange-500">
                    Descuento de {{ formatCurrency(calculateDiscount(index)) }} aplicado
                  </small>
                </div>

                <!-- Subtotal Calculado -->
                <div class="form-field">
                  <label class="field-label">
                    {{ isPurchase ? 'Precio Venta Sugerido' : 'Subtotal' }}
                  </label>
                  <div class="subtotal-display">
                    <i class="pi pi-calculator mr-2"></i>
                    <span class="font-semibold text-lg">
                      {{ formatCurrency(detail._calculated_subtotal || 0) }}
                    </span>
                  </div>
                  <small v-if="isPurchase" class="field-hint">
                    Con {{ detail.percentage_applied }}% de ganancia
                  </small>
                  <small v-else-if="detail.quantity > 1" class="field-hint">
                    Por unidad: {{ formatCurrency(calculateUnitPrice(index)) }}
                  </small>
                </div>

              </template>
            </div>
          </Panel>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <i class="pi pi-inbox text-4xl text-gray-400 mb-2"></i>
          <p class="text-gray-600">
            No hay productos agregados
          </p>
          <small class="text-gray-500">
            Haga clic en "Agregar Producto" para comenzar
          </small>
        </div>

        <small v-if="fieldErrors.order_details" class="field-error mt-2">
          {{ fieldErrors.order_details }}
        </small>

        <Button
            label="Agregar Producto"
            icon="pi pi-plus"
            size="small"
            :disabled="!canAddDetail"
            @click="addDetail"
          />
      </section>

      <!-- ==================== SECCIÓN AJUSTES Y NOTAS ==================== -->
      <section class="form-section">
        <h3 class="section-title">
          <i class="pi pi-sliders-h mr-2"></i>
          Ajustes y Notas
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Ajuste de Precio -->
          <div class="form-field">
            <label for="adjustment" class="field-label">
              Ajuste de Precio
            </label>
            <InputNumber
              id="adjustment"
              v-model="form.adjustment_amount"
              mode="currency"
              currency="ARS"
              locale="es-AR"
              :max-fraction-digits="0"
              class="w-full"
              placeholder="0"
            />
            <small class="field-hint">
              Positivo aumenta, negativo reduce el total
            </small>
          </div>

          <!-- Notas -->
          <div class="form-field md:col-span-2">
            <label for="notes" class="field-label">
              Notas
            </label>
            <Textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              :maxlength="255"
              class="w-full"
              placeholder="Observaciones adicionales..."
            />
            <small class="field-hint text-right block">
              {{ form.notes?.length || 0 }}/255 caracteres
            </small>
          </div>
        </div>
      </section>

      <!-- ==================== RESUMEN DEL PEDIDO ==================== -->
      <section class="form-section bg-gray-50 dark:bg-gray-800">
        <h3 class="section-title">
          <i class="pi pi-info-circle mr-2"></i>
          Resumen del Pedido
        </h3>

        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Tipo de Pedido:</span>
            <span class="summary-value">
              {{ getMovementTypeName(form.movement_type_id) || '-' }}
            </span>
          </div>

          <div class="summary-item">
            <span class="summary-label">Contacto:</span>
            <span class="summary-value">
              {{ getContactName(form.contact_id) }}
            </span>
          </div>

          <div class="summary-item">
            <span class="summary-label">Productos:</span>
            <span class="summary-value">
              {{ form.order_details.length }} {{ form.order_details.length === 1 ? 'producto' : 'productos' }}
            </span>
          </div>

          <div class="summary-item">
            <span class="summary-label">Unidades Totales:</span>
            <span class="summary-value">
              {{ totalUnits }}
            </span>
          </div>

          <div class="summary-item" v-if="!isPurchase && totalDiscount > 0">
            <span class="summary-label">Descuento Total:</span>
            <span class="summary-value text-orange-500">
              -{{ formatCurrency(totalDiscount) }}
            </span>
          </div>

          <div class="summary-item" v-if="form.adjustment_amount !== 0">
            <span class="summary-label">Ajuste:</span>
            <span class="summary-value" :class="form.adjustment_amount > 0 ? 'text-green-500' : 'text-red-500'">
              {{ form.adjustment_amount > 0 ? '+' : '' }}{{ formatCurrency(form.adjustment_amount) }}
            </span>
          </div>

          <div class="summary-item-total">
            <span class="summary-label-total">Total Aproximado:</span>
            <span class="summary-value-total">
              {{ formatCurrency(totalApproximate) }}
            </span>
          </div>
        </div>

        <small class="text-gray-500 text-xs block mt-2">
          * El total exacto será recalculado al guardar
        </small>
      </section>

      <!-- ==================== MENSAJES DE ERROR GLOBALES ==================== -->
      <Message v-if="globalError" severity="error" :closable="true" @close="globalError = null">
        <div class="flex flex-col gap-2">
          <strong>Error al actualizar el pedido</strong>
          <span>{{ globalError }}</span>
        </div>
      </Message>

      <!-- ==================== BOTONES DE ACCIÓN ==================== -->
      <div class="flex justify-end gap-3 pt-4 border-t">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="handleCancel"
          :disabled="isSubmitting"
        />
        <Button
          label="Guardar Cambios"
          icon="pi pi-check"
          severity="success"
          @click="handleSubmit"
          :loading="isSubmitting"
          :disabled="!canSubmit"
        />
      </div>
    </div>

    <!-- Error cargando datos iniciales -->
    <div v-else class="flex flex-col items-center justify-center p-8 text-center">
      <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
      <p class="text-red-700 mb-4">Error al cargar los datos del formulario</p>
      <Button label="Reintentar" icon="pi pi-refresh" @click="loadInitialData" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';

// PrimeVue Components
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Panel from 'primevue/panel';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';

// ==================== PROPS & EMITS ====================

const props = defineProps({
  recordData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['finish', 'close']);

// ==================== COMPOSABLES ====================

const toast = useToast();

// ==================== STATE ====================

// Loading states
const isLoadingInitialData = ref(true);
const isSubmitting = ref(false);

// Initial data from API
const initialData = ref(null);
const orderData = ref(null);

// Form data
const form = reactive({
  movement_type_id: null,
  contact_id: null,
  adjustment_amount: 0,
  notes: '',
  order_details: []
});

// Error states
const fieldErrors = reactive({});
const globalError = ref(null);

// Detail counter for unique IDs
let detailCounter = 0;

// ==================== COMPUTED PROPERTIES ====================

/**
 * Check if movement type is purchase
 */
const isPurchase = computed(() => {
  return form.movement_type_id === 1;
});

/**
 * Check if movement type is sale
 */
const isSale = computed(() => {
  return form.movement_type_id === 2;
});

/**
 * Check if can add more details
 */
 const canAddDetail = computed(() => {
  return form.movement_type_id !== null;
});

/**
 * Available contacts based on movement type
 */
const availableContacts = computed(() => {
  if (!initialData.value) return [];
  
  // For purchases, filter providers
  if (isPurchase.value) {
    return initialData.value.contacts.filter(c => c.contact_type === 'proveedor' || c.contact_type === 'ambos');
  }
  
  // For sales, filter clients
  if (isSale.value) {
    return initialData.value.contacts.filter(c => c.contact_type === 'cliente' || c.contact_type === 'ambos');
  }
  
  return initialData.value.contacts;
});

/**
 * Calculate total units across all details
 */
const totalUnits = computed(() => {
  return form.order_details.reduce((sum, detail) => sum + (detail.quantity || 0), 0);
});

/**
 * Calculate total discount (only for sales)
 */
const totalDiscount = computed(() => {
  if (isPurchase.value) return 0;
  
  return form.order_details.reduce((sum, detail) => {
    if (!detail.product_id || !detail.quantity || !detail.unit_price) return sum;
    
    const discount = detail.unit_price * detail.quantity * (detail.percentage_applied / 100);
    return sum + discount;
  }, 0);
});

/**
 * Calculate approximate total
 */
const totalApproximate = computed(() => {
  let subtotal = 0;
  
  form.order_details.forEach((detail) => {
    if (detail._calculated_subtotal) {
      subtotal += detail._calculated_subtotal;
    }
  });
  
  return subtotal + (form.adjustment_amount || 0);
});

/**
 * Check if form can be submitted
 */
const canSubmit = computed(() => {
  return form.movement_type_id !== null && 
         form.contact_id !== null &&
         form.order_details.length > 0 &&
         !isSubmitting.value;
});

// ==================== LIFECYCLE ====================

onMounted(() => {
  loadInitialData();
});

// ==================== METHODS ====================

/**
 * Load initial data from API
 */
async function loadInitialData() {
  isLoadingInitialData.value = true;
  globalError.value = null;
  
  try {
    const orderId = props.recordData.id;
    const response = await axios.get(`${axios.defaults.baseURL}/orders/${orderId}/edit`);
    
    if (response.data.success) {
      initialData.value = response.data.data;
      orderData.value = response.data.data.order;
      
      // Initialize form with order data
      initializeFormWithOrderData();
    } else {
      throw new Error(response.data.message || 'Error al cargar datos');
    }
  } catch (err) {
    console.error('Error loading initial data:', err);
    globalError.value = err.response?.data?.message || err.message || 'Error de conexión';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos del pedido',
      life: 5000
    });
  } finally {
    isLoadingInitialData.value = false;
  }
}

/**
 * Initialize form with order data
 */
function initializeFormWithOrderData() {
  if (!orderData.value) return;
  
  form.movement_type_id = orderData.value.movement_type_id;
  form.contact_id = orderData.value.contact_id;
  form.adjustment_amount = orderData.value.adjustment_amount || 0;
  form.notes = orderData.value.notes || '';
  
  // Initialize order details
  form.order_details = orderData.value.order_details.map(detail => {
    const reactiveDetail = reactive({
      _uid: `detail_${detailCounter++}`,
      _original_id: detail.id, // Store original detail ID
      product_id: detail.product_id,
      quantity: detail.quantity,
      unit_price: detail.unit_price,
      percentage_applied: detail.percentage_applied,
      _calculated_subtotal: 0
    });
    
    // Calculate initial subtotal
    calculateDetailSubtotalForDetail(reactiveDetail);
    
    return reactiveDetail;
  });
}

/**
 * Handle contact change
 */
function handleContactChange(event) {
  delete fieldErrors.contact;
}

/**
 * Add new detail
 */
function addDetail() {
  const detail = reactive({
    _uid: `detail_${detailCounter++}`,
    product_id: null,
    quantity: 1,
    unit_price: 0,
    percentage_applied: isPurchase.value ? 30 : 0,
    _calculated_subtotal: 0
  });
  
  form.order_details.push(detail);
  
  // Clear related errors
  const index = form.order_details.length - 1;
  delete fieldErrors[`detail_${index}_product`];
  delete fieldErrors[`detail_${index}_quantity`];
  delete fieldErrors[`detail_${index}_unit_price`];
  delete fieldErrors[`detail_${index}_percentage`];
}

/**
 * Remove detail by index
 */
function removeDetail(index) {
  form.order_details.splice(index, 1);
  
  // Clear related errors
  delete fieldErrors[`detail_${index}_product`];
  delete fieldErrors[`detail_${index}_quantity`];
  delete fieldErrors[`detail_${index}_unit_price`];
  delete fieldErrors[`detail_${index}_percentage`];
  delete fieldErrors.order_details;
}

/**
 * Handle product selection
 */
function handleProductSelect(index, productId) {
  const detail = form.order_details[index];
  
  if (!productId) {
    // Product cleared
    detail.quantity = 1;
    detail.unit_price = 0;
    detail.percentage_applied = isPurchase.value ? 30 : 0;
    detail._calculated_subtotal = 0;
    return;
  }
  
  const product = getProductById(productId);
  if (!product) return;
  
  // Set initial values based on movement type
  if (isPurchase.value) {
    detail.quantity = 1;
    detail.unit_price = product.buy_price;
    detail.percentage_applied = product.profit_percentage;
  } else {
    detail.quantity = 1;
    detail.unit_price = product.sale_price;
    detail.percentage_applied = 0;
  }
  
  // Calculate subtotal
  calculateDetailSubtotal(index);
  
  // Clear error
  delete fieldErrors[`detail_${index}_product`];
}

/**
 * Calculate detail subtotal
 */
function calculateDetailSubtotal(index) {
  const detail = form.order_details[index];
  calculateDetailSubtotalForDetail(detail);
}

/**
 * Calculate subtotal for a specific detail object
 */
function calculateDetailSubtotalForDetail(detail) {
  if (!detail.product_id || !detail.quantity || detail.unit_price === null) {
    detail._calculated_subtotal = 0;
    return;
  }
  
  if (isPurchase.value) {
    // For purchases: show suggested sale price
    detail._calculated_subtotal = Math.round(
      detail.unit_price * (1 + (detail.percentage_applied || 0) / 100)
    );
  } else {
    // For sales: show subtotal with discount
    const discountMultiplier = 1 - ((detail.percentage_applied || 0) / 100);
    detail._calculated_subtotal = Math.round(
      detail.quantity * detail.unit_price * discountMultiplier
    );
  }
}

/**
 * Calculate discount for a detail (sales only)
 */
function calculateDiscount(index) {
  const detail = form.order_details[index];
  if (!detail.product_id || isPurchase.value) return 0;
  
  return Math.round(
    detail.quantity * detail.unit_price * ((detail.percentage_applied || 0) / 100)
  );
}

/**
 * Calculate unit price with discount (sales only)
 */
function calculateUnitPrice(index) {
  const detail = form.order_details[index];
  if (!detail.product_id || isPurchase.value) return 0;
  
  const discountMultiplier = 1 - ((detail.percentage_applied || 0) / 100);
  return Math.round(detail.unit_price * discountMultiplier);
}

/**
 * Get available products for detail (excluding already selected)
 */
function getAvailableProducts(detailIndex) {
  if (!initialData.value) return [];
  
  const selectedProductIds = form.order_details
    .map((d, idx) => idx !== detailIndex ? d.product_id : null)
    .filter(Boolean);
  
  let products = initialData.value.products.filter(
    p => !selectedProductIds.includes(p.id)
  );
  
  // For sales, filter only products with stock
  if (isSale.value) {
    products = products.filter(p => p.current_stock > 0);
  }
  
  return products;
}

/**
 * Get max quantity for a product
 */
function getMaxQuantity(productId) {
  if (isPurchase.value) return 9999999;
  
  const product = getProductById(productId);
  return product ? product.current_stock : 1;
}

/**
 * Get product by ID
 */
function getProductById(productId) {
  if (!initialData.value) return null;
  return initialData.value.products.find(p => p.id === productId);
}

/**
 * Get product name
 */
function getProductName(productId) {
  const product = getProductById(productId);
  return product ? product.search_alias : '';
}

/**
 * Get product stock
 */
function getProductStock(productId) {
  const product = getProductById(productId);
  return product ? product.current_stock : 0;
}

/**
 * Get movement type name
 */
function getMovementTypeName(typeId) {
  if (!initialData.value) return '';
  const type = initialData.value.order_types.find(t => t.id === typeId);
  return type ? type.name : '';
}

/**
 * Get movement type icon
 */
function getMovementTypeIcon(typeId) {
  if (typeId === 1) return 'pi pi-shopping-cart'; // Compra
  if (typeId === 2) return 'pi pi-dollar'; // Venta
  return 'pi pi-receipt';
}

/**
 * Get movement type severity
 */
function getMovementTypeSeverity(typeName) {
  const severityMap = {
    'compra': 'info',
    'venta': 'success'
  };
  return severityMap[typeName?.toLowerCase()] || 'secondary';
}

/**
 * Get contact by ID
 */
function getContactById(contactId) {
  if (!initialData.value) return null;
  return initialData.value.contacts.find(c => c.id === contactId);
}

/**
 * Get contact name
 */
function getContactName(contactId) {
  const contact = getContactById(contactId);
  return contact ? contact.search_alias : '';
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format currency
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0);
}

/**
 * Validate form before submission
 */
function validateForm() {
  // Clear previous errors
  Object.keys(fieldErrors).forEach(key => delete fieldErrors[key]);
  globalError.value = null;
  
  let isValid = true;
  
  // Validate movement type (should always exist when editing)
  if (!form.movement_type_id) {
    fieldErrors.movement_type_id = 'El tipo de pedido es obligatorio';
    isValid = false;
  }
  
  // Validate contact (required)
  if (!form.contact_id) {
    fieldErrors.contact = 'El contacto es obligatorio';
    isValid = false;
  }
  
  // Validate at least one detail
  if (form.order_details.length === 0) {
    fieldErrors.order_details = 'Debe tener al menos un producto';
    isValid = false;
  }
  
  // Validate each detail
  form.order_details.forEach((detail, index) => {
    // Validate product
    if (!detail.product_id) {
      fieldErrors[`detail_${index}_product`] = 'Debe seleccionar un producto';
      isValid = false;
    }
    
    // Validate quantity
    if (!detail.quantity || detail.quantity < 1) {
      fieldErrors[`detail_${index}_quantity`] = 'La cantidad debe ser mayor a 0';
      isValid = false;
    }
    
    // Validate max quantity for sales
    if (isSale.value && detail.product_id) {
      const maxQty = getMaxQuantity(detail.product_id);
      if (detail.quantity > maxQty) {
        fieldErrors[`detail_${index}_quantity`] = `Cantidad máxima: ${maxQty}`;
        isValid = false;
      }
    }
    
    // Validate unit price
    if (detail.unit_price === null || detail.unit_price < 0) {
      fieldErrors[`detail_${index}_unit_price`] = 'El precio debe ser mayor o igual a 0';
      isValid = false;
    }
    
    // Validate percentage
    if (detail.percentage_applied < 0) {
      fieldErrors[`detail_${index}_percentage`] = 'El porcentaje no puede ser negativo';
      isValid = false;
    }
    
    if (isSale.value && detail.percentage_applied > 100) {
      fieldErrors[`detail_${index}_percentage`] = 'El descuento no puede ser mayor a 100%';
      isValid = false;
    }
  });
  
  return isValid;
}

/**
 * Build payload for API
 */
function buildPayload() {
  const payload = {
    contact_id: form.contact_id,
    // movement_type_id: form.movement_type_id,
    adjustment_amount: form.adjustment_amount || 0,
    notes: form.notes || '',
    order_details: form.order_details.map(detail => ({
      product_id: detail.product_id,
      quantity: detail.quantity,
      unit_price: detail.unit_price,
      percentage_applied: detail.percentage_applied || 0
    }))
  };
  
  return payload;
}

/**
 * Handle form submission
 */
async function handleSubmit() {
  // Validate form
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Validación fallida',
      detail: 'Por favor corrija los errores en el formulario',
      life: 5000
    });
    return;
  }
  
  isSubmitting.value = true;
  globalError.value = null;
  
  try {
    const payload = buildPayload();
    const orderId = props.recordData.id;
    
    const response = await axios.put(`${axios.defaults.baseURL}/orders/${orderId}`, payload);
    
    if (response.data.success) {
      toast.add({
        severity: 'success',
        summary: 'Pedido actualizado',
        detail: 'El pedido se actualizó exitosamente',
        life: 3000
      });
      
      emit('finish', response.data.data);
    } else {
      throw new Error(response.data.message || 'Error al actualizar el pedido');
    }
  } catch (err) {
    console.error('Error updating order:', err);
    
    // Handle validation errors from backend
    if (err.response?.data?.errors) {
      const backendErrors = err.response.data.errors;
      
      Object.keys(backendErrors).forEach(key => {
        // Map backend error keys to frontend field keys
        if (key === 'movement_type_id') {
          fieldErrors.movement_type_id = backendErrors[key][0];
        } else if (key === 'contact_id') {
          fieldErrors.contact = backendErrors[key][0];
        } else if (key.startsWith('order_details.')) {
          // Handle detail errors: order_details.0.product_id -> detail_0_product
          const match = key.match(/order_details\.(\d+)\.(\w+)/);
          if (match) {
            const index = match[1];
            const field = match[2];
            fieldErrors[`detail_${index}_${field === 'product_id' ? 'product' : field}`] = backendErrors[key][0];
          }
        } else {
          globalError.value = backendErrors[key][0];
        }
      });
    } else {
      globalError.value = err.response?.data?.message || err.message || 'Error al actualizar el pedido';
    }
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: globalError.value || 'No se pudo actualizar el pedido',
      life: 5000
    });
  } finally {
    isSubmitting.value = false;
  }
}

/**
 * Handle form cancellation
 */
function handleCancel() {
  emit('close');
}
</script>

<style>
@reference "../../style.css";

.order-edit-form {
  @apply w-full;
}

/* Info Banner */
.info-banner {
  @apply flex items-center justify-between p-4 bg-blue-900/20 border border-blue-800 rounded-lg;
}

/* Sections */
.form-section {
  @apply bg-transparent rounded-lg border border-gray-200 dark:border-gray-700 p-6;
}

.section-title {
  @apply text-xl font-semibold text-white mb-4 flex items-center gap-2;
}

/* Form Fields */
.form-field {
  @apply flex flex-col gap-3;
}

.field-label {
  @apply text-lg font-medium text-gray-300;
}

.field-label.required::after {
  content: ' *';
  @apply text-red-500;
}

.field-error {
  @apply text-red-400;
}

.field-hint {
  @apply text-gray-400;
}

/* Detail Panel */
.detail-panel {
  @apply border border-gray-200 dark:border-gray-700;
}

/* Empty State */
.empty-state {
  @apply flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg;
}

/* Subtotal Display */
.subtotal-display {
  @apply flex items-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300;
}

/* Summary Grid */
.summary-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.summary-item {
  @apply flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded;
}

.summary-label {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.summary-value {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.summary-item-total {
  @apply col-span-full flex justify-between items-center p-4 bg-primary-100 dark:bg-primary-900/30 rounded-lg border-2 border-primary-300 dark:border-primary-700;
}

.summary-label-total {
  @apply text-base font-semibold text-gray-900 dark:text-white;
}

.summary-value-total {
  @apply text-xl font-bold text-primary-600 dark:text-primary-400;
}
</style>