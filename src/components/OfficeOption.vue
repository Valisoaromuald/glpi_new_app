<template>
  <a :href="url" class="office-card" :class="`office-card--${variant}`">
    <div class="card-icon">
      <slot name="icon" />
    </div>
    <div class="card-body">
      <p class="card-label">{{ label }}</p>
      <p class="card-desc">{{ description }}</p>
    </div>
    <span class="card-arrow">→</span>
  </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'OfficeOption',
  props: {
    url: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    variant: {
      type: String as () => 'green' | 'blue',
      default: 'blue',
    },
  },
})
</script>

<style scoped>
.office-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 1.5rem 1.25rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
}

.office-card:hover {
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
}

.office-card:active {
  transform: translateY(0);
  box-shadow: none;
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.office-card--green .card-icon {
  background: #eaf3de;
  color: #3b6d11;
}

.office-card--blue .card-icon {
  background: #e6f1fb;
  color: #185fa5;
}

.card-body {
  flex: 1;
}

.card-label {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.card-desc {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.card-arrow {
  font-size: 16px;
  color: #9ca3af;
  align-self: flex-end;
  transition: transform 0.15s ease, color 0.15s ease;
}

.office-card:hover .card-arrow {
  transform: translateX(3px);
  color: #6b7280;
}
</style>
