<template>
    <form @submit.prevent="generateForDocs" novalidate>
        <div class="flex flex-col space-y-4">
            <label for="file_input" class="block text-sm font-medium text-gray-900">
                Upload your document
            </label>
            <div class="relative group">
                <div class="flex items-center justify-between border rounded-md p-2 bg-gray-100 transition-colors duration-300 ease-in-out group-hover:border-base-green group-hover:text-base-green"
                    :class="{
                        'border-red-500': errorMessage,
                        'border-gray-300': !errorMessage
                    }">
                    <input id="file_input" type="file" accept=".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt"
                        @change="handleFileChange" :class="{
                            'border-red-500': errorMessage,
                            'border-gray-300': !errorMessage
                        }" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div class="flex items-center space-x-2 w-full">
                        <span class="text-sm text-gray-900 truncate flex-1">{{ fileName || 'No document chosen' }}</span>
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
                Accepted File Type: PDF, Word, Excel, PowerPoint, TXT (MAX&nbsp;SIZE&nbsp;10MB).
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
const errorMessage = ref('');
const isButtonDisabled = ref(true);
const isLoading = ref(false);

// Define the emits
const emit = defineEmits(['qrCodeGenerated']);

// File handler
const handleFileChange = (event) => {
    const file = event.target.files[0];
    errorMessage.value = '';

    if (file) {
        const validTypes = [
            'application/pdf', // PDF
            'application/msword', // Word 97-2003
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word 2007+
            'application/vnd.ms-excel', // Excel 97-2003
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel 2007+
            'application/vnd.ms-powerpoint', // PowerPoint 97-2003
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPoint 2007+
            'text/plain' // TXT
        ];

        const maxSizeMB = 10;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (!validTypes.includes(file.type)) {
            errorMessage.value = 'Please choose a valid document type.';
            isButtonDisabled.value = true;
            return;
        }

        if (file.size > maxSizeBytes) {
            errorMessage.value = 'File exceeds maximum size of 10MB.';
            isButtonDisabled.value = true;
            return;
        }

        fileName.value = file.name;
        isButtonDisabled.value = false;
    } else {
        clearSelection();
    }
};

// Clear selected file
const clearSelection = () => {
    const fileInput = document.getElementById('file_input');
    if (fileInput) {
        fileInput.value = '';
    }
    fileName.value = '';
    errorMessage.value = '';
    isButtonDisabled.value = true;
};

// Generate Logic
const generateForDocs = async (event) => {
    event.preventDefault();
    isLoading.value = true;

    if (fileName.value && !errorMessage.value) {
        try {
            // Handle document upload and QR code generation
            const fileInput = document.getElementById('file_input');
            const file = fileInput.files[0];
            if (!file) {
                throw new Error("No file selected.");
            }

            // Upload document to Firebase Storage
            const storageReference = storageRef(storage, `documents/${fileName.value}`);
            const snapshot = await uploadBytes(storageReference, file);

            // Get download URL of the uploaded document
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
            console.error("Error uploading document to Firebase", error);
            alert("Failed to upload document and generate QR Code.");
        } finally {
            isLoading.value = false;
        }
    } else {
        alert("Failed to generate QR Code. Please ensure the document is valid and under 10MB.");
        isLoading.value = false;
    }
};
</script>

<style scoped>
.qrCodeImg {
    width: 100%;
    height: auto;
}</style>