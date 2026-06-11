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
  { name: "Serviços", icon: "🛠️", active: true, order: 1 },
  { name: "Saúde", icon: "💊", active: true, order: 2 },
  { name: "Mercado", icon: "🛒", active: true, order: 3 },
  { name: "Alimentação", icon: "🍽️", active: true, order: 4 },
  { name: "Beleza", icon: "💇", active: true, order: 5 },
  { name: "Automotivo", icon: "🚗", active: true, order: 6 },
  { name: "Construção", icon: "🏗️", active: true, order: 7 },
  { name: "Tecnologia", icon: "💻", active: true, order: 8 },
  { name: "Farmácia", icon: "💊", active: true, order: 9 },
  { name: "Lanches", icon: "🍔", active: true, order: 10 },
  { name: "Açaí", icon: "🍧", active: true, order: 11 },
  { name: "Bebidas", icon: "🥤", active: true, order: 12 },
  { name: "Açougue", icon: "🥩", active: true, order: 13 }
];

export const ONLINE_CATEGORIES = [
  { name: "Todos", icon: "▦" },
  { name: "Lanches", icon: "🍔" },
  { name: "Restaurantes", icon: "🍕" },
  { name: "Açaí", icon: "🍧" },
  { name: "Mercado", icon: "🛒" },
  { name: "Açougue", icon: "🥩" },
  { name: "Bebidas", icon: "🍾" },
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
