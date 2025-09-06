<template>
    <main class="recory-password-container">
        <h1 class="recory-password-container__title">¡Bienvenido a <span class="emphasis">SyP app</span>!</h1>
        <p class="recory-password-container__parag">Llena este formulario para reestablecer tu contraseña.</p>
        <Fieldset legend="Restablecimiento de contraseña" class="reset-fieldset">
            <Form class="reset-form form_classic" v-slot="$form" :initialValues="{ email: '', password: '', confirmation: '' }" :resolver="resolver" @submit="onFormSubmit">
                <FloatLabel variant="in">
                    <label class="label_classic" for="email">Correo electrónico</label>
                    <InputText class="input_txt-classic" type="email" id="email" name="email" required />
                    <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
                </FloatLabel>

                <FloatLabel variant="in">
                    <label class="label_classic" for="password">Contraseña</label>
                    <InputText class="input_txt-classic" type="password" id="password" name="password" required />
                    <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">{{ $form.password.error?.message }}</Message>
                </FloatLabel>

                <FloatLabel variant="in">
                    <label class="label_classic" for="password">Confirmacion de contraseña</label>
                    <InputText class="input_txt-classic" type="password" id="password" name="password" required />
                    <Message v-if="$form.confirmation?.invalid" severity="error" size="small" variant="simple">{{ $form.confirmation.error?.message }}</Message>
                </FloatLabel>

                <div class="reset-form__actions">
                    <!-- <Button type="submit" severity="secondary" label="Atras" >
                        <router-link to="/login">Volver al login</router-link>
                    </Button> -->
                    <Button type="submit" label="Reestablecer"/>
                </DIV>
            </Form>
        </Fieldset>
    </main>
</template>

<script setup>
import { ref } from 'vue'
// import axios from 'axios'

// props recibidos desde Vue Router
const props = defineProps({
  token: String,
  email: String
})

const form = ref({
  email: props.email || '',
  password: '',
  confirmation: ''
})

const submit = async () => {
  try {
    /* await axios.post('/api/auth/reset-password', {
      email: form.value.email,
      token: props.token,
      password: form.value.password,
      confirmation: form.value.confirmation
    }) */
    alert('PROXIMAMENTE, SOLO EN CINES')
  } catch (e) {
    alert(e.response?.data?.message || 'Error')
  }
}
</script>

<style scoped>
.recory-password-container {
    max-width: 100dvw;
    padding: 5dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1dvh;
}
.recory-password-container__title {
    text-align: center;
    font-size: var(--heading-md-fs);
}
.recory-password-container__parag {
    text-align: center;
    font-size: var(--body-lg-fs);
}
.reset-fieldset {
    margin-top: 3dvh;
    width: 90%;
}
.reset-form {

}
.form-group {
}
.label_classic {
}
.input_txt-classic {
}
.reset-form__actions {
    width: 100%;
}

</style>