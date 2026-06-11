// js/pwa.js
import { showToast } from "./utils.js";

let deferredPrompt = null;

export function initPWA() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.warn("Service Worker não registrado", error);
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    showToast("Você já pode instalar o App da Cidade no celular.");
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    showToast("App instalado com sucesso!");
  });
}

export async function promptInstall() {
  if (!deferredPrompt) {
    showToast("Use o menu do navegador e toque em ‘Adicionar à tela inicial’." );
    return;
  }
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
}
