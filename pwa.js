// js/pwa.js
import { $, showToast } from "./utils.js";

let deferredPrompt = null;
let installed = false;

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function updateInstallButtons() {
  const buttons = [$("#installAppBtnAuth"), $("#installHelpBtn")].filter(Boolean);
  buttons.forEach((button) => {
    if (isStandaloneMode() || installed) {
      button.classList.add("hidden");
    } else {
      button.classList.remove("hidden");
    }
  });
}

function monitorServiceWorkerUpdate(registration) {
  let refreshing = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    showToast("Atualizando o app...");
    window.location.reload();
  });

  function activateWaitingWorker() {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  }

  registration.addEventListener("updatefound", () => {
    const newWorker = registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener("statechange", () => {
      if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
        showToast("Nova versão encontrada. Atualizando...");
        activateWaitingWorker();
      }
    });
  });

  activateWaitingWorker();

  // Procura atualização ao abrir o app e de tempos em tempos.
  registration.update().catch(() => null);
  setInterval(() => registration.update().catch(() => null), 60 * 1000);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      registration.update().catch(() => null);
    }
  });
}

export function initPWA() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" })
      .then((registration) => {
        monitorServiceWorkerUpdate(registration);
      })
      .catch((error) => {
        console.warn("Service Worker não registrado", error);
      });
  }

  updateInstallButtons();

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    updateInstallButtons();
    showToast("Você já pode instalar o App da Cidade no celular.");
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installed = true;
    updateInstallButtons();
    showToast("App instalado com sucesso!");
  });
}

export async function promptInstall() {
  if (isStandaloneMode() || installed) {
    showToast("O app já está instalado neste celular.");
    updateInstallButtons();
    return;
  }

  if (!deferredPrompt) {
    showToast("No Chrome/Android, toque em ⋮ e depois em ‘Adicionar à tela inicial’. No iPhone, toque em Compartilhar e ‘Adicionar à Tela de Início’.");
    return;
  }

  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;

  if (choice.outcome === "accepted") {
    installed = true;
    showToast("Instalação iniciada.");
  } else {
    showToast("Instalação cancelada.");
  }

  updateInstallButtons();
}
