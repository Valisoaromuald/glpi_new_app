<script setup lang="ts">
import type { BaseAsset } from '@/types/asset/asset';

const props = defineProps<{
    asset: Partial<BaseAsset>
}>()
</script>
<template>
    <tr class="*:text-gray-900 *:first:font-medium">
        <td class="px-3 py-2 whitespace-nowrap">{{ asset.name ?? 'aucun' }}</td>
        <td class="px-3 py-2 whitespace-nowrap">{{ asset.computermodels_id ?? asset.phonemodels_id ?? asset.monitormodels_id ?? 'aucun' }}</td>
        <td class="px-3 py-2 whitespace-nowrap">{{ asset.otherserial ?? 'aucun' }}</td>
        <td class="px-3 py-2 whitespace-nowrap">{{ asset.manufacturers_id ?? 'aucun' }}</td>
        <td class="px-3 py-2 whitespace-nowrap">{{ asset.users_id ?? 'aucun' }}</td>
        <td class="px-3 py-2 whitespace-nowrap">{{ asset.locations_id ?? 'aucun' }}</td>
        <td class="px-3 py-2 whitespace-nowrap">{{ asset.states_id ?? 'aucun' }}</td>
    </tr>
</template>