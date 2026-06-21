<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  logs: string
  title: string
}>()

interface LogLine {
  type: 'progress' | 'success' | 'error' | 'info'
  raw: string
  resource?: string
  done?: number
  total?: number
  percent?: number
}

const parsedLines = computed<LogLine[]>(() => {
  return props.logs
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => {
      // Format progress : "[PROGRESS:Tickets:7:12]"
      const progressMatch = line.match(/^\[PROGRESS:(.+):(\d+):(\d+)\]$/)
      if (progressMatch) {
        const done = Number(progressMatch[2])
        const total = Number(progressMatch[3])
        const percent = total === 0 ? 100 : Math.round((done / total) * 100)
        return { type: 'progress', raw: line, resource: progressMatch[1], done, total, percent }
      }
      if (line.startsWith('✓') || line.includes('succès')) return { type: 'success', raw: line }
      if (line.startsWith('✗') || line.includes('Erreur')) return { type: 'error', raw: line }
      return { type: 'info', raw: line }
    })
})
</script>

<template>
  <div class="font-mono text-sm rounded-xl overflow-hidden border border-zinc-800">
    <!-- Header bar -->
    <div class="bg-zinc-90 border-b border-zinc-800 px-4 py-2 flex items-center gap-2">
      <span class="w-3 h-3 rounded-full bg-red-500"></span>
      <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
      <span class="w-3 h-3 rounded-full bg-green-500"></span>
      <span class="ml-3 text-xs text-zinc-500 tracking-widest uppercase">{{ props.title }}</span>
    </div>

    <!-- Terminal body -->
    <div class="bg-black min-h-48 max-h-96 overflow-y-auto p-5 space-y-1.5">

      <template v-if="parsedLines.length">
        <div v-for="(line, i) in parsedLines" :key="i">

          <!-- Ligne de progression avec barre CSS -->
          <div v-if="line.type === 'progress'" class="flex items-center gap-3">
            <!-- Barre de progression -->
            <div class="w-28 h-3 rounded-sm overflow-hidden shrink-0">
              <div
                class="h-full bg-green-300 transition-all duration-300"
                :style="{ width: line.percent + '%' }"
              ></div>
            </div>
            <!-- Nom de la ressource -->
            <span class="text-green-300 w-36 truncate">{{ line.resource }}</span>
            <!-- Compteur -->
            <span class="text-green-300 text-xs">
              {{ line.total === 0 ? 'vide' : `${line.done}/${line.total} (${line.percent}%)` }}
            </span>
          </div>

          <!-- Ligne succès -->
          <div v-else-if="line.type === 'success'" class="text-green-300 font-semibold" :style="{color:'green'}">
            {{ line.raw }}
          </div>

          <!-- Ligne erreur -->
          <div v-else-if="line.type === 'error'" class="text-red-400">
            {{ line.raw }}
          </div>

          <!-- Ligne info -->
          <div v-else class="text-green-300">
            {{ line.raw }}
          </div>

        </div>
      </template>

      <!-- Idle state -->
      <div v-else class="flex items-center gap-2 text-green-300">
        <span>$</span>
        <span class="w-2 h-4 bg-green-300 animate-pulse inline-block"></span>
      </div>

    </div>
  </div>
</template>
<style>

</style>