<script lang="ts" setup>
import AccordionMenu from '@/components/common/accordion/AccordionMenu.vue';
import { useRedirect } from '@/composables/useRedirect';
import GlpiOAuthService from '@/services/authentication/GlpiOAuthService';

const glpiOAuthService = new GlpiOAuthService()
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
    <aside class="w-56 bg-gray-950 flex flex-col">

      <div class="px-5 py-5 border-b border-gray-500">
        <p class="text-white font-semibold text-base">GLPI</p>
        <p class="text-white text-xs mt-0.5">Backoffice</p>
      </div>

      <nav class="flex-1 px-3 py-4 flex flex-col gap-1">
        <p class="text-white text-xs uppercase tracking-widest px-2 mb-1">Gestion</p>
        <router-link to="/backoffice/home"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-gray-500 hover:text-white transition-colors"
          active-class="bg-gray-700 text-white font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Accueil
        </router-link>
        <router-link to="/backoffice/reset"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-gray-500 hover:text-white transition-colors"
          active-class="bg-gray-700 text-white font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Réinitialiser données
        </router-link>

        <router-link to="/backoffice/import"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-gray-500 hover:text-white transition-colors"
          active-class="bg-gray-700 text-white font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Importer fichiers
        </router-link>

        <AccordionMenu :title="'Ticket'" :hover-color="`bg-gray-500`">
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
        <AccordionMenu :title="'Kanban'" :hover-color="`hover:bg-gray-500`">
          <template #child>
            <!-- Liste des tickets -->
            <router-link to="/backoffice/kanban/config"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-gray-500 hover:text-white transition-colors"
              active-class="bg-gray-700 text-white font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008Z" />
              </svg>

              Config
            </router-link>
          </template>
        </AccordionMenu>
        <button @click="handleLogout"
          class="flex items-center gap-2 ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden sm:inline">Déconnexion</span>
        </button>

      </nav>
    </aside>

    <!-- CONTENU PRINCIPAL -->
    <div class="flex-1 flex flex-col overflow-hidden">

      <!-- TOPBAR -->
      <header class="bg-white border-b border-gray-200 px-6 py-4">
        <slot name="header">
          <h1 class="text-base font-semibold text-gray-800">Backoffice</h1>
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