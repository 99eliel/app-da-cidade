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
import { $, sanitize, initials, fileExt, showToast, openModal, closeModal } from "./utils.js";
import { logout } from "./auth.js";

export function initProfile() {
  setupProfileForm();
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

  const name = profile.businessName || profile.name || "Usuário";
  const avatarUrl = profile.logoURL || profile.photoURL;
  const avatarHtml = avatarUrl
    ? `<img class="avatar" src="${sanitize(avatarUrl)}" alt="Foto de ${sanitize(name)}">`
    : `<div class="avatar">${sanitize(initials(name))}</div>`;

  summary.innerHTML = `
    ${avatarHtml}
    <div>
      <h2>${sanitize(name)}</h2>
      <p>@${sanitize(profile.username || "usuario")} • ${profile.accountType === "empresa" ? "Empresa" : "Pessoa física"}</p>
    </div>
  `;

  actions.innerHTML = `
    ${profile.accountType === "empresa" ? `
      <button class="action-card business-highlight" id="myBusinessBtn">
        <div><strong>Minha Empresa</strong><p>Atualize WhatsApp, categoria, logo, banner e dados públicos.</p></div>
        <span>→</span>
      </button>` : ``}
    <button class="action-card" id="editProfileBtn">
      <div><strong>Editar perfil</strong><p>Atualize nome, foto e informações.</p></div>
      <span>→</span>
    </button>
    <button class="action-card" id="installHelpBtn">
      <div><strong>Instalar no celular</strong><p>Use como aplicativo pela tela inicial.</p></div>
      <span>＋</span>
    </button>
    <button class="danger-btn" id="logoutBtn">Sair da conta</button>
  `;

  $("#editProfileBtn")?.addEventListener("click", openEditProfile);
  $("#myBusinessBtn")?.addEventListener("click", openEditProfile);
  $("#logoutBtn")?.addEventListener("click", logout);
  $("#installHelpBtn")?.addEventListener("click", () => showToast("No Chrome/Android, toque em ⋮ e depois em ‘Adicionar à tela inicial’."));
}

function openEditProfile() {
  const profile = state.currentProfile;
  if (!profile) return;
  const form = $("#profileForm");
  form.name.value = profile.name || profile.businessName || "";
  form.username.value = profile.username || "";
  const businessFields = $("#businessProfileFields");
  businessFields.classList.toggle("hidden", profile.accountType !== "empresa");

  if (profile.accountType === "empresa") {
    form.businessName.value = profile.businessName || profile.name || "";
    form.category.value = profile.category || "";
    form.whatsapp.value = profile.whatsapp || "";
    form.instagram.value = profile.instagram || "";
    form.address.value = profile.address || "Pontalina, GO";
    form.description.value = profile.description || "";
    form.isOnlineStore.checked = Boolean(profile.isOnlineStore);
    form.isOpen.checked = profile.isOpen !== false;
    form.freeDelivery.checked = Boolean(profile.freeDelivery);
    form.hasPromotion.checked = Boolean(profile.hasPromotion);
  }

  openModal("editProfileModal");
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

      if (profile.accountType === "empresa") {
        Object.assign(update, {
          businessName: String(data.get("businessName") || data.get("name") || "").trim(),
          category: String(data.get("category") || "Serviços").trim(),
          whatsapp: String(data.get("whatsapp") || "").trim(),
          instagram: String(data.get("instagram") || "").trim(),
          address: String(data.get("address") || "Pontalina, GO").trim(),
          description: String(data.get("description") || "").trim(),
          isOnlineStore: Boolean(data.get("isOnlineStore")),
          isOpen: Boolean(data.get("isOpen")),
          freeDelivery: Boolean(data.get("freeDelivery")),
          hasPromotion: Boolean(data.get("hasPromotion"))
        });

        const logo = data.get("logo");
        if (logo && logo.size > 0) {
          update.logoURL = await uploadUserFile(logo, `users/${state.currentUser.uid}/logo/logo.${fileExt(logo)}`);
        }

        const banner = data.get("banner");
        if (banner && banner.size > 0) {
          update.bannerURL = await uploadUserFile(banner, `users/${state.currentUser.uid}/banner/banner.${fileExt(banner)}`);
        }
      }

      await updateDoc(doc(db, "users", state.currentUser.uid), update);
      state.currentProfile = { ...state.currentProfile, ...update };
      closeModal("editProfileModal");
      showToast("Perfil atualizado!");
      renderProfile();
      form.reset();
    } catch (error) {
      console.error(error);
      feedback.textContent = "Erro ao salvar. Confira as regras do Firestore/Storage.";
    }
  });
}

async function uploadUserFile(file, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type || "image/jpeg" });
  return getDownloadURL(storageRef);
}
