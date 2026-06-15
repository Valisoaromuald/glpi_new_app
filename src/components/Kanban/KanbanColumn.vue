<script setup lang="ts">
import Draggable from "vuedraggable";
import KanbanCardComponent from "./KanbanCard.vue";
import type { IKanbanColumn } from "@/types/kanban/KanBanColumn";
import type { IKanbanCard } from "@/types/kanban/kanbanCard";
import type { DraggableChangeEvent } from "@/types/kanban";

const props = defineProps<{
    column: Partial<IKanbanColumn>;
    bgColor?:string
}>();

const emit = defineEmits<{
    (
        e: "cardMoved",
        payload: {
            card: IKanbanCard;
            destinationStatus: number;
        }
    ): void;
}>();

function onChange(event: DraggableChangeEvent) {
    if (!event.added) return;

    emit("cardMoved", {
        card: event.added.element,
        destinationStatus: props.column.status ?? 0
    });
}
</script>

<template>
    <div
        :class="`${ bgColor ? bgColor: `bg-gray-100`}rounded-xl p-3 w-80 flex flex-col`"
    >
        <div class="flex justify-between items-center mb-3">
            <h2 class="font-semibold">
                {{ column.title }}
            </h2>

            <span
                class="bg-gray-300 rounded-full px-2 py-1 text-xs"
            >
                {{ column.cards?.length ?? 0 }}
            </span>
        </div>

        <Draggable
            v-model="column.cards"
            group="kanban"
            item-key="ticketId"
            animation="200"
            @change="onChange"
            class="flex flex-col gap-2 min-h-25"
        >
            <template #item="{ element }">
                <KanbanCardComponent
                    :card="element"
                />
            </template>
        </Draggable>
    </div>
</template>