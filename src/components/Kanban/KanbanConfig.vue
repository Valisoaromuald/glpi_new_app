<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-xl font-semibold text-gray-800 mb-6">
      Configuration du Kanban
    </h1>

    <div v-if="loading" class="text-gray-500">Chargement...</div>

    <div v-else class="space-y-4">
      <div v-for="col in columns" :key="col.status_id" class="flex items-center gap-4 p-4 rounded-xl shadow border"
        :style="{ backgroundColor: col.color }">
        <!-- Aperçu / sélecteur de couleur -->
        <div class="flex flex-col items-center gap-1">
          <input type="color" v-model="col.color" class="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" />
          <span class="text-xs text-gray-600">{{ col.color }}</span>
        </div>

        <!-- Infos du statut -->
        <div class="flex-1">
          <p class="font-medium text-gray-800">{{ col.label }}</p>
          <label class="block text-sm text-gray-600 mt-1">
            Nom en malgache
          </label>
          <input v-model="col.label_mg" type="text" placeholder="ex: Vaovao"
            class="w-full border rounded-lg px-3 py-1.5 mt-1 bg-white" />
        </div>
      </div>

      <!-- Message de confirmation -->
      <p v-if="saved" class="text-green-600 text-sm">
        Modifications enregistrées avec succès.
      </p>
      <p v-if="error" class="text-red-600 text-sm">
        Une erreur est survenue lors de l'enregistrement.
      </p>
      <div class="flex justify-end">
        <button @click="saveAll" :disabled="saving"
          class="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import NewAppApi from '@/api/newAppApi';
import type { KanbanConfigRow, UpdateKanbanConfigInput } from 'shared-types';

const api = new NewAppApi();

const columns = ref<Partial<KanbanConfigRow>[]>([]);
const loading = ref(true);
const saving = ref(false);
const saved = ref(false);
const error = ref(false);

const fetchConfig = async (): Promise<void> => {
  loading.value = true;
  try {
    const res = await api.get<Partial<KanbanConfigRow>[]>('/kanban-config');
    columns.value = res.data;
  } catch (err) {
    console.error('Erreur fetchConfig:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};



const saveAll = async (): Promise<void> => {
  saving.value = true;
  saved.value = false;
  error.value = false;
  try {
    await Promise.all(
      columns.value.map((col) =>
        api.put<{ success: boolean }>(
          `/kanban-config/${col.status_id}`,
          {
            color: col.color ?? "",
            label_mg: col.label_mg ?? ""
          }
        )
      )
    );
    saved.value = true;
    setTimeout(() => (saved.value = false), 3000);
  } catch (err) {
    console.error('Erreur saveAll:', err);
    error.value = true;
  } finally {
    saving.value = false;
  }
};

onMounted(fetchConfig);
</script>