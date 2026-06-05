<script setup lang="ts">
import TableRow from './TableRow.vue';
const props = defineProps<{
    data : object[]
}>();
</script>
<template>
    <tbody>
        <TableRow v-for="(datum,index) in data" :datum="datum" :key="index"/>
    </tbody>
</template>