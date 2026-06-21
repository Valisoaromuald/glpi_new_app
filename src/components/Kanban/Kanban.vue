<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useKanban } from "@/composables/useKanban";
import type { IKanbanCard } from "@/types/kanban/kanbanCard.ts";
import KanbanColumn from "./KanbanColumn.vue";
import type { IKanbanColumn } from "@/types/kanban/KanBanColumn.ts";
import Modal from "../modal/Modal.vue";
const {
    columns,
    status,
    closingValue,
    rollBackValue,
    isClosed,
    isRollBack,
    isClosingSumbit,
    isRollBackSubmit,
    ticketId,
    movementMessage,
    deleteRecentTicketCosts,
    getTotalCosts,
    load,
    moveCard,
    insertCost
} = useKanban();
let langue = ref<string>('anglais(par defaut)')
onMounted(load);

const reopenMode = ref<number>(1)
const pendingPayload = ref<{ card: IKanbanCard; destinationStatus: number } | null>(null)
function handleCardMoved(payload: { card: IKanbanCard; destinationStatus: number }) {
    moveCard(payload.card, payload.destinationStatus)
}
function onUpdateCards(column: Partial<IKanbanColumn>, newCards: IKanbanCard[]) {
    column.cards = newCards;
}
function handleCardPending(payload: { card: IKanbanCard; destinationStatus: number }) {
    ticketId.value = payload.card.ticketId
    pendingPayload.value = payload
    if (payload.destinationStatus === 3) isClosed.value = true
    if (payload.destinationStatus === 2 && payload.card.ticketStatus === 3) isRollBack.value = true
}
async function handleReopen() {
    try {
        isRollBackSubmit.value = true
        const totalRecentCosts = await getTotalCosts(ticketId.value, Number(reopenMode.value))
        const cost = (totalRecentCosts / 100) * rollBackValue.value
        await insertCost(cost, 'reopening', ticketId.value)
        movementMessage.value = "<p class='text-green-600 font-semibold'> l'insertion du cout de reouverture reussie</p>"

        if (pendingPayload.value) {
            moveCard(pendingPayload.value.card, pendingPayload.value.destinationStatus)
            pendingPayload.value = null
        }
    } catch (error) {
        console.error(error)
        movementMessage.value = "<p class='text-red-600 font-semibold'>erreur lors de l'insertion du cout de reouverture</p>"
    }
    finally {
        isRollBackSubmit.value = false
    }
}

async function handleTicketClose() {
    try {
        isClosingSumbit.value = true
        await insertCost(closingValue.value, 'super_cost', ticketId.value)
        movementMessage.value = "<p class='text-green-600 font-semibold'> l'insertion du super cout reussie</p>"
        if (pendingPayload.value) {
            moveCard(pendingPayload.value.card, pendingPayload.value.destinationStatus)
            pendingPayload.value = null
        }
    } catch (error) {
        console.error(error)
        movementMessage.value = "<p class='text-red-600 font-semibold'>erreur lors de l'insertion du super cout</p>"
    }
    finally {
        isClosingSumbit.value = false
    }
}

async function handleDelete() {
    try {
        await deleteRecentTicketCosts(ticketId.value);
        movementMessage.value = "<p class='text-green-600 font-semibold'> suppression du dernier super cout reussie</p>"
    } catch (error) {
        console.error(error)
        movementMessage.value = "<p class='text-red-600 font-semibold'>erreur lors de  la supression  du dernier super cout</p>"
    }
    finally {
        isRollBackSubmit.value = false
    }
}
function changeLanguageVersion() {
    if (langue.value === "anglais") {
        columns.value.forEach(element => {
            const relevantStatus = status.value.find(s => s.label === element.title || s.label_mg === element.title)
            if (relevantStatus) {
                element.title = relevantStatus.label
            }
        });
    }
    else {
        columns.value.forEach(element => {
            const relevantStatus = status.value.find(s => s.label === element.title || s.label_mg === element.title)
            if (relevantStatus) {
                element.title = relevantStatus.label_mg
            }
        });
    }
}
</script>

<template>

    <div class="flex flex-col gap-1 mb-10">
        <label for="statut" class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Langue de statut</label>
        <div class="relative">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-4">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                </svg>
            </span>
            <select id="statut" v-model="langue" @change="changeLanguageVersion"
                class="w-80  pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-gray-300">
                <option :key="1" :value="'anglais'">anglais(par defaut)</option>
                <option :key="2" :value="'malagasy'">
                    malagasy
                </option>
            </select>
        </div>
    </div>
    <div class="flex gap-4">
        <kanban-column v-for="column in columns" :key="column.status" :column="column" :useButton="column.status === 1"
            @cardMoved="handleCardMoved" @cardPending="handleCardPending"
            @update:cards="(newCards) => onUpdateCards(column, newCards)" />
    </div>
    <Modal v-model="isClosed">
        <template #header>Fermeture d'un ticket</template>
        <form>
            <div class="fledx flex-col gap-4">
                <label class="form-label">Super cout</label>
                <input v-model="closingValue" type="number" step="0.01" required class="form-input" />
            </div>
            <div class="mt-2">
                <button type="submit" class="btn-primary" @click="handleTicketClose" :disabled="isClosingSumbit">
                    {{ isClosingSumbit ? 'Fermeture...' : 'Fermer le ticket' }}
                </button>
            </div>
            <div v-if="movementMessage" v-html="movementMessage"></div>
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
                {{ isRollBackSubmit ? 'Reouverture...' : 'Reouvrir le ticket' }}
            </button>
            <button @click="handleDelete"
                class="flex items-center gap-1.5 px-2.5 py-1 text-sm bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="M6 6l12 12" />
                </svg>
                {{ isRollBackSubmit ? 'Annulation...' : 'Annuler le ticket' }}
            </button>
            <div v-if="movementMessage" v-html="movementMessage"></div>
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