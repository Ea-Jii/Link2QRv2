<template>
    <form @submit.prevent="generateForImage" novalidate>
        <div class="flex flex-col space-y-4">
            <label for="file_input" class="block text-sm font-medium text-gray-900">
                Upload Image
            </label>
            <div class="relative group">
                <div class="flex items-center justify-between border rounded-md p-2 bg-gray-100 transition-colors duration-300 ease-in-out group-hover:border-base-green group-hover:text-base-green"
                    :class="{
                        'border-red-500': errorMessage,
                        'border-gray-300': !errorMessage
                    }">
                    <input id="file_input" type="file" accept="image/*" @change="handleFileChange" :class="{
                        'border-red-500': errorMessage,
                        'border-gray-300': !errorMessage
                    }" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div class="flex items-center space-x-2 w-full">
                        <div v-if="imagePreview" class="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                            <img :src="imagePreview" alt="Image preview" class="w-full h-full object-cover" />
                        </div>
                        <span class="text-sm text-gray-900 truncate flex-1">{{ fileName || 'No image chosen' }}</span>
                        <button type="button"
                            class="flex items-center justify-center p-1 text-red-500 hover:bg-red-100 rounded-md relative z-10"
                            v-if="fileName" @click="clearSelection">
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <span v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</span>
            <p class="mt-1 text-sm text-gray-500" id="file_input_help">
                SVG, PNG, JPG, or GIF (MAX SIZE 2MB).
            </p>
            <BtnGenerate :disabled="isButtonDisabled" :isLoading="isLoading" />
        </div>
    </form>
</template>

<script setup>
import { ref } from 'vue';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase'; 
import BtnGenerate from './GenerateButton.vue'; 
import QRCode from 'qrcode-generator'; 

// Reactive variables
const fileName = ref('');
const imagePreview = ref('');
const errorMessage = ref('');
const isButtonDisabled = ref(true);
const isLoading = ref(false);
const hasQRCode = ref(false);

// Define the emits
const emit = defineEmits(['qrCodeGenerated']);

// File handler
const handleFileChange = (event) => {
    const file = event.target.files[0];
    errorMessage.value = '';

    if (file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            errorMessage.value = 'Please choose a valid image type.';
            isButtonDisabled.value = true;
            return;
        }

        const maxSizeMB = 2;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            errorMessage.value = 'File exceeds maximum size of 2MB.';
            isButtonDisabled.value = true;
            return;
        }

        fileName.value = file.name;
        isButtonDisabled.value = false;

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        clearSelection();
    }
};

// Clear selected image
const clearSelection = () => {
    const fileInput = document.getElementById('file_input');
    if (fileInput) {
        fileInput.value = '';
    }
    fileName.value = '';
    imagePreview.value = '';
    errorMessage.value = '';
    isButtonDisabled.value = true;
};

// Generate Logic
const generateForImage = async (event) => {
    event.preventDefault();
    isLoading.value = true;

    if (fileName.value && imagePreview.value && !errorMessage.value) {
        try {
            // Upload image to Firebase Storage
            const storageReference = storageRef(storage, `images/${fileName.value}`);
            const response = await fetch(imagePreview.value);
            const blob = await response.blob();
            const snapshot = await uploadBytes(storageReference, blob);

            // Get download URL of the uploaded image
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Generate QR code directly from the download URL
            const qrCodeContainer = document.getElementById('qrcode');
            if (qrCodeContainer) {
                qrCodeContainer.innerHTML = ''; 
                const qr = QRCode(0, 'L'); 
                qr.addData(downloadURL); 
                qr.make();

                const qrCodeImg = qr.createImgTag(6); 

                qrCodeContainer.innerHTML = qrCodeImg; 
                emit('qrCodeGenerated', { downloadURL }); 
            } else {
                console.error('QR Code container not found.');
            }
        } catch (error) {
            console.error("Error uploading image to Firebase", error);
            alert("Failed to upload image and generate QR Code.");
        } finally {
            isLoading.value = false;
        }
    } else {
        alert("Failed to generate QR Code. Please ensure the image is valid and under 2MB.");
        isLoading.value = false;
    }
};


</script>

<style scoped>
.qrCodeImg {
    width: 100%;
    height: auto;
}
</style>