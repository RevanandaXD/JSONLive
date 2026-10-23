<p align="center">
  <img src="public/thumbnails/image.png" alt="JSONLive Preview" width="100%" />
</p>

# JSONLive

JSONLive adalah platform penyedia hosted mock API berbasis web yang memungkinkan pengembang mengubah data JSON menjadi REST API endpoint publik maupun privat secara instan tanpa perlu menyiapkan server atau konfigurasi backend tambahan.

Dirancang untuk mempercepat alur kerja pengujian integrasi frontend, mobile app, prototyping, hingga skenario CI/CD dengan performa tinggi dan efisiensi konsumsi memori.

## Fitur Utama

### Instant API Generation
Mengonversi payload JSON menjadi live endpoint siap pakai menggunakan slug terstruktur berbasis username pengguna.

### Manajemen Resource
Mendukung pembuatan, pratinjau, pengeditan, validasi format JSON, serta penghapusan resource secara langsung dari dashboard.

### Kontrol Akses dan Keamanan
Menyediakan konfigurasi visibilitas publik atau privat, otentikasi berbasis token sesi melalui Better Auth, serta integrasi API Key untuk akses terproteksi.

### CORS Terbuka
Mendukung konsumsi API lintas domain secara langsung dari browser klien, Vercel, Netlify, aplikasi mobile, maupun perkakas pengujian HTTP.

### Arsitektur Ringan
Dibuat dengan Next.js App Router, PostgreSQL, dan Prisma ORM, cocok dijalankan pada infrastruktur cloud mandiri maupun perangkat edge seperti Mini PC.

## Arsitektur Teknologi

### Frontend
Next.js 16, React 19, Tailwind CSS v4, Motion, Zustand, TanStack Query

### Backend dan API
Next.js Route Handlers, Better Auth, PostgreSQL, Prisma ORM

### Runtime dan Package Manager
Node.js, pnpm

## Struktur Endpoint

Endpoint publik diakses menggunakan pola URL berikut:

```http
GET /api/{username}/{resource}
```

Contoh respon:

```json
[
  {
    "id": 1,
    "name": "Revan",
    "role": "Developer"
  }
]
```

## Menjalankan Proyek Secara Lokal

### Prasyarat Sistem
Node.js versi 20 atau lebih baru, pnpm, serta PostgreSQL server aktif.

### 1. Kloning Repositori

```bash
git clone https://github.com/RevanandaXD/JSONLive.git
cd JSONLive
```

### 2. Instalasi Dependensi

```bash
pnpm install
```

### 3. Konfigurasi Environment

Salin berkas template environment:

```bash
cp .env.example .env
```

Sesuaikan variabel di dalam berkas .env:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/jsonlive
BETTER_AUTH_SECRET=rahasia-string-minimal-32-karakter
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_ACTION_SECRET=rahasia-admin-string
```

### 4. Migrasi Basis Data

Jalankan sinkronisasi skema basis data:

```bash
npx prisma db push
```

### 5. Jalankan Server Pengembangan

```bash
pnpm dev
```

Buka peramban dan akses alamat http://localhost:3000.

## Pengujian dan Linter

Jalankan pengujian unit otomatis:

```bash
pnpm test
```

Jalankan analisis kode:

```bash
pnpm lint
```

## Menjalankan Melalui Docker

Proyek ini telah dilengkapi konfigurasi Docker Compose untuk deployment mandiri:

```bash
docker compose up -d --build
```

Layanan aplikasi dan basis data PostgreSQL akan otomatis aktif dan siap digunakan.

## Lisensi dan Pengembang

Dikembangkan oleh Revananda untuk keperluan mock API development dan prototyping yang efisien.
