<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TicketService from '@/services/assistance/ticketService'
import { TICKET_STATUS_MAP, PRIORITY_MAP, IMPACT_MAP } from '@/utils/ticketUtil'
import type { Ticket } from '@/types/assistance/ticket'
import type { TicketUser } from '@/types/assistance/ticketUser'

const route  = useRoute()
const router = useRouter()
const ticketService = new TicketService()

const ticket     = ref<Partial<Ticket> | null>(null)
const requesters = ref<TicketUser[]>([])
const assignees  = ref<TicketUser[]>([])
const observers  = ref<TicketUser[]>([])
const isLoading  = ref(true)

const statusClass: Record<string, string> = {
  'Nouveau':             'bg-blue-50 text-blue-700 border-blue-200',
  'En cours (attribué)': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'En cours (planifié)': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'En attente':          'bg-orange-50 text-orange-700 border-orange-200',
  'Résolu':              'bg-green-50 text-green-700 border-green-200',
  'Clos':                'bg-gray-100 text-gray-500 border-gray-200',
}

const priorityClass: Record<string, string> = {
  'Très basse': 'bg-gray-100 text-gray-500',
  'Basse':      'bg-gray-100 text-gray-600',
  'Moyenne':    'bg-yellow-50 text-yellow-700',
  'Haute':      'bg-orange-50 text-orange-700',
  'Très haute': 'bg-red-50 text-red-700',
}

function getLabelByValue(map: Record<string, number>, value: number): string {
  return Object.entries(map).find(([, v]) => v === value)?.[0] ?? '—'
}

function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(async () => {
  const id = Number(route.params.id)
  const [t, actors] = await Promise.all([
    TicketService.getById(id),
    ticketService.getActors(id),
  ])
  ticket.value    = t
  requesters.value = actors.users.filter((u: TicketUser) => u.type === 1)
  assignees.value  = actors.users.filter((u: TicketUser) => u.type === 2)
  observers.value  = actors.users.filter((u: TicketUser) => u.type === 3)
  isLoading.value  = false
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-4 py-6 px-4">

    <!-- ── Bouton retour ── -->
    <button
      type="button"
      class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      @click="router.push('/backoffice/tickets')"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Retour à la liste
    </button>

    <!-- ── Loading ── -->
    <div v-if="isLoading" class="flex items-center justify-center py-24 text-gray-400">
      <svg class="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <span class="text-sm">Chargement...</span>
    </div>

    <template v-else-if="ticket">

      <!-- ── En-tête ── -->
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-mono text-gray-400">#{{ ticket.id }}</span>
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium border"
                :class="statusClass[getLabelByValue(TICKET_STATUS_MAP, Number(ticket.status?.id ?? ticket.status))] ?? 'bg-gray-100 text-gray-500 border-gray-200'"
              >
                {{ getLabelByValue(TICKET_STATUS_MAP, Number(ticket.status?.id ?? ticket.status)) }}
              </span>
            </div>
            <h1 class="text-xl font-semibold text-gray-900 truncate">{{ ticket.name }}</h1>
            <p class="text-xs text-gray-400 mt-1">Créé le {{ formatDate(ticket.date_creation) }}</p>
          </div>
        </div>
      </div>

      <!-- ── Grille infos + acteurs ── -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

        <!-- Informations générales -->
        <div class="md:col-span-2 bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 class="text-sm font-semibold text-gray-700">Informations générales</h2>

          <div class="grid grid-cols-2 gap-4">

            <div>
              <p class="text-xs text-gray-400 mb-1">Type</p>
              <p class="text-sm text-gray-800">{{ ticket.type === 1 ? 'Incident' : 'Demande' }}</p>
            </div>

            <div>
              <p class="text-xs text-gray-400 mb-1">Priorité</p>
              <span
                class="text-xs px-2 py-0.5 rounded-full font-medium"
                :class="priorityClass[getLabelByValue(PRIORITY_MAP, Number(ticket.priority))] ?? 'bg-gray-100 text-gray-500'"
              >
                {{ getLabelByValue(PRIORITY_MAP, Number(ticket.priority)) }}
              </span>
            </div>

            <div>
              <p class="text-xs text-gray-400 mb-1">Urgence</p>
              <p class="text-sm text-gray-800">{{ getLabelByValue(PRIORITY_MAP, Number(ticket.urgency)) }}</p>
            </div>

            <div>
              <p class="text-xs text-gray-400 mb-1">Impact</p>
              <p class="text-sm text-gray-800">{{ getLabelByValue(IMPACT_MAP, Number(ticket.impact)) }}</p>
            </div>

            <div>
              <p class="text-xs text-gray-400 mb-1">Catégorie</p>
              <p class="text-sm text-gray-800">{{ ticket.category?.name || '—' }}</p>
            </div>

            <div>
              <p class="text-xs text-gray-400 mb-1">Source</p>
              <p class="text-sm text-gray-800">{{ ticket.request_type?.name || '—' }}</p>
            </div>

            <div>
              <p class="text-xs text-gray-400 mb-1">Localisation</p>
              <p class="text-sm text-gray-800">{{ ticket.location?.id || '—' }}</p>
            </div>

            <div>
              <p class="text-xs text-gray-400 mb-1">Dernière modification</p>
              <p class="text-sm text-gray-800">{{ formatDate(ticket.date_mod) }}</p>
            </div>

          </div>
        </div>

        <!-- Acteurs -->
        <div class="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 class="text-sm font-semibold text-gray-700">Acteurs</h2>

          <!-- Demandeurs -->
          <div>
            <p class="text-xs text-gray-400 mb-2">Demandeurs</p>
            <div class="flex flex-col gap-1.5">
              <div
                v-for="u in requesters"
                :key="u.id"
                class="flex items-center gap-2"
              >
                <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span class="text-xs font-medium text-blue-700">
                    {{ String(u.users_id).charAt(0).toUpperCase() }}
                  </span>
                </div>
                <span class="text-sm text-gray-700">{{ u.users_id }}</span>
              </div>
              <p v-if="!requesters.length" class="text-xs text-gray-300">—</p>
            </div>
          </div>

          <!-- Assignés -->
          <div>
            <p class="text-xs text-gray-400 mb-2">Assignés</p>
            <div class="flex flex-col gap-1.5">
              <div
                v-for="u in assignees"
                :key="u.id"
                class="flex items-center gap-2"
              >
                <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <span class="text-xs font-medium text-green-700">
                    {{ String(u.users_id).charAt(0).toUpperCase() }}
                  </span>
                </div>
                <span class="text-sm text-gray-700">{{ u.users_id }}</span>
              </div>
              <p v-if="!assignees.length" class="text-xs text-gray-300">—</p>
            </div>
          </div>

          <!-- Observateurs -->
          <div>
            <p class="text-xs text-gray-400 mb-2">Observateurs</p>
            <div class="flex flex-col gap-1.5">
              <div
                v-for="u in observers"
                :key="u.id"
                class="flex items-center gap-2"
              >
                <div class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <span class="text-xs font-medium text-gray-500">
                    {{ String(u.users_id).charAt(0).toUpperCase() }}
                  </span>
                </div>
                <span class="text-sm text-gray-700">{{ u.users_id }}</span>
              </div>
              <p v-if="!observers.length" class="text-xs text-gray-300">—</p>
            </div>
          </div>
        </div>

      </div>

      <!-- ── Description ── -->
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <h2 class="text-sm font-semibold text-gray-700 mb-3">Description</h2>
        <div
          class="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
          v-html="ticket.content || '<span class=\'text-gray-300\'>Aucune description.</span>'"
        />
      </div>

    </template>

    <!-- ── Ticket introuvable ── -->
    <div v-else class="text-center py-24 text-gray-400 text-sm">
      Ticket introuvable.
    </div>

  </div>
</template>