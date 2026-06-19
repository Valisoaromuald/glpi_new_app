<script setup lang="ts">
import type { ImportedFile } from '@/types/file/importedFile';
import ImportCard from './ImportCard.vue';
import { FileService, type CsvResult } from '@/services/import/fileService.ts';
import { useKanban } from '@/composables/useKanban.ts';
import { computed, ref } from 'vue';
import DataResetService from '@/services/database/resetService.ts';
import Log from '../terminal/Log.vue';


const { importTransaction } = useKanban()
const isImporting = ref<boolean>(false)
const isError = ref<boolean>(false)
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
const filesLabel = computed(() =>
    `Fichier${files.value.length > 1 ? 's' : ''}`
)

const isSubmitting = ref<boolean>(false)
const files = ref<ImportedFile[]>([])

function handleAdd(file: ImportedFile): void {
    files.value.push(file)
}
function handleRemove(file: ImportedFile): void {
    files.value = files.value.filter(f => f.id !== file.id)
}
const logs = ref<string>('')

function appendLog(line: string): void {
    logs.value += (logs.value ? '\n' : '') + line
}
async function handleImport(): Promise<void> {
    logs.value = ''
    isImporting.value = true
    try {
        const file: CsvResult | null = await new FileService(files.value[0]?.file).readCsv()
        if (file) {
            appendLog('[Fichier Transction] Démarrage de l\'import...')
            const msg1 = await importTransaction(file, onProgress)
            appendLog(`[Fichier transaction] ${msg1}`)
        }
        if (!file) {
            appendLog('Aucun fichier reconnu. Vérifiez les colonnes.')
        }

        files.value = []

    } catch (error) {
        const resetService = new DataResetService()
        isError.value = true
        appendLog(`✗[ERREUR] ${(error as Error).message}`)
        await resetService.resetDatabase(onProgress)
        appendLog('[RESET] Base de données réinitialisée.')
        throw error;
    } finally {
        isImporting.value = false
        isError.value = false
    }
}
function textButton(): string {
    if (isImporting.value && isError.value) {
        return 'Réinitialisation des données...'
    }
    if (isImporting.value) {
        return 'Importation en cours...'
    }
    return `Importer ${files.value.length} ${filesLabel.value}`  // ← .value
}
</script>
<template>
    <ImportCard :accept="`.csv`" :multiple="false" @add="handleAdd" @remove="handleRemove" />
    <button type="button" :disabled="files.length === 0 || isImporting" @click="handleImport"
        class="h-9 px-4 flex items-center gap-2 mt-2 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 self-start">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" :class="{ 'animate-spin': isImporting }" fill="none"
            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        {{ textButton() }}
    </button>
    <Log v-if="logs.length > 0 || isImporting" :logs="logs" :title="`glpi-import-Terminal`" />

</template>
