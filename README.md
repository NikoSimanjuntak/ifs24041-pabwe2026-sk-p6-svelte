# Delcom Link Tree (SK-P6)

Praktikum PABWE2026 - Studi Kasus 1: aplikasi **Delcom Link Tree** dengan Svelte 5, Vite, dan JavaScript.
Sumber data: <https://open-api.delcom.org/docs/1.0/api-link-trees>.

## Menjalankan

```bash
bun install
bun run dev              # http://localhost:3004
bun run build && bun run preview
bun run test:coverage    # threshold 100%
```

Konfigurasi di `.env`:

```
VITE_DELCOM_BASEURL=https://open-api.delcom.org/api/v1
APP_PORT=3004
```

## Struktur

```
src/
  App.svelte, main.js, router.js, app.css
  lib/navigation.js              # navigate, link action, popstate
  helpers/apiHelper.js           # request, ApiError, assetUrl
  helpers/toolsHelper.js         # token, format, validasi
  hooks/useInput.js
  components/                    # LogoIcon, Modal, Navbar, Sidebar
  pages/NotFoundPage.svelte
  features/
    auth/      api, states/authStore.js, layouts/AuthLayout, pages/Login+Register
    users/     api, states/usersStore.js, pages/UsersPage + ProfilePage
    linktrees/ api/linkTreeApi.js, states/linkTreesStore.js,
               layouts/LinkTreeLayout, pages/HomePage + DetailPage,
               components/AddModal, ChangeModal, ChangeCoverModal, ItemModal
```

## Rute

| Path | Halaman |
| --- | --- |
| `/auth/login`, `/auth/register` | Layout autentikasi (khusus tamu) |
| `/` | Daftar link tree |
| `/link-trees/:linkTreeId` | Detail link tree |
| `/users`, `/profile` | Pengguna dan profil |
| lainnya | `NotFoundPage` |
