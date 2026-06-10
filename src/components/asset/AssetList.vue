<script setup lang="ts">
import AssetService from '@/services/assets/assetService';
import type { BaseAsset } from '@/types/asset/asset';
import { ASSET_ENDPOINTS } from '@/utils/assetUtil';
import { onMounted, ref } from 'vue';
import AssetRow from './AssetRow.vue';
import Pagination from '../dashboard/pagination/Pagination.vue';
const allAssets = ref<Partial<BaseAsset>[]>([])
const filteredAssets = ref<Partial<BaseAsset>[]>([])
const searchCriteria = ref({
    name: '',
    model: '',
    serial: '',
    manufacturer: '',
    user: '',
    location: '',
    status: ''
})

const handleSearch = () => {
    filteredAssets.value = allAssets.value.filter(asset => {
        let assetModelName = asset.computermodels_ids ?? asset.monitormodels_ids ?? asset.phonemodels_ids ?? ''
        return (
            asset.name && asset.name.toLowerCase().includes(searchCriteria.value.name.toLowerCase()) &&
            assetModelName.toLowerCase().includes(searchCriteria.value.model.toLowerCase()) &&
            asset.otherserial && asset.otherserial.toLowerCase().includes(searchCriteria.value.serial.toLowerCase()) &&
            asset.manufacturers_id && String(asset.manufacturers_id).toLowerCase().includes(searchCriteria.value.manufacturer.toLowerCase()) &&
            asset.users_id && String(asset.users_id).toLowerCase().includes(searchCriteria.value.user.toLowerCase()) &&
            asset.locations_id && String(asset.locations_id).toLowerCase().includes(searchCriteria.value.location.toLowerCase()) &&
            asset.states_id && String(asset.states_id).toLowerCase().includes(searchCriteria.value.status.toLowerCase())
        )
    })
}
onMounted(async () => {
    const assetService: AssetService = new AssetService()
    const endpoints = ASSET_ENDPOINTS.map(ae => ae.endpoint)
    allAssets.value = await assetService.getAllAssets(endpoints)
    filteredAssets.value = [...allAssets.value]
})



const handleReset = () => {
    // Vide les champs
    searchCriteria.value = {
        name: '',
        model: '',
        serial: '',
        manufacturer: '',
        user: '',
        location: '',
        status: ''
    }
    // Réaffiche toute la liste
    filteredAssets.value = [...allAssets.value]
}
const handlePagination=(start:number,end:number)=>{
    console.log("start: ",start)
    console.log("end: ",end)
}
</script>
<template>
    <div class=" w-full flex flex-col items-center justify-center mt-10">
        <!-- 
      L'astuce est ici : @submit.prevent empêche le rechargement de la page 
      et appelle notre fonction handleSearch()
    -->
        <form @submit.prevent="handleSearch" @reset.prevent="handleReset" class="space-y-4 mb-6">

            <div class=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 ">
                <!-- Champ Nom -->
                <div class="flex flex-col">
                    <label for="nom" class="text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input id="nom" v-model="searchCriteria.name" type="text"
                        class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="ex. PC-XXX-XXX" />
                </div>

                <!-- Champ Modèle -->
                <div class="flex flex-col">
                    <label for="modele" class="text-sm font-medium text-gray-700 mb-1">Modèle</label>
                    <input id="modele" v-model="searchCriteria.model" type="text"
                        class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="ex. ProBook 6550b" />
                </div>

                <!-- Champ Numéro de série -->
                <div class="flex flex-col">
                    <label for="serial" class="text-sm font-medium text-gray-700 mb-1">Numéro de série</label>
                    <input id="serial" v-model="searchCriteria.serial" type="text"
                        class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="serial" />
                </div>

                <!-- Champ Fabricant -->
                <div class="flex flex-col">
                    <label for="manufacturer" class="text-sm font-medium text-gray-700 mb-1">Fabricant</label>
                    <input id="manufacturer" v-model="searchCriteria.manufacturer" type="text"
                        class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="ex. Asus" />
                </div>

                <!-- Champ Utilisateur -->
                <div class="flex flex-col">
                    <label for="user" class="text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
                    <input id="user" v-model="searchCriteria.user" type="text"
                        class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="ex. Rakoto" />
                </div>

                <!-- Champ Localisation -->
                <div class="flex flex-col">
                    <label for="location" class="text-sm font-medium text-gray-700 mb-1">Localisation</label>
                    <input id="location" v-model="searchCriteria.location" type="text"
                        class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="ex. Administration" />
                </div>
            </div>

            <!-- Champ Statut -->
            <div>
                <label for="statut" class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <input id="statut" v-model="searchCriteria.status" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="ex. En maintenance" />
            </div>

            <!-- Boutons d'actions -->
            <div class="flex justify-end gap-3">
                <button type="reset"
                    class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
                    Réinitialiser
                </button>

                <button type="submit"
                    class="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
                    Rechercher
                </button>
            </div>
        </form>

        <!-- Tableau d'affichage -->
        <div class="overflow-x-auto">
            <table class="border-black min-w-full divide-y-2 divide-gray-200">
                <template v-if="filteredAssets.length > 0">
                    <thead>
                        <tr class="*:font-medium *:text-gray-900 ltr:text-left">
                            <th class="px-3 py-2 whitespace-nowrap">Nom</th>
                            <th class="px-3 py-2 whitespace-nowrap">Modèle</th>
                            <th class="px-3 py-2 whitespace-nowrap">Numéro de série</th>
                            <th class="px-3 py-2 whitespace-nowrap">Fabricant</th>
                            <th class="px-3 py-2 whitespace-nowrap">Utilisateur</th>
                            <th class="px-3 py-2 whitespace-nowrap">Localisation</th>
                            <th class="px-3 py-2 whitespace-nowrap">Statut</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <AssetRow v-for="asset in filteredAssets" :key="asset.name" :asset="asset" />
                    </tbody>
                    
                </template>
                <template v-else>
                    <tbody>
                        <tr>
                            <td colspan="7" class="text-center py-4 text-gray-500">Aucun élément à afficher</td>
                        </tr>
                    </tbody>
                </template>
            </table>
            <Pagination :total="filteredAssets.length" @update:limit="handlePagination"/>
        </div>
    </div>
</template>