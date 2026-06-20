// composables/useTicketCost.ts
import { ref } from 'vue'
import type { ITicketCostGrouped } from 'shared-types'

export function useTicketCost() {
    const rows = ref<Partial<ITicketCostGrouped>[]>([])
    const isLoading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const glpiCostTotal = ref<number>(0)
    const superCostTotal = ref<number>(0)
    const reopeningCostTotal = ref<number>(0)
    const globalTotal = ref<number>(0)

    function computeTotals() {
        glpiCostTotal.value = 0
        superCostTotal.value = 0
        reopeningCostTotal.value = 0
        globalTotal.value = 0

        rows.value.forEach(element => {
            glpiCostTotal.value += element.glpi_cost ?? 0
            superCostTotal.value += element.super_cost ?? 0
            reopeningCostTotal.value += element.reopening ?? 0
            globalTotal.value += element.total ?? 0
        })
    }

    return {
        rows,
        isLoading,
        error,
        glpiCostTotal,
        superCostTotal,
        reopeningCostTotal,
        globalTotal,
        computeTotals
    }
}