<script lang="ts" setup>
import Table from '@/components/common/table/backOffice/Table.vue';
import { useAxiosInterceptor } from '@/composables/useAxiosInterceptor';
import type { User } from '@/types/administration/user/user';
import { onMounted, ref } from 'vue';
const { apiGLPI } = useAxiosInterceptor();
const users = ref<Partial<User>[]>([])
const loadUsers = async () => {
  try {
    // Plus besoin de spécifier l'URL complète ni les Headers d'autorisation !
    // L'intercepteur s'occupe de tout (URL de base, Token, et Refresh si besoin)
    const response = await apiGLPI.get('/Administration/User');

    for(let datum of response.data){
      const userObject : Partial<User>= {
        username: datum.username,
        firstname: datum.firstname,
        emails :datum.emails,
        phone: datum.phone,
        location: datum.location,
        is_active : datum.is_active
      }
      users.value.push(userObject)
    }
  } catch (error) {
    console.error("Impossible de charger les utilisateurs", error);
  }
};
onMounted(() => {
  loadUsers()
})
</script>

<template>
  <section class="container px-4 mx-auto">
    <Table :data="users" :columnNames="['IDENTIFIANT','NOM DE FAMILLE','E-MAILS','TELEPHONE','LIEU','	ACTIVE']"/>

    <div class="mt-6 sm:flex sm:items-center sm:justify-between ">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        Page <span class="font-medium text-gray-950 ">1 of 10</span>
      </div>
    </div>
  </section>
</template>