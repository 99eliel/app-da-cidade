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

export function whatsappIcon(label = "") {
  const text = label ? `<span>${sanitize(label)}</span>` : "";
  return `
    <svg class="wa-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M16.04 3.2c-7.06 0-12.8 5.62-12.8 12.54 0 2.21.6 4.37 1.73 6.27L3.2 28.8l6.98-1.78a13.05 13.05 0 0 0 5.86 1.39c7.06 0 12.8-5.62 12.8-12.54S23.1 3.2 16.04 3.2Zm0 22.98c-1.9 0-3.75-.5-5.37-1.45l-.38-.22-4.14 1.06 1.1-4.02-.25-.41a10.1 10.1 0 0 1-1.55-5.4c0-5.7 4.75-10.33 10.59-10.33 5.84 0 10.58 4.63 10.58 10.33 0 5.7-4.74 10.44-10.58 10.44Zm5.8-7.8c-.32-.16-1.9-.92-2.2-1.03-.29-.1-.5-.16-.72.16-.21.31-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.35-.49-2.57-1.56-.95-.83-1.6-1.86-1.78-2.17-.19-.31-.02-.48.14-.64.14-.14.32-.37.48-.55.16-.18.21-.31.32-.52.1-.21.05-.39-.03-.55-.08-.16-.72-1.7-.99-2.33-.26-.62-.53-.54-.72-.55h-.61c-.21 0-.55.08-.85.39-.29.31-1.12 1.08-1.12 2.64 0 1.55 1.15 3.05 1.31 3.26.16.21 2.27 3.4 5.5 4.76.77.33 1.37.52 1.83.67.77.24 1.47.2 2.02.12.62-.09 1.9-.76 2.17-1.5.27-.73.27-1.36.19-1.5-.08-.13-.29-.21-.61-.37Z"/>
    </svg>${text}
  `;
}
