// js/businesses.js

import { db, collection, onSnapshot, query, where, getDocs } from "./firebase.js";
import { state, DEFAULT_CATEGORIES, ONLINE_CATEGORIES } from "./state.js";
import { $, sanitize, initials, buildWhatsAppLink } from "./utils.js";

let unsubscribeUsers = null;
let unsubscribeCategories = null;

export function initBusinesses() {
  listenUsers();
  listenCategories();
}

function listenUsers() {
  if (unsubscribeUsers) unsubscribeUsers();
  const q = query(collection(db, "users"), where("accountType", "==", "empresa"));
  unsubscribeUsers = onSnapshot(q, (snapshot) => {
    state.users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderBusinesses();
    renderOnlineBusinesses();
  }, async (error) => {
    console.warn("onSnapshot empresas falhou, tentando leitura simples", error);
    try {
      const snap = await getDocs(collection(db, "users"));
      state.users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(u => u.accountType === "empresa");
    } catch (err) {
      console.error(err);
      state.users = [];
    }
    renderBusinesses();
    renderOnlineBusinesses();
  });
}

function listenCategories() {
  if (unsubscribeCategories) unsubscribeCategories();
  unsubscribeCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
    const fromDb = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    state.categories = fromDb.length
      ? [{ name: "Todos", icon: "▦", active: true, order: 0 }, ...fromDb.filter(c => c.active !== false).sort((a, b) => (a.order || 99) - (b.order || 99))]
      : DEFAULT_CATEGORIES;
    renderCategoryPills();
  }, () => {
    state.categories = DEFAULT_CATEGORIES;
    renderCategoryPills();
  });
}

export function renderCategoryPills() {
  const box = $("#categoryPills");
  if (!box) return;
  box.innerHTML = state.categories.map((cat) => `
    <button class="pill ${state.selectedCategory === cat.name ? "active" : ""}" data-category="${sanitize(cat.name)}">
      ${sanitize(cat.icon || "")}&nbsp;${sanitize(cat.name)}
    </button>
  `).join("");

  box.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedCategory = btn.dataset.category;
      renderCategoryPills();
      renderBusinesses();
    });
  });
}

export function renderOnlineCategoryIcons() {
  const box = $("#onlineCategoryIcons");
  if (!box) return;
  box.innerHTML = ONLINE_CATEGORIES.map((cat) => `
    <button class="category-icon ${state.selectedOnlineCategory === cat.name ? "active" : ""}" data-online-category="${sanitize(cat.name)}">
      <span>${sanitize(cat.icon)}</span>
      ${sanitize(cat.name)}
    </button>
  `).join("");

  box.querySelectorAll("[data-online-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedOnlineCategory = btn.dataset.onlineCategory;
      renderOnlineCategoryIcons();
      renderOnlineBusinesses();
    });
  });
}

export function renderBusinesses() {
  const list = $("#businessList");
  if (!list) return;

  const term = state.searches.business.toLowerCase().trim();
  const selected = state.selectedCategory;

  const businesses = state.users.filter((b) => {
    const categoryOk = selected === "Todos" || !selected || b.category === selected;
    const searchOk = !term || [b.businessName, b.name, b.category, b.description, b.address]
      .join(" ")
      .toLowerCase()
      .includes(term);
    return categoryOk && searchOk;
  });

  if (!businesses.length) {
    list.innerHTML = `<div class="empty-state">Nenhuma empresa encontrada nessa categoria.</div>`;
    return;
  }

  list.innerHTML = businesses.map(renderBusinessCard).join("");
  attachBusinessOverlayEvents(list);
}

function renderBusinessCard(business) {
  const name = business.businessName || business.name || "Empresa";
  const logo = business.logoURL || business.photoURL;
  const logoHtml = logo
    ? `<img class="logo" src="${sanitize(logo)}" alt="Logo de ${sanitize(name)}">`
    : `<div class="logo">${sanitize(initials(name))}</div>`;

  return `
    <article class="business-card">
      ${logoHtml}
      <div class="business-info">
        <h3>${sanitize(name)} <span class="verified">●</span></h3>
        <div class="meta-row">${sanitize(business.category || "Serviços")} • ${sanitize(business.address || "Pontalina, GO")}</div>
        <p>${sanitize(business.description || "Toque para ver mais informações e chamar no WhatsApp.")}</p>
        <button class="open-profile" data-business-id="${sanitize(business.id)}">Ver perfil</button>
      </div>
    </article>
  `;
}

export function renderOnlineBusinesses() {
  const list = $("#onlineList");
  const count = $("#onlineCount");
  if (!list) return;

  const term = state.searches.online.toLowerCase().trim();
  const category = state.selectedOnlineCategory;

  const businesses = state.users.filter((b) => {
    if (!b.isOnlineStore) return false;
    const categoryOk = category === "Todos" || !category || b.category === category || (category === "Restaurantes" && b.category === "Alimentação");
    const searchOk = !term || [b.businessName, b.name, b.category, b.description].join(" ").toLowerCase().includes(term);
    const filtersOk = Array.from(state.activeOnlineFilters).every(filter => Boolean(b[filter]));
    return categoryOk && searchOk && filtersOk;
  });

  if (count) count.textContent = `● ${businesses.length} empresas online`;

  if (!businesses.length) {
    list.innerHTML = `<div class="empty-state">Nenhuma empresa online encontrada.</div>`;
    return;
  }

  list.innerHTML = businesses.map(renderOnlineCard).join("");
  attachBusinessOverlayEvents(list);
}

function renderOnlineCard(business) {
  const name = business.businessName || business.name || "Empresa";
  const logo = business.logoURL || business.photoURL;
  const logoHtml = logo
    ? `<img class="online-logo" src="${sanitize(logo)}" alt="Logo de ${sanitize(name)}">`
    : `<div class="online-logo">${sanitize(initials(name))}</div>`;
  const actionText = ["Mercado", "Farmácia", "Açougue", "Bebidas"].includes(business.category) ? "Ver Loja" : "Ver Cardápio";
  const link = buildWhatsAppLink(business.whatsapp, `Olá, vim pelo App da Cidade e gostaria de ver ${actionText.toLowerCase()} de ${name}.`);

  return `
    <article class="online-card">
      ${logoHtml}
      <div class="online-info">
        <h3>${sanitize(name)} <span class="status-chip">Online</span></h3>
        <div class="meta-row">${sanitize(business.category || "Delivery")} • Pontalina, GO</div>
        <div class="meta-row">⭐ ${business.rating || "4,8"} • 🕒 ${business.deliveryTime || "30–50 min"}</div>
        ${business.freeDelivery ? `<span class="tag-chip">Entrega grátis</span>` : ``}
        ${business.hasPromotion ? `<span class="tag-chip">Promoção de hoje</span>` : ``}
      </div>
      <div class="online-actions">
        ${business.hasPromotion ? `<span class="promo-label">Oferta</span>` : ``}
        ${link ? `<a class="outline-green" href="${link}" target="_blank" rel="noopener">☘ ${actionText}</a>` : `<button class="outline-green" data-business-id="${sanitize(business.id)}">Ver Perfil</button>`}
      </div>
    </article>
  `;
}

function attachBusinessOverlayEvents(root) {
  root.querySelectorAll("[data-business-id]").forEach((btn) => {
    btn.addEventListener("click", () => openBusinessOverlay(btn.dataset.businessId));
  });
}

export function openBusinessOverlay(id) {
  const business = state.users.find(b => b.id === id || b.uid === id);
  if (!business) return;

  const name = business.businessName || business.name || "Empresa";
  const link = buildWhatsAppLink(business.whatsapp, `Olá, vim pelo App da Cidade e gostaria de mais informações sobre ${name}.`);
  const content = $("#businessOverlayContent");
  const overlay = $("#businessOverlay");

  const bannerStyle = business.bannerURL ? `style="background-image:url('${sanitize(business.bannerURL)}')"` : "";
  const logo = business.logoURL || business.photoURL;
  const logoHtml = logo
    ? `<img class="public-logo" src="${sanitize(logo)}" alt="Logo de ${sanitize(name)}">`
    : `<div class="public-logo">${sanitize(initials(name))}</div>`;

  content.innerHTML = `
    <div class="public-banner" ${bannerStyle}></div>
    <div class="public-content">
      ${logoHtml}
      <h2>${sanitize(name)}</h2>
      <p class="username">@${sanitize(business.username || "empresa")} • ${sanitize(business.category || "Serviços")}</p>
      <div class="public-info">
        <strong>Sobre nós</strong>
        <p>${sanitize(business.description || "Empresa cadastrada no App da Cidade.")}</p>
        <p>📍 ${sanitize(business.address || "Pontalina, GO")}</p>
        ${business.instagram ? `<p>📷 ${sanitize(business.instagram)}</p>` : ``}
      </div>
      ${link ? `<a class="big-whatsapp" href="${link}" target="_blank" rel="noopener">☘ Chamar no WhatsApp</a>` : `<button class="big-whatsapp">WhatsApp não informado</button>`}
    </div>
  `;

  overlay.classList.remove("hidden");
}
