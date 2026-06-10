<script setup lang="ts">
import ImportCard from '@/components/import/ImportCard.vue';
import Log from '@/components/logs/Log.vue';
import DataResetService from '@/services/database/resetService';
import { type CsvResult } from '@/services/import/fileService';
import ImportService from '@/services/import/importService';
import type { ImportedFile } from '@/types/file/importedFile';
import { FILE1_COLLUMN_NAMES, FILE2_COLLUMN_NAMES, FILE3_COLLUMN_NAMES } from '@/utils/importUtil';
import { computed, ref } from 'vue';

// ─── État global des fichiers sélectionnés ────────────────────────────────────

const files = ref<ImportedFile[]>([])
const importService = new ImportService();

const filesLabel = computed(() =>
  `Fichier${files.value.length > 1 ? 's' : ''}`
)

// ─── Logs ─────────────────────────────────────────────────────────────────────

const logs = ref<string>('')
const isImporting = ref<boolean>(false)

function appendLog(line: string): void {
  logs.value += (logs.value ? '\n' : '') + line
}

/**
 * Met à jour la ligne de progression d'une ressource si elle existe déjà,
 * sinon l'ajoute. Evite les doublons de lignes pour une même ressource.
 */
function onProgress(resource: string, done: number, total: number): void {
  const newLine =
    done === 0 && total === 0
      ? `[${resource}] done (100%)`
      : `[${resource}] ${done}/${total} (${Math.round((done / total) * 100)}%)`

  const pattern = new RegExp(`\\[${resource}\\][^\n]*`)

  if (pattern.test(logs.value)) {
    // Remplace la ligne existante pour cette ressource
    logs.value = logs.value.replace(pattern, newLine)
  } else {
    appendLog(newLine)
  }
}

// ─── Handlers sélection ───────────────────────────────────────────────────────

function handleAdd(file: ImportedFile): void {
  files.value.push(file)
}

function handleRemove(file: ImportedFile): void {
  files.value = files.value.filter(f => f.id !== file.id)
}

// ─── Import ───────────────────────────────────────────────────────────────────

async function handleImport(): Promise<void> {
  logs.value = ''
  isImporting.value = true
  try {
    const file1: CsvResult | null = await importService.getRelevantCsvResult(files.value, FILE1_COLLUMN_NAMES)
    const file2: CsvResult | null = await importService.getRelevantCsvResult(files.value, FILE2_COLLUMN_NAMES)
    const file3: CsvResult | null = await importService.getRelevantCsvResult(files.value, FILE3_COLLUMN_NAMES)
     const file4 : ImportedFile | null = importService.getZipFile(files.value); 
    if (file1) {
      appendLog('[Fichier 1] Démarrage de l\'import...')
      const msg1 = await importService.importAssets(file1, onProgress)
      appendLog(`[Fichier 1] ${msg1}`)
    }

    if (file2) {
      appendLog('[Fichier 2] Démarrage de l\'import...')
      const msg2 = await importService.importTickets(file2, onProgress)
      appendLog(`[Fichier 2] ${msg2}`)
    }

    if (file3) {
      appendLog('[Fichier 3] Démarrage de l\'import...')
      const msg3 = await importService.importTicketCosts(file3, onProgress)
      appendLog(`[Fichier 3] ${msg3}`)
    }
    if(file4){
      appendLog('[Fichier 4] Démarrage de l\'import...')
      const msg3 = await importService.importImagesZip(file4, onProgress)
      appendLog(`[Fichier 4] ${msg3}`)
    }

    if (!file1 && !file2 && !file3 && !file4) {
      appendLog('Aucun fichier reconnu. Vérifiez les colonnes.')
    }

    files.value = []

  } catch (error) {
    const resetService = new DataResetService()
    appendLog(`[ERREUR] ${(error as Error).message}`)
    await resetService.resetDatabase(onProgress)
    appendLog('[RESET] Base de données réinitialisée.')
  } finally {
    isImporting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">

    <!-- ── Cartes d'import ── -->
    <div class="grid grid-cols-2 grid-rows-1 gap-4">
      <ImportCard :accept="`.csv`" :multiple="false" @add="handleAdd" @remove="handleRemove" />
      <ImportCard :accept="`.csv`" :multiple="false" @add="handleAdd" @remove="handleRemove" />
    </div>
    <div class="grid grid-cols-2 grid-rows-1 gap-4">
      <ImportCard :accept="`.csv`" :multiple="false" @add="handleAdd" @remove="handleRemove" />
      <ImportCard :accept="`.zip`" :multiple="false" @add="handleAdd" @remove="handleRemove" />
    </div>

    <!-- ── Bouton global ── -->
    <button type="button" :disabled="files.length === 0 || isImporting" @click="handleImport"
      class="h-9 px-4 flex items-center gap-2 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 self-start">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" :class="{ 'animate-spin': isImporting }" fill="none"
        viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      {{ isImporting ? 'Import en cours...' : `Importer ${files.length} ${filesLabel}` }}
    </button>

    <!-- ── Terminal de logs ── -->
    <Log v-if="logs.length > 0 || isImporting" :logs="logs" :title="`glpi-import-Terminal`" />

  </div>
</template>