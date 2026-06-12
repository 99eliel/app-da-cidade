// js/profile.js

import {
  db,
  storage,
  doc,
  updateDoc,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL
} from "./firebase.js";

import { state } from "./state.js";
import { promptInstall } from "./pwa.js";
import { $, sanitize, initials, fileExt, showToast, openModal, closeModal } from "./utils.js";
import { logout } from "./auth.js";

let editingBusinessMode = false;

export function initProfile() {
  setupProfileForm();
  setupServicesBuilder();
}

export function renderProfile() {
  const summary = $("#profileSummary");
  const actions = $("#profileActions");
  if (!summary || !actions) return;

  const profile = state.currentProfile;

  if (!state.currentUser || !profile) {
    summary.innerHTML = `
      <div class="avatar">👤</div>
      <div>
        <h2>Você ainda não entrou</h2>
        <p>Entre para postar no mural ou cadastrar sua empresa.</p>
      </div>
    `;
    actions.innerHTML = `
      <button class="action-card" id="profileLoginAction">
        <div><strong>Entrar ou criar conta</strong><p>Acesse sua conta grátis.</p></div>
        <span>→</span>
      </button>
    `;
    $("#profileLoginAction")?.addEventListener("click", () => openModal("authModal"));
    return;
  }

  const name = profile.name || "Usuário";
  const avatarUrl = profile.photoURL || profile.logoURL;
  const avatarHtml = avatarUrl
    ? `<img class="avatar" src="${sanitize(avatarUrl)}" alt="Foto de ${sanitize(name)}">`
    : `<div class="avatar">${sanitize(initials(name))}</div>`;

  summary.innerHTML = `
    ${avatarHtml}
    <div>
      <h2>${sanitize(name)}</h2>
      <p>@${sanitize(profile.username || "usuario")} • Pessoa física${profile.hasBusiness || profile.accountType === "empresa" ? " + empresa" : ""}</p>
      ${profile.hasBusiness || profile.accountType === "empresa" ? `<small class="business-mini-line">${sanitize(profile.businessName || "Empresa cadastrada")}</small>` : ""}
    </div>
  `;

  const hasBusiness = Boolean(profile.hasBusiness || profile.accountType === "empresa");

  actions.innerHTML = `
    <button class="action-card" id="editProfileBtn">
      <div><strong>Meu perfil</strong><p>Atualize nome, @usuário e foto pessoal.</p></div>
      <span>→</span>
    </button>
    <button class="action-card business-highlight" id="myBusinessBtn">
      <div><strong>${hasBusiness ? "Minha Empresa" : "+ Cadastrar minha empresa"}</strong><p>${hasBusiness ? "Atualize WhatsApp, categoria, logo, banner e dados públicos." : "Use o mesmo login para aparecer no Guia Comercial."}</p></div>
      <span>→</span>
    </button>
    <button class="action-card" id="installHelpBtn">
      <div><strong>Instalar no celular</strong><p>Use como aplicativo pela tela inicial.</p></div>
      <span>＋</span>
    </button>
    <button class="danger-btn" id="logoutBtn">Sair da conta</button>
  `;

  $("#editProfileBtn")?.addEventListener("click", () => openEditProfile(false));
  $("#myBusinessBtn")?.addEventListener("click", () => openEditProfile(true));
  $("#logoutBtn")?.addEventListener("click", logout);
  $("#installHelpBtn")?.addEventListener("click", promptInstall);
}

function openEditProfile(editBusiness = false) {
  const profile = state.currentProfile;
  if (!profile) return;

  editingBusinessMode = Boolean(editBusiness);

  const form = $("#profileForm");
  form.name.value = profile.name || "";
  form.username.value = profile.username || "";

  const businessFields = $("#businessProfileFields");
  businessFields.classList.toggle("hidden", !editingBusinessMode);

  if (editingBusinessMode) {
    form.businessName.value = profile.businessName || "";
    form.category.value = profile.category || "Serviços";
    form.whatsapp.value = profile.whatsapp || "";
    form.instagram.value = profile.instagram || "";
    form.address.value = profile.address || "Pontalina, GO";
    form.description.value = profile.description || "";
    setServiceFields(Array.isArray(profile.services) ? profile.services : []);
    form.servicesText.value = Array.isArray(profile.services) ? profile.services.join("\n") : "";
    form.businessLink.value = profile.businessLink || "";
    form.isOnlineStore.checked = Boolean(profile.isOnlineStore);
    form.isOpen.checked = profile.isOpen !== false;
    form.freeDelivery.checked = Boolean(profile.freeDelivery);
    form.hasPromotion.checked = Boolean(profile.hasPromotion);
    setBusinessHoursFields(profile.businessHours || defaultBusinessHours());
  }

  openModal("editProfileModal");
}

function defaultBusinessHours() {
  return {
    mon: { open: "08:00", close: "18:00", closed: false },
    tue: { open: "08:00", close: "18:00", closed: false },
    wed: { open: "08:00", close: "18:00", closed: false },
    thu: { open: "08:00", close: "18:00", closed: false },
    fri: { open: "08:00", close: "18:00", closed: false },
    sat: { open: "08:00", close: "12:00", closed: false },
    sun: { open: "", close: "", closed: true }
  };
}


function setupServicesBuilder() {
  const addBtn = $("#addServiceBtn");
  if (!addBtn) return;

  addBtn.addEventListener("click", () => addServiceField(""));
}

function setServiceFields(services = []) {
  const box = $("#servicesFields");
  if (!box) return;
  box.innerHTML = "";

  const validServices = services.map(item => String(item || "").trim()).filter(Boolean);
  if (!validServices.length) {
    addServiceField("");
    return;
  }

  validServices.forEach(service => addServiceField(service));
  syncServicesHiddenInput();
}

function addServiceField(value = "") {
  const box = $("#servicesFields");
  if (!box) return;

  const row = document.createElement("div");
  row.className = "service-field-row";
  row.innerHTML = `
    <input type="text" class="service-field-input" value="${sanitize(value)}" placeholder="Ex: Padaria, Açougue, Pintura, Entrega" />
    <button type="button" class="remove-service-btn" aria-label="Remover serviço">×</button>
  `;

  row.querySelector(".service-field-input").addEventListener("input", syncServicesHiddenInput);
  row.querySelector(".remove-service-btn").addEventListener("click", () => {
    row.remove();
    if (!box.querySelector(".service-field-row")) addServiceField("");
    syncServicesHiddenInput();
  });

  box.appendChild(row);
  syncServicesHiddenInput();
}

function getServiceFieldsValues() {
  const fields = Array.from(document.querySelectorAll("#servicesFields .service-field-input"));
  const seen = new Set();

  return fields
    .map(field => field.value.trim())
    .filter(Boolean)
    .filter(service => {
      const key = service.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function syncServicesHiddenInput() {
  const hidden = $("#servicesTextHidden");
  if (!hidden) return;
  hidden.value = getServiceFieldsValues().join("\n");
}

const BUSINESS_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function setBusinessHoursFields(hours = {}) {
  BUSINESS_DAYS.forEach((day) => {
    const open = document.querySelector(`[name="hours_${day}_open"]`);
    const close = document.querySelector(`[name="hours_${day}_close"]`);
    const closed = document.querySelector(`[name="hours_${day}_closed"]`);
    const data = hours?.[day] || {};
    if (open) open.value = data.open || "";
    if (close) close.value = data.close || "";
    if (closed) closed.checked = Boolean(data.closed);
  });
}

function getBusinessHoursFromForm(form) {
  const hours = {};
  BUSINESS_DAYS.forEach((day) => {
    hours[day] = {
      open: form[`hours_${day}_open`]?.value || "",
      close: form[`hours_${day}_close`]?.value || "",
      closed: Boolean(form[`hours_${day}_closed`]?.checked)
    };
  });
  return hours;
}

function setupProfileForm() {
  const form = $("#profileForm");
  const feedback = $("#profileFeedback");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.currentUser || !state.currentProfile) return;

    feedback.textContent = "";
    feedback.classList.remove("ok");
    syncServicesHiddenInput();
    const data = new FormData(form);
    const profile = state.currentProfile;

    try {
      const update = {
        name: String(data.get("name") || "").trim(),
        username: String(data.get("username") || "").trim().replace(/^@/, ""),
        updatedAt: serverTimestamp()
      };

      const photo = data.get("photo");
      if (photo && photo.size > 0) {
        update.photoURL = await uploadUserFile(photo, `users/${state.currentUser.uid}/profile/profile.${fileExt(photo)}`);
      }

      if (editingBusinessMode) {
        Object.assign(update, {
          accountType: "empresa",
          hasBusiness: true,
          businessName: String(data.get("businessName") || data.get("name") || "").trim(),
          category: String(data.get("category") || "Serviços").trim(),
          whatsapp: String(data.get("whatsapp") || "").trim(),
          instagram: String(data.get("instagram") || "").trim(),
          address: String(data.get("address") || "Pontalina, GO").trim(),
          description: String(data.get("description") || "").trim(),
          services: String(data.get("servicesText") || "").split("\n").map(item => item.trim()).filter(Boolean),
          businessLink: String(data.get("businessLink") || "").trim(),
          isOnlineStore: Boolean(data.get("isOnlineStore")),
          isOpen: Boolean(data.get("isOpen")),
          freeDelivery: Boolean(data.get("freeDelivery")),
          hasPromotion: Boolean(data.get("hasPromotion")),
          businessHours: getBusinessHoursFromForm(form)
        });

        const logo = data.get("logo");
        if (logo && logo.size > 0) {
          update.logoURL = await uploadUserFile(logo, `users/${state.currentUser.uid}/logo/logo.${fileExt(logo)}`);
        }

        const banner = data.get("banner");
        if (banner && banner.size > 0) {
          update.bannerURL = await uploadUserFile(banner, `users/${state.currentUser.uid}/banner/banner.${fileExt(banner)}`);
        }

        const menuPdf = data.get("menuPdf");
        if (menuPdf && menuPdf.size > 0) {
          if (menuPdf.type !== "application/pdf") {
            throw new Error("O cardápio precisa ser um arquivo PDF.");
          }
          update.menuPdfURL = await uploadUserFile(menuPdf, `users/${state.currentUser.uid}/menu/cardapio.${fileExt(menuPdf)}`);
        }
      }

      await updateDoc(doc(db, "users", state.currentUser.uid), update);
      state.currentProfile = { ...state.currentProfile, ...update };
      closeModal("editProfileModal");
      showToast("Perfil atualizado!");
      renderProfile();
      editingBusinessMode = false;
      form.reset();
    } catch (error) {
      console.error(error);
      feedback.textContent = error.message === "O cardápio precisa ser um arquivo PDF." ? error.message : "Erro ao salvar. Confira as regras do Firestore/Storage.";
    }
  });
}

async function uploadUserFile(file, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type || "image/jpeg" });
  return getDownloadURL(storageRef);
}
