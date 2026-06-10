<script setup lang="ts">
import type { ImportedFile } from '@/types/file/importedFile';
import { ref, computed } from 'vue'

// ─── Props & Emits ────────────────────────────────────────────────────────────

const props = withDefaults(defineProps<{
  title?: string
  accept?: string
  maxSizeMb?: number
  multiple?: boolean
  maxFiles?: number
  disabled?: boolean
}>(), {
  title: 'Importer un fichier',
  accept: '',
  maxSizeMb: 10,
  multiple: false,
  maxFiles: 1,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'add', file: ImportedFile): void
  (e: 'remove', file: ImportedFile): void
  (e: 'cancel'): void
}>()

// ─── State ────────────────────────────────────────────────────────────────────

const fileInputRef = ref<HTMLInputElement | null>(null)
const importedFiles = ref<ImportedFile[]>([])
const errorMessage = ref<string>('')

// ─── Computed ─────────────────────────────────────────────────────────────────

const acceptedTypes = computed<string[]>(() =>
  props.accept
    ? props.accept.split(',').map(t => t.trim().toLowerCase())
    : []
)

const isMaxReached = computed(() =>
  importedFiles.value.length >= props.maxFiles
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function getExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() ?? 'FILE'
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

function getExtensionColor(ext: string): string {
  const map: Record<string, string> = {
    PDF:  'bg-red-100   text-red-700',
    XLSX: 'bg-green-100 text-green-700',
    XLS:  'bg-green-100 text-green-700',
    CSV:  'bg-yellow-100 text-yellow-700',
    DOCX: 'bg-blue-100  text-blue-700',
    DOC:  'bg-blue-100  text-blue-700',
    PNG:  'bg-purple-100 text-purple-700',
    JPG:  'bg-purple-100 text-purple-700',
    JPEG: 'bg-purple-100 text-purple-700',
    ZIP:  'bg-gray-100  text-gray-600',
    JSON: 'bg-orange-100 text-orange-700',
    TXT:  'bg-gray-100  text-gray-600',
  }
  return map[ext] ?? 'bg-gray-100 text-gray-600'
}

// ─── Methods ──────────────────────────────────────────────────────────────────

function openFilePicker(): void {
  fileInputRef.value?.click()
}

function validateFile(file: File): string | null {
  const sizeMb = file.size / (1024 * 1024)
  if (sizeMb > props.maxSizeMb) {
    return `"${file.name}" dépasse la taille maximum de ${props.maxSizeMb} Mo.`
  }
  if (acceptedTypes.value.length > 0) {
    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`
    if (!acceptedTypes.value.includes(ext)) {
      return `"${file.name}" : type de fichier non accepté.`
    }
  }
  return null
}

function onFileChange(event: Event): void {
  errorMessage.value = ''
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const incoming = Array.from(input.files)

  for (const file of incoming) {
    const error = validateFile(file)
    if (error) {
      errorMessage.value = error
      input.value = ''
      return
    }

    if (!props.multiple) {
      // En mode simple : si un fichier existait déjà, on émet remove avant de le remplacer
      if (importedFiles.value.length > 0) {
        let file =  importedFiles.value[0]
        if(file){
          emit('remove', file )
        }
      }
      const newFile: ImportedFile = {
        id:        generateId(),
        file,
        name:      file.name,
        size:      formatSize(file.size),
        extension: getExtension(file.name),
      }
      importedFiles.value = [newFile]
      emit('add', newFile)
      break
    }

    const alreadyAdded = importedFiles.value.some(
      f => f.name === file.name && f.size === formatSize(file.size)
    )
    if (alreadyAdded) continue

    if (importedFiles.value.length >= props.maxFiles) {
      errorMessage.value = `Maximum ${props.maxFiles} fichiers autorisés.`
      break
    }

    const newFile: ImportedFile = {
      id:        generateId(),
      file,
      name:      file.name,
      size:      formatSize(file.size),
      extension: getExtension(file.name),
    }
    importedFiles.value.push(newFile)
    emit('add', newFile)
  }

  input.value = ''
}

function removeFile(id: string): void {
  const file = importedFiles.value.find(f => f.id === id)
  if (file) emit('remove', file)
  importedFiles.value = importedFiles.value.filter(f => f.id !== id)
  errorMessage.value = ''
}

function handleCancel(): void {
  // Émet remove pour chaque fichier présent avant de vider
  for (const file of importedFiles.value) {
    emit('remove', file)
  }
  importedFiles.value = []
  errorMessage.value = ''
  emit('cancel')
}
</script>

<template>
  <div
    class="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col gap-5 shadow-sm">

    <!-- ── Header ── -->
    <div class="flex items-center gap-3">
      <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none"
          viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>
      <div>
        <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
          {{ props.title }}
        </h2>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {{ props.accept || 'Tous types de fichiers' }} · max {{ props.maxSizeMb }} Mo
          <template v-if="props.multiple"> · {{ props.maxFiles }} fichiers max</template>
        </p>
      </div>
    </div>

    <!-- ── Input caché ── -->
    <input ref="fileInputRef" type="file" class="hidden" :accept="props.accept || undefined" @change="onFileChange" />

    <!-- ── Zone de sélection ── -->
    <div class="flex gap-2 items-center">
      <div
        class="flex-1 h-10 px-3 flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-400 dark:text-gray-500 select-none truncate">
        <template v-if="importedFiles.length === 0">
          Aucun fichier sélectionné
        </template>
        <template v-else-if="!props.multiple">
          {{ importedFiles[0]?.name ?? '' }}
        </template>
        <template v-else>
          {{ importedFiles.length }} fichier{{ importedFiles.length > 1 ? 's' : '' }} sélectionné{{ importedFiles.length > 1 ? 's' : '' }}
        </template>
      </div>
      <button type="button" :disabled="isMaxReached || props.disabled"
        class="h-10 px-4 flex items-center gap-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        @click="openFilePicker">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
        Parcourir
      </button>
    </div>

    <!-- ── Message d'erreur ── -->
    <transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="errorMessage"
        class="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24"
          stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        {{ errorMessage }}
      </div>
    </transition>

    <!-- ── Liste des fichiers ── -->
    <transition-group v-if="importedFiles.length" tag="ul" class="flex flex-col gap-2"
      enter-active-class="transition-all duration-200" enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <li v-for="item in importedFiles" :key="item.id"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <span
          class="shrink-0 inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none"
          :class="getExtensionColor(item.extension)">
          {{ item.extension }}
        </span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate leading-tight">
            {{ item.name }}
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ item.size }}</p>
        </div>
        <button type="button"
          class="shrink-0 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          :aria-label="`Supprimer ${item.name}`" @click="removeFile(item.id)">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </li>
    </transition-group>

    <!-- ── Séparateur ── -->
    <div class="border-t border-gray-100 dark:border-gray-800" />

    <!-- ── Actions ── -->
    <div class="flex justify-end gap-2">
      <button
        :disabled="importedFiles.length < 1"
        type="button"
        class="h-9 px-4 text-sm font-medium rounded-xl border border-gray-200 dark:border-red-700 text-gray-600 dark:text-gray-50 hover:bg-red-500 dark:hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        @click="handleCancel">
        Annuler
      </button>
    </div>

  </div>
</template>