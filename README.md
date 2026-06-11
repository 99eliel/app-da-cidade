# App da Cidade - Pontalina

PWA de guia comercial, mural da cidade e vitrine online com redirecionamento para WhatsApp.

## O que já vem nesta versão

- Interface mobile inspirada nos prints enviados.
- Abas: Início, Categorias, Online e Perfil.
- Firebase Authentication com email e senha.
- Firestore para usuários/empresas, posts, banners e categorias.
- Storage para foto, logo e banner.
- PWA com `manifest.json` e `service-worker.js`.
- Sem carrinho, sem pedidos e sem pagamento interno.

## Estrutura de pastas

```txt
index.html
manifest.json
service-worker.js
style.css
firebase.js
app.js
auth.js
posts.js
businesses.js
profile.js
pwa.js
state.js
utils.js
icon-192.png
icon-512.png
```

## Firebase usado

Projeto configurado em `firebase.js`:

```txt
projectId: app-da-cidade-7759b
```

## Coleções esperadas

```txt
users
posts
banners
categories
admins
```

## Importante

Para testar localmente, use servidor local. Não abra apenas clicando no `index.html`, porque módulos JavaScript precisam de servidor.

Exemplos:

```bash
npx serve .
```

ou, com Python:

```bash
python -m http.server 5500
```

Depois acesse:

```txt
http://localhost:5500
```

## GitHub Pages

Se subir no GitHub Pages, o PWA deve funcionar melhor depois de publicado com HTTPS.

## Observação

Se uma tela ficar vazia, confira no Console do navegador se as regras do Firestore/Storage estão permitindo leitura/escrita nas coleções usadas.
