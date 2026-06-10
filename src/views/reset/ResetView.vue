<script setup lang="ts">
import Log from '@/components/logs/Log.vue';
import UserService from '@/services/administration/userService';
import AssetService from '@/services/assets/assetService';
import DataResetService from '@/services/database/resetService';
import { onMounted, ref } from 'vue';

const ids = ref<number[]>([])
const idsAndHrefs = ref<{ hrefs: string[], ids: number[][] }>({ hrefs: [], ids: [] })

const logs = ref<string>('')
const isResetting = ref(false)

onMounted(async () => {
  const userService = new UserService();
  const assetService = new AssetService();
})

const progressMap: Record<string, string> = {}  // ← pas de ref, simple objet

async function handleReset() {
  isResetting.value = true
  const resetService = new DataResetService()
  
  // Réinitialiser la map à chaque reset
  Object.keys(progressMap).forEach(key => delete progressMap[key])
  logs.value = ''

  try {
    await resetService.resetDatabase((resource: string, done: number, total: number) => {
      if (done !== 0 && total !== 0) {
        const percent = Math.round((done / total) * 100)
        const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10))
        progressMap[resource] = `[${bar}] ${resource.padEnd(20)} ${done}/${total} (${percent}%)`
      } else {
        const bar = '█'.repeat(10)
        progressMap[resource] = `[${bar}] ${resource.padEnd(20)} done (100%)`
      }

      logs.value = Object.values(progressMap).join('\n')
    })
    logs.value += '\n\n✓ Réinitialisation terminée avec succès.'
  } catch (error) {
    console.error(error)
    logs.value += `\n\n✗ Erreur : ${error}`
  } finally {
    isResetting.value = false
  }
}
</script>

<template>
  <div class="max-w-lg space-y-4">

    <!-- Carte d'avertissement -->
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
            Cette action supprimera toutes les données importées : elemnts, tickets,
             couts de tickets et images. Elle ne peut pas être annulée.
          </p>
        </div>
      </div>

      <!-- Bouton reset -->
      <button type="button" :disabled="isResetting"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-medium transition-colors"
        @click="handleReset">
        <svg class="w-4 h-4" :class="{ 'animate-spin': isResetting }" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path v-if="!isResetting" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m2-3h6a1 1 0 011 1v1H8V5a1 1 0 011-1z" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ isResetting ? 'Réinitialisation en cours...' : 'Réinitialiser la base de données' }}
      </button>
    </div>

    <!-- Terminal Log.vue — visible dès qu'on a des logs -->
    <Log v-if="logs || isResetting" :logs="logs" :title="`glpi reset-terminal`" />

  </div>
</template>