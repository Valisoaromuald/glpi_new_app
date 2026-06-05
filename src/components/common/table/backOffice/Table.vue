<script setup lang="ts">
import TableBody from './TableBody.vue';
import TableHead from './TableHead.vue';

const props = defineProps<{
    columnNames: string[],
    data: Object[],
}>()
</script>
<template>

    <div class="flex flex-col mt-6">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div class="overflow-hidden border border-gray-200 md:rounded-lg">
                    <table class="min-w-full divide-y">
                        <table-head
                            :column-names="props.columnNames" />
                        <table-body :data="props.data" />
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>