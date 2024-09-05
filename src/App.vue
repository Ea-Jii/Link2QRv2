<template>
  <div class="min-h-screen flex flex-col items-center bg-green-50">
    <main class="w-full max-w-4xl flex-grow flex items-center justify-center">
      <div
        class="flex flex-col md:flex-row items-center shadow-md rounded-xl p-8 space-y-8 md:space-y-0 md:space-x-8 border m-4 bg-white">
        <div class="flex flex-col w-full md:w-7/12 space-y-6">
          <div class="flex flex-col">
            <h2 class="text-3xl font-bold text-base-green mb-4 text-center md:text-start">How It Works?</h2>
            <p class="text-md text-gray-500 text-center md:text-start">
              Choose your QR code type, fill in the details, and watch the magic unfold.
              Transform your information into an easily accessible format.
            </p>
          </div>

          <!-- Input selector -->
          <div class="flex space-x-1 md:space-x-2">
            <!-- Type: Link -->
            <InputType @click="toggleForm('Link')"
              :class="{ 'text-base-green border-base-green': selectedInput === 'Link' }">
              <IconLink stroke="1.5" width="24" height="24" class="mr-1" />
              Link
            </InputType>
            <!-- Type: Image -->
            <InputType @click="toggleForm('Image')"
            :class="{ 'text-base-green border-base-green': selectedInput === 'Image' }">
              <IconPhoto stroke="1.5" width="20" height="20" class="mr-1" />
              Image
            </InputType>
            <!-- Type: Wifi -->
            <InputType @click="toggleForm('Wifi')"
            :class="{ 'text-base-green border-base-green': selectedInput === 'Wifi' }">
              <IconWifi stroke="2" width="22" height="22" class="mr-1" />
              Wi-Fi
            </InputType>
            <!-- Type: Document -->
            <InputType @click="toggleForm('Document')"
            :class="{ 'text-base-green border-base-green': selectedInput === 'Document' }">
              <IconFiles stroke="1.5" width="22" height="22" class="mr-1" />
              Docs
            </InputType>
          </div>

          <!-- Forms -->
          <div>
            <LinkInput v-if="selectedInput === 'Link'" @qrCodeGenerated="handleQRCodeGeneration" />
            <ImageInput v-if="selectedInput === 'Image'" @qrCodeGenerated="handleQRCodeGeneration" />
            <WifiInput v-if="selectedInput === 'Wifi'" @qrCodeGenerated="handleQRCodeGeneration" />
            <DocumentInput v-if="selectedInput === 'Document'" @qrCodeGenerated="handleQRCodeGeneration" />
          </div>
        </div>

        <!-- QR Code Preview Section -->
        <div class="w-full md:w-5/12 border rounded-lg p-4 md:p-6 flex flex-col items-center space-y-4">
          <h4 :class="{
            'text-md font-semibold spaced-text': true,
            'text-base-green': hasQRCode,
            'text-gray-700': !hasQRCode
          }">{{ previewMessage }}</h4>
          <div :class="qrCodeClasses">
            <div id="qrcode"></div>
            <IconQrcodeOff id="placeholder" v-show="!hasQRCode" stroke="0.5" class="w-64 h-64 md:w-74 md:h-74 text-base-green" />
          </div>

          <div v-if="hasQRCode" class="w-full flex items-center justify-center gap-2 ">
            <p class="text-sm font-semibold text-gray-800">Quick Action:</p>
            <button @click="handleAction('copy')"
              class="text-base-green transition-all duration-300 ease-out transform hover:-translate-y-1">
              <IconCopy stroke="1.5" class="w-6 h-6" />
            </button>

            <button @click="handleAction('share')"
              class="text-base-green transition-all duration-300 ease-out transform hover:-translate-y-1">
              <IconShare stroke="1.5" class="w-6 h-6" />
            </button>

            <button @click="handleAction('download')"
              class="text-base-green transition-all duration-300 ease-out transform hover:-translate-y-1">
              <IconDownload stroke="1.5" class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { IconLink, IconPhoto, IconWifi, IconAlignJustified, IconQrcodeOff, IconDownload, IconShare, IconCopy, IconFiles } from '@tabler/icons-vue';
import { handleQRCodeAction, togglePlaceholder } from './utils';
import InputType from './components/InputType.vue';
import LinkInput from './components/LinkInput.vue';
import ImageInput from './components/ImageInput.vue';
import WifiInput from './components/WifiInput.vue';
import DocumentInput from './components/DocumentInput.vue';

// Set the initial form to link
const selectedInput = ref('Link');

// Reactive state for QR code generation
const hasQRCode = ref(false);

// Computed property for the QR code preview message
const previewMessage = computed(() => {
  return hasQRCode.value
    ? "Here's Your Generated QR Code"
    : "Your QR Code Will Appear Below";
});

// Computed property for QR code container classes
const qrCodeClasses = computed(() => {
  return hasQRCode.value
    ? 'flex items-center justify-center border rounded-lg shadow-sm w-full max-w-sm bg-white'
    : 'flex items-center justify-center border rounded-lg shadow-sm w-full max-w-sm bg-white';
});

// Method to toggle the form
const toggleForm = (inputType) => {
  selectedInput.value = inputType;
  hasQRCode.value = false;

  const qrcode = document.getElementById("qrcode");
  if (qrcode) {
    qrcode.innerHTML = '';
  }
  togglePlaceholder();
};

// Handle QR code generation status
const handleQRCodeGeneration = (status) => {
  hasQRCode.value = status;
};

// Function to handle button actions
const handleAction = async (action) => {
  try {
    await handleQRCodeAction(action);
  } catch (error) {
    console.error(`Failed to handle ${action}:`, error);
  }
};

// Watch the value of hasQRCode
watch( hasQRCode, (newValue) => {
  togglePlaceholder(newValue)
});
</script>
