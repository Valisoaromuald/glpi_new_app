<script setup lang="ts">
import type { BaseAsset } from '@/types/asset/asset';

const props = defineProps<{
    asset: Partial<BaseAsset>
}>()
function display(value: any): string {
    if (value === null || value === undefined || value === 0 || value === '0' || value === '') {
        return 'N/A'
    }
    return String(value)
}
</script>
<template>
  <tr class="*:text-gray-900 *:first:font-medium">
    <td class="px-3 py-2 whitespace-nowrap"><img v-if="asset.image" :src="`${asset.image}`" class="w-25 h-25"/><p v-else>{{ "Aucune" }}</p></td>
    <td class="px-3 py-2 whitespace-nowrap">{{ display(asset.name) }}</td>
    <td class="px-3 py-2 whitespace-nowrap">{{ display(asset.computermodels_id ?? asset.phonemodels_id ?? asset.monitormodels_id) }}</td>
    <td class="px-3 py-2 whitespace-nowrap">{{ display(asset.otherserial) }}</td>
    <td class="px-3 py-2 whitespace-nowrap">{{ display(asset.manufacturers_id) }}</td>
    <td class="px-3 py-2 whitespace-nowrap">{{ display(asset.users_id) }}</td>
    <td class="px-3 py-2 whitespace-nowrap">{{ display(asset.locations_id) }}</td>
    <td class="px-3 py-2 whitespace-nowrap">{{ display(asset.states_id) }}</td>
  </tr>
</template>