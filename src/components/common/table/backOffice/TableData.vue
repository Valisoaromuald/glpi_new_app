<script lang="ts" setup>
const props = defineProps<{
    value: unknown
}>()
</script>
<template>
    <td class="px-4 py-4 text-sm whitespace-nowrap">
        <p class="text-sm font-normal text-black">
            {{ props.value }}
        </p>
    </td>
</template>