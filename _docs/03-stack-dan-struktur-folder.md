# 03. Stack dan Struktur Folder

## Versi Teknologi

Semua versi diambil dari `package.json`. Jangan menebak, cek file ini kalau ada yang berubah.

| Teknologi | Versi | Tugas |
|-----------|-------|-------|
| Next.js | 16.3.4 | Framework, routing, route handler |
| React | 19.2.8 | UI |
| TypeScript | 5 | Tipe data, strict mode aktif |
| Tailwind CSS | 4 | Styling |
| Prisma | 7.10.0 | ORM, schema, migration, seed |
| @prisma/adapter-pg | 7.10.0 | Adapter Prisma ke PostgreSQL via `pg` |
| pg | 8.23.0 | Driver PostgreSQL |
| better-auth | 1.7.4 | Registrasi, login, session, rate limit auth |
| TanStack Query | 5.102.8 | Server state di browser |
| Zustand | 5.0.15 | State UI global (sidebar) |
| motion | 13.2.0 | Animasi |
| react-icons | 5.7.0 | Ikon |
| Node.js | 22 | Runtime server dan build |
| pnpm | 10.33.2 | Package manager |

## Library yang Dipakai dan Tidak Dipakai

Sengaja tidak dipakai, supaya tidak bertambah komplektivitas:

| Tidak dipakai | Alasan |
|---------------|--------|
| Express | Next.js route handler sudah cukup |
| Redis | Rate limit in-memory cukup untuk satu mini PC |
| ORM lain | Prisma sudah menangani |
| State manager lain | TanStack Query + Zustand sudah cukup |
| Storybook | Belum perlu, komponen masih sedikit |

## Path Alias

`tsconfig.json` mendefinisikan satu alias:

```text
@/*  ->  ./*
```

Contoh: `import prisma from "@/src/lib/prisma"` berarti file `src/lib/prisma.ts`.
Selalu pakai alias, jangan path relatif seperti `../../src/lib/prisma`.

## Struktur Folder

```text
jsonlive/
|
|-- app/                      Halaman dan API (App Router)
|   |-- page.tsx              Landing page, section marketing
|   |-- layout.tsx            Root layout, metadata, font
|   |-- provider.tsx          QueryClientProvider TanStack Query
|   |-- globals.css           Token warna, class dasar Tailwind
|   |
|   |-- login/page.tsx        Halaman login
|   |-- register/page.tsx     Halaman registrasi
|   |-- thanks/page.tsx       Halaman setelah registrasi
|   |
|   |-- dashboard/page.tsx    Daftar resource milik user
|   |-- dashboard/new/
|   |   |-- page.tsx          Form create resource
|   |   |-- format.tsx        Editor JSON berbasis textarea
|   |
|   |-- resources/[id]/page.tsx  Detail dan edit satu resource
|   |-- settings/page.tsx     Profil, API key, hapus akun
|   |-- admin/page.tsx        Panel admin
|   |-- public/page.tsx       Daftar semua endpoint published
|   |-- docs/page.tsx         Dokumentasi API untuk pengguna
|   |
|   `-- api/                  Semua route handler
|       |-- auth/[...all]/route.ts    milik better-auth
|       |-- resources/route.ts        list + create
|       |-- resources/[id]/route.ts   read, update, delete
|       |-- api-keys/route.ts         list + create key
|       |-- api-keys/[id]/route.ts    delete key
|       |-- account/delete/           ajukan hapus akun
|       |-- account/cancel-delete/    batalkan pengajuan hapus
|       |-- admin/users/              list + ubah user (admin)
|       `-- [username]/[resource]/
|           |-- route.ts      API publik: collection
|           `-- [id]/route.ts API publik: item
|
|-- components/
|   |-- layout/               Kerangka halaman
|   |   |-- Navbar.tsx            navbar untuk halaman publik
|   |   |-- DashboardNav.tsx      sidebar dashboard
|   |   |-- AuthShell.tsx         wrapper halaman login/register
|   |   |-- Background.tsx        latar dekoratif
|   |   |-- DashboardSkeleton.tsx skeleton saat loading
|   |   |-- Logo.tsx              logo
|   |   `-- Footer.tsx            footer
|   |-- marketing/            Landing page
|   |   |-- Hero.tsx
|   |   |-- Features.tsx
|   |   |-- HowItWorks.tsx
|   |   |-- Stats.tsx
|   |   `-- FAQ.tsx
|   |-- resources/            Kartu dan daftar resource
|   |   |-- ResourceCard.tsx
|   |   `-- PublicGrid.tsx
|   `-- ui/                   Komponen dasar, tanpa bisnis
|       |-- Button.tsx
|       |-- Card.tsx
|       |-- Input.tsx
|       |-- Badge.tsx
|       |-- Alert.tsx
|       |-- Modal.tsx
|       |-- Tabs.tsx
|       |-- Switch.tsx
|       |-- SearchInput.tsx
|       |-- CopyButton.tsx
|       |-- EmptyState.tsx
|       `-- Skeleton.tsx
|
|-- hooks/                    Pembungkus TanStack Query
|   |-- useSession.tsx
|   |-- useUser.tsx
|   |-- useResource.tsx
|   |-- useCreateResource.tsx
|   `-- useApiKeys.tsx
|
|-- stores/
|   `-- ui-store.ts           Zustand, hanya state sidebar
|
|-- types/
|   |-- resource.ts           tipe Resource
|   `-- api-key.ts            tipe ApiKey
|
|-- src/lib/                  Inti logika server
|   |-- prisma.ts
|   |-- auth.ts
|   |-- auth-client.ts
|   |-- api-key.ts
|   |-- api.ts
|   |-- rate-limit.ts
|   |-- config.ts
|   |-- format.ts
|   |-- settings.ts
|   `-- docs.ts
|   `-- docs.ts
|
|-- prisma/
|   |-- schema.prisma         definisi tabel
|   |-- seed.ts               data contoh
|   `-- migrations/           riwayat perubahan skema
|
|-- tests/                    Test unit (node:test)
|   |-- format.test.ts
|   `-- settings.test.ts
|
|-- proxy.ts                  Guard route Next.js 16
|-- next.config.ts
|-- prisma.config.ts
|-- Dockerfile
|-- docker-compose.yml
`-- .github/workflows/ci.yml
```

## Kenapa `src/lib` Terpisah dari Root

Project ini punya dua kebiasaan yang berbeda:

- `app/`, `components/`, `hooks/` adalah tipikal Next.js, dikelola oleh framework.
- `src/lib/` sengaja dipisah agar jelas mana kode yang **tidak** boleh ikut diubah framework, yaitu akses database, auth, dan rate limit.

Kalau pindah ke Turbopack atau framework lain, `src/lib/` relatif aman. `app/` tidak.

## Aturan Penempatan File

| Jenis file | Letak | Contoh |
|------------|-------|--------|
| Halaman | `app/<route>/page.tsx` | `app/settings/page.tsx` |
| API | `app/api/<path>/route.ts` | `app/api/resources/route.ts` |
| Komponen | `components/<group>/<Name>.tsx` | `components/ui/Button.tsx` |
| Hook | `hooks/use<Thing>.tsx` | `hooks/useApiKeys.tsx` |
| Logika server | `src/lib/<topik>.ts` | `src/lib/api-key.ts` |
| Tipe | `types/<topik>.ts` | `types/resource.ts` |
| Test | `tests/<topik>.test.ts` | `tests/format.test.ts` |

## Catatan Suffiks `.tsx` pada hooks

`hooks/` memakai `.tsx` walau isinya bukan JSX. Ini mengikuti pola yang sudah dipakai project dan tidak diubah.
Jangan mencampur dua suffiks dalam satu file tanpa alasan yang jelas.
