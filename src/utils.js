// Global variable to store the QR code data URL
let qrCodeDataUrl = null;

// Function to convert QR code into an image and update the global variable
export function convertQRToImage() {
  const qrCodeImage = document.querySelector("#qrcode img");

  if (qrCodeImage) {
    qrCodeDataUrl = qrCodeImage.src;
    return qrCodeDataUrl;
  } else {
    qrCodeDataUrl = null;
    return null;
  }
}

// Function to handle QR code actions
export async function handleQRCodeAction(action) {
  // If dataUrl is not set, attempt to generate it
  if (!qrCodeDataUrl) {
    const dataUrl = convertQRToImage();
    if (!dataUrl) {
      console.error("Failed to generate QR code image.");
      return;
    }
  }

  // Use the shared qrCodeDataUrl
  const dataUrl = qrCodeDataUrl;

  if (action === "download") {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "Generated QR.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (action === "share") {
    let blob;
    try {
      const response = await fetch(dataUrl);
      blob = await response.blob();
    } catch (error) {
      console.error("Error converting dataUrl to Blob:", error);
      return;
    }

    const fileToShare = new File([blob], "qrcode.png", { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
      try {
        await navigator.share({
          files: [fileToShare],
          title: "Share QR",
          text: "Sharing this QR Code",
        });
      } catch (error) {
        console.log("Failed to share", error);
      }
    } else {
      alert("Your system doesn't support sharing these files.");
    }
  }

  if (action === "copy") {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], "qrcode.png", { type: "image/png" });

      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [file.type]: file,
          }),
        ]);
        alert("QR Code copied to clipboard:");
      } else {
        alert("Clipboard API is not supported on your browser.");
      }
    } catch (error) {
      console.error("Failed to copy QR code image to clipboard:", error);
    }
  }
}

// Placeholder
export const togglePlaceholder = (hasQRCode) => {
  const placeholder = document.getElementById("placeholder");

  if (!hasQRCode) {
    placeholder.classList.remove("hidden");
  } else {
    placeholder.classList.add("hidden");
  }
};
