<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
    showModal: String
})
const displayInput = ref<boolean>(false)
const isReopening = defineModel('')
const percentage = defineModel<number>({ default: 0 })
function getSecondButtonText(): string {
    if (percentage.value !== 0) {
        return "Valider reouverture"
    }
    return "Reouvrir";
}
</script>
<template>

    <template>
        <div v-if="props.showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <label class="text-lg font-semibold mb-4">Entrer le coup de reouverture</label>
                <div class="flex flex-co gap-2">
                    <label for="reponening">
                        pourcentage de reouverture
                    </label>
                    <input type="number" id="reponening" v-model="percentage">
                </div>
                <div>
                    <button>Annuler</button>
                    <button>{{ getSecondButtonText() }}</button>
                </div>
            </div>
        </div>
    </template>
</template>