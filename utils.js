// js/utils.js

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

export function sanitize(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function normalizeUsername(value = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._]/g, "")
    .slice(0, 24);
}

export function onlyNumbers(value = "") {
  return String(value).replace(/\D/g, "");
}

export function buildWhatsAppLink(number = "", message = "Olá, vim pelo App da Cidade e gostaria de mais informações.") {
  let phone = onlyNumbers(number);
  if (!phone) return "";
  if (!phone.startsWith("55")) phone = `55${phone}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function formatTimeAgo(dateLike) {
  const date = dateLike?.toDate ? dateLike.toDate() : dateLike ? new Date(dateLike) : new Date();
  const diff = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diff < 60) return "agora";
  const min = Math.floor(diff / 60);
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} dia${d > 1 ? "s" : ""}`;
}

export function initials(name = "") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() || "").join("") || "?";
}

export function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add("hidden"), 2800);
}

export function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("hidden");
}

export function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("hidden");
}

export function fileExt(file) {
  const byName = file?.name?.split(".").pop()?.toLowerCase();
  if (byName) return byName;
  const byType = file?.type?.split("/").pop()?.toLowerCase();
  return byType || "jpg";
}
