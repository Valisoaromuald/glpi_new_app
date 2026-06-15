<script setup lang="ts">
import { onMounted } from "vue";
import { useKanban } from "@/composables/useKanban";
import type { IKanbanCard } from "@/types/kanban/kanbanCard.ts";
import KanbanColumn from "./KanbanColumn.vue";

const {
    columns,
    load,
    moveCard
} = useKanban();

onMounted(load);

function handleCardMoved(payload: {
    card: IKanbanCard;
    destinationStatus: number;
}) {
    moveCard(
        payload.card,
        payload.destinationStatus
    );
}
</script>

<template>

    <div class="flex gap-4">

        <kanban-column
            v-for="column in columns"
            :key="column.status"
            :column="column"
            @cardMoved="handleCardMoved"
        />

    </div>
</template>