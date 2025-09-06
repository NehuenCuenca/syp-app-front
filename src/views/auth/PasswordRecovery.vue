<template>
   <main class="recory-password-container">
        <h1 class="recory-password-container__title">¡Bienvenido a <span class="emphasis">SyP app</span>!</h1>
        <p class="recory-password-container__parag">Inicia sesión y armá tus pedidos.</p>
        <Fieldset legend="Recuperacion de contraseña" class="recovery-fieldset">
            <Form class="recovery-form form_classic" v-slot="$form" :initialValues="{ email: '', password: '' }" :resolver="resolver" @submit="onFormSubmit">
                <FloatLabel variant="in">
                    <label class="label_classic" for="email">Correo electrónico</label>
                    <InputText class="input_txt-classic" type="email" id="email" name="email" required />
                    <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error?.message }}</Message>
                </FloatLabel>

                <div class="form__actions">
                    <Button type="submit" severity="secondary" label="Atras" >
                        <router-link to="/login">Volver</router-link>
                    </Button>
                    <Button type="submit" label="Enviar" />
                </div>
            </Form>
        </Fieldset>
    </main>
</template>

<script setup>

</script>

<style scoped>
.recory-password-container {
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

.recovery-fieldset{
    margin-top: 3dvh;
}
.recovery-form {}

.form-group {}

.form__actions{
    width: 100%;
    display: flex;
    justify-content: space-between;
}


</style>