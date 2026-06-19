<script setup lang="ts">
import Draggable from "vuedraggable";
import KanbanCardComponent from "./KanbanCard.vue";
import Modal from "@/components/modal/Modal.vue";
import type { IKanbanColumn } from "@/types/kanban/KanBanColumn";
import type { IKanbanCard } from "@/types/kanban/kanbanCard";
import type { DraggableChangeEvent } from "@/types/kanban";
import { ref, computed } from "vue";
import TicketForm from "../assistance/TicketForm.vue";

interface Props {
    column: Partial<IKanbanColumn>;
    useButton?: boolean
    movementAllowed?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    useButton: false,
    movementAllowed: true
});

const showModal = ref<boolean>(false)

const emit = defineEmits<{
    (e: "cardMoved", payload: { card: IKanbanCard; destinationStatus: number }): void;
    (e: "update:cards", cards: IKanbanCard[]): void;
}>();

// computed avec getter/setter : Draggable peut "écrire" dedans
const cards = computed<IKanbanCard[]>({
    get() {
        return (props.column.cards ?? []) as IKanbanCard[];
    },
    set(value) {
        // if (props.movementAllowed) {
            emit("update:cards", value);
        // }
    }
});

function onChange(event: DraggableChangeEvent) {

    if (!event.added) return;
    // if (props.movementAllowed) {
        emit("cardMoved", {
            card: event.added.element,
            destinationStatus: props.column.status ?? 0
        });
    // }
}
</script>

<template>
    <div class="rounded-xl p-3 w-80 flex flex-col" :style="{ backgroundColor: column.color || '#f3f4f6' }">
        <div class="flex justify-between items-center mb-3">
            <h2 class="font-semibold">{{ column.title }}</h2>
            <span class="bg-gray-300 rounded-full px-2 py-1 text-xs">
                {{ column.cards?.length ?? 0 }}
            </span>
        </div>

        <Draggable v-model="cards" group="kanban" item-key="ticketId" animation="200" @change="onChange"
            class="flex flex-col gap-2 min-h-25">
            <template #item="{ element }">
                <KanbanCardComponent :card="element" />
            </template>
        </Draggable>

        <button v-if="useButton" @click="showModal = true"
            class="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 mt-2 text-black">
            Ajouter 1 Ticket
        </button>

        <Modal v-model="showModal">
            <template #header>Création d'un ticket</template>
            <TicketForm :is-for-kanban="true" />
            <template #footer="{ close }">
                <button @click="close" class="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">
                    Annuler
                </button>
            </template>
        </Modal>
    </div>
</template>