<script lang="ts" setup>
const props = defineProps<{
  loadingMessage: string
}>()
</script>

<template>
  <div class="h-screen bg-white flex justify-center items-center">
    <div class="flex flex-col items-center gap-4">

      <!-- Spinner Tailwind -->
      <div
        class="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"
      />

      <!-- Message -->
      <p class="text-gray-500 text-sm font-medium tracking-wide">
        {{ props.loadingMessage }}
      </p>

    </div>
  </div>
</template>