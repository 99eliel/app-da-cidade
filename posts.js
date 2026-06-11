// js/posts.js

import {
  db,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "./firebase.js";

import { state } from "./state.js";
import { $, sanitize, formatTimeAgo, initials, buildWhatsAppLink, whatsappIcon, showToast, closeModal } from "./utils.js";
import { requireLogin } from "./auth.js";

let unsubscribePosts = null;

export function initPosts() {
  setupPostForm();
  listenPosts();
}

function listenPosts() {
  if (unsubscribePosts) unsubscribePosts();
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
  unsubscribePosts = onSnapshot(q, (snapshot) => {
    state.posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderPosts();
  }, (error) => {
    console.error("Erro ao carregar posts", error);
    state.posts = [];
    renderPosts();
  });
}

function setupPostForm() {
  const form = $("#postForm");
  const feedback = $("#postFeedback");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!requireLogin("Entre para publicar no mural.")) return;

    const profile = state.currentProfile;
    if (!profile) return;

    const data = new FormData(form);
    feedback.textContent = "";

    try {
      await addDoc(collection(db, "posts"), {
        userId: state.currentUser.uid,
        userName: profile.businessName || profile.name,
        userPhoto: profile.logoURL || profile.photoURL || "",
        userType: profile.accountType || "fisica",
        title: String(data.get("title") || "").trim(),
        description: String(data.get("description") || "").trim(),
        tag: data.get("tag"),
        serviceType: String(data.get("serviceType") || "").trim(),
        whatsapp: String(data.get("whatsapp") || profile.whatsapp || "").trim(),
        city: "Pontalina",
        state: "GO",
        createdAt: serverTimestamp()
      });
      form.reset();
      closeModal("postModal");
      showToast("Publicado no mural!");
    } catch (error) {
      console.error(error);
      feedback.textContent = "Erro ao publicar. Confira as regras do Firestore.";
    }
  });
}

export function renderPosts() {
  const list = $("#postsList");
  if (!list) return;

  const term = state.searches.home.toLowerCase().trim();
  const posts = state.posts.filter((post) => {
    if (!term) return true;
    return [post.title, post.description, post.serviceType, post.userName]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });

  if (!posts.length) {
    list.innerHTML = `<div class="empty-state">Nenhuma publicação encontrada. Seja o primeiro a postar!</div>`;
    return;
  }

  list.innerHTML = posts.map(renderPostCard).join("");
}

function renderPostCard(post) {
  const isJob = post.tag === "emprego";
  const profileLabel = post.userType === "empresa" ? "Empresa 🏢" : "Pessoa física 👤";
  const chip = isJob
    ? `<span class="job-chip">Vaga de emprego</span>`
    : `<span class="need-chip">Preciso de serviço</span>`;
  const serviceType = post.serviceType || (isJob ? "Emprego" : "Serviço");
  const link = buildWhatsAppLink(post.whatsapp, `Olá, vi sua publicação no App da Cidade: ${post.title}`);

  const avatar = post.userPhoto
    ? `<img class="avatar" src="${sanitize(post.userPhoto)}" alt="Foto de ${sanitize(post.userName)}">`
    : `<div class="avatar">${sanitize(initials(post.userName))}</div>`;

  return `
    <article class="post-card">
      <div>${avatar}</div>
      <div class="post-main">
        <div class="meta-row"><strong>${sanitize(post.userName || "Usuário")}</strong></div>
        <div class="meta-row">${profileLabel}</div>
        <h4>${sanitize(post.title || "Publicação")}</h4>
        <p>${sanitize(post.description || "")}</p>
        <div><span class="tag-chip">${isJob ? "💼" : "🛠️"} ${sanitize(serviceType)}</span></div>
        <div class="meta-row" style="margin-top:10px">📍 Pontalina, GO</div>
      </div>
      <div class="post-time">🕒 ${formatTimeAgo(post.createdAt)}</div>
      ${link ? `<a class="whatsapp-float" href="${link}" target="_blank" rel="noopener" aria-label="Chamar no WhatsApp">${whatsappIcon()}</a>` : `<button class="whatsapp-float" title="Sem WhatsApp">${whatsappIcon()}</button>`}
      <div style="position:absolute;right:14px;top:48px">${chip}</div>
    </article>
  `;
}
