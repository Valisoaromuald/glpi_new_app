<script setup lang="ts">
defineProps<{
  logs: string
}>()
</script>

<template>
  <div class="font-mono text-sm rounded-xl overflow-hidden border border-zinc-800">
    <!-- Header bar -->
    <div class="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center gap-2">
      <span class="w-3 h-3 rounded-full bg-red-500"></span>
      <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
      <span class="w-3 h-3 rounded-full bg-green-500"></span>
      <span class="ml-3 text-xs text-zinc-500 tracking-widest uppercase">glpi reset — terminal</span>
    </div>

    <!-- Terminal body -->
    <div class="bg-black min-h-48 max-h-96 overflow-y-auto p-5">
      <pre
        v-if="logs"
        class="text-green-400 whitespace-pre-wrap leading-relaxed m-0"
      >{{ logs }}</pre>

      <!-- Idle state -->
      <div v-else class="flex items-center gap-2 text-green-700">
        <span>$</span>
        <span class="w-2 h-4 bg-green-700 animate-pulse inline-block"></span>
      </div>
    </div>
  </div>
</template>