<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TicketCostService from '@/services/assistance/ticketCostService'
import { useTicketCost } from '@/composables/useTicketCost'


const route = useRoute()

const { rows, isLoading, error, glpiCostTotal, superCostTotal, reopeningCostTotal, globalTotal, computeTotals } = useTicketCost()

async function loadDetails(category: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
        rows.value = await TicketCostService.getDetailsPerItemByCategory(category)
        computeTotals()
    } catch (err) {
        error.value = "Erreur lors du chargement des détails"
    } finally {
        isLoading.value = false
    }
}
onMounted(async () => {
    const category = route.params.category
    if (typeof category === "string") {
        loadDetails(category)
    }
})
</script>
<template>
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden si">
        <div class="overflow-x-auto">

            <table class="w-full text-sm border-collapse">
                <thead>
                    <tr class="bg-blue-800  text-left text-white font-bold">
                        <th class="px-3 py-2 font-medium">Nom</th>
                        <th class="px-3 py-2 font-medium">Modele</th>
                        <th class="px-3 py-2 font-medium">Super Cout </th>
                        <th class="px-3 py-2 font-medium">Cout glpi</th>
                        <th class="px-3 py-2 font-medium">Réouverture</th>
                        <th class="px-3 py-2 font-medium">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="error" >
                        <td  colspan="6" class="text-sm text-red-500">
                            {{ error }}
                        </td>
                    </tr>
                    <tr v-else-if="isLoading">
                        <td  colspan="6" class="text-sm text-gray-500">Chargement...</td>
                    </tr>
                    <template v-else>
                        <tr v-for="row in rows" class="border-b border-gray-100">
                            <td class="px-3 py-2">{{ row.name }}</td>
                            <td class="px-3 py-2">{{ row.model }}</td>
                            <td class="px-3 py-2">{{ row.super_cost }}</td>
                            <td class="px-3 py-2">{{ row.glpi_cost }}</td>
                            <td class="px-3 py-2">{{ row.reopening }}</td>
                            <td class="px-3 py-2 font-semibold">{{ row.total }}</td>
                        </tr>
                        <tr>
                            <td colspan="2" class="px-3 py-2 font-bold text-center">Total</td>
                            <td class="px-3 py-2">{{ superCostTotal }}</td>
                            <td class="px-3 py-2">{{ glpiCostTotal }}</td>
                            <td class="px-3 py-2">{{ reopeningCostTotal }}</td>
                            <td class="px-3 py-2 font-semibold">{{ globalTotal }}</td>
                        </tr>
                        <tr v-if="rows.length === 0">
                            <td colspan="6" class="px-3 py-4 text-center text-gray-400">Aucun coût n'a ete enregistre
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>