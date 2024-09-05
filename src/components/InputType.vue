<script setup>
import { defineEmits } from 'vue';

const emit = defineEmits();

const handleClick = (event) => {
    emit('click', event); 
};
</script>

<template>
    <div class="w-full flex items-center justify-center border rounded-md text-sm md:text-md py-1 md:p-2 hover:border-base-green hover:text-base-green"
        @click="handleClick">
        <slot></slot>
    </div>
</template>
