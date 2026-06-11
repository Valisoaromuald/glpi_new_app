<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'
import tinymce from 'tinymce';
import { createTinymceConfig } from '@/utils/tinymceconfig';


interface Props {
  modelValue: string | undefined
  placeholder?: string
}
const Editor = defineAsyncComponent(() => import('@tinymce/tinymce-vue'))
const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Décrivez le ticket...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const content = ref(props.modelValue ?? '')

watch(() => props.modelValue, (val) => {
  if (val !== content.value) content.value = val ?? ''
})

const handleInput = (value: string) => {
  content.value = value
  emit('update:modelValue', value)
}

const tinymceConfig = createTinymceConfig(props.placeholder)
onBeforeUnmount(() => {
  // Détruit l'instance TinyMCE liée à ce composant
  tinymce.remove()
})
</script>

<template>
  <div class="rounded-md overflow-hidden border border-gray-300">
    <Editor v-model="content" :init="tinymceConfig" @update:modelValue="handleInput" />
  </div>
</template>