<script setup lang="ts">
import type { IKanbanCard } from "@/types/kanban/kanbanCard";

defineProps<{
    card: IKanbanCard;
}>();
</script>

<template>
    <div
        class="bg-white rounded-lg shadow border border-gray-200 p-3 cursor-pointer hover:shadow-md transition"
    >
        <div class="font-semibold text-sm">
            {{ card.title }}
        </div>

        <div
            v-if="card.description"
            class="text-xs text-gray-500 mt-2 line-clamp-3"
        >
            {{ card.description }}
        </div>

        <div class="mt-3 flex justify-between items-center text-xs text-gray-400">
            <span>#{{ card.ticketId }}</span>

            <span>
                {{ card.ticketStatus }}
            </span>
        </div>
    </div>
</template>