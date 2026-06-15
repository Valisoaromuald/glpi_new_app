<script setup lang="ts">
import Draggable from "vuedraggable";
import KanbanCardComponent from "./KanbanCard.vue";
import Modal from "@/components/modal/Modal.vue";
import type { IKanbanColumn } from "@/types/kanban/KanBanColumn";
import type { IKanbanCard } from "@/types/kanban/kanbanCard";
import type { DraggableChangeEvent } from "@/types/kanban";
import { ref } from "vue";
import TicketForm from "../assistance/TicketForm.vue";

interface Props {
    column: Partial<IKanbanColumn>;
    useButton?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    useButton: false
});

const showModal = ref<boolean>(false)

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
    <div class="rounded-xl p-3 w-80 flex flex-col" :style="{ backgroundColor: column.color || '#f3f4f6' }">
        <div class="flex justify-between items-center mb-3">
            <h2 class="font-semibold">
                {{ column.title }}
            </h2>

            <span class="bg-gray-300 rounded-full px-2 py-1 text-xs">
                {{ column.cards?.length ?? 0 }}
            </span>
        </div>

        <Draggable
            :model-value="column.cards"
            group="kanban"
            item-key="ticketId"
            animation="200"
            @change="onChange"
            class="flex flex-col gap-2 min-h-25"
        >
            <template #item="{ element }">
                <KanbanCardComponent :card="element" />
            </template>
        </Draggable>

        <button
            v-if="useButton"
            @click="showModal = true"
            class="px-4 py-2 rounded-lg bg-white  hover:bg--700 mt-2 text-black"
        >
            Ajouter 1 Ticket
        </button>

        <Modal v-model="showModal">
            <template #header>
                Creation d'un ticket
            </template>            
            <TicketForm :is-for-kanban="true"/>
            <template #footer="{ close }">
                <button @click="close" class="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">
                    Annuler
                </button>
            </template>
        </Modal>
    </div>
</template>