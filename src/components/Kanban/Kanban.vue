<template>
    <div class="p-6">
        <div class="flex gap-4 overflow-x-auto">
            <div v-for="col in columns" :key="col.id" class="flex-1 min-w-70 rounded-xl p-3"
                :style="{ backgroundColor: col.color }">
                <!-- Header colonne -->
                <div class="flex items-center justify-between mb-3 px-1">
                    <h3 class="font-semibold text-gray-800">
                        {{ col.label }}
                        <span class="text-sm text-gray-500">({{ col.label_mg }})</span>
                    </h3>
                    <span class="bg-white text-gray-700 text-xs font-bold px-2 py-1 rounded-full shadow">
                        {{ ticketsByStatus(col.id).length }}
                    </span>
                </div>

                <!-- Liste draggable -->
                <draggable :list="ticketsByStatus(col.id)" group="tickets" item-key="id"
                    class="flex flex-col gap-2 min-h-25" @change="(evt:DraggableChangeEvent) => onChange(evt, col.id)">
                    <template #item="{ element }">
                        <div class="bg-white rounded-lg shadow p-3 cursor-pointer hover:shadow-md transition"
                            @click="openDetails(element)">
                            <p class="font-medium text-gray-800">{{ element.titre }}</p>
                            <p v-if="element.description" class="text-sm text-gray-500 truncate">
                                {{ element.description }}
                            </p>
                        </div>
                    </template>
                </draggable>

                <!-- Bouton ajouter (uniquement colonne "New") -->
                <button v-if="col.label === 'New'" @click="showAddModal = true"
                    class="w-full mt-3 flex items-center justify-center gap-2 bg-white/70 hover:bg-white text-gray-600 text-sm font-medium rounded-lg py-2 transition">
                    <span class="text-lg">+</span> Ajouter 1 ticket
                </button>
            </div>
        </div>

        <!-- Modal: Ajouter un ticket -->
        <div v-if="showAddModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h2 class="text-lg font-semibold mb-4">Nouveau ticket</h2>
                <input v-model="newTicket.titre" placeholder="Titre" class="w-full border rounded-lg px-3 py-2 mb-3" />
                <textarea v-model="newTicket.description" placeholder="Description"
                    class="w-full border rounded-lg px-3 py-2 mb-4" rows="3"></textarea>
                <div class="flex justify-end gap-2">
                    <button @click="showAddModal = false" class="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
                        Annuler
                    </button>
                    <button @click="addTicket" class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                        Créer
                    </button>
                </div>
                
            </div>
        </div>

        <!-- Modal: Détails ticket -->
        <div v-if="selectedTicket" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h2 class="text-lg font-semibold mb-2">{{ selectedTicket.titre }}</h2>
                <p class="text-gray-600 mb-2">{{ selectedTicket.description || 'Aucune description' }}</p>
                <p class="text-sm text-gray-500">Statut : {{ selectedTicket.status_label }} ({{
                    selectedTicket.status_label_mg
                }})</p>
                <p v-if="selectedTicket.glpi_cost" class="text-sm text-gray-500">Coût GLPI : {{ selectedTicket.glpi_cost
                }}</p>
                <p v-if="selectedTicket.super_cost" class="text-sm text-gray-500">Coût Super : {{
                    selectedTicket.super_cost }}
                </p>

                <div class="flex justify-end mt-4">
                    <button @click="selectedTicket = null" class="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                        Fermer
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal: changement de statut nécessitant infos supplémentaires -->
        <div v-if="pendingStatusChange" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h2 class="text-lg font-semibold mb-4">Informations complémentaires</h2>
                <p class="text-sm text-gray-600 mb-3">
                    Le passage vers "{{ pendingStatusChange.targetLabel }}" nécessite une information.
                </p>
                <textarea v-model="extraInfo" placeholder="Commentaire / information"
                    class="w-full border rounded-lg px-3 py-2 mb-4" rows="3"></textarea>
                <div class="flex justify-end gap-2">
                    <button @click="cancelStatusChange" class="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
                        Annuler
                    </button>
                    <button @click="confirmStatusChange"
                        class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                        Valider
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import draggable from 'vuedraggable';
import NewAppApi from '@/api/newAppApi';

const api = new NewAppApi();

// --- Types ---
interface Column {
  id: number;
  label: string;
  label_mg: string;
  color: string;
}

interface Ticket {
  id: number;
  titre: string;
  description?: string;
  statut_id: number;
  status_label: string;
  status_label_mg: string;
  glpi_cost?: number;
  super_cost?: number;
}

interface PendingStatusChange {
  ticketId: number;
  targetStatusId: number;
  targetLabel: string;
  previousStatusId: number;
}

interface DraggableChangeEvent {
  added?: {
    element: Ticket;
    newIndex: number;
  };
  removed?: {
    element: Ticket;
    oldIndex: number;
  };
  moved?: {
    element: Ticket;
    newIndex: number;
    oldIndex: number;
  };
}

// --- State ---
const columns = ref<Column[]>([]);
const tickets = ref<Ticket[]>([]);

const showAddModal = ref(false);
const newTicket = ref({ titre: '', description: '' });

const selectedTicket = ref<Ticket | null>(null);

const pendingStatusChange = ref<PendingStatusChange | null>(null);
const extraInfo = ref('');

// Statuts qui nécessitent une info complémentaire (ex: passage vers "Closed")
const STATUSES_REQUIRING_INFO = ['Closed'];

// --- Fetch ---
const fetchData = async (): Promise<void> => {
  try {
    const [configRes, ticketsRes] = await Promise.all([
      api.get<Column[]>('/kanban-config'),
      api.get<Ticket[]>('/tickets'),
    ]);
    columns.value = configRes.data;
    tickets.value = ticketsRes.data;
  } catch (err) {
    console.error('Erreur fetchData:', err);
  }
};

const ticketsByStatus = (statusId: number): Ticket[] =>
  tickets.value.filter((t) => t.statut_id === statusId);

const openDetails = (ticket: Ticket): void => {
  selectedTicket.value = ticket;
};

const addTicket = async (): Promise<void> => {
  if (!newTicket.value.titre.trim()) return;

  const res = await api.post<{ id: number }>('/tickets', newTicket.value);

  tickets.value.push({
    id: res.data.id,
    titre: newTicket.value.titre,
    description: newTicket.value.description,
    statut_id: 1,
    status_label: 'New',
    status_label_mg: 'Vaovao',
  });

  newTicket.value = { titre: '', description: '' };
  showAddModal.value = false;
};

// Appelé par vuedraggable lors d'un déplacement
const onChange = (evt: DraggableChangeEvent, newStatusId: number): void => {
  if (evt.added) {
    const ticket = evt.added.element;
    const targetCol = columns.value.find((c) => c.id === newStatusId);

    if (!targetCol) return;

    if (STATUSES_REQUIRING_INFO.includes(targetCol.label)) {
      // Ouvrir la boîte de dialogue avant de valider
      pendingStatusChange.value = {
        ticketId: ticket.id,
        targetStatusId: newStatusId,
        targetLabel: targetCol.label,
        previousStatusId: ticket.statut_id,
      };
      extraInfo.value = '';
    } else {
      updateTicketStatus(ticket.id, newStatusId);
    }

    // Mettre à jour localement pour refléter le déplacement
    ticket.statut_id = newStatusId;
    ticket.status_label = targetCol.label;
    ticket.status_label_mg = targetCol.label_mg;
  }
};

const updateTicketStatus = async (
  ticketId: number,
  statutId: number,
  extra?: string
): Promise<void> => {
  await api.patch(`/tickets/${ticketId}/status`, {
    statut_id: statutId,
    extra_info: extra ?? null,
  });
};

const confirmStatusChange = (): void => {
  if (!pendingStatusChange.value) return;
  const { ticketId, targetStatusId } = pendingStatusChange.value;
  updateTicketStatus(ticketId, targetStatusId, extraInfo.value);
  pendingStatusChange.value = null;
};

const cancelStatusChange = (): void => {
  if (!pendingStatusChange.value) return;

  // Remettre le ticket dans sa colonne d'origine
  const { ticketId, previousStatusId } = pendingStatusChange.value;
  const ticket = tickets.value.find((t) => t.id === ticketId);
  const prevCol = columns.value.find((c) => c.id === previousStatusId);

  if (ticket && prevCol) {
    ticket.statut_id = previousStatusId;
    ticket.status_label = prevCol.label;
    ticket.status_label_mg = prevCol.label_mg;
  }

  pendingStatusChange.value = null;
};

onMounted(fetchData);
</script>