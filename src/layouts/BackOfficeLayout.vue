<script lang="ts" setup>

    const handleLogout  = () :void  => {
      if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('user')
        window.location.href = '/backoffice/login'
      }
    }
</script>

<template>
  <div class="flex h-screen bg-gray-100">

    <!-- SIDEBAR -->
    <aside class="w-56 bg-blue-800 flex flex-col">

      <div class="px-5 py-5 border-b border-blue-700">
        <p class="text-white font-semibold text-base">NewApp</p>
        <p class="text-blue-300 text-xs mt-0.5">Backoffice</p>
      </div>

      <nav class="flex-1 px-3 py-4 flex flex-col gap-1">
        <p class="text-blue-400 text-xs uppercase tracking-widest px-2 mb-1">Gestion</p>
        <router-link to="/backoffice/home"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
          active-class="bg-blue-900 text-white font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Accueil
        </router-link>
        <router-link to="/backoffice/reset"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
          active-class="bg-blue-900 text-white font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Réinitialiser données
        </router-link>

        <router-link to="/backoffice/import"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-200 hover:bg-blue-700 hover:text-white transition-colors"
          active-class="bg-blue-900 text-white font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Importer fichiers
        </router-link>
        <button @click="handleLogout"
          class="flex items-center gap-2 ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden sm:inline">Déconnexion</span>
        </button>

      </nav>

      <div class="px-5 py-4 border-t border-blue-700 flex items-center gap-3">
        <div class="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-medium">
          AD
        </div>
        <span class="text-blue-200 text-xs">Admin</span>
      </div>

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
      <main class="flex-1 overflow-auto p-6">
        <router-view />
      </main>

    </div>
  </div>
</template>