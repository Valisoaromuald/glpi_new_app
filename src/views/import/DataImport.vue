<script lang="ts">
import BackOfficeLayout from '@/layouts/BackOfficeLayout.vue'
import { defineComponent } from 'vue'

// import ImportService from '@/services/business/importService'

type FileKey = 'products' | 'categories' | 'users' | 'images'

interface FileSlot {
  key: FileKey
  label: string
  accept: string
  type: 'csv' | 'zip'
  file: File | null
}

export default defineComponent({
  name: 'DataImport',

  components: { BackOfficeLayout },

  data() {
    return {
      isLoading: false as boolean,
      isDone: false as boolean,
      hasError: false as boolean,
      errorMessage: '' as string,
    //   importService: new ImportService(),

      slots: [
        { key: 'products',   label: 'Produits',     accept: '.csv', type: 'csv', file: null },
        { key: 'categories', label: 'Catégories',   accept: '.csv', type: 'csv', file: null },
        { key: 'users',      label: 'Utilisateurs', accept: '.csv', type: 'csv', file: null },
        { key: 'images',     label: 'Images',       accept: '.zip', type: 'zip', file: null },
      ] as FileSlot[]
    }
  },

  computed: {
    allFilesSelected(): boolean {
      return this.slots.every(s => s.file !== null)
    }
  },

  methods: {
    onFileChange(event: Event, key: FileKey): void {
      const input = event.target as HTMLInputElement
      const slot = this.slots.find(s => s.key === key)
      if (slot && input.files?.[0]) {
        slot.file = input.files[0]
      }
    },

    triggerInput(key: FileKey): void {
      const input = this.$refs[`input-${key}`] as HTMLInputElement
      input.click()
    },

    removeFile(key: FileKey): void {
      const slot = this.slots.find(s => s.key === key)
      if (slot) slot.file = null
    },

    // async handleImport(): Promise<void> {
    //   if (!this.allFilesSelected) return

    //   this.isLoading = true
    //   this.isDone = false
    //   this.hasError = false

    //   try {
    //     const files = Object.fromEntries(
    //       this.slots.map(s => [s.key, s.file as File])
    //     )
    //     await this.importService.importAll(files)
    //     this.isDone = true
    //     this.slots.forEach(s => s.file = null)
    //   } catch (e: any) {
    //     this.hasError = true
    //     this.errorMessage = e?.message ?? 'Erreur lors de l\'import.'
    //   } finally {
    //     this.isLoading = false
    //   }
    // }
  }
})
</script>

<template>
  <BackofficeLayout>

    <template #header>
      <h1 class="text-base font-semibold text-gray-800">Importer les fichiers</h1>
      <p class="text-xs text-gray-400 mt-0.5">Backoffice / Importer fichiers</p>
    </template>

    <div class="max-w-2xl flex flex-col gap-5">

      <!-- Grille des 4 fichiers -->
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="slot in slots"
          :key="slot.key"
          class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3"
        >
          <!-- En-tête carte -->
          <div class="flex items-center gap-3">
            <div
              :class="slot.type === 'csv'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-amber-50 text-amber-700'"
              class="w-8 h-8 rounded-lg flex items-center justify-center"
            >
              <!-- Icône CSV -->
              <svg v-if="slot.type === 'csv'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z"/>
              </svg>
              <!-- Icône ZIP -->
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-800">{{ slot.label }}</p>
              <p class="text-xs text-gray-400">{{ slot.accept.toUpperCase() }}</p>
            </div>
          </div>

          <!-- Input caché -->
          <input
            :ref="`input-${slot.key}`"
            type="file"
            :accept="slot.accept"
            class="hidden"
            @change="onFileChange($event, slot.key)"
          />

          <!-- Fichier sélectionné -->
          <div v-if="slot.file" class="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <p class="text-xs text-gray-600 truncate max-w-[130px]">{{ slot.file.name }}</p>
            <button @click="removeFile(slot.key)" class="text-gray-400 hover:text-red-500 transition-colors ml-2">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Zone de dépôt -->
          <button
            v-else
            @click="triggerInput(slot.key)"
            class="border-2 border-dashed border-gray-200 hover:border-blue-800 rounded-lg py-4 flex flex-col items-center gap-1 text-gray-400 hover:text-blue-800 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            <span class="text-xs">Choisir un fichier</span>
          </button>

        </div>
      </div>

      <!-- Feedback succès -->
      <div v-if="isDone" class="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
        Import réalisé avec succès.
      </div>

      <!-- Feedback erreur -->
      <div v-if="hasError" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
        {{ errorMessage }}
      </div>

      <!-- Bouton import -->
      <button
        :disabled="!allFilesSelected || isLoading"
        class="flex items-center gap-2 self-start bg-blue-800 hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
        </svg>
        {{ isLoading ? 'Import en cours...' : 'Lancer l\'import' }}
      </button>

    </div>

  </BackofficeLayout>
</template>