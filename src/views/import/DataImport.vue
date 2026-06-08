<script setup lang="ts">
import ImportCard from '@/components/import/ImportCard.vue';
import { FileService } from '@/services/import/fileService';
import ImportService from '@/services/import/importService';
import type { Manufacturer } from '@/types/dropdowns/manufacturer';
import { ref } from 'vue';

const headers = ref<string[]>([])
const states = ref<string[]>([])
const manufacturer = ref<Partial<Manufacturer>>({})
const objects = ref<any>([])
const message = ref<string>('')
const importStarted = ref<boolean>(false)
const importFinished = ref<boolean>(false)
async function handleImport(files: File[]) {
  importStarted.value= true
  const fileService = new FileService(files[0]);
  const importService = new ImportService();
  const csvContent = await fileService.readCsv();
  headers.value = csvContent.headers
  // states.value = importService.getAllStates(csvContent)
  message.value = await importService.importFromFirstFile(csvContent)
  importFinished.value= true
  importStarted.value= false

}
</script>
<template>
  <div class="flex flex-row gap-4">
    <div class="grid grid-cols-1 grid-rows-2 gap-4">
      <ImportCard :accept="`.csv`" :multiple="false" @import="handleImport" />
      <ImportCard :accept="`.csv`" :multiple="false" />
    </div>
    <div class="grid grid-cols-1 grid-rows-2 gap-4">
      <ImportCard :accept="`.csv`" :multiple="false" />
      <ImportCard :accept="`.zip`" :multiple="false" />
    </div>
  </div>
  <template v-if="headers.length">
    <ul>
      <li v-for="header in headers" :key="header">{{ header }}</li>
    </ul>
  </template>
  <template v-if="message.length === 0 && importStarted">
    <div class="animate-spin text-green-400"></div>import de donnee en cours...
  </template>
  <template v-if="message.length !== 0 && importFinished">  
    {{ message }}
  </template>
</template>