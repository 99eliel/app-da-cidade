// js/state.js

export const state = {
  currentUser: null,
  currentProfile: null,
  users: [],
  posts: [],
  banners: [],
  categories: [],
  selectedCategory: "Todos",
  selectedOnlineCategory: "Todos",
  activeOnlineFilters: new Set(),
  searches: {
    home: "",
    business: "",
    online: ""
  }
};

export const DEFAULT_CATEGORIES = [
  { name: "Todos", icon: "▦", active: true, order: 0 },
  { name: "Alimentação", icon: "🍽️", active: true, order: 1 },
  { name: "Mercado", icon: "🛒", active: true, order: 2 },
  { name: "Lanches", icon: "🍔", active: true, order: 3 },
  { name: "Restaurantes", icon: "🍕", active: true, order: 4 },
  { name: "Açaí", icon: "🍧", active: true, order: 5 },
  { name: "Bebidas", icon: "🥤", active: true, order: 6 },
  { name: "Açougue", icon: "🥩", active: true, order: 7 },
  { name: "Padaria", icon: "🥖", active: true, order: 8 },
  { name: "Hortifruti", icon: "🥬", active: true, order: 9 },
  { name: "Farmácia", icon: "💊", active: true, order: 10 },
  { name: "Saúde", icon: "🏥", active: true, order: 11 },
  { name: "Clínicas", icon: "🩺", active: true, order: 12 },
  { name: "Beleza", icon: "💇", active: true, order: 13 },
  { name: "Barbearia", icon: "💈", active: true, order: 14 },
  { name: "Serviços", icon: "🛠️", active: true, order: 15 },
  { name: "Construção", icon: "🏗️", active: true, order: 16 },
  { name: "Automotivo", icon: "🚗", active: true, order: 17 },
  { name: "Educação", icon: "📚", active: true, order: 18 },
  { name: "Tecnologia", icon: "💻", active: true, order: 19 },
  { name: "Roupas", icon: "👕", active: true, order: 20 },
  { name: "Casa", icon: "🏠", active: true, order: 21 },
  { name: "Pets", icon: "🐶", active: true, order: 22 },
  { name: "Eventos", icon: "🎉", active: true, order: 23 },
  { name: "Imobiliária", icon: "🏘️", active: true, order: 24 },
  { name: "Transporte", icon: "🚕", active: true, order: 25 }
];

export const ONLINE_CATEGORIES = [
  { name: "Todos", icon: "▦" },
  { name: "Lanches", icon: "🍔" },
  { name: "Restaurantes", icon: "🍕" },
  { name: "Açaí", icon: "🍧" },
  { name: "Mercado", icon: "🛒" },
  { name: "Padaria", icon: "🥖" },
  { name: "Açougue", icon: "🥩" },
  { name: "Hortifruti", icon: "🥬" },
  { name: "Bebidas", icon: "🥤" },
  { name: "Farmácia", icon: "💊" }
];

export const DEFAULT_BANNERS = [
  {
    title: "Precisa de ajuda com algo?",
    subtitle: "Poste aqui e encontre profissionais perto de você!",
    action: "SAIBA MAIS",
    emoji: "👷‍♂️",
    type: "home",
    active: true,
    order: 1
  },
  {
    title: "Comércio local na palma da mão",
    subtitle: "Encontre empresas de Pontalina com poucos toques.",
    action: "VER GUIA",
    emoji: "🏪",
    type: "home",
    active: true,
    order: 2
  }
];
