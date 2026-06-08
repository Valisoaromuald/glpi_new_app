<script setup lang="ts">
import ImportCard from '@/components/import/ImportCard.vue';
import { FileService } from '@/services/import/fileService';
import ImportService from '@/services/import/importService';
import { ref } from 'vue';

const headers = ref<string[]>([])
const states = ref<string[]>([])
async function handleImport(files:File[]){
  const fileService = new FileService(files[0]);
  const importService = new ImportService();
  const csvContent = await fileService.readCsv();
  headers.value = csvContent.headers
  states.value = importService.getAllStates(csvContent)
}
</script>
<template>
  <div class="flex flex-row gap-4">
    <div class="grid grid-cols-1 grid-rows-2 gap-4">
      <ImportCard :accept="`.csv`" :multiple="false" @import="handleImport"/>
      <ImportCard :accept="`.csv`" :multiple="false" />
    </div>
    <div class="grid grid-cols-1 grid-rows-2 gap-4">
      <ImportCard :accept="`.csv`" :multiple="false" />
      <ImportCard :accept="`.zip`" :multiple="false"  />
    </div>
  </div>
  <template v-if="headers.length">
    <ul>
      <li v-for="header in headers" :key="header">{{ header }}</li>
    </ul>
  </template>
  <template v-if="states.length">
    <ul>
      <li v-for="state in states" :key="state">{{ state }}</li>
    </ul>
  </template>
</template>