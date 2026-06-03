<script lang="ts">
import { defineComponent } from 'vue'
import BackOfficeLayout from '@/layouts/BackOfficeLayout.vue'
// import ResetService from '@/services/business/resetService'

export default defineComponent({
  name: 'ResetView',

  components: { BackOfficeLayout },

  data() {
    return {
      isLoading: false as boolean,
      isDone: false as boolean,
      hasError: false as boolean,
    //   resetService: new ResetService()
    }
  },

  methods: {
    async handleReset(): Promise<void> {
      this.isLoading = true
      this.isDone = false
      this.hasError = false

      try {
        // await this.resetService.resetAll()
        this.isDone = true
      } catch (e) {
        this.hasError = true
      } finally {
        this.isLoading = false
      }
    }
  }
})
</script>

<template>
  <BackofficeLayout>

    <template #header>
      <h1 class="text-base font-semibold text-gray-800">Réinitialiser les données</h1>
      <p class="text-xs text-gray-400 mt-0.5">Backoffice / Réinitialiser données</p>
    </template>

    <div class="max-w-lg">
      <div class="bg-white rounded-xl border border-gray-200 p-6">

        <!-- Avertissement -->
        <div class="flex items-start gap-3 mb-6">
          <div class="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-800">Action irréversible</p>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed">
              Cette action supprimera toutes les données importées : produits, catégories,
              utilisateurs et images. Elle ne peut pas être annulée.
            </p>
          </div>
        </div>

        <!-- Feedback succès -->
        <div v-if="isDone" class="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          Données réinitialisées avec succès.
        </div>

        <!-- Feedback erreur -->
        <div v-if="hasError" class="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          Une erreur est survenue. Réessayez.
        </div>

        <button
          :disabled="isLoading"
          @click="handleReset"
          class="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          {{ isLoading ? 'Réinitialisation...' : 'Confirmer la réinitialisation' }}
        </button>

      </div>
    </div>

  </BackofficeLayout>
</template>