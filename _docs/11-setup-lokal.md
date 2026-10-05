# 11. Setup Lokal

## Kebutuhan

| Tool | Versi | Cek dengan |
|------|-------|------------|
| Node.js | 22 | `node -v` |
| pnpm | 10.33.2 | `pnpm -v` |
| PostgreSQL | 17 | `psql --version` |

Docker bisa jadi alternatif PostgreSQL lokal:

```bash
docker run -d --name jsonlive-db -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=jsonlive -p 5432:5432 postgres:17-alpine
```

## Langkah Awal

```bash
# 1. Install dependency
pnpm install

# 2. Siapkan environment
copy .env.example .env
# Linux/macOS: cp .env.example .env

# 3. Buat database bernama jsonlive, lalu sesuaikan DATABASE_URL

# 4. Terapkan migration
pnpm prisma migrate deploy

# 5. Generate Prisma client
pnpm prisma generate

# 6. Isi data contoh
pnpm prisma db seed

# 7. Jalankan
pnpm dev
```

Buka `http://localhost:3000`.

Kalau `.env.example` belum ada di repo, buat manual. Isinya ada di bagian berikutnya.

## Environment Variable

| Nama | Dipakai oleh | Contoh |
|------|--------------|--------|
| `DATABASE_URL` | Prisma, seed | `postgresql://postgres:admin@localhost:5432/jsonlive` |
| `BETTER_AUTH_SECRET` | better-auth | string panjang random |
| `BETTER_AUTH_URL` | better-auth, server | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | better-auth client | `http://localhost:3000` |

Generate secret:

```bash
openssl rand -base64 32
```

`.env` sudah masuk `.gitignore` dan tidak boleh di-commit.

## Perintah yang Tersedia

| Perintah | Fungsi |
|----------|--------|
| `pnpm dev` | Server development dengan hot reload |
| `pnpm build` | Build produksi |
| `pnpm start` | Menjalankan hasil build |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit test |

Perintah Prisma yang sering dipakai:

| Perintah | Fungsi |
|----------|--------|
| `pnpm prisma generate` | Generate ulang client dari schema |
| `pnpm prisma migrate dev --name nama` | Buat dan terapkan migration baru |
| `pnpm prisma migrate deploy` | Terapkan migration yang sudah ada |
| `pnpm prisma db seed` | Isi data contoh |
| `pnpm prisma studio` | GUI untuk melihat dan mengubah data |
| `pnpm prisma migrate reset` | Hapus database, jalankan ulang migration dan seed |

`pnpm prisma studio` adalah cara tercepat untuk memastikan data seed masuk dengan benar.

## Data Seed

`prisma/seed.ts` membuat tiga user:

| Email | Username | Role | Password |
|-------|----------|------|----------|
| `admin@jsonlive.com` | `admin` | admin | `password123` |
| `demo@jsonlive.com` | `revan` | user | `password123` |
| `budi@jsonlive.com` | `budi` | user | `password123` |

Seed juga membuat dua resource:

```text
/api/revan/users   3 item
/api/budi/users    2 item
```

Seed pakai `upsert`, jadi aman dijalankan berulang kali. Password di-hash dengan `better-auth/crypto`, sama seperti alur registrasi.

Penting: password seed ini hanya untuk pengembangan. Jangan pernah dipakai di production.

## Alur Kerja Harian

```text
pnpm dev                       terminal 1

git pull                      dapat perubahan dari remote
pnpm install                   kalau ada dependency baru
pnpm prisma migrate deploy     kalau ada migration baru
pnpm dev                       terminal 1

pnpm lint && pnpm test && pnpm build             sebelum push
```

## Test

Test unit memakai `node:test` bawaan Node, tanpa framework tambahan.

```bash
pnpm test
```

File test sekarang:

| File | Yang diuji |
|------|-----------|
| `tests/format.test.ts` | `formatBytes`, `timeAgo`, `slugify` |
| `tests/settings.test.ts` | Helper halaman settings |

Cara menambah test:

```text
1. Tulis file di tests/<topik>.test.ts
2. Tambahkan ke script "test" di package.json
3. Jalankan pnpm test
```

Perhatikan langkah 2. Script `test` di `package.json` menyebut file secara eksplisit, jadi file test baru tidak akan jalan kalau tidak didaftarkan.

## Masalah yang Sering Muncul

### Error koneksi database

```text
Can't reach database server
```

- PostgreSQL belum jalan. Cek dengan `pg_isready`.
- `DATABASE_URL` salah port, nama database, atau password.
- Kalau pakai Docker, pastikan nama host-nya `postgres`, bukan `localhost`, saat request datang dari container lain.

### Prisma client stale

```text
PrismaClient is not initialized
```

Jalankan ulang:

```bash
pnpm prisma generate
```

### Halaman login selalu gagal

- `BETTER_AUTH_SECRET` kosong atau berubah sendiri. Kalau berubah, semua session lama jadi tidak valid.
- `BETTER_AUTH_URL` tidak cocok dengan URL yang dibuka di browser.
- `NEXT_PUBLIC_APP_URL` tidak cocok, karena dipakai better-auth di sisi browser.

### Session habis terus

Cek nilai `session.expiresAt` di Prisma Studio. Cara tercepat: logout, hapus cookie di browser, lalu login ulang.

### Resource tidak muncul di `/public`

Hanya resource dengan `published: true` yang tampil. Cek juga `username` user-nya, karena URL disusun dari situ.

### Slug bentrok saat create

Beri `name` berbeda. Slug unik per user, jadi `users` dan `Users` menghasilkan slug yang sama.

### Error saat `pnpm build`

`next build` butuh koneksi database untuk halaman server component seperti `/public` dan `/admin`.
Pastikan `DATABASE_URL` benar dan database bisa dijangkau.

### Port 3000 sudah dipakai

```bash
pnpm dev --port 3001
```

Kalau port digeser, `PUBLIC_BASE_URL` di `src/lib/config.ts` masih menunjuk ke 3000, jadi URL yang ditampilkan di UI akan salah. Ingat bahwa `PUBLIC_BASE_URL` masih hardcoded.

## Kalau Mulai Dari Nol

Urutan yang aman:

```text
1. clone repository
2. pnpm install
3. jalankan PostgreSQL
4. buat database jsonlive
5. isi .env
6. pnpm prisma migrate deploy
7. pnpm prisma generate
8. pnpm prisma db seed
9. pnpm dev
```

Kalau `pnpm prisma migrate deploy` gagal dengan "database does not exist", buat dulu database-nya lewat psql atau pgAdmin.
