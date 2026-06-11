<template>
  <section class="rounded-md border border-gray-200 bg-white">
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
    >
      <div class="flex items-center gap-2">
        <span class="font-medium text-gray-800">{{ title }}</span>

        <span
          v-if="badge !== undefined"
          class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
        >
          {{ badge }}
        </span>
      </div>

      <svg
        class="h-4 w-4 text-gray-500 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div v-show="isOpen" class="border-t border-gray-200 p-4">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  badge?: number
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: true,
})

const isOpen = ref(props.defaultOpen)
</script>