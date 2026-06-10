<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{
    total: number   // nombre total d'éléments
}>()

const emit = defineEmits<{
    (e: 'update:limit', start: number,end:number): void
}>()

const rowOptions = [5, 10, 25, 50]
const selectedRows = ref<number>(5)

// start est l'index du premier élément (1-based)
const start = ref<number>(1)

const end = computed(() => Math.min(start.value + selectedRows.value - 1, props.total))

const totalPages = computed(() => Math.ceil(props.total / selectedRows.value))
const currentPage = computed(() => Math.ceil(start.value / selectedRows.value))

const canPrev = computed(() => start.value > 1)
const canNext = computed(() => end.value < props.total)

// Émet à chaque changement de start ou end
watch([start, end], () => {
    emit('update:limit', start.value,end.value)
}, { immediate: true })

// Quand on change le nombre de lignes, on repart de la page 1
watch(selectedRows, () => {
    start.value = 1
})

function goNext() {
    if (!canNext.value) return
    start.value = start.value + selectedRows.value
}

function goPrev() {
    if (!canPrev.value) return
    start.value = Math.max(1, start.value - selectedRows.value)
}
</script>

<template>
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white max-w-full">

        <!-- Infos -->
        <div>
            <span class="text-xs text-gray-500">
                {{ start }}–{{ end }} sur {{ total }} résultat{{ total > 1 ? 's' : '' }}
            </span>
        </div>
        <div class="flex items-center gap-3">

            <!-- Select nombre de lignes -->
            <div class="flex items-center gap-2">
                <label class="text-xs text-gray-500">Lignes</label>
                <select v-model="selectedRows"
                    class="h-8 px-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700">
                    <option v-for="opt in rowOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
            </div>

            <!-- Navigation pages -->
            <div class="flex items-center gap-1">

                <!-- Bouton gauche -->
                <button type="button" :disabled="!canPrev"
                    class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    @click="goPrev">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <!-- Indicateur page -->
                <span class="text-xs text-gray-500 px-2">
                    {{ currentPage }} / {{ totalPages }}
                </span>

                <!-- Bouton droite -->
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