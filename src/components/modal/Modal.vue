<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="close"
      >
        <div
          class="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b">
            <h2 class="text-lg font-semibold text-gray-800">
              <slot name="header">Titre</slot>
            </h2>
            <button
              @click="close"
              class="text-gray-400 hover:text-gray-600 text-xl leading-none"
              aria-label="Fermer"
            >
              &times;
            </button>
          </div>

          <!-- Body -->
          <div class="px-5 py-4">
            <slot />
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-2 px-5 py-4 border-t">
            <slot name="footer" :close="close" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

function close() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>