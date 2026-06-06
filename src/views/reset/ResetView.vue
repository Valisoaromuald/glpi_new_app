<script setup lang="ts">
import ComputerService from '@/services/assets/computerService';
import { onMounted, ref } from 'vue';

const ids = ref<number[]>([])
const computerId = defineModel<number>('computerId', { required: true, default: 0 })

onMounted(async () => {
  const computerService = new ComputerService();
  ids.value = await computerService.getAllIds()
})

async function deleteByComputerId(id: number | string) {
  const computerService = new ComputerService();
  try {
    if (id !== 0) {
      return computerService.deleteById(id)
    }
    else {
      return computerService.deleteAll()
    }
  } catch (error) {
    throw error;
  }
}
</script>

<template>
  <div class="max-w-lg">

    <div class="bg-white rounded-xl border border-gray-200 p-6">

      <div class="flex items-start gap-3 mb-6">
        <div class="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
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

      <ul class="mb-4">
        <li v-for="id in ids" :key="id" class="text-sm text-gray-600 list-disc list-inside">
          ID Ordinateur : {{ id }}
        </li>
      </ul>
      <form @submit.prevent="deleteByComputerId(computerId)">
        <label>

          <input type="number" v-model="computerId">
        </label>
        <button type="submit">supprimer</button>
      </form>

    </div>
  </div>
</template>