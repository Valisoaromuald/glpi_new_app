<script setup lang="ts">
import { onMounted } from 'vue'
import NewAppApi from '@/api/newAppApi'
import type { ITicketCostGrouped } from 'shared-types';
import { useRouter } from 'vue-router';
import { useTicketCost } from '@/composables/useTicketCost'
import { useFormatter } from '@/composables/useFormatter';

const router = useRouter()
const props = defineProps<{ ticketId: number }>()
const newAppApi = new NewAppApi()
const { rows, isLoading, error, glpiCostTotal, superCostTotal, reopeningCostTotal, globalTotal, computeTotals } = useTicketCost()
const {formatNumber} = useFormatter()

async function loadGroupedCosts() {
    isLoading.value = true
    error.value = null
    try {
        const { data } = (await newAppApi.get<{ data: ITicketCostGrouped[] }>(
            `tickets/${props.ticketId}/costs/grouped`)).data
        rows.value = data
        computeTotals()
    } catch (err) {
        error.value = 'Impossible de charger les coûts'
    } finally {
        isLoading.value = false
    }
}
onMounted(loadGroupedCosts)
</script>

<template>
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden si">
        <div class="overflow-x-auto">
            <table class="w-full text-sm border-collapse">
                <thead>
                    <tr class="bg-blue-800  text-left text-white font-bold">
                        <th class="px-3 py-2 font-medium">Catégorie d'Actifs</th>
                        <th class="px-3 py-2 font-medium">Super cost</th>
                        <th class="px-3 py-2 font-medium">Glpi cost</th>
                        <th class="px-3 py-2 font-medium">Réouverture</th>
                        <th class="px-3 py-2 font-medium">Total</th>
                        <th class="px-3 py-2 font-medium">Action(s)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="error">
                        <td colspan="6" class="text-sm text-center text-red-500 py-2">
                            {{ error }}
                        </td>
                    </tr>
                    <tr v-else-if="isLoading">
                        <td colspan="6" class="text-sm text-gray-500">Chargement...</td>
                    </tr>
                    <template v-else>
                        <tr v-for="row in rows" class="border-b border-gray-100">
                            <td class="px-3 py-2">{{ row.category}}</td>
                            <td class="px-3 py-2">{{ formatNumber(row.super_cost??0,3) }}</td>
                            <td class="px-3 py-2">{{ formatNumber(row.glpi_cost??0,3) }}</td>
                            <td class="px-3 py-2">{{ formatNumber(row.reopening??0,3) }}</td>
                            <td class="px-3 py-2 font-semibold">{{ formatNumber(row.total??0,3) }}</td>
                            <td class="px-3 py-2 font-semibold">
                                <button
                                    class="flex items-center gap-1 bg-green-400 hover:bg-green-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                    @click="router.push(`/detail/${row.category}`)">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" class="size-4">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.574-3.007-9.964-7.178Z" />
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                    Détails
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-3 py-2 font-bold">Total</td>
                            <td class="px-3 py-2">{{ formatNumber(superCostTotal,3) }}</td>
                            <td class="px-3 py-2">{{ formatNumber(glpiCostTotal,3) }}</td>
                            <td class="px-3 py-2">{{ formatNumber(reopeningCostTotal,3) }}</td>
                            <td class="px-3 py-2 font-semibold">{{ formatNumber(globalTotal,3) }}</td>
                        </tr>
                    </template>
                    <tr v-if="rows.length === 0 && !error">
                        <td colspan="7" class="px-3 py-4 text-center text-gray-400">Aucun coût n'a ete enregistre</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>