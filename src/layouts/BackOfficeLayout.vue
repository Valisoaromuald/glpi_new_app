<script lang="ts" setup>
import AccordionMenu from '@/components/common/accordion/AccordionMenu.vue';
import { useRedirect } from '@/composables/useRedirect';
import GlpiOAuthService from '@/services/authentication/GlpiOAuthService';
import { ref } from 'vue';

const glpiOAuthService = new GlpiOAuthService()
const collapsed = ref<boolean>(false)
const { to } = useRedirect()
const handleLogout = () => {
  if (confirm("Voulez vous vraiment vous deconnecter")) {
    glpiOAuthService.logout();
    to('/backoffice/login')
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">

    <!-- SIDEBAR -->
    <aside :class="collapsed ? 'w-16' : 'w-56'" class="bg-gray-950 flex flex-col transition-all duration-300">
      <div class="px-3 py-5  border-gray-500 flex items-center justify-between">
        <div v-if="!collapsed" class="px-5 py-5  border-gray-500">
          <p class="text-white font-semibold text-base">GLPI</p>
          <p class="text-white text-xs mt-0.5">Backoffice</p>
        </div>
        <button @click="collapsed = !collapsed"
          class="text-white hover:bg-gray-850 p-1.5 rounded-lg transition-colors cursor-pointer ml-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
          </svg>
        </button>
      </div>
      <nav class="flex-1 px-3 py-4 flex flex-col gap-1">
        <router-link to="/backoffice/home"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-gray-500 hover:text-white transition-colors"
          active-class="bg-gray-700 text-white font-medium">
          <svg width="16" height="16" viewBox="0 0 80 48" fill="none">
            <!-- fond -->
            <path d="M8 44 A36 36 0 0 1 72 44" stroke="#ffffff" stroke-width="8" stroke-linecap="round" />
            <!-- progression -->
            <path d="M8 44 A36 36 0 0 1 58 14" stroke="#ffffff" stroke-width="8" stroke-linecap="round" />
            <!-- aiguille -->
            <line x1="40" y1="44" x2="55" y2="16" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
            <circle cx="40" cy="44" r="5" fill="#1e40af" />
            <circle cx="40" cy="44" r="2" fill="white" />
          </svg>
          <span v-if="!collapsed">Tableau de bord</span>
        </router-link>
        <router-link to="/backoffice/reset"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-gray-500 hover:text-white transition-colors"
          active-class="bg-gray-700 text-white font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span v-if="!collapsed">Réinitialiser données</span>
        </router-link>


        <div v-if="!collapsed">
          <AccordionMenu :title="'Import'" :hover-color="`bg-gray-500`" :icon="`<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2'
              d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' />
          </svg>`">
            <template #child>
              <!-- Liste des tickets -->
              <router-link to="/backoffice/import"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-gray-500 hover:text-white transition-colors"
                active-class="bg-gray-700 text-white font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <!-- cylindre = ensemble de données -->
                  <ellipse cx="12" cy="5" rx="8" ry="3" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 5v5c0 1.657 3.582 3 8 3s8-1.343 8-3V5" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 10v5c0 1.657 3.582 3 8 3s8-1.343 8-3v-5" />
                  <!-- plus = insertion -->
                  <line x1="17" y1="20" x2="21" y2="20" stroke-linecap="round" stroke-width="2" />
                  <line x1="19" y1="18" x2="19" y2="22" stroke-linecap="round" stroke-width="2" />
                </svg>
                <span>General</span>
              </router-link>
              <router-link to="/backoffice/newImport"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-gray-500 hover:text-white transition-colors"
                active-class="bg-gray-700 text-white font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <!-- ticket -->
                  <rect x="3" y="4" width="13" height="16" rx="2" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" />
                  <line x1="7" y1="8" x2="12" y2="8" stroke-linecap="round" stroke-width="2" />
                  <line x1="7" y1="11" x2="12" y2="11" stroke-linecap="round" stroke-width="2" />
                  <line x1="7" y1="14" x2="10" y2="14" stroke-linecap="round" stroke-width="2" />
                  <!-- flèche de mouvement -->
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 13l4 4-4 4" />
                  <line x1="20" y1="17" x2="13" y2="17" stroke-linecap="round" stroke-width="2" />
                </svg>
                Mouvement Ticket
              </router-link>
            </template>
          </AccordionMenu>
        </div>
        <button v-else class="flex justify-center py-2 rounded-lg text-white hover:bg-gray-750 transition-colors">
          <svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2'
              d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' />
          </svg>
        </button>
        <div v-if="!collapsed">
          <AccordionMenu :title="'Ticket'" :hover-color="`bg-gray-500`" :icon="`<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='size-4'>
                <path stroke-linecap='round' stroke-linejoin='round' d='M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z' />
                </svg>`">
            <template #child>
              <!-- Liste des tickets -->
              <router-link to="/backoffice/tickets"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-gray-500 hover:text-white transition-colors"
                active-class="bg-gray-700 text-white font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Liste
              </router-link>
            </template>
          </AccordionMenu>
        </div>
        <button v-else class="flex justify-center py-2 rounded-lg text-white hover:bg-gray-750 transition-colors">
          <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5'
            stroke='currentColor' class='size-4'>
            <path stroke-linecap='round' stroke-linejoin='round'
              d='M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z' />
          </svg>
        </button>
        <div v-if="!collapsed">
          <AccordionMenu :title="'Kanban'" :hover-color="`hover:bg-gray-500`" :icon="`<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5'
                        stroke='currentColor' class='size-4 shrink-0'>
                        <path stroke-linecap='round' stroke-linejoin='round'
                            d='M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v9a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 15V6ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v4.5A2.25 2.25 0 0 1 18 12.75h-2.25A2.25 2.25 0 0 1 13.5 10.5V6Z' />
                    </svg>`">
            <template #child>
              <!-- Liste des tickets -->
              <router-link to="/backoffice/kanban/config"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-gray-500 hover:text-white transition-colors"
                active-class="bg-gray-700 text-white font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="size-4">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008Z" />
                </svg>
                Config
              </router-link>
            </template>
          </AccordionMenu>
        </div>
        <button v-else class="flex justify-center py-2 rounded-lg text-white hover:bg-gray-750 transition-colors">
          <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5'
            stroke='currentColor' class='size-4 shrink-0'>
            <path stroke-linecap='round' stroke-linejoin='round'
              d='M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v9a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 15V6ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v4.5A2.25 2.25 0 0 1 18 12.75h-2.25A2.25 2.25 0 0 1 13.5 10.5V6Z' />
          </svg>
        </button>



      </nav>
    </aside>

    <!-- CONTENU PRINCIPAL -->
    <div class="flex-1 flex flex-col overflow-hidden">

      <!-- TOPBAR -->
      <header class="bg-white border-b border-gray-200 px-6 py-4">
        <slot name="header">
          <div class="flex flex-row justify-between">
            <h1 class="text-base font-semibold text-gray-800">Backoffice</h1>
            <button @click="handleLogout"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Déconnexion</span>
            </button>
          </div>
        </slot>
      </header>

      <!-- PAGE -->
      <main class="w-full flex-1 overflow-auto p-4 sm:p-6">
        <div class="max-w-7xl mx-auto w-full">
          <router-view />
        </div>
      </main>

    </div>
  </div>
</template>