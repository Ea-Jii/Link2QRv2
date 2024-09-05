<template>
    <form @submit.prevent="generateQrWifi" novalidate>
        <div class="flex flex-col space-y-4">
            <label for="wifi-input" class="text-sm font-medium text-gray-800">Enter Wi-Fi Details</label>
            
            <!-- Network Name (SSID) Input -->
            <input id="wifi-input" v-model="networkName" type="text" placeholder="Network name (SSID)"
                class="w-full border outline-none text-md rounded-md p-2" :class="{
                    'border-red-500': errorMessage,
                    'border-gray-200': !errorMessage
                }" />

            <!-- Password Input with Show/Hide Password Button -->
            <div class="relative w-full">
                <!-- Password Input -->
                <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Password"
                    class="w-full border outline-none text-md rounded-md p-2 pr-10" :class="{
                        'border-red-500': errorMessage,
                        'border-gray-200': !errorMessage
                    }" />
                <!-- Toggle Visibility Button -->
                <button type="button" @click="togglePasswordVisibility"
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none">
                    <!-- Icon for showing and hiding password -->
                    <IconEye stroke={2} width="24" height="24" v-if="showPassword" />
                    <IconEyeClosed stroke={2} width="24" height="24" v-else />
                </button>
            </div>


            <div class="w-full flex flex-col md:flex-row items-center md:justify-evenly">

                <!-- Security Type Selector -->
                <div class="flex items-center space-x-2">
                    <label for="security-type" class="text-sm font-medium text-gray-800">Security Type</label>
                    <div class="relative">
                        <select id="security-type" v-model="securityType"
                            class="appearance-none border rounded-md p-2 pl-3 pr-8 bg-white text-gray-600 focus:outline-none">
                            <option value="WPA">WPA</option>
                            <option value="WPA2">WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="">None</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Hidden Network Checkbox -->
                <div class="flex items-center space-x-2">
                    <input id="hidden-network" type="checkbox" v-model="isHiddenNetwork"
                        class="h-4 w-4 border-gray-300 rounded" />
                    <label for="hidden-network" class="text-sm font-medium text-gray-800">Hidden Network</label>
                </div>
            </div>

            <!-- Error Message Display -->
            <span v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</span>

            <!-- Generate QR Button Component -->
            <BtnGenerate :disabled="!isFormValid" :isLoading="isLoading" />
        </div>
    </form>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue';
import BtnGenerate from './GenerateButton.vue';
import QRCode from 'qrcode-generator';
import { togglePlaceholder } from '../utils';
import { IconEye, IconEyeClosed } from '@tabler/icons-vue';

// Define emit
const emit = defineEmits(['qrCodeGenerated']);

// Reactive variables
const networkName = ref('');
const password = ref('');
const securityType = ref('WPA');
const isHiddenNetwork = ref(false);
const errorMessage = ref('');
const isLoading = ref(false);
const hasQRCode = ref(false);

const showPassword = ref(false);
const isFormValid = computed(() => networkName.value && password.value);

// Generate QR Code
function generateQrWifi(event) {
    event.preventDefault();
    isLoading.value = true;

    if (!networkName.value || !password.value) {
        errorMessage.value = 'Please fill out all fields';
        isLoading.value = false;
        return;
    }

    errorMessage.value = '';

    const qrData = `WIFI:S:${networkName.value};T:${securityType.value};P:${password.value};H:${isHiddenNetwork.value};`;

    try {
        const qrCodeContainer = document.getElementById('qrcode');
        qrCodeContainer.innerHTML = '';

        const qr = QRCode(0, 'L');
        qr.addData(qrData);
        qr.make();

        const qrCodeImg = qr.createImgTag(6);

        qrCodeContainer.innerHTML = qrCodeImg;

        hasQRCode.value = true;
        updatePlaceholder();
        emit('qrCodeGenerated', true);
    } catch (error) {
        errorMessage.value = 'Failed to generate QR code. Please try again.';
        console.error(error);
        emit('qrCodeGenerated', false);
    } finally {
        isLoading.value = false;
    }
}

// Toggle visibility
function togglePasswordVisibility() {
    showPassword.value = !showPassword.value;
}

// Update placeholder visibility
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
