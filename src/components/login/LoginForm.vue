<script lang="ts" setup>
import GlpiOAuthService from '@/services/authentication/GlpiOAuthService';
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';


const errorMessage = ref<string>('')
const login = defineModel<string>('login', { type: String })
const password = defineModel<string>('password', { type: String })
const glpiOAuthService = new GlpiOAuthService()
const router = useRouter(); 
const handleLogin = async (): Promise<any> => {
    try {
        if (login.value && password.value) {
            return await glpiOAuthService.login(login.value, password.value)
        }
        else {
            throw new Error("login et password requis");
        }
    } catch (error: any) { // En TS, l'erreur interceptée est souvent typée en 'any' ou 'unknown'

        // 1. On vérifie si l'erreur vient d'Axios (problème serveur, 404, 401, etc.)
        if (axios.isAxiosError(error)) {
            // Si le serveur a renvoyé un message d'erreur précis (ex: ton JSON GLPI avec .detail)
            if (error.response?.data?.detail) {
                errorMessage.value = error.response.data.detail;
            } else if (error.response?.data?.title) {
                errorMessage.value = error.response.data.title;
            } else {
                errorMessage.value = `Erreur serveur (${error.response?.status || 'Inconnu'})`;
            }
        }
        // 2. Si c'est une erreur JavaScript classique lancée via "throw new Error('...')"
        else if (error instanceof Error) {
            errorMessage.value = error.message;
        }
        // 3. Cas de secours (si un string a vraiment été jeté par un throw "mon erreur")
        else if (typeof error === 'string') {
            errorMessage.value = error;
        }
        // 4. Erreur inconnue par défaut
        else {
            errorMessage.value = "Une erreur imprévue est survenue.";
        }

        console.error("Détails de l'erreur interceptée :", error);
    }

}

</script>
<template>
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center">

        <div class="bg-white shadow-md rounded-xl p-8 w-full max-w-md">

            <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
                GLPI
            </h2>

            <form class="flex flex-col gap-4 " @submit.prevent="handleLogin()">

                <!-- EMAIL -->
                <div class="flex flex-col gap-1">
                    <label class="text-sm font-medium text-gray-700">login</label>

                    <input type="text" v-model="login" placeholder="exemple@email.com"
                        class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                </div>

                <!-- PASSWORD -->
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">Mot de passe</label>

                    <input type="password" v-model="password" placeholder="••••••••"
                        class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                </div>

                <button type="submit" class="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    Se connecter
                </button>

            </form>
        </div>

        <div v-show="errorMessage.length !== 0" class="bg-red-600 text-white rounded-lg mt-8 w-96 p-3">
            <p>{{ errorMessage }}</p>
        </div>

    </div>
</template>