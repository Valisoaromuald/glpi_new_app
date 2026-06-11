<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Accordion from '@/components/common/accordion/Accordion.vue'
import { IMPACT_MAP, PRIORITY_MAP, TICKET_STATUS_MAP } from '@/utils/ticketUtil'
import type { Ticket } from '@/types/assistance/ticket'
import type { User } from '@/types/administration/user/user'
import UserService from '@/services/administration/userService'
import TicketService from '@/services/assistance/ticketService'
import type { LinkedElement } from '@/types/assistance/ticketForm'
import RequestTypeService from '@/services/dropdowns/requestTypeService'
import ImportService from '@/services/import/importService'
import { ASSET_ENDPOINTS } from '@/utils/assetUtil'
import AssetService from '@/services/assets/assetService'
import type { BaseAsset } from '@/types/asset/asset'
import RichTextEditor from '../RichTextEditor.vue'
const users = ref<Partial<User>[]>([])

// ─── Formulaire ───────────────────────────────────────────────────────────────

const defaultForm = (): Partial<Ticket> => ({
    date_creation: new Date().toISOString().slice(0, 16),
    name: '',
    content: '',
    urgency: 3,
    impact: 3,
    priority: 3,
    type: 1,
    category: { id: 0, name: '' },
    location: { id: 0 },
    entity: { id: 0 },
    request_type: { id: 0, name: '' },
    status: {
        id: 0,
        name: ''
    },
    team: [],
    costs: [],
})
const request_types = ref<{ id: number, name: string }[]>([])

const form = reactive<Partial<Ticket>>(defaultForm())
const createId = () => {
    return crypto.randomUUID()
}
async function selectElements(element: LinkedElement): Promise<void> {
    const assetService = new AssetService()
    try {
        const assets = await assetService.getAssets<Partial<BaseAsset>[]>(element.type, true)
        element.availableElements = assets.map(asset => ({
            uid: createId(),
            id: String(asset.id),
            type: element.type,
            name: asset.name ?? '',
            serialNumber: asset.otherserial ?? ''
        }))
    } catch (error) {
        console.error(error)
        alert(`Erreur lors de la récupération des éléments de type ${element.type}`)
    }
}

// ─── Acteurs ──────────────────────────────────────────────────────────────────

const addActor = () => {
    form.team?.push({
        id: 0,
        name: '',
        type: 'User',
        role: 'requester',
    })
}

const removeActor = (index: number) => {
    form.team?.splice(index, 1)
}

// ─── Éléments associés ────────────────────────────────────────────────────────
const elements = ref<LinkedElement[]>([])
const addElement = () => {
    elements.value.push({
        uid: createId(),
        id: '',
        type: 'computer',
        name: '',
        serialNumber: '',
        availableElements: []
    })
}
const removeElement = (index: number) => {
    elements.value.splice(index, 1)
}

// ─── Soumission ───────────────────────────────────────────────────────────────

const isSubmitting = ref(false)

const resetForm = () => {
    Object.assign(form, defaultForm())
    elements.value = []
}

const submitTicket = async () => {
    isSubmitting.value = true
    try {
        const ticketService = new TicketService()
        const importService = new ImportService()
        const data = await ticketService.create(form)
        const items = await ticketService.getItemsByLinkedElements(elements.value)
        await importService.linkItemsToTicket(data.id, items)
        resetForm()
    } catch (error) {
        console.error('Erreur création ticket :', error)
    } finally {
        isSubmitting.value = false
    }
}

// ─── Données ──────────────────────────────────────────────────────────────────

onMounted(async () => {
    const userService = new UserService()
    const requestTypeService = new RequestTypeService()
    users.value = await userService.getAll()
    request_types.value = await requestTypeService.getAll()
})
</script>

<template>
    <main class="min-h-screen bg-gray-100 px-4 py-6">
        <div class="mx-auto max-w-4xl">

            <div class="mb-5">
                <h1 class="text-2xl font-semibold text-gray-900">Créer un ticket</h1>
                <p class="mt-1 text-sm text-gray-500">
                    Renseignez le ticket, les acteurs concernés et les éléments associés.
                </p>
            </div>

            <form class="space-y-4" @submit.prevent="submitTicket">

                <!-- ── Ticket ── -->
                <Accordion title="Ticket" :default-open="true">
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div class="md:col-span-2">
                            <label class="form-label">Date d'ouverture </label>
                            <input v-model="form.date_creation" type="datetime-local" required class="form-input"
                                placeholder="Ex : Problème imprimante" />
                        </div>

                        <!-- Type -->
                        <div>
                            <label class="form-label">Type</label>
                            <select v-model="form.type" required class="form-input">
                                <option :value="1">Incident</option>
                                <option :value="2">Demande</option>
                            </select>
                        </div>

                        <!-- Catégorie -->
                        <div>
                            <label class="form-label">Catégorie</label>
                            <input v-model="form.category!.name" type="text" class="form-input"
                                placeholder="Ex : Matériel" />
                        </div>
                        <div>
                            <label class="form-label">Status</label>
                            <select v-model="form.status!.id" class="form-input">
                                <option v-for="[label, value] in Object.entries(TICKET_STATUS_MAP)" :key="value"
                                    :value="value">
                                    {{ label }}
                                </option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Source de la demande</label>
                            <select v-model="form.request_type!.id" class="form-input">
                                <option v-for="request_type in request_types" :key="request_type.id"
                                    :value="request_type.id">
                                    {{ request_type.name }}
                                </option>
                            </select>
                        </div>
                        <!-- Urgence -->
                        <div>
                            <label class="form-label">Urgence</label>
                            <select v-model="form.urgency" class="form-input">
                                <option v-for="[label, value] in Object.entries(PRIORITY_MAP)" :key="label"
                                    :value="value">
                                    {{ label }}
                                </option>
                            </select>
                        </div>

                        <!-- Impact -->
                        <div>
                            <label class="form-label">Impact</label>
                            <select v-model="form.impact" class="form-input">
                                <option v-for="[label, value] in Object.entries(IMPACT_MAP)" :key="label"
                                    :value="value">
                                    {{ label }}
                                </option>
                            </select>
                        </div>
                        <!-- Titre -->
                        <div class="md:col-span-2">
                            <label class="form-label">Titre <span class="text-red-500">*</span></label>
                            <input v-model="form.name" type="text" required class="form-input"
                                placeholder="Ex : Problème imprimante" />
                        </div>

                        <!-- Description -->
                        <div class="md:col-span-2">
                            <label class="form-label">Description <span class="text-red-500">*</span></label>
                            <RichTextEditor v-model="form.content"
                                placeholder="Décrivez le problème ou la demande..." />
                        </div>

                    </div>
                </Accordion>

                <!-- ── Acteurs ── -->
                <Accordion title="Acteurs" :badge="form.team?.length">
                    <div class="space-y-3">

                        <div v-for="(actor, index) in form.team" :key="index"
                            class="rounded-md border border-gray-200 bg-gray-50 p-3">
                            <div class="grid grid-cols-1 gap-3 md:grid-cols-3">

                                <!-- Rôle -->
                                <div>
                                    <label class="form-label">Rôle</label>
                                    <select v-model="actor.role" class="form-input">
                                        <option value="requester">Demandeur</option>
                                        <option value="observer">Observateur</option>
                                        <option value="assign">Assigné à</option>
                                    </select>
                                </div>

                                <!-- Type acteur -->
                                <div>
                                    <label class="form-label">Type</label>
                                    <select v-model="actor.type" class="form-input">
                                        <option value="User">Utilisateur</option>
                                        <option value="Group">Groupe</option>
                                    </select>
                                </div>

                                <!-- Utilisateur -->
                                <div>
                                    <label class="form-label">Utilisateur</label>
                                    <select v-model="actor.id" class="form-input">
                                        <option :value="0" disabled>-- Choisir --</option>
                                        <option v-for="user in users" :key="user.id" :value="user.id">
                                            {{ user.username }}
                                        </option>
                                    </select>
                                </div>

                            </div>

                            <div class="mt-2 flex justify-end">
                                <button type="button" class="btn-danger" @click="removeActor(index)">
                                    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
                                        <path d="M6 7H18" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" />
                                        <path d="M9 7V18" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" />
                                        <path d="M15 7V18" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" />
                                        <path d="M10 4H14" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" />
                                        <path d="M7 7L8 20H16L17 7" stroke="currentColor" stroke-width="2"
                                            stroke-linejoin="round" />
                                    </svg>
                                    Supprimer
                                </button>
                            </div>
                        </div>

                        <button type="button" class="btn-secondary" @click="addActor">
                            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
                                <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                                <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                            </svg>
                            Ajouter un acteur
                        </button>

                    </div>
                </Accordion>

                <!-- ── Éléments ── -->
                <Accordion title="Éléments" :badge="elements.length">
                    <div class="space-y-3">

                        <div v-for="(element, index) in elements" :key="element.uid"
                            class="rounded-md border border-gray-200 bg-gray-50 p-3">

                            <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div>
                                    <label class="form-label">Type</label>
                                    <select v-model="element.type" class="form-input" @change="selectElements(element)">
                                        <option v-for="endpoint in ASSET_ENDPOINTS" :key="endpoint.endpoint"
                                            :value="endpoint.itemtype">{{ endpoint.french_translation }}</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Nom--N° de série</label>
                                    <select v-model="element.name" class="form-input">
                                        <option value="">-- Choisir --</option>

                                        <option v-for="el in element.availableElements" :key="el.id" :value="el.id">
                                            {{ el.name }} -- {{ el.serialNumber }}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div class="mt-2 flex justify-end">
                                <button type="button" class="btn-danger" @click="removeElement(index)">
                                    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
                                        <path d="M6 7H18" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" />
                                        <path d="M9 7V18" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" />
                                        <path d="M15 7V18" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" />
                                        <path d="M10 4H14" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" />
                                        <path d="M7 7L8 20H16L17 7" stroke="currentColor" stroke-width="2"
                                            stroke-linejoin="round" />
                                    </svg>
                                    Supprimer
                                </button>
                            </div>
                        </div>

                        <button type="button" class="btn-secondary" @click="addElement">
                            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
                                <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                                <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                            </svg>
                            Ajouter un élément
                        </button>

                    </div>
                </Accordion>

                <!-- ── Actions ── -->
                <div class="flex justify-end gap-3 pt-2">
                    <button type="button" class="btn-secondary" @click="resetForm">
                        Réinitialiser
                    </button>
                    <button type="submit" class="btn-primary" :disabled="isSubmitting">
                        {{ isSubmitting ? 'Création...' : 'Créer le ticket' }}
                    </button>
                </div>

            </form>
        </div>
    </main>
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

.btn-secondary {
    @apply inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50;
}

.btn-danger {
    @apply inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100;
}
</style>