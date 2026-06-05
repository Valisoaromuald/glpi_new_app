<script lang="ts" setup>
import TableData from './TableData.vue';

const props = defineProps<{
    datum: Object
}>();
const getAllValues = (): unknown[] => {
    if (!props.datum) return [];

    // Object.values() extrait automatiquement toutes les valeurs dans un tableau
    return Object.values(props.datum);
}
</script>
<template>
    <tr class="bg-gray-100 border-b border-gray-200">
        <TableData v-for="(value,index) in getAllValues()" :key="index" :value="value"/>
    </tr>
</template>