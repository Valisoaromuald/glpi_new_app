<script lang="ts" setup>
import TableHeader from './TableHeader.vue';
    const props = defineProps<{
        columnNames : string[]
    }>()
</script>
<template>
    <tr>
        <TableHeader v-for="columnName in columnNames" :columnName="columnName" :key="columnName"/>
    </tr>
</template>