<script lang="ts" setup>
import AccordionMenu from '@/components/common/accordion/AccordionMenu.vue';


</script>

<template>
    <div class="flex h-screen bg-gray-100">

        <!-- SIDEBAR -->
        <aside class="w-56 bg-blue-800 flex flex-col">

            <div class="px-5 py-5 border-b border-gray-500">
                <p class="text-white font-semibold text-base">GLPI</p>
                <p class="text-white text-xs mt-0.5">FrontOffice</p>
            </div>

            <nav class="flex-1 px-3 py-4 flex flex-col gap-1">
                <router-link to="/frontoffice/home"
                    class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-blue-600 hover:text-white transition-colors"
                    active-class="bg-blue-700 text-white font-medium">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Accueil
                </router-link>
                <AccordionMenu :title="'Ticket'">
                    <template #child>

                        <!-- Création de ticket -->
                        <router-link to="/frontoffice/ticket/form"
                            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-blue-600 hover:text-white transition-colors"
                            active-class="bg-blue-700 text-white font-medium">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4v16m8-8H4" />
                            </svg>
                            Création
                        </router-link>
                        <!-- Cout des tickets -->
                        <AccordionMenu :title="'Cout'" :icon="`<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='size-4'>
                        <path stroke-linecap='round' stroke-linejoin='round' d='M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' />
                        </svg>`">
                            <template #child>
                                <router-link to="/frontoffice/ticketCost/list"
                                    class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-blue-600 hover:text-white transition-colors"
                                    active-class="bg-blue-700 text-white font-medium">
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
                <router-link to="/frontoffice/kanban"
                    class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-blue-600 hover:text-white transition-colors"
                    active-class="bg-blue-700 text-white font-medium">
                    Kanban
                </router-link>
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