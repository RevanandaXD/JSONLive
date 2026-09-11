# JSONLive — Progress Report

**Updated:** 10 September 2026
**Status:** MVP Development (Early Stage)

---

## Ringkasan

JSONLive masih dalam tahap **awal pengembangan MVP**. Beberapa komponen inti sudah dibuat, namun banyak fitur kritis yang belum terhubung atau masih dalam bentuk placeholder/dummy.

---

## Apa yang Sudah Dikerjakan

### ✅ Infrastruktur Dasar

| Item | Status | Catatan |
|------|--------|---------|
| Next.js 16 + TypeScript | ✅ Selesai | App Router |
| PostgreSQL + Prisma | ✅ Selesai | Schema dasar (User, Resource) |
| Tailwind CSS | ✅ Selesai | Theme dark sudah aktif |
| Docker + Docker Compose | ✅ Selesai | jsonlive + postgres |
| GitHub Actions CI | ✅ Selesai | Lint + build + postgres service |
| TanStack Query | ✅ Selesai | Hook useResource, useCreateResource |

### ✅ Landing Page

| Item | Status | Catatan |
|------|--------|---------|
| Navbar | ✅ Selesai | Responsive, ada tombol Login → /login |
| Hero section | ✅ Selesai | |
| Features | ✅ Selesai | |
| How It Works | ✅ Selesai | |
| FAQ | ✅ Selesai | |
| Footer | ✅ Selesai | Dengan hover animation |

### ✅ Halaman Auth (UI Only)

| Item | Status | Catatan |
|------|--------|---------|
| Login page | ✅ UI Selesai | Belum di-wire ke Auth.js |
| Register page | ✅ UI Selesai | Validasi form sudah ada |
| Background pixel blast | ✅ Selesai | Canvas animasi hijau |

### ⚠️ API Routes

| Item | Status | Catatan |
|------|--------|---------|
| `POST /api/resources` | ⚠️ Ada tapi | Pakai hardcoded `userId = "default-user-id"`, belum ada auth |
| `GET /api/resources` | ⚠️ Ada tapi | Filter `userId: "test"`, tidak real |
| `PUT /api/resources/[id]` | ⚠️ Ada tapi | Tidak ada authorization ownership check |
| `DELETE /api/resources/[id]` | ⚠️ Ada tapi | Tidak ada authorization ownership check |
| `GET /api/[username]/[resource]` | ✅ Selesai | Public endpoint + CORS |

### ⚠️ Dashboard

| Item | Status | Catatan |
|------|--------|---------|
| Dashboard page | ⚠️ Dummy | Stats hardcoded ("6", "6", "1.2k"), `r.type`/`r.size` tidak ada di DB |
| Create resource page | ⚠️ Dummy | Form jalan, tapi POST pakai userId hardcoded |
| Resource detail page (`/resources/[id]`) | ❌ Dummy | Semua pakai mock data, belum fetch dari API |
| JSON editor (CodeMirror) | ✅ Selesai | |

---

## Bug / Masalah yang Diketahui

### 1. Dashboard Stats Masih Dummy
- `page.tsx` baris 30-34: `stats` array hardcoded
- `r.type` dan `r.size` di-declare di `types/resource.ts` tapi tidak ada di Prisma schema
- Seharusnya: hitung `resources.length` dan `totalSize` dari data real

### 2. API Routes Pakai userId Hardcoded
- `GET /api/resources`: `where: { userId: 'test' }` (baris 7)
- `POST /api/resources`: `userId = "default-user-id"` (baris 46)
- Tidak ada user session/auth → data tidak pernah muncul di dashboard

### 3. Tidak Ada Authorization
- `PUT /api/resources/[id]`: tidak cek `resource.userId === currentUser`
- `DELETE /api/resources/[id]`: sama
- Siapapun bisa edit/hapus resource milik user lain

### 4. Resource Detail Page Masih Mock
- `resources/[id]/page.tsx`: pakai `mock` object, bukan fetch dari API
- Edit/Delete button tidak terhubung ke API

### 5. Resource Type Tidak Akurat
- `types/resource.ts`: punya `size` dan `type` yang tidak ada di schema DB
- Prisma model tidak punya kolom `size` dan `type`

### 6. Prisma Client Import Fix (Sudah Diperbaiki)
- `src/lib/prisma.ts`: sudah di-fix dari `@prisma/client/extension` → `@prisma/client`
- Sudah ada singleton pattern untuk dev hot-reload

---

## Yang Belum Dikerjakan (Prioritas MVP)

### 🔴 Kritis — Harus Selesai Sebelum MVP

| Item | Prioritas | Estimasi |
|------|-----------|----------|
| **Auth system (Auth.js + registration + verifikasi email)** | 🔴 Tinggi | 2-3 hari |
| Hubungkan API routes ke user session | 🔴 Tinggi | 1 hari |
| Dashboard pakai data real (bukan dummy) | 🔴 Tinggi | 0.5 hari |
| Resource detail page fetch dari API | 🔴 Tinggi | 0.5 hari |
| Authorization check (ownership) di PUT/DELETE | 🔴 Tinggi | 0.5 hari |
| UserCard → UserMenu dropdown (logout) | 🔴 Tinggi | 0.5 hari |
| Auth guard untuk halaman dashboard | 🔴 Tinggi | 0.5 hari |

### 🟡 Penting — MVP Harus Punya

| Item | Prioritas | Estimasi |
|------|-----------|----------|
| Rate limiting | 🟡 Sedang | 1 hari |
| CORS config yang lebih baik | 🟡 Sedang | 0.5 hari |
| JSON validation yang lebih strict | 🟡 Sedang | 0.5 hari |
| Error handling yang lebih konsisten | 🟡 Sedang | 0.5 hari |
| Tests (unit + integration) | 🟡 Sedang | 2 hari |

### 🟢 Nice to Have — Bisa Ditunda

| Item | Prioritas | Estimasi |
|------|-----------|----------|
| Request logs | 🟢 Rendah | 1 hari |
| Resource expiration | 🟢 Rendah | 0.5 hari |
| OAuth (Google/GitHub) | 🟢 Rendah | 1 hari |
| API key system | 🟢 Rendah | 1 hari |
| Mini PC deployment | 🟢 Rendah | 1 hari |
| Cloudflare Tunnel | 🟢 Rendah | 0.5 hari |

---

## Rekomendasi Order Pengerjaan

### Minggu 1: Auth + Dashboard Real
1. Setup Auth.js (NextAuth v5) dengan Credentials provider
2. Tambah field `email`, `emailVerified`, `password` ke schema User
3. Buat flow register → verifikasi email (6 digit code)
4. Buat flow login → session JWT
5. Update API routes pakai session user
6. Dashboard tampilkan data real
7. Buat UserMenu dropdown dengan logout

### Minggu 2: CRUD Lengkap + Polish
1. Resource detail page fetch dari API
2. Authorization check di semua write operations
3. Error handling yang konsisten di semua API
4. Rate limiting (60 req/min GET, 10 req/min write)
5. JSON size limit validation
6. UI polish: loading states, error states, empty states

### Minggu 3: Testing + Deployment
1. Unit tests untuk API routes
2. Integration tests untuk auth flow
3. E2E tests untuk dashboard
4. Docker build optimization
5. Mini PC deployment
6. Cloudflare Tunnel setup

---

## Struktur File Saat Ini

```
jsonlive/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Login (UI only)
│   ├── register/page.tsx           # Register (UI only)
│   ├── layout.tsx                  # Root layout
│   ├── provider.tsx                # TanStack Query provider
│   ├── dashboard/
│   │   ├── page.tsx                # Dashboard (dummy data)
│   │   ├── new/page.tsx            # Create resource
│   │   ├── new/format.tsx          # JSON editor
│   │   ├── new/event.tsx           # Editor events
│   │   └── docs/page.tsx           # API docs
│   ├── resources/[id]/page.tsx     # Resource detail (mock)
│   └── api/
│       ├── resources/route.ts      # GET/POST (hardcoded userId)
│       ├── resources/[id]/route.ts # PUT/DELETE (no auth check)
│       └── [username]/[resource]/route.ts # Public endpoint
├── components/
│   ├── ui/
│   │   ├── Navbar.tsx              # Landing navbar
│   │   ├── Footer.tsx              # Landing footer
│   │   ├── Hero.tsx                # Landing hero
│   │   ├── Features.tsx            # Landing features
│   │   ├── HowItWorks.tsx          # Landing how it works
│   │   ├── FAQ.tsx                 # Landing FAQ
│   │   ├── DashboardNav.tsx        # Dashboard navbar
│   │   └── UserCard.tsx            # User card (dummy)
│   └── background/Background.tsx   # Pixel blast animation
├── hooks/
│   ├── useResource.tsx             # Fetch resources
│   └── useCreateResource.tsx       # Create resource
├── stores/
│   └── ui-store.ts                 # Sidebar state
├── types/
│   └── resource.ts                 # Resource type (dummy fields)
├── src/lib/
│   ├── prisma.ts                   # Prisma client (fixed)
│   ├── api.ts                      # Fetch wrapper
│   └── config.ts                   # Config constants
├── prisma/
│   └── schema.prisma               # Database schema
├── .github/workflows/ci.yml        # CI pipeline (fixed)
├── docker-compose.yml              # Docker setup
├── Dockerfile                      # App container
└── AGENTS.md                       # PRD
```

---

## Catatan Teknis

### Prisma Schema (Saat Ini)
```prisma
model User {
  id        String     @id @default(uuid())
  username  String     @unique
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  resources Resource[]
}

model Resource {
  id        String   @id @default(uuid())
  userId    String
  name      String
  slug      String
  data      Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user User @relation(fields: [userId], references: [id])
}
```

### Yang Perlu Ditambah ke Schema
- `email: String?` (untuk verifikasi)
- `emailVerified: DateTime?` (null = belum verifikasi)
- `password: String?` (null untuk OAuth users)
- `image: String?` (untuk avatar)

---

## Kesimpulan

Project ini sudah punya fondasi yang cukup kuat:
- **Infrastruktur**: Docker, CI/CD, Prisma, PostgreSQL
- **UI**: Landing page selesai, login/register UI siap
- **API**: CRUD endpoints ada, tinggal hubungkan ke auth

Yang paling kritis untuk diselesaikan sekarang adalah **auth system** dan **menghubungkan semuanya ke user session**. Tanpa itu, dashboard tetap menampilkan data dummy dan tidak bisa digunakan secara real.

**Estimasi MVP selesai:** 1-2 minggu lagi (jika fokus pengerjaan).