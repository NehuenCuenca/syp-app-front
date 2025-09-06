<template>
    <main class="login-container">
        <div class="entry-heading">
            <h1 class="entry-title">¡Bienvenido a <span class="emphasis">SyP app</span>!</h1>
            <p class="entry-parag">Inicia sesión y armá tus pedidos.</p>
        </div>
        <Fieldset legend="Acceso a la plataforma" class="entry-fieldset">
            <Form class="form_classic" v-slot="$form" :initialValues="{ email: '', password: '' }" :resolver="resolver" @submit="onFormSubmit">
                <FloatLabel variant="in">
                    <label class="label_classic" for="email">Correo electrónico</label>
                    <InputText class="input_txt-classic" type="email" id="email" name="email" required />
                    <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
                </FloatLabel>
                <FloatLabel variant="in">
                    <InputText class="input_txt-classic" type="password" id="password" name="password" required/>
                    <label class="label_classic" for="password">Contraseña</label>
                </FloatLabel>

                <Button type="submit" label="Iniciar sesión" />
                <!-- <div class="form-group">
                    <router-link class="link_classic" to="/recuperar-contraseña">¿Olvidaste tu contraseña?</router-link>
                </div> -->
            </Form>
        </Fieldset>
    </main>
</template>

<script setup>
    import { ref, computed } from 'vue'

    /* const email = ref('')
    const password = ref('')
    const errors = ref({})

    const formHasValidInputs = computed(() => {
        errors.value = {}

        if(!email.value || !password.value){
            errors.value.form = 'El formulario todavia no fue completado.'
        } else {
            //make a validation for an email
            if(!email.value.includes('@')){
                errors.value.email = 'El correo electrónico no es válido.'
            }
            if(password.value.length < 8){
                errors.value.password = 'La contraseña debe tener al menos 8 caracteres.'
            }
        }

        return Object.keys(errors.value).length === 0
    })

    const handleSubmit = async () => {
        if (!formHasValidInputs.value) {
            return
        }
        console.log('login submitted')
    } */
</script>

<style scoped>
.login-container {
    padding: 5dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1dvh;
}
</style>