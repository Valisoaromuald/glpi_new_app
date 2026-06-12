<script lang="ts" setup>
import TableHeader from './TableHeader.vue';
    const props = defineProps<{
        columnNames : string[]
    }>()
</script>
<template>
    <tr class="bg-amber-300">
        <TableHeader v-for="columnName in columnNames" :columnName="columnName" :key="columnName"/>
    </tr>
</template>