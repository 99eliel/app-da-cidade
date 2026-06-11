<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#2563eb" />
  <meta name="description" content="Guia comercial, mural e vitrine online de Pontalina, GO." />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="App Cidade" />

  <title>App da Cidade</title>

  <link rel="manifest" href="./manifest.json" />
  <link rel="icon" href="./assets/icon-192.png" />
  <link rel="apple-touch-icon" href="./assets/icon-192.png" />
  <link rel="stylesheet" href="./css/style.css" />
</head>
<body>
  <div id="app" class="app-shell">
    <header class="topbar">
      <div class="location-pill">
        <span class="location-icon">📍</span>
        <strong>Pontalina, GO</strong>
        <span class="chevron">⌄</span>
      </div>
      <button class="icon-button" id="openLoginBtn" aria-label="Abrir perfil">
        <span class="bell">🔔</span>
        <span class="badge">3</span>
      </button>
    </header>

    <main class="screen-container">
      <section id="screen-home" class="screen active" aria-labelledby="homeTitle">
        <div class="search-box">
          <span>🔎</span>
          <input id="homeSearch" type="search" placeholder="O que você precisa hoje?" autocomplete="off" />
        </div>

        <section class="hero-carousel" aria-label="Banners principais">
          <div id="homeBanners" class="banner-track"></div>
          <div id="homeDots" class="dots"></div>
        </section>

        <button id="openPostModalBtn" class="primary-cta">
          <span>＋</span> O QUE VOCÊ PRECISA?
        </button>

        <div class="section-header">
          <h1 id="homeTitle">Publicações recentes</h1>
          <button class="link-button" id="showAllPostsBtn">Ver todas</button>
        </div>

        <div id="postsList" class="cards-list"></div>
      </section>

      <section id="screen-categories" class="screen" aria-labelledby="categoriesTitle">
        <div class="search-box">
          <span>🔎</span>
          <input id="businessSearch" type="search" placeholder="Buscar empresas, serviços e profissionais..." autocomplete="off" />
        </div>

        <div class="section-header vertical">
          <div>
            <h1 id="categoriesTitle">Categorias</h1>
            <p>Encontre comércios e profissionais da cidade.</p>
          </div>
        </div>

        <div id="categoryPills" class="pills-row"></div>
        <div id="businessList" class="cards-list"></div>
      </section>

      <section id="screen-online" class="screen" aria-labelledby="onlineTitle">
        <div class="search-box">
          <span>🔎</span>
          <input id="onlineSearch" type="search" placeholder="Buscar restaurantes, mercados e mais..." autocomplete="off" />
        </div>

        <div class="section-header vertical">
          <div>
            <h1 id="onlineTitle">Online <span class="green-chip">Entrega rápida</span></h1>
            <p>Peça agora e receba onde estiver!</p>
          </div>
        </div>

        <div id="onlineCategoryIcons" class="category-icons"></div>

        <section class="delivery-banner">
          <div>
            <h2>Peça sem sair de casa!</h2>
            <p>Fale direto pelo WhatsApp com as melhores empresas da cidade.</p>
            <button id="jumpOnlineListBtn">Peça agora →</button>
          </div>
          <div class="delivery-illustration">🛵</div>
        </section>

        <div class="filter-row">
          <button class="filter-btn" data-online-filter="freeDelivery">🚚 Entrega Grátis</button>
          <button class="filter-btn" data-online-filter="isOpen">🕒 Abertos agora</button>
          <button class="filter-btn" data-online-filter="hasPromotion">🏷️ Promoções</button>
        </div>

        <div class="section-header compact">
          <h2>Empresas disponíveis</h2>
          <span id="onlineCount" class="online-count">● 0 empresas online</span>
        </div>

        <div id="onlineList" class="cards-list"></div>
      </section>

      <section id="screen-profile" class="screen" aria-labelledby="profileTitle">
        <div class="profile-card" id="profileSummary"></div>

        <div class="section-header vertical">
          <div>
            <h1 id="profileTitle">Perfil</h1>
            <p>Gerencie sua conta e seus dados públicos.</p>
          </div>
        </div>

        <div id="profileActions" class="profile-actions"></div>
      </section>
    </main>

    <nav class="bottom-nav" aria-label="Navegação principal">
      <button class="nav-item active" data-screen="home">
        <span>🏠</span><small>Início</small>
      </button>
      <button class="nav-item" data-screen="categories">
        <span>▦</span><small>Categorias</small>
      </button>
      <button class="nav-item" data-screen="online">
        <span>🛵</span><small>Online</small>
      </button>
      <button class="nav-item" data-screen="profile">
        <span>👤</span><small>Perfil</small>
      </button>
    </nav>
  </div>

  <div id="authModal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="authTitle">
    <div class="modal-card auth-card">
      <button class="close-btn" data-close-modal="authModal">×</button>
      <h2 id="authTitle">Entrar no App da Cidade</h2>
      <p class="muted">Entre para postar no mural ou cadastrar sua empresa.</p>

      <div class="tabs-mini">
        <button class="tab-mini active" data-auth-mode="login">Entrar</button>
        <button class="tab-mini" data-auth-mode="register">Criar conta</button>
      </div>

      <form id="loginForm" class="form-stack">
        <label>Email<input type="email" name="email" required placeholder="seuemail@exemplo.com" /></label>
        <label>Senha<input type="password" name="password" required minlength="6" placeholder="Mínimo 6 caracteres" /></label>
        <button class="primary-btn" type="submit">Entrar</button>
      </form>

      <form id="registerForm" class="form-stack hidden">
        <label>Tipo de conta
          <select name="accountType" id="registerAccountType" required>
            <option value="fisica">Pessoa física</option>
            <option value="empresa">Empresa</option>
          </select>
        </label>
        <label>Nome completo / Nome da empresa<input type="text" name="name" required placeholder="Ex: João Silva ou Mercado Central" /></label>
        <label>@usuário<input type="text" name="username" required placeholder="ex: joaosilva" /></label>
        <label>Email<input type="email" name="email" required /></label>
        <label>Senha<input type="password" name="password" required minlength="6" /></label>
        <div id="registerBusinessFields" class="business-extra hidden">
          <label>Categoria
            <select name="category">
              <option value="Alimentação">Alimentação</option>
              <option value="Serviços">Serviços</option>
              <option value="Mercado">Mercado</option>
              <option value="Saúde">Saúde</option>
              <option value="Beleza">Beleza</option>
              <option value="Automotivo">Automotivo</option>
              <option value="Construção">Construção</option>
              <option value="Tecnologia">Tecnologia</option>
              <option value="Farmácia">Farmácia</option>
              <option value="Lanches">Lanches</option>
              <option value="Açaí">Açaí</option>
              <option value="Bebidas">Bebidas</option>
            </select>
          </label>
          <label>WhatsApp<input type="tel" name="whatsapp" placeholder="64999999999" /></label>
        </div>
        <button class="primary-btn" type="submit">Criar conta</button>
      </form>

      <p id="authFeedback" class="feedback"></p>
    </div>
  </div>

  <div id="postModal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="postTitle">
    <div class="modal-card">
      <button class="close-btn" data-close-modal="postModal">×</button>
      <h2 id="postTitle">O que você precisa?</h2>
      <p class="muted">Publique no mural para a cidade ver.</p>
      <form id="postForm" class="form-stack">
        <label>Título<input type="text" name="title" required placeholder="Ex: Preciso de um pintor" /></label>
        <label>Descrição<textarea name="description" required rows="4" placeholder="Explique melhor o que você precisa..."></textarea></label>
        <label>Tipo
          <select name="tag" required>
            <option value="servico">Preciso de serviço</option>
            <option value="emprego">Vaga de emprego</option>
          </select>
        </label>
        <label>Área / Serviço<input type="text" name="serviceType" placeholder="Ex: Pintor, Faxineira, Emprego" /></label>
        <label>WhatsApp para contato<input type="tel" name="whatsapp" placeholder="64999999999" /></label>
        <button class="primary-btn" type="submit">Publicar</button>
      </form>
      <p id="postFeedback" class="feedback"></p>
    </div>
  </div>

  <div id="editProfileModal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="editProfileTitle">
    <div class="modal-card large">
      <button class="close-btn" data-close-modal="editProfileModal">×</button>
      <h2 id="editProfileTitle">Editar perfil</h2>
      <form id="profileForm" class="form-stack">
        <label>Nome<input type="text" name="name" required /></label>
        <label>@usuário<input type="text" name="username" required /></label>
        <label>Foto de perfil<input type="file" name="photo" accept="image/*" /></label>

        <div id="businessProfileFields" class="business-extra hidden">
          <label>Nome da empresa<input type="text" name="businessName" /></label>
          <label>Categoria<input type="text" name="category" placeholder="Ex: Lanches" /></label>
          <label>WhatsApp<input type="tel" name="whatsapp" placeholder="64999999999" /></label>
          <label>Instagram<input type="text" name="instagram" placeholder="@suaempresa" /></label>
          <label>Endereço<input type="text" name="address" placeholder="Pontalina, GO" /></label>
          <label>Resumo dos serviços<textarea name="description" rows="4"></textarea></label>
          <label>Logo<input type="file" name="logo" accept="image/*" /></label>
          <label>Banner<input type="file" name="banner" accept="image/*" /></label>
          <label class="check-line"><input type="checkbox" name="isOnlineStore" /> Aparecer na aba Online</label>
          <label class="check-line"><input type="checkbox" name="isOpen" /> Aberto agora</label>
          <label class="check-line"><input type="checkbox" name="freeDelivery" /> Entrega grátis</label>
          <label class="check-line"><input type="checkbox" name="hasPromotion" /> Tem promoção</label>
        </div>

        <button class="primary-btn" type="submit">Salvar alterações</button>
      </form>
      <p id="profileFeedback" class="feedback"></p>
    </div>
  </div>

  <div id="businessOverlay" class="business-overlay hidden" role="dialog" aria-modal="true">
    <div class="business-sheet">
      <button class="close-btn overlay-close" id="closeBusinessOverlay">×</button>
      <div id="businessOverlayContent"></div>
    </div>
  </div>

  <div id="toast" class="toast hidden"></div>

  <script type="module" src="./js/app.js"></script>
</body>
</html>
