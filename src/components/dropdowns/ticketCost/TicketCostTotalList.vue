<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import NewAppApi from '@/api/newAppApi'
import type { ITicketCostGrouped } from 'shared-types';
// import util


const props = defineProps<{ ticketId: number }>()

const newAppApi = new NewAppApi()
const categories = ref<string[]>([])
const selectedCategory = ref<string>('')
const rows = ref<ITicketCostGrouped[]>([])
const isLoading = ref<boolean>(false)
const error = ref<string | null>(null)
const glpiCostTotal = ref<number>(0)
const superCostTotal = ref<number>(0)
const reopeningCostTotal = ref<number>(0)
const globalTotal = ref<number>(0)


async function loadGroupedCosts() {
    isLoading.value = true
    error.value = null
    try {
        const { data } = (await newAppApi.get<{ data: ITicketCostGrouped[] }>(
            `tickets/${props.ticketId}/costs/grouped`)).data
        rows.value = data
        rows.value.forEach(element => {
            glpiCostTotal.value += element.glpi_cost
            superCostTotal.value += element.super_cost
            reopeningCostTotal.value += element.reopening
            globalTotal.value += element.total
        });
    } catch (err) {
        error.value = 'Impossible de charger les coûts'
    } finally {
        isLoading.value = false
    }
}
watch(selectedCategory, loadGroupedCosts)
onMounted(loadGroupedCosts)
</script>

<template>
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden si">
        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span class="text-sm font-medium text-black">
                <div class="flex flex-row gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="size-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span>Couts des tickets</span>
                </div>
            </span>
        </div>
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        <p v-else-if="isLoading" class="text-sm text-gray-500">Chargement...</p>

        <table v-else class="w-full text-sm border-collapse">
            <thead>
                <tr class="bg-gray-100 text-left text-black font-bold">
                    <th class="px-3 py-2 font-medium">Catégorie</th>
                    <th class="px-3 py-2 font-medium">Super cost</th>
                    <th class="px-3 py-2 font-medium">Glpi cost</th>
                    <th class="px-3 py-2 font-medium">Réouverture</th>
                    <th class="px-3 py-2 font-medium">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in rows"  class="border-b border-gray-100">
                    <td class="px-3 py-2">{{ row.category }}</td>
                    <td class="px-3 py-2">{{ row.super_cost }}</td>
                    <td class="px-3 py-2">{{ row.glpi_cost }}</td>
                    <td class="px-3 py-2">{{ row.reopening }}</td>
                    <td class="px-3 py-2 font-semibold">{{ row.total }}</td>
                </tr>
                <tr>
                    <td class="px-3 py-2 font-bold">Total</td>
                    <td class="px-3 py-2">{{  superCostTotal }}</td>
                    <td class="px-3 py-2">{{ glpiCostTotal }}</td>
                    <td class="px-3 py-2">{{ reopeningCostTotal }}</td>
                    <td class="px-3 py-2 font-semibold">{{globalTotal}}</td>
                </tr>
                <tr v-if="rows.length === 0">
                    <td colspan="7" class="px-3 py-4 text-center text-gray-400">Aucun coût n'a ete enregistre</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>