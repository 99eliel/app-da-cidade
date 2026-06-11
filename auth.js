// js/auth.js

import {
  auth,
  db,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "./firebase.js";

import { state } from "./state.js";
import { $, normalizeUsername, showToast, closeModal } from "./utils.js";
import { renderProfile } from "./profile.js";
import { renderPosts } from "./posts.js";
import { renderBusinesses, renderOnlineBusinesses } from "./businesses.js";

function lockAppForLogin() {
  document.body.classList.remove("app-unlocked");
  document.body.classList.add("auth-locked");
  document.body.classList.add("auth-required");
  lockAppForLogin();
}

function unlockAppAfterLogin() {
  document.body.classList.remove("auth-locked");
  document.body.classList.remove("auth-required");
  document.body.classList.add("app-unlocked");
  document.getElementById("authModal")?.classList.add("hidden");
}

export function initAuth() {
  setupAuthForms();

  onAuthStateChanged(auth, async (user) => {
    state.currentUser = user;

    if (!user) {
      state.currentProfile = null;
      lockAppForLogin();
      renderProfile();
      renderPosts();
      renderBusinesses();
      renderOnlineBusinesses();
      return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));
    state.currentProfile = snap.exists() ? { id: snap.id, ...snap.data() } : null;
    unlockAppAfterLogin();
    renderProfile();
    renderPosts();
    renderBusinesses();
    renderOnlineBusinesses();
  });
}

function setupAuthForms() {
  const loginForm = $("#loginForm");
  const registerForm = $("#registerForm");
  const accountType = $("#registerAccountType");
  const extra = $("#registerBusinessFields");
  const feedback = $("#authFeedback");

  document.querySelectorAll("[data-auth-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-auth-mode]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const mode = btn.dataset.authMode;
      loginForm.classList.toggle("hidden", mode !== "login");
      registerForm.classList.toggle("hidden", mode !== "register");
      feedback.textContent = "";
    });
  });

  accountType?.addEventListener("change", () => {
    extra.classList.toggle("hidden", accountType.value !== "empresa");
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "";
    const data = new FormData(loginForm);
    try {
      await signInWithEmailAndPassword(auth, data.get("email"), data.get("password"));
      showToast("Login realizado com sucesso!");
      loginForm.reset();
    } catch (error) {
      feedback.textContent = getAuthError(error);
    }
  });

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "";
    const data = new FormData(registerForm);
    const type = data.get("accountType");
    const name = String(data.get("name") || "").trim();
    const username = normalizeUsername(data.get("username"));

    if (!username) {
      feedback.textContent = "Digite um @usuário válido.";
      return;
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, data.get("email"), data.get("password"));
      await updateProfile(credential.user, { displayName: name });

      const baseProfile = {
        uid: credential.user.uid,
        accountType: type,
        name,
        username,
        email: data.get("email"),
        photoURL: "",
        city: "Pontalina",
        state: "GO",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const businessProfile = type === "empresa" ? {
        businessName: name,
        category: data.get("category") || "Serviços",
        whatsapp: data.get("whatsapp") || "",
        instagram: "",
        businessLink: data.get("businessLink") || "",
        menuPdfURL: "",
        services: [],
        address: "Pontalina, GO",
        description: "",
        logoURL: "",
        bannerURL: "",
        isOnlineStore: ["Alimentação", "Lanches", "Restaurantes", "Açaí", "Mercado", "Padaria", "Açougue", "Hortifruti", "Bebidas", "Farmácia"].includes(data.get("category")),
        isOpen: true,
        hasPromotion: false,
        freeDelivery: false,
        deliveryTags: [],
        businessHours: {
          mon: { open: "08:00", close: "18:00", closed: false },
          tue: { open: "08:00", close: "18:00", closed: false },
          wed: { open: "08:00", close: "18:00", closed: false },
          thu: { open: "08:00", close: "18:00", closed: false },
          fri: { open: "08:00", close: "18:00", closed: false },
          sat: { open: "08:00", close: "12:00", closed: false },
          sun: { open: "", close: "", closed: true }
        }
      } : {};

      await setDoc(doc(db, "users", credential.user.uid), { ...baseProfile, ...businessProfile });
      showToast("Conta criada com sucesso!");
      registerForm.reset();
      extra.classList.add("hidden");
    } catch (error) {
      feedback.textContent = getAuthError(error);
    }
  });
}

export async function logout() {
  await signOut(auth);
  showToast("Você saiu da conta.");
}

export function requireLogin(message = "Entre para continuar.") {
  if (!state.currentUser) {
    showToast(message);
    lockAppForLogin();
    return false;
  }
  return true;
}

function getAuthError(error) {
  const code = error?.code || "";
  if (code.includes("email-already-in-use")) return "Este email já está em uso.";
  if (code.includes("invalid-email")) return "Email inválido.";
  if (code.includes("weak-password")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "Email ou senha incorretos.";
  if (code.includes("network-request-failed")) return "Falha de conexão. Verifique sua internet.";
  return "Não foi possível concluir. Verifique os dados e tente novamente.";
}
