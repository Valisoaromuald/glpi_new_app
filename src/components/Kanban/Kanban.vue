<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useKanban } from "@/composables/useKanban";
import type { IKanbanCard } from "@/types/kanban/kanbanCard.ts";
import KanbanColumn from "./KanbanColumn.vue";
import type { IKanbanColumn } from "@/types/kanban/KanBanColumn.ts";
import Modal from "../modal/Modal.vue";
const {
    columns,
    closingValue,
    rollBackValue,
    isClosed,
    isRollBack,
    isClosingSumbit,
    ticketId,
    deleteRecentTicketCosts,
    getTotalCosts,
    load,
    moveCard,
    insertCost
} = useKanban();

onMounted(load);

const reopenMode = ref<number>(1)
const movementAccepted = ref<boolean>(false)
async function handleCardMoved(payload: {
    card: IKanbanCard;
    destinationStatus: number;
}) {
    ticketId.value = payload.card.ticketId
    if (payload.destinationStatus === 3) {
        isClosed.value = true
    }
    if (payload.destinationStatus === 2 && payload.card.ticketStatus === 3) {
        isRollBack.value = true
    }
    if(movementAccepted){
        moveCard(
            payload.card,
            payload.destinationStatus
        );
        movementAccepted.value = false
    }
}
function onUpdateCards(column: Partial<IKanbanColumn>, newCards: IKanbanCard[]) {
    column.cards = newCards;
}
async function handleReopen() {
    let cost = 0;
        const totalRecentCosts = await getTotalCosts(ticketId.value,Number(reopenMode.value));
        cost = (totalRecentCosts / 100) * rollBackValue.value;
        insertCost(cost, 'reopening', ticketId.value);
        movementAccepted.value = true
}
</script>

<template>

    <div class="flex gap-4">
        <kanban-column v-for="column in columns" :key="column.status" :column="column" :useButton="column.status === 1" :movement-allowed="movementAccepted"
            @cardMoved="handleCardMoved" @update:cards="(newCards) => onUpdateCards(column, newCards)" />
    </div>
    <Modal v-model="isClosed">
        <template #header>Fermeture d'un ticket</template>
        <form>
            <div class="fledx flex-col gap-4">
                <label class="form-label">Super cout</label>
                <input v-model="closingValue" type="number" step="0.01" required class="form-input" />
            </div>
            <div class="mt-2">
                <button type="submit" class="btn-primary" @click="insertCost(closingValue, 'super_cost', ticketId)"
                    :disabled="isClosingSumbit">
                    {{ isClosingSumbit ? 'Fermeture...' : 'Fermer le ticket' }}
                </button>
            </div>
        </form>
    </Modal>
    <Modal v-model="isRollBack">
        <template #header>Rollback d'un ticket</template>
        <form>
            <div class="fledx flex-col gap-4">
                <label class="form-label">Cout de reouverture</label>
                <input v-model="rollBackValue" type="number" step="0.01" required class="form-input" />
            </div>
            <div>
                <label class="form-label">Mode de reouverture</label>
                <select v-model="reopenMode" class="form-input">
                    <option value="1">1(dernier cout insere)</option>
                    <option value="2">2(premier cout insere)</option>
                    <option value="3">3(moyenne de tous les couts)</option>
                    <option value="4">4(somme de les couts)</option>
                </select>
            </div>
        </form>

        <template #footer="{ close }">
            <button @click="close" class="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">
                Fermer Modal
            </button>
            <button @click="handleReopen"
                class="flex items-center gap-1.5 px-2.5 py-1 text-sm disabled:bg-green-200 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                :disabled="rollBackValue == 0">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                </svg>
                Réouverture
            </button>
            <button @click="deleteRecentTicketCosts(ticketId)"
                class="flex items-center gap-1.5 px-2.5 py-1 text-sm bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="M6 6l12 12" />
                </svg>
                Annulation
            </button>
        </template>
    </Modal>
</template>
<style scoped>
@reference "tailwindcss";

.form-label {
    @apply mb-1 block text-sm font-medium text-gray-700;
}

.form-input {
    @apply w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500;
}

.btn-primary {
    @apply rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed;
}
</style>