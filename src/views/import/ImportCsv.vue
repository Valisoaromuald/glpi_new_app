<!-- views/ImportCsv.vue -->
<template>
  <div class="max-w-2xl mx-auto p-8">
    <div class="bg-white border border-gray-200 rounded-xl p-7">

      <h1 class="text-lg font-medium text-gray-900">Importation CSV</h1>
      <p class="text-sm text-gray-500 mt-1 mb-6">
        Ajoutez des fichiers et renseignez l'endpoint PrestaShop pour chacun
      </p>
      <!-- Grille des groupes -->
      <div class="grid grid-cols-2 gap-3">
        <div v-for="(group, index) in groups" :key="group.id"
          class="flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3 relative">
          <!-- Bouton supprimer -->
          <button @click="removeGroup(index)" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm">
            ✕
          </button>

          <!-- Input fichier -->
          <p class="text-xs font-medium text-gray-500">Fichier CSV</p>
          <label
            class="flex items-center justify-center gap-2 h-9 border border-dashed border-gray-300 rounded-lg cursor-pointer text-sm text-gray-500 hover:bg-white transition"
            :class="{ 'border-green-400 text-green-600': group.file }">
            <span>{{ group.file ? group.file.name : 'Choisir un fichier' }}</span>
            <input type="file" accept=".csv" class="hidden" @change="onFileChange($event, index)" />
          </label>

          <!-- Input endpoint -->
          <p class="text-xs font-medium text-gray-500 mt-1">Endpoint API</p>
          <input v-model="group.endpoint" type="text" placeholder="ex : categories"
            class="h-9 px-3 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400" />

          <!-- Aperçu URL -->
          <p class="text-xs font-mono text-gray-400 truncate">
            {{ baseUrl }}/
            <span class="text-blue-500 font-medium">{{ group.endpoint || '...' }}</span>
          </p>

          <!-- Statut -->
          <p v-if="group.status === 'success'" class="text-xs text-green-600">✓ Importé</p>
          <p v-if="group.status === 'error'" class="text-xs text-red-500">✗ {{ group.error }}</p>
        </div>
      </div>


      <!-- Bouton ajouter -->
      <button @click="addGroup"
        class="w-full mt-3 h-10 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition">
        + Ajouter un fichier
      </button>

      <hr class="my-5 border-gray-100" />

      <!-- Barre de progression globale -->
      <div v-if="importing" class="mb-4">
        <div class="flex justify-between text-xs text-gray-500 mb-1">
          <span>{{ progressText }}</span>
          <span>{{ progressPct }}%</span>
        </div>
        <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all duration-300" :class="allDone ? 'bg-green-500' : 'bg-blue-500'"
            :style="{ width: progressPct + '%' }"></div>
        </div>
      </div>


      <!-- Actions -->
      <div class="flex gap-3">
        <button @click="reset"
          class="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
          Annuler
        </button>
        <button @click="handleImport" :disabled="!canImport"
          class="flex-1 h-10 bg-gray-400 text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition">
          {{ groups.length > 1 ? `Importer ${groups.length} fichiers` : 'Importer' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { importCsvFile } from '@/services/import/importService'

interface ImportGroup {
  id: number
  file: File | null
  endpoint: string
  status: 'success' | 'error' | null
  error: string
}

export default defineComponent({
  name: 'ImportCsv',

  data() {
    return {
      groups: [] as ImportGroup[],
      counter: 0,
      importing: false,
      done: 0,
      baseUrl: import.meta.env.VITE_PRESTASHOP_API_URL as string
    }
  },

  computed: {
    canImport(): boolean {
      return (
        this.groups.length > 0 &&
        this.groups.every(
          g => g.file !== null && g.endpoint.trim() !== ''
        )
      )
    },

    progressPct(): number {
      if (this.groups.length === 0) return 0
      return Math.round((this.done / this.groups.length) * 100)
    },

    allDone(): boolean {
      return (
        this.done === this.groups.length &&
        this.groups.length > 0
      )
    },

    progressText(): string {
      if (this.allDone) {
        return `${this.groups.length} fichier(s) importé(s) ✓`
      }
      return `Import en cours... (${this.done}/${this.groups.length})`
    }
  },

  methods: {
    addGroup(): void {
      this.groups.push({
        id: this.counter++,
        file: null,
        endpoint: '',
        status: null,
        error: ''
      })
    },

    removeGroup(index: number): void {
      this.groups.splice(index, 1)
    },

    onFileChange(event: Event, index: number): void {
      const target = event.target as HTMLInputElement

      if (target.files && target.files.length > 0) {
        this.groups[index].file = target.files[0]
      }
    },

    reset(): void {
      this.groups = []
      this.counter = 0
      this.importing = false
      this.done = 0
    },

    async handleImport(): Promise<void> {
      if (!this.canImport) return

      this.importing = true
      this.done = 0

      this.groups.forEach(g => {
        g.status = null
        g.error = ''
      })

      await Promise.allSettled(
        this.groups.map(async (group) => {
          try {
            if (!group.file) return

            await importCsvFile(
              this.baseUrl,
              group.endpoint,
              group.file
            )

            group.status = 'success'
          } catch (err: unknown) {
            group.status = 'error'

            if (err instanceof Error) {
              group.error = err.message
            } else {
              group.error = 'Erreur inconnue'
            }
          } finally {
            this.done++
          }
        })
      )
    }
  },

  created() {
    this.addGroup()
  }
})
</script>