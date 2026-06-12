<script lang="ts" setup>
import TableRowHeader from './TableRowHeader.vue';
const props = defineProps<{
    columnNames: string[]
}>()
</script>
<template>
    <thead class="bg-gray-950 ">
        <TableRowHeader :column-names="columnNames" />
    </thead>
</template>