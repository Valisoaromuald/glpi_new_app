<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import TicketService from '@/services/assistance/ticketService'
import { TICKET_STATUS_MAP, PRIORITY_MAP } from '@/utils/ticketUtil'
import Pagination from '../common/pagination/Pagination.vue'

const router = useRouter()
const ticketService = new TicketService()

// ─── Data ─────────────────────────────────────────────────────────────────────
const tickets = ref<any[]>([])
const isLoading = ref(true)

// ─── Filtres ──────────────────────────────────────────────────────────────────
const searchTitre     = ref('')
const searchStatus    = ref('')
const searchPriority  = ref('')
const searchRequester = ref('')
const searchAssigne   = ref('')

// ─── Pagination ───────────────────────────────────────────────────────────────
const itemsPerPage = 5
const start = ref(1)
const end   = ref(itemsPerPage)

// ─── Couleurs statut ──────────────────────────────────────────────────────────
const statusClass: Record<string, string> = {
  'Nouveau':             'bg-blue-50 text-blue-700',
  'En cours (attribué)': 'bg-yellow-50 text-yellow-700',
  'En cours (planifié)': 'bg-yellow-50 text-yellow-700',
  'En attente':          'bg-orange-50 text-orange-700',
  'Résolu':              'bg-green-50 text-green-700',
  'Clos':                'bg-gray-100 text-gray-500',
}

const priorityClass: Record<string, string> = {
  'Très basse': 'bg-gray-100 text-gray-500',
  'Basse':      'bg-gray-100 text-gray-600',
  'Moyenne':    'bg-yellow-50 text-yellow-700',
  'Haute':      'bg-orange-50 text-orange-700',
  'Très haute': 'bg-red-50 text-red-700',
}

// ─── Filtrage ─────────────────────────────────────────────────────────────────
const filtered = computed(() =>
  tickets.value.filter(t => {
    const matchTitre     = !searchTitre.value     || String(t.titre ?? '').toLowerCase().includes(searchTitre.value.toLowerCase())
    const matchStatus    = !searchStatus.value    || String(t.status ?? '').toLowerCase().includes(searchStatus.value.toLowerCase())
    const matchPriority  = !searchPriority.value  || String(t.priority ?? '').toLowerCase().includes(searchPriority.value.toLowerCase())
    const matchRequester = !searchRequester.value || (t.requesters && t.requesters.some((r: string) => r.toLowerCase().includes(searchRequester.value.toLowerCase())))
    const matchAssigne   = !searchAssigne.value   || (t.assignes && t.assignes.some((a: string) => a.toLowerCase().includes(searchAssigne.value.toLowerCase())))
    return matchTitre && matchStatus && matchPriority && matchRequester && matchAssigne
  })
)

// Remet la pagination à zéro quand un filtre change
watch(
  [searchTitre, searchStatus, searchPriority, searchRequester, searchAssigne],
  () => {
    start.value = 1
    end.value = itemsPerPage
  }
)

const paginated = computed(() => filtered.value.slice(start.value - 1, end.value))

const hasFilters = computed(() =>
  [searchTitre, searchStatus, searchPriority, searchRequester, searchAssigne].some(f => f.value !== '')
)

function clearFilters() {
  searchTitre.value = searchStatus.value = searchPriority.value = searchRequester.value = searchAssigne.value = ''
}

function formatDate(date: string): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR')
}

// ─── Pagination — récupère start/end depuis le composant ──────────────────────
function handlePaginationUpdate(newStart: number, newEnd: number) {
  start.value = newStart
  end.value = newEnd
}

onMounted(async () => {
  tickets.value = await ticketService.getTicketsList()
  isLoading.value = false
})
</script>

<template>
  <div class="space-y-4">

    <!-- ── Filtres ── -->
    <div class="bg-white border border-gray-200 rounded-xl p-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filtres
        </h2>
        <button
          v-if="hasFilters"
          type="button"
          class="text-xs text-blue-600 hover:text-blue-800 font-medium"
          @click="clearFilters"
        >
          Réinitialiser
        </button>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-500">Titre</label>
          <input v-model="searchTitre" type="text" placeholder="Rechercher..."
            class="h-8 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-500">Statut</label>
          <select v-model="searchStatus"
            class="h-8 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Tous</option>
            <option v-for="[label] in Object.entries(TICKET_STATUS_MAP)" :key="label" :value="label">{{ label }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-500">Priorité</label>
          <select v-model="searchPriority"
            class="h-8 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Toutes</option>
            <option v-for="[label] in Object.entries(PRIORITY_MAP)" :key="label" :value="label">{{ label }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-500">Demandeur</label>
          <input v-model="searchRequester" type="text" placeholder="Nom..."
            class="h-8 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-gray-500">Assigné</label>
          <input v-model="searchAssigne" type="text" placeholder="Nom..."
            class="h-8 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300" />
        </div>
      </div>
    </div>

    <!-- ── Table ── -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">

      <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">Tickets</span>
        <span class="text-xs text-gray-400">
          {{ filtered.length }} résultat{{ filtered.length > 1 ? 's' : '' }}
          <template v-if="hasFilters"> sur {{ tickets.length }}</template>
        </span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-16 text-gray-400">
        <svg class="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span class="text-sm">Chargement...</span>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-950  text-left ">
              <th class="px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide w-12">#</th>
              <th class="px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide">Titre</th>
              <th class="px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide w-32">Statut</th>
              <th class="px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide w-28">Priorité</th>
              <th class="px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide">Demandeurs</th>
              <th class="px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide">Assignés</th>
              <th class="px-4 py-3 text-xs font-semibold text-white uppercase tracking-wide w-24">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">

            <tr v-if="filtered.length === 0">
              <td colspan="7" class="px-4 py-12 text-center text-sm text-gray-400">
                Aucun ticket ne correspond aux filtres.
              </td>
            </tr>
            <tr
              v-for="ticket in paginated"
              :key="ticket.id"
              class="hover:bg-gray-50 cursor-pointer transition-colors"
              @click="router.push(`/backoffice/tickets/${ticket.id}`)"
            >
              <td class="px-4 py-3 text-xs text-gray-400 font-mono">{{ ticket.id }}</td>
              <td class="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{{ ticket.titre }}</td>

              <td class="px-4 py-3">
                <span class="text-xs px-2 py-1 rounded-full font-medium"
                  :class="statusClass[ticket.status] ?? 'bg-gray-100 text-gray-500'">
                  {{ ticket.status }}
                </span>
              </td>

              <td class="px-4 py-3">
                <span class="text-xs px-2 py-1 rounded-full font-medium"
                  :class="priorityClass[ticket.priority] ?? 'bg-gray-100 text-gray-500'">
                  {{ ticket.priority }}
                </span>
              </td>

              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span v-for="r in ticket.requesters" :key="r"
                    class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    {{ r }}
                  </span>
                  <span v-if="!ticket.requesters?.length" class="text-xs text-gray-300">—</span>
                </div>
              </td>

              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span v-for="a in ticket.assignes" :key="a"
                    class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    {{ a }}
                  </span>
                  <span v-if="!ticket.assignes?.length" class="text-xs text-gray-300">—</span>
                </div>
              </td>

              <td class="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                {{ formatDate(ticket.date_creation) }}
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="filtered.length > 0"
        :total="filtered.length"
        :start="start"
        @update:limit="handlePaginationUpdate"
      />

    </div>
  </div>
</template>