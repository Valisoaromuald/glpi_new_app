<template>
  <div class="portal-root">

    <div class="portal-wrapper">

      <div class="portal-header">
        <div class="portal-brand">Mon Application GLPI</div>
        <h1 class="portal-title">Choisissez votre portail</h1>
        <p class="portal-subtitle">Accédez à l'espace qui correspond à votre rôle</p>
      </div>

      <div class="portal-cards">
        <OfficeOption
          url="/backoffice/login"
          label="Back Office"
          description="Administration et gestion interne"
          variant="green"
        >
          <template #icon>⚙️</template>
        </OfficeOption>

        <OfficeOption
          url="/frontoffice"
          label="Front Office"
          description="Interface utilisateur et services"
          variant="blue"
        >
          <template #icon>🖥️</template>
        </OfficeOption>
      </div>

    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import OfficeOption from './OfficeOption.vue'

export default defineComponent({
  name: 'PortalSelector',
  components: {
    OfficeOption,
  },
})
</script>

<style scoped>
.portal-root {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.portal-wrapper {
  width: 100%;
  max-width: 480px;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.portal-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.portal-brand {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 4px;
}

.portal-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.portal-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.portal-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  width: 100%;
}

@media (max-width: 400px) {
  .portal-cards {
    grid-template-columns: 1fr;
  }
}
</style>
