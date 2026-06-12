<script lang="ts" setup>
    const props = defineProps<{
        columnName : string 
    }>()
</script>
<template>
    <th scope="col" class="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-white">
        {{ props.columnName }}
    </th>
</template>