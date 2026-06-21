<script lang="ts" setup>
import AccordionMenu from '@/components/common/accordion/AccordionMenu.vue';
import { ref } from 'vue';
const collapsed = ref<boolean>(false)
</script>

<template>
    <div class="flex h-screen bg-gray-100">

        <!-- SIDEBAR -->
        <aside :class="collapsed ? 'w-16' : 'w-56'" class="bg-blue-800 flex flex-col transition-all duration-300">

            <!-- Header -->
            <div class="px-3 py-5 border-b border-gray-500 flex items-center justify-between">
                <div v-if="!collapsed">
                    <p class="text-white font-semibold text-base">GLPI</p>
                    <p class="text-white text-xs mt-0.5">FrontOffice</p>
                </div>
                <!-- Bouton collapse -->
                <button @click="collapsed = !collapsed"
                    class="text-white hover:bg-blue-600 p-1.5 rounded-lg transition-colors cursor-pointer ml-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
                    </svg>
                </button>
            </div>

            <!-- Nav -->
            <nav class="flex-1 px-2 py-4 flex flex-col gap-1">

                <!-- Accueil -->
                <router-link to="/frontoffice/home" :class="collapsed ? 'justify-center px-2' : 'px-3'"
                    class="flex items-center gap-3 py-2 rounded-lg text-sm text-white hover:bg-blue-600 transition-colors"
                    active-class="bg-blue-700 font-medium">
                    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span v-if="!collapsed">Accueil</span>
                </router-link>

                <!-- Kanban -->
                <router-link to="/frontoffice/kanban" :class="collapsed ? 'justify-center px-2' : 'px-3'"
                    class="flex items-center gap-3 py-2 rounded-lg text-sm text-white hover:bg-blue-600 transition-colors"
                    active-class="bg-blue-700 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="size-4 shrink-0">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v9a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 15V6ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v4.5A2.25 2.25 0 0 1 18 12.75h-2.25A2.25 2.25 0 0 1 13.5 10.5V6Z" />
                    </svg>
                    <span v-if="!collapsed">Kanban</span>
                </router-link>

                <!-- Tickets — caché si collapsed -->
                <div v-if="!collapsed">
                    <AccordionMenu :title="'Ticket'" :icon="`<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='size-4'>
                <path stroke-linecap='round' stroke-linejoin='round' d='M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z' />
                </svg>`">
                        <template #child>
                            <router-link to="/frontoffice/ticket/form"
                                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-blue-600 transition-colors"
                                active-class="bg-blue-700 font-medium">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 4v16m8-8H4" />
                                </svg>
                                Création
                            </router-link>
                            <AccordionMenu :title="'Cout'" :icon="`<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='size-4'>
                        <path stroke-linecap='round' stroke-linejoin='round' d='M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' />
                        </svg>`">
                                <template #child>
                                    <router-link to="/frontoffice/ticketCost/list"
                                        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-blue-600 transition-colors"
                                        active-class="bg-blue-700 font-medium">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.5" stroke="currentColor" class="size-4">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                                        </svg>
                                        Par catégorie d'Actifs
                                    </router-link>
                                </template>
                            </AccordionMenu>
                        </template>
                    </AccordionMenu>
                </div>

                <!-- Icône Ticket seule si collapsed -->
                <button v-else
                    class="flex justify-center py-2 rounded-lg text-white hover:bg-blue-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="size-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                    </svg>
                </button>

            </nav>
        </aside>

        <!-- CONTENU PRINCIPAL -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- PAGE -->
            <main class="w-full flex-1 overflow-auto p-4 sm:p-6">
                <div class="max-w-7xl mx-auto w-full">
                    <router-view />
                </div>
            </main>

        </div>
    </div>
</template>