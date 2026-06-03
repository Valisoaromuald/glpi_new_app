<script lang="ts" setup>
import LoginForm from '@/components/login/LoginForm.vue';
import { ref } from 'vue';
const login = ref<string>('glpi')
const password = ref<string>('glpi')
</script>
<template>
    <LoginForm v-model:login="login" v-model:password="password"/>
</template>
<style></style>