    <script setup lang="ts">
    import AssetService from '@/services/assets/assetService.ts';
    import ElementCard from '../administration/ElementCard.vue';
    import { computed, onMounted, ref } from 'vue';
    import TicketService from '@/services/assistance/ticketService.ts';


    const incidentsNumber = ref<number>(0);
    const requestsNumber = ref<number>(0);
    const globalAssetsDetails = ref<Array<{ count: number, text: string }>>([])
    // 2. Propriété computed globale corrigée (Somme de TOUS les équipements)
    const getAssetsTotalNumber = computed(() => {
        let result = 0;
        for (let detail of globalAssetsDetails.value) {
            result += detail.count
        }
        console.log("result: ", result)
        return result;
    })

    const getTicketsTotalNumber = computed(() => {
        return incidentsNumber.value + requestsNumber.value;
    })
    const totalAssetsLabel = computed(() =>
        'Equipement' + (getAssetsTotalNumber.value > 1 ? 's' : '')
    )

    const ticketsLabel = computed(() =>
        'Ticket' + (getTicketsTotalNumber.value > 1 ? 's' : '')
    )

    const incidentsLabel = computed(() =>
        'Incident' + (incidentsNumber.value > 1 ? 's' : '')
    )

    const requestsLabel = computed(() =>
        'Demande' + (requestsNumber.value > 1 ? 's' : '') + ' de service'
    )
    onMounted(async () => {
        const assetService = new AssetService();
        const ticketService = new TicketService();
        const ticketPromises = [ticketService.getTotalByType(1),
        ticketService.getTotalByType(2)
        ]
        globalAssetsDetails.value = await assetService.getAssetsGlobalDetails();
        const allTicketsNumber = await Promise.all(ticketPromises)
        incidentsNumber.value = allTicketsNumber[0] ? allTicketsNumber[0] : 0;
        requestsNumber.value = allTicketsNumber[1] ? allTicketsNumber[1] : 0;
    })
    const assetsGrid = computed(() => {
        const grille = {
            ligne: 0,
            colonne: 4
        }
        grille.ligne = Math.floor(globalAssetsDetails.value.length / grille.colonne)
        return grille
    })
</script>

<template>
    <div class="w-full gap-100">
        <div class="flex flex-row justify-between">
            <ElementCard :count="getAssetsTotalNumber" :text="totalAssetsLabel" backgroundColor="#3B82F6" />
            <ElementCard :count="getTicketsTotalNumber" :text="ticketsLabel" />
        </div>
        <div class="grid grid-cols-2 gap-10 mt-5">
            <div :style="{
                display: 'grid',
                gridTemplateColumns: `repeat(${assetsGrid.colonne}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${assetsGrid.ligne}, minmax(0, 1fr))`,
                columnGap: '6rem',
                rowGap: '1rem'
            }">
                <ElementCard v-for="object in globalAssetsDetails" :key="object.text" :count="object.count"
                    :text="object.text" class="m" />
            </div>
            <div class="grid grid-cols-2 ml-44 gap-20">
                <ElementCard :count="incidentsNumber" :text="incidentsLabel" />
                <ElementCard :count="requestsNumber" :text="requestsLabel" />
            </div>
        </div>
    </div>
</template>