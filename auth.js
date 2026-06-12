// js/auth.js

import {
  auth,
  db,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "./firebase.js";

import { state } from "./state.js";
import { $, normalizeUsername, showToast } from "./utils.js";
import { renderProfile } from "./profile.js";
import { renderPosts } from "./posts.js";
import { renderBusinesses, renderOnlineBusinesses } from "./businesses.js";

function lockAppForLogin() {
  document.body.classList.remove("app-unlocked");
  document.body.classList.add("auth-locked");
  document.body.classList.add("auth-required");
  document.getElementById("authModal")?.classList.remove("hidden");
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
  const resetPasswordForm = $("#resetPasswordForm");
  const feedback = $("#authFeedback");

  setupPasswordToggles();

  document.querySelectorAll("[data-auth-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-auth-mode]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const mode = btn.dataset.authMode;
      loginForm.classList.toggle("hidden", mode !== "login");
      registerForm.classList.toggle("hidden", mode !== "register");
      resetPasswordForm?.classList.add("hidden");
      feedback.textContent = "";
      feedback.classList.remove("ok");
    });
  });

  $("#forgotPasswordBtn")?.addEventListener("click", () => {
    feedback.textContent = "";
    feedback.classList.remove("ok");
    const currentEmail = loginForm?.email?.value?.trim() || "";
    if (resetPasswordForm?.resetEmail && currentEmail) {
      resetPasswordForm.resetEmail.value = currentEmail;
    }
    loginForm?.classList.add("hidden");
    registerForm?.classList.add("hidden");
    resetPasswordForm?.classList.remove("hidden");
  });

  $("#cancelResetPasswordBtn")?.addEventListener("click", () => {
    feedback.textContent = "";
    feedback.classList.remove("ok");
    resetPasswordForm?.classList.add("hidden");
    loginForm?.classList.remove("hidden");
    document.querySelectorAll("[data-auth-mode]").forEach(b => b.classList.remove("active"));
    document.querySelector('[data-auth-mode="login"]')?.classList.add("active");
  });

  resetPasswordForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "";
    feedback.classList.remove("ok");

    const data = new FormData(resetPasswordForm);
    const email = String(data.get("resetEmail") || "").trim();

    if (!email) {
      feedback.textContent = "Digite o e-mail cadastrado.";
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      feedback.textContent = "Enviamos um link de recuperação para seu e-mail.";
      feedback.classList.add("ok");
      showToast("Link de recuperação enviado!");
      resetPasswordForm.reset();
      resetPasswordForm.classList.add("hidden");
      loginForm?.classList.remove("hidden");
      if (loginForm?.email) loginForm.email.value = email;
    } catch (error) {
      feedback.textContent = getAuthError(error);
    }
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "";
    feedback.classList.remove("ok");
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
    feedback.classList.remove("ok");
    const data = new FormData(registerForm);
    const name = String(data.get("name") || "").trim();
    const username = normalizeUsername(data.get("username"));
    const password = String(data.get("password") || "");
    const confirmPassword = String(data.get("confirmPassword") || "");

    if (!username) {
      feedback.textContent = "Digite um @usuário válido.";
      return;
    }

    if (password.length < 6) {
      feedback.textContent = "A senha precisa ter pelo menos 6 caracteres.";
      return;
    }

    if (password !== confirmPassword) {
      feedback.textContent = "As senhas não conferem.";
      return;
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, data.get("email"), password);
      await updateProfile(credential.user, { displayName: name });

      const profile = {
        uid: credential.user.uid,
        accountType: "fisica",
        hasBusiness: false,
        name,
        username,
        email: data.get("email"),
        photoURL: "",
        city: "Pontalina",
        state: "GO",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, "users", credential.user.uid), profile);
      showToast("Conta criada com sucesso!");
      registerForm.reset();
    } catch (error) {
      feedback.textContent = getAuthError(error);
    }
  });
}

function setupPasswordToggles() {
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement?.querySelector("input");
      if (!input) return;
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      btn.textContent = showing ? "👁️" : "🙈";
      btn.setAttribute("aria-label", showing ? "Mostrar senha" : "Ocultar senha");
    });
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
  if (code.includes("missing-email")) return "Digite o e-mail para recuperar a senha.";
  if (code.includes("network-request-failed")) return "Falha de conexão. Verifique sua internet.";
  return "Não foi possível concluir. Verifique os dados e tente novamente.";
}
