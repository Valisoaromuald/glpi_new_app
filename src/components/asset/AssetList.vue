<script setup lang="ts">
import AssetService from '@/services/assets/assetService';
import type { BaseAsset } from '@/types/asset/asset';
import { ASSET_ENDPOINTS } from '@/utils/assetUtil';
import { onMounted, ref, computed } from 'vue';
import AssetRow from './AssetRow.vue';
import Pagination from '../common/pagination/Pagination.vue';
import type { State } from '@/types/dropdowns/state.ts';
import StateService from '@/services/dropdowns/stateService.ts';
import LocationService from '@/services/dropdowns/locationService.ts';
import type { Location } from '@/types/dropdowns/location.ts';
import type { User } from '@/types/administration/user/user.ts';
import UserService from '@/services/administration/userService.ts';
import ManufacturerService from '@/services/management/manufacturerService.ts';
import type { Manufacturer } from '@/types/dropdowns/manufacturer.ts';

const allAssets = ref<Partial<BaseAsset>[]>([])
const states = ref<Partial<State>[]>([])
const locations = ref<Partial<Location>[]>([])
const users = ref<Partial<User>[]>([])
const manufacturers = ref<Partial<Manufacturer>[]>([])
const filteredAssets = ref<Partial<BaseAsset>[]>([])

const itemsPerPage = 5
const start = ref(1)
const end = ref(itemsPerPage)

const paginatedAssets = computed(() =>
  filteredAssets.value.slice(start.value - 1, end.value)
)

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
    const assetModelName = String(
      asset.computermodels_ids ?? asset.monitormodels_ids ?? asset.phonemodels_ids ?? ''
    )

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

  start.value = 1
}

onMounted(async () => {
  const assetService: AssetService = new AssetService()
  const stateService: StateService = new StateService()
  const locationService: LocationService = new LocationService()
  const userService: UserService = new UserService()
  const manufacturerService: ManufacturerService = new ManufacturerService()
  const endpoints = ASSET_ENDPOINTS.map(ae => ae.endpoint)
  allAssets.value = await assetService.getAllAssets(endpoints)
  states.value = await stateService.getAll()
  locations.value = await locationService.getAll()
  users.value = await userService.getAll()
  manufacturers.value = await manufacturerService.getAll()
  filteredAssets.value = [...allAssets.value]
})

const handleReset = () => {
  searchCriteria.value = {
    name: '',
    model: '',
    serial: '',
    manufacturer: '',
    user: '',
    location: '',
    status: ''
  }
  filteredAssets.value = [...allAssets.value]
  start.value = 1
  end.value = itemsPerPage
}

function handlePaginationUpdate(newStart: number, newEnd: number) {
  start.value = newStart
  end.value = newEnd
}
</script>

<template>
  <div class="w-full min-h-screen bg-gray-50 px-4 py-8">

    <!-- En-tête de la page -->
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-800"> Gestion des Actifs</h1>
        <p class="text-sm text-gray-500 mt-1">Recherchez et filtrez vos équipements informatiques</p>
      </div>

      <!-- Carte Formulaire de recherche -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">

        <div class="flex items-center gap-2 mb-5">
          <div class="w-1 h-5 bg-blue-600 rounded-full"></div>
          <h2 class="text-base font-semibold text-gray-700">Filtres de recherche</h2>
        </div>

        <form @submit.prevent="handleSearch" @reset.prevent="handleReset" class="space-y-5">

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <!-- Nom -->
            <div class="flex flex-col gap-1">
              <label for="nom" class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input id="nom" v-model="searchCriteria.name" type="text"
                  class="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-gray-300"
                  placeholder="ex. PC-XXX-XXX" />
              </div>
            </div>

            <!-- Modèle -->
            <div class="flex flex-col gap-1">
              <label for="modele" class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Modèle</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </span>
                <input id="modele" v-model="searchCriteria.model" type="text"
                  class="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-gray-300"
                  placeholder="ex. ProBook 6550b" />
              </div>
            </div>

            <!-- Numéro de série -->
            <div class="flex flex-col gap-1">
              <label for="serial" class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Numéro de
                série</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </span>
                <input id="serial" v-model="searchCriteria.serial" type="text"
                  class="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-gray-300"
                  placeholder="ex. SN-2024-001" />
              </div>
            </div>

            <!-- Fabricant -->
            <div class="flex flex-col gap-1">
              <label for="manufacturer"
                class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fabricant</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <select id="statut" v-model="searchCriteria.location"
                  class="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-gray-300">
                  <option value="">Tous</option>
                  <option v-for="manufacturer in manufacturers" :key="manufacturer.id" :value="manufacturer.name">
                    {{ manufacturer.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Utilisateur -->
            <div class="flex flex-col gap-1">
              <label for="user" class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Utilisateur</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <select id="statut" v-model="searchCriteria.location"
                  class="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-gray-300">
                  <option value="">Tous</option>
                  <option v-for="user in users" :key="user.id" :value="user.name">
                    {{ user.username }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Localisation -->
            <div class="flex flex-col gap-1">
              <label for="location"
                class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Localisation</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>

                <select id="statut" v-model="searchCriteria.location"
                  class="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-gray-300">
                  <option value="">Tous</option>
                  <option v-for="location in locations" :key="location.id" :value="location.name">
                    {{ location.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Statut -->
          <div class="flex flex-col gap-1">
            <label for="statut" class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <select id="statut" v-model="searchCriteria.status"
                class="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-gray-300">
                <option value="">Tous</option>
                <option v-for="state in states" :key="state.id" :value="state.name">
                  {{ state.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Boutons d'actions -->
          <div class="flex flex-col sm:flex-row justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="reset"
              class="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>

              Réinitialiser
            </button>

            <button type="submit"
              class="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 shadow-sm shadow-blue-200 transition-all duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>

              Rechercher
            </button>
          </div>
        </form>
      </div>

      <!-- Carte Tableau -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 bg-blue-600 rounded-full"></div>
            <h2 class="text-base font-semibold text-gray-700">Résultats</h2>
            <span class="ml-1 px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-full">
              {{ filteredAssets.length }} élément(s)
            </span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full">
            <template v-if="filteredAssets.length > 0">
              <thead class="bg-blue-800 border-b border-gray-100">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Image</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Nom</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Modèle</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Numéro de
                    série</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Fabricant
                  </th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Utilisateur
                  </th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Localisation
                  </th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <AssetRow v-for="asset in paginatedAssets" :key="asset.name" :asset="asset" />
              </tbody>
            </template>

            <template v-else>
              <tbody>
                <tr>
                  <td colspan="7">
                    <div class="flex flex-col items-center justify-center py-16 text-gray-400">
                      <svg class="w-14 h-14 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p class="text-sm font-medium text-gray-500">Aucun élément trouvé</p>
                      <p class="text-xs text-gray-400 mt-1">Essayez de modifier vos critères de recherche</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </template>
          </table>
        </div>

        <!-- Pagination -->
        <Pagination v-if="filteredAssets.length > 0" :total="filteredAssets.length" :start="start"
          @update:limit="handlePaginationUpdate" />
      </div>
    </div>
  </div>
</template>