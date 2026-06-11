// js/app.js

import { state, DEFAULT_BANNERS } from "./state.js";
import { $, $$, sanitize, openModal, closeModal, showToast } from "./utils.js";
import { initAuth, requireLogin } from "./auth.js";
import { initPosts, renderPosts } from "./posts.js";
import { initBusinesses, renderBusinesses, renderOnlineBusinesses, renderOnlineCategoryIcons } from "./businesses.js";
import { initProfile } from "./profile.js";
import { initPWA } from "./pwa.js";
import { db, collection, onSnapshot, query, where, orderBy } from "./firebase.js";

let bannerIndex = 0;
let bannerTimer = null;

window.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupModals();
  setupSearches();
  setupOnlineFilters();
  setupButtons();
  listenBanners();
  renderOnlineCategoryIcons();

  initAuth();
  initPosts();
  initBusinesses();
  initProfile();
  initPWA();
});

function setupNavigation() {
  $$(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const screen = btn.dataset.screen;
      $$(".nav-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      $$(".screen").forEach(s => s.classList.remove("active"));
      $(`#screen-${screen}`)?.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function setupModals() {
  $$("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (document.body.classList.contains("auth-locked") && btn.dataset.closeModal === "authModal") return;
      closeModal(btn.dataset.closeModal);
    });
  });

  $$(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal && !(document.body.classList.contains("auth-locked") && modal.id === "authModal")) modal.classList.add("hidden");
    });
  });

  $("#closeBusinessOverlay")?.addEventListener("click", () => $("#businessOverlay")?.classList.add("hidden"));
  $("#businessOverlay")?.addEventListener("click", (event) => {
    if (event.target.id === "businessOverlay") event.currentTarget.classList.add("hidden");
  });
}

function setupSearches() {
  $("#homeSearch")?.addEventListener("input", (event) => {
    state.searches.home = event.target.value;
    renderPosts();
  });

  $("#businessSearch")?.addEventListener("input", (event) => {
    state.searches.business = event.target.value;
    renderBusinesses();
  });

  $("#onlineSearch")?.addEventListener("input", (event) => {
    state.searches.online = event.target.value;
    renderOnlineBusinesses();
  });
}

function setupOnlineFilters() {
  $$("[data-online-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.onlineFilter;
      if (state.activeOnlineFilters.has(filter)) {
        state.activeOnlineFilters.delete(filter);
        btn.classList.remove("active");
      } else {
        state.activeOnlineFilters.add(filter);
        btn.classList.add("active");
      }
      renderOnlineBusinesses();
    });
  });
}

function setupButtons() {
  $("#openLoginBtn")?.addEventListener("click", () => openModal("authModal"));

  $("#openPostModalBtn")?.addEventListener("click", () => {
    if (requireLogin("Entre para publicar no mural.")) openModal("postModal");
  });

  $("#showAllPostsBtn")?.addEventListener("click", () => {
    state.searches.home = "";
    const input = $("#homeSearch");
    if (input) input.value = "";
    renderPosts();
    showToast("Mostrando todas as publicações.");
  });

  $("#jumpOnlineListBtn")?.addEventListener("click", () => {
    $("#onlineList")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function listenBanners() {
  const q = query(collection(db, "banners"), where("active", "==", true), orderBy("order", "asc"));
  onSnapshot(q, (snapshot) => {
    const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(b => (b.type || "home") === "home");
    state.banners = banners.length ? banners : DEFAULT_BANNERS;
    renderBanners();
  }, (error) => {
    console.warn("Banners do Firestore não carregaram. Usando padrão.", error);
    state.banners = DEFAULT_BANNERS;
    renderBanners();
  });
}

function renderBanners() {
  const track = $("#homeBanners");
  const dots = $("#homeDots");
  if (!track || !dots) return;

  track.innerHTML = state.banners.map((banner, index) => {
    const imageStyle = banner.imageURL ? `style="background-image:url('${sanitize(banner.imageURL)}')"` : "";
    return `
      <article class="banner-slide ${index === bannerIndex ? "active" : ""}" ${imageStyle}>
        <div>
          <h2>${sanitize(banner.title || "App da Cidade")}</h2>
          <p>${sanitize(banner.subtitle || "Encontre serviços e comércios locais.")}</p>
          <span class="banner-action">${sanitize(banner.action || "SAIBA MAIS")}</span>
        </div>
        <div class="banner-emoji">${sanitize(banner.emoji || "👷‍♂️")}</div>
      </article>
    `;
  }).join("");

  dots.innerHTML = state.banners.map((_, index) => `<button class="dot ${index === bannerIndex ? "active" : ""}" data-dot="${index}" aria-label="Banner ${index + 1}"></button>`).join("");
  dots.querySelectorAll("[data-dot]").forEach((dot) => {
    dot.addEventListener("click", () => {
      bannerIndex = Number(dot.dataset.dot);
      renderBanners();
      restartBannerTimer();
    });
  });

  restartBannerTimer();
}

function restartBannerTimer() {
  clearInterval(bannerTimer);
  if (state.banners.length <= 1) return;
  bannerTimer = setInterval(() => {
    bannerIndex = (bannerIndex + 1) % state.banners.length;
    renderBanners();
  }, 5000);
}
