<script setup lang="ts">

defineProps < {
    text: string
    count: number
    
}> ()

</script>

<template>
    <div
        class="bg-gray-50 relative flex flex-col justify-between w-40 h-32 rounded-2xl p-4 overflow-hidden shadow-lg select-none">

        <!-- Cercle décoratif en fond -->
        <div class="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10 pointer-events-none"/>
        <div class="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />

        <!-- Ligne haute : count -->
        <div class="flex items-start justify-center relative z-10">
            <span class="text-4xl font-bold text-black leading-none">{{ count }}</span>
        </div>

        <!-- Label en bas -->
        <div class="relative z-10">
            <span class="text-sm font-medium text-black tracking-wide">{{ text }}</span>
        </div>

    </div>
</template>