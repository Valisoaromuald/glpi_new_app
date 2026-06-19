<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title: string,
  hoverColor?: string,
  icon?: string
}>()

const isOpen = ref(false)

function toggle(): void {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="w-full">

    <!-- ── Header (bouton toggle) ── -->
    <button type="button"
      :class="`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:${hoverColor} transition-colors`"
      active-class="bg-blue-700 text-white font-medium" @click="toggle">
      <div class="flex flex-row gap-2">
        <div v-if="props.icon" v-html="props.icon">
        </div>
        <span>{{ props.title }}</span>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </button>

    <!-- ── Contenu (slot child) ── -->
    <Transition enter-active-class="transition-all duration-200 ease-out overflow-hidden"
      enter-from-class="max-h-0 opacity-0" enter-to-class="max-h-96 opacity-100"
      leave-active-class="transition-all duration-150 ease-in overflow-hidden" leave-from-class="max-h-96 opacity-100"
      leave-to-class="max-h-0 opacity-0">
      <div v-if="isOpen" class="mt-1 ml-3 pl-3 border-l border-gray-200 dark:border-gray-700 flex flex-col gap-0.5">
        <slot name="child"></slot>
      </div>
    </Transition>

  </div>
</template>