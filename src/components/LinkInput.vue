<template>
    <form @submit.prevent="generateQrLink" novalidate>
        <div class="flex flex-col space-y-4">
            <label for="link-input" class="text-sm font-medium text-gray-800">Enter URL</label>
            <input id="link-input" v-model="url" type="url" placeholder="http://www.example.com"
                class="w-full border outline-none text-md rounded-md p-2" :class="{
                    'border-red-500': errorMessage,
                    'border-gray-200': !errorMessage
                }" />
            <span v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</span>
            <BtnGenerate :disabled="isButtonDisabled" :isLoading="isLoading" />
        </div>
    </form>
</template>

<script setup>
import { ref, watch, defineEmits } from 'vue';
import BtnGenerate from './GenerateButton.vue';
import { togglePlaceholder } from '../utils';
import QRCode from 'qrcode-generator';

// Define the emits
const emit = defineEmits(['qrCodeGenerated']);

// Reactive state variables
const url = ref('');
const errorMessage = ref('');
const isButtonDisabled = ref(true);
const hasQRCode = ref(false);
const isLoading = ref(false);

// URL validator
const isValidUrl = (value) => {
    try {
        new URL(value);
        return true;
    } catch (error) {
        return false;
    }
};

// Function to validate URL and update state
const validateURL = () => {
    const trimmedUrl = url.value.trim();

    if (trimmedUrl === '') {
        errorMessage.value = '';
        isButtonDisabled.value = true;
    } else if (!isValidUrl(trimmedUrl)) {
        errorMessage.value = 'Please enter a valid URL.';
        isButtonDisabled.value = true;
    } else {
        errorMessage.value = '';
        isButtonDisabled.value = false;
    }
};

// Watch for changes in the URL input
watch(url, validateURL);

// Function to generate QR code from URL
const generateQrLink = (event) => {
    event.preventDefault();
    isLoading.value = true;

    const linkInput = url.value.trim();

    if (isValidUrl(linkInput)) {
        const qrCodeContainer = document.getElementById('qrcode');
        qrCodeContainer.innerHTML = '';

        const qr = QRCode(4, 'L'); // Version 4, low error correction
        qr.addData(linkInput);
        qr.make();

        const qrCodeImg = qr.createImgTag(6); // 6 is the scale factor for QR code size

        qrCodeContainer.innerHTML = qrCodeImg;

        hasQRCode.value = true;
        updatePlaceholder();
        emit('qrCodeGenerated', true);
    } else {
        alert("Failed to generate QR Code.");
        emit('qrCodeGenerated', false);
    }

    isLoading.value = false;
};



// Placeholder
const updatePlaceholder = () => {
    togglePlaceholder(hasQRCode.value);
}
</script>


<style scoped>
.qrCodeImg {
    width: 100%;
    height: auto;
}
</style>