<script setup lang="ts">
import { computed, watch } from 'vue';

const props = defineProps<{
  total: number
  start: number
}>()

const emit = defineEmits<{
  (e: 'update:limit', start: number, end: number): void
}>()

const rowOptions = [5, 10, 25, 50]

// selectedRows dérivé de start/end externes — mais on a besoin d'un état local
// uniquement pour le choix du nombre de lignes
import { ref } from 'vue'
const selectedRows = ref<number>(5)

const end = computed(() => Math.min(props.start + selectedRows.value - 1, props.total))
const totalPages = computed(() => Math.ceil(props.total / selectedRows.value))
const currentPage = computed(() => Math.ceil(props.start / selectedRows.value))

const canPrev = computed(() => props.start > 1)
const canNext = computed(() => end.value < props.total)

// Recalcule end chaque fois que selectedRows ou total change
watch([selectedRows, () => props.total], () => {
  emit('update:limit', 1, Math.min(selectedRows.value, props.total))
})

// Si le total diminue et que start dépasse le total, repart à 1
watch(() => props.total, (newTotal) => {
  if (props.start > newTotal && newTotal > 0) {
    emit('update:limit', 1, Math.min(selectedRows.value, newTotal))
  }
})

function goNext() {
  if (!canNext.value) return
  const newStart = props.start + selectedRows.value
  emit('update:limit', newStart, Math.min(newStart + selectedRows.value - 1, props.total))
}

function goPrev() {
  if (!canPrev.value) return
  const newStart = Math.max(1, props.start - selectedRows.value)
  emit('update:limit', newStart, Math.min(newStart + selectedRows.value - 1, props.total))
}
</script>

<template>
  <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white max-w-full">

    <div>
      <span class="text-xs text-gray-500">
        {{ start }}–{{ end }} sur {{ total }} résultat{{ total > 1 ? 's' : '' }}
      </span>
    </div>

    <div class="flex items-center gap-3">

      <div class="flex items-center gap-2">
        <label class="text-xs text-gray-500">Lignes</label>
        <select v-model="selectedRows"
          class="h-8 px-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700">
          <option v-for="opt in rowOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>

      <div class="flex items-center gap-1">
        <button type="button" :disabled="!canPrev"
          class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          @click="goPrev">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span class="text-xs text-gray-500 px-2">{{ currentPage }} / {{ totalPages }}</span>

        <button type="button" :disabled="!canNext"
          class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          @click="goNext">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>