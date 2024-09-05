<template>
    <button :disabled="disabled || isLoading" :class="[
        'w-full text-white font-semibold bg-base-green hover:bg-dark-green p-2 rounded-md flex items-center justify-center',
        { 'opacity-50 cursor-not-allowed': disabled || isLoading }
    ]" @click="handleClick">
        <span v-if="isLoading" class="flex items-center">
            <!-- Loading Animation -->
            <div
                class="w-5 h-5 border-4 border-t-4 border-white border-opacity-50 border-t-base-green rounded-full animate-spin mr-3">
            </div>
            <span class="text-sm">Processing...</span>
        </span>
        <span v-else>Generate QR</span>
    </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    disabled: Boolean,
    isLoading: Boolean,
});

// Emit
const emit = defineEmits(['click']);

const handleClick = () => {
    emit('click');
};
</script>