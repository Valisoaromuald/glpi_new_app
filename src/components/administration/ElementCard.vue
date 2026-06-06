<script setup lang="ts">

defineProps < {
    icon: string   // Peut être : "ti ti-key" (classe) OU "<svg>...</svg>" (SVG brut)
    text: string
    count: number
    backgroundColor: string
    isSvg?: boolean  // Si true, on utilise v-html ; si false, on utilise :class
}> ()

</script>

<template>
    <div
        class="relative flex flex-col justify-between w-48 h-32 rounded-2xl p-4 overflow-hidden shadow-lg select-none"
        :style="{ backgroundColor }">

        <!-- Cercle décoratif en fond -->
        <div class="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10 pointer-events-none"/>
        <div class="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />

        <!-- Ligne haute : count + icône -->
        <div class="flex items-start justify-between relative z-10">
            <span class="text-4xl font-bold text-white leading-none">{{ count }}</span>
            
            <!-- CAS 1 : C'est du SVG brut -->
            <div v-if="isSvg" class="text-white/80 [&>svg]:w-6 [&>svg]:h-6" v-html="icon" />
            
            <!-- CAS 2 : C'est une classe d'icône (FontAwesome, Tabler, etc.) -->
            <i v-else :class="icon" class="text-2xl text-white/80" aria-hidden="true" />
        </div>

        <!-- Label en bas -->
        <div class="relative z-10">
            <span class="text-sm font-medium text-white/90 tracking-wide">{{ text }}</span>
        </div>

    </div>
</template>