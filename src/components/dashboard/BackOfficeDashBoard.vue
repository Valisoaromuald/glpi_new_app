<script setup lang="ts">
import AssetService from '@/services/assets/assetService.ts';
import ElementCard from '../administration/ElementCard.vue';
import { computed, onMounted, ref } from 'vue';
import TicketService from '@/services/assistance/ticketService.ts';

// 1. Déclaration des Refs pour stocker les comptes
const softwaresNumber = ref<number>(0)
const computersNumber = ref<number>(0)
const networkEquipmentsNumber = ref<number>(0)
const phonesNumber = ref<number>(0)
const softwareLicencesNumber = ref<number>(0)
const monitorsNumber = ref<number>(0)
const racksNumber = ref<number>(0)
const printersNumber = ref<number>(0)
const chassisNumber = ref<number>(0)
const PDUsNumber = ref<number>(0)

const incidentsNumber = ref<number>(0);
const requestsNumber = ref<number>(0);
// 2. Propriété computed globale corrigée (Somme de TOUS les équipements)
const getAssetsTotalNumber = computed(() => {
    return softwaresNumber.value +
        computersNumber.value +
        networkEquipmentsNumber.value +
        phonesNumber.value +
        softwareLicencesNumber.value +
        monitorsNumber.value +
        racksNumber.value +
        printersNumber.value +
        chassisNumber.value +
        PDUsNumber.value;
})

const getTicketsTotalNumber = computed(() => {
    return incidentsNumber.value + requestsNumber.value;
})
// 3. Propriétés computed pour la gestion propre des pluriels
const totalAssetsLabel = computed(() => `Équipement${getAssetsTotalNumber.value > 1 ? 's' : ''}`)
const computersLabel = computed(() => `Ordinateur${computersNumber.value > 1 ? 's' : ''}`)
const softwaresLabel = computed(() => `Logiciel${softwaresNumber.value > 1 ? 's' : ''}`)
const networkEquipmentsLabel = computed(() => `Matériel${networkEquipmentsNumber.value > 1 ? 's' : ''} Réseau`)
const phonesLabel = computed(() => `Téléphone${phonesNumber.value > 1 ? 's' : ''}`)
const softwareLicencesLabel = computed(() => `Licence${softwareLicencesNumber.value > 1 ? 's' : ''} `)
const monitorsLabel = computed(() => `Écran${monitorsNumber.value > 1 ? 's' : ''}`)
const racksLabel = computed(() => `Baie${racksNumber.value > 1 ? 's' : ''} (Rack)`)
const printersLabel = computed(() => `Imprimante${printersNumber.value > 1 ? 's' : ''}`)
const chassisLabel = computed(() => `Châssis`) // Invariable
const PDUsLabel = computed(() => `PDU${PDUsNumber.value > 1 ? 's' : ''}`)
const incidentLabel = computed(() => `Incident${PDUsNumber.value > 1 ? 's' : ''}`)
const requestsLabel = computed(() => `Demande${PDUsNumber.value > 1 ? 's' : ''} de service`)
const ticketsLabel = computed(() => `Ticket${getTicketsTotalNumber.value > 1 ? 's' : ''} `)

// 4. Chargement des données au montage du composant
onMounted(async () => {
    const assetService = new AssetService();
    const ticketService = new TicketService();
    const assetsPromises = [assetService.getTotalByElementName('Software'),
    assetService.getTotalByElementName('Computer'),
    assetService.getTotalByElementName('NetworkEquipment'),
    assetService.getTotalByElementName('Phone'),
    assetService.getTotalByElementName('SoftwareLicense'),
    assetService.getTotalByElementName('Monitor'),
    assetService.getTotalByElementName('Rack'),
    assetService.getTotalByElementName('Printer'),
    assetService.getTotalByElementName('PDU'),
    ]
    const ticketPromises = [ticketService.getTotalByType(1),
    ticketService.getTotalByType(2)
    ]
    const allAssetsNumber = await Promise.all(assetsPromises);
    const allTicketsNumber = await Promise.all(ticketPromises)
    softwaresNumber.value = allAssetsNumber[0] ? allAssetsNumber[0] : 0;
    computersNumber.value = allAssetsNumber[1] ? allAssetsNumber[1] : 0;
    networkEquipmentsNumber.value = allAssetsNumber[2] ? allAssetsNumber[2] : 0;
    phonesNumber.value = allAssetsNumber[3] ? allAssetsNumber[3] : 0;
    softwareLicencesNumber.value = allAssetsNumber[4] ? allAssetsNumber[4] : 0;
    monitorsNumber.value = allAssetsNumber[5] ? allAssetsNumber[5] : 0;
    racksNumber.value = allAssetsNumber[6] ? allAssetsNumber[6] : 0;
    printersNumber.value = allAssetsNumber[7] ? allAssetsNumber[7] : 0;
    PDUsNumber.value = allAssetsNumber[8] ? allAssetsNumber[8] : 0;
    incidentsNumber.value = allTicketsNumber[0] ? allTicketsNumber[0] : 0;
    requestsNumber.value = allTicketsNumber[1]? allTicketsNumber[1] : 0;
})
</script>

<template>
    <div class="w-full gap-100">
        <div class="flex flex-row justify-between">
            <ElementCard :count="getAssetsTotalNumber" :text="totalAssetsLabel" backgroundColor="#3B82F6" :isSvg="true"
                icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" /></svg>' />
            <ElementCard :count="getTicketsTotalNumber" :text="ticketsLabel" backgroundColor="#FFDC64" :isSvg="true"
                icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" /></svg>' />
        </div>
        <div class="flex flex-row justify-between">
            <div class="grid grid-rows-2 grid-cols-5 w-4xl gap-30 mt-5">
                <ElementCard :count="computersNumber" :text="computersLabel" backgroundColor="#C53232" :isSvg="true"
                    icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>' />

                <ElementCard :count="softwaresNumber" :text="softwaresLabel" backgroundColor="#70B11C" :isSvg="true"
                    icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5" /></svg>' />

                <ElementCard :count="networkEquipmentsNumber" :text="networkEquipmentsLabel" backgroundColor="#4a7b96"
                    :isSvg="true"
                    icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>' />

                <ElementCard :count="phonesNumber" :text="phonesLabel" backgroundColor="#a0cec2" :isSvg="true" icon='<svg class="w-[32px] h-[32px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path d="M7.978 4a2.553 2.553 0 0 0-1.926.877C4.233 6.7 3.699 8.751 4.153 10.814c.44 1.995 1.778 3.893 3.456 5.572 1.68 1.679 3.577 3.018 5.57 3.459 2.062.456 4.115-.073 5.94-1.885a2.556 2.556 0 0 0 .001-3.861l-1.21-1.21a2.689 2.689 0 0 0-3.802 0l-.617.618a.806.806 0 0 1-1.14 0l-1.854-1.855a.807.807 0 0 1 0-1.14l.618-.62a2.692 2.692 0 0 0 0-3.803l-1.21-1.211A2.555 2.555 0 0 0 7.978 4Z"/>
</svg>
' />

                <ElementCard :count="softwareLicencesNumber" :text="softwareLicencesLabel" backgroundColor="#9bc06b"
                    :isSvg="true"
                    icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 11-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>' />

                <ElementCard :count="monitorsNumber" :text="monitorsLabel" backgroundColor="#EC4899" :isSvg="true"
                    icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h14.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" /></svg>' />

                <ElementCard :count="racksNumber" :text="racksLabel" backgroundColor="#14B8A6" :isSvg="true"
                    icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 3h13.5m-13.5-6h13.5m-13.5-3h13.5m-16.5 12h16.5c.621 0 1.125-.504 1.125-1.125V3.375c0-.621-.504-1.125-1.125-1.125H2.25c-.621 0-1.125.504-1.125 1.125v13.5c0 .621.504 1.125 1.125 1.125z" /></svg>' />

                <ElementCard :count="printersNumber" :text="printersLabel" backgroundColor="#F59E0B" :isSvg="true" icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
</svg>
' />

                <ElementCard :count="chassisNumber" :text="chassisLabel" backgroundColor="#64748B" :isSvg="true"
                    icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 00 2.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 00 2.25 2.25Zm.75-12h9v9h-9v-9Z" /></svg>' />

                <ElementCard :count="PDUsNumber" :text="PDUsLabel" backgroundColor="#06B6D4" :isSvg="true"
                    icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>' />
            </div>
            <div class="grid grid-cols-2 gap-2 mt-5">

                <ElementCard :count="incidentsNumber" :text="incidentLabel" backgroundColor="#EF4444"
                    icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>' />


                <ElementCard :count="requestsNumber" :text="requestsLabel" backgroundColor="#10B981"
                    icon='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>' />
            </div>
        </div>
    </div>
</template>